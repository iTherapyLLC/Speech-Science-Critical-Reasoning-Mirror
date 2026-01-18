import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { analyzePDFText, type RosterStudent } from '@/lib/pdf-parser';

// Dynamic import for pdf-parse to avoid SSR issues
async function parsePDF(buffer: Buffer): Promise<string> {
  const pdf = await import('pdf-parse');
  const data = await pdf.default(buffer);
  return data.text;
}

function verifyPassword(request: Request): boolean {
  const authHeader = request.headers.get('x-instructor-password');
  return authHeader === process.env.INSTRUCTOR_PASSWORD;
}

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    let extractedText: string;
    try {
      extractedText = await parsePDF(buffer);
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json({
        error: 'Failed to parse PDF. The file may be corrupted or password-protected.',
        details: pdfError instanceof Error ? pdfError.message : 'Unknown error'
      }, { status: 400 });
    }

    // Fetch roster for student matching
    const supabase = createServiceClient();
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('id, name, email, section');

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 });
    }

    const roster: RosterStudent[] = (studentsData || []).map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      section: s.section,
    }));

    // Analyze the PDF text
    const result = analyzePDFText(extractedText, roster);

    return NextResponse.json({
      success: true,
      detection: result,
      filename: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Endpoint to confirm and save a submission
export async function PUT(request: NextRequest) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      studentId,
      studentEmail,
      studentName,
      weekNumber,
      submissionType,
      pdfData, // Base64 encoded PDF
      filename,
    } = body;

    if (!studentEmail || !weekNumber) {
      return NextResponse.json({ error: 'Student email and week number required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check if submission already exists for this student/week
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('student_email', studentEmail)
      .eq('week_number', weekNumber)
      .not('submitted_at', 'is', null)
      .single();

    if (existingConv) {
      return NextResponse.json({
        error: 'Submission already exists for this student and week',
        existingId: existingConv.id
      }, { status: 409 });
    }

    // For manual uploads, we create a conversation record with the PDF as "transcript"
    // The transcript will indicate this was an instructor upload
    const now = new Date().toISOString();

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        student_name: studentName || 'Unknown',
        student_email: studentEmail,
        week_number: weekNumber,
        transcript: [{
          role: 'assistant' as const,
          content: `[Instructor uploaded PDF: ${filename}]`,
          timestamp: now,
        }],
        reflection: '[Instructor manual upload - see PDF for full conversation]',
        started_at: now,
        submitted_at: now,
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return NextResponse.json({ error: 'Failed to create conversation record' }, { status: 500 });
    }

    // Create submission record
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        conversation_id: conversation.id,
        flagged: false,
        reviewed: false,
      })
      .select()
      .single();

    if (subError) {
      console.error('Error creating submission:', subError);
      // Rollback conversation
      await supabase.from('conversations').delete().eq('id', conversation.id);
      return NextResponse.json({ error: 'Failed to create submission record' }, { status: 500 });
    }

    // If PDF data provided, upload to storage (optional - for archival)
    if (pdfData) {
      try {
        const pdfBuffer = Buffer.from(pdfData, 'base64');
        const storagePath = `submissions/${studentEmail}/${weekNumber}/${filename}`;

        await supabase.storage
          .from('conversation-pdfs')
          .upload(storagePath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
          });
      } catch (storageError) {
        // Non-fatal - just log
        console.error('PDF storage error (non-fatal):', storageError);
      }
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      submissionId: submission.id,
      message: `Submission filed for ${studentName || studentEmail}, Week ${weekNumber}`,
    });
  } catch (error) {
    console.error('Confirm upload error:', error);
    return NextResponse.json({
      error: 'Failed to save submission',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
