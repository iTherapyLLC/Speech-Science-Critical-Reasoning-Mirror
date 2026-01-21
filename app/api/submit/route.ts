import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Input validation limits
const MAX_REFLECTION_LENGTH = 5000;
const MAX_MESSAGES = 200;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Submit API request received`);

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        error: 'Invalid request body',
        errorCode: 'INVALID_JSON'
      }, { status: 400 });
    }

    const {
      weekNumber,
      messages,
      studentName,
      reflection,
      sessionStartTime,
      pasteAttempts = 0,
      suspectedAIResponses = 0,
      submissionFlagged = false,
      flagReasons = []
    } = body;

    // Input validation
    if (!weekNumber || typeof weekNumber !== 'number' || weekNumber < 1 || weekNumber > 15) {
      return NextResponse.json({
        error: 'Invalid week number',
        errorCode: 'INVALID_WEEK'
      }, { status: 400 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({
        error: 'Messages are required',
        errorCode: 'INVALID_MESSAGES'
      }, { status: 400 });
    }

    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json({
        error: 'Too many messages',
        errorCode: 'TOO_MANY_MESSAGES'
      }, { status: 400 });
    }

    if (!studentName || typeof studentName !== 'string') {
      return NextResponse.json({
        error: 'Student name is required',
        errorCode: 'INVALID_NAME'
      }, { status: 400 });
    }

    if (!reflection || typeof reflection !== 'string' || reflection.length < 50) {
      return NextResponse.json({
        error: 'Reflection must be at least 50 characters',
        errorCode: 'INVALID_REFLECTION'
      }, { status: 400 });
    }

    if (reflection.length > MAX_REFLECTION_LENGTH) {
      return NextResponse.json({
        error: 'Reflection is too long',
        errorCode: 'REFLECTION_TOO_LONG'
      }, { status: 400 });
    }

    // Calculate session duration
    let sessionDuration = null;
    if (sessionStartTime) {
      const start = new Date(sessionStartTime);
      const end = new Date();
      sessionDuration = Math.round((end.getTime() - start.getTime()) / 1000 / 60); // minutes
    }

    // Count user messages (exchanges)
    const userMessageCount = messages.filter((m: Message) => m.role === 'user').length;

    console.log(`[${requestId}] Week: ${weekNumber}, Student: ${studentName}, Messages: ${userMessageCount}, Duration: ${sessionDuration}min, PasteAttempts: ${pasteAttempts}, SuspectedAI: ${suspectedAIResponses}, Flagged: ${submissionFlagged}`);

    // Try to save to Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Combine flag reasons into a single string for the database
        const flagReasonStr = flagReasons.length > 0 ? flagReasons.join('; ') : null;

        const { error: insertError } = await supabase
          .from('submissions')
          .insert({
            week_number: weekNumber,
            student_name: studentName,
            message_count: userMessageCount,
            reflection: reflection,
            session_duration_minutes: sessionDuration,
            conversation: messages,
            submitted_at: new Date().toISOString(),
            paste_attempts: pasteAttempts,
            suspected_ai_responses: suspectedAIResponses,
            flagged: submissionFlagged,
            flag_reason: flagReasonStr,
          });

        if (insertError) {
          console.error(`[${requestId}] Supabase insert error:`, insertError);
          // Don't fail the request - just log the error
        } else {
          console.log(`[${requestId}] Submission saved to Supabase`);
        }
      } catch (dbError) {
        console.error(`[${requestId}] Database error:`, dbError);
        // Don't fail the request - just log the error
      }
    } else {
      console.log(`[${requestId}] Supabase not configured - submission logged but not saved to database`);
    }

    return NextResponse.json({
      success: true,
      weekNumber,
      messageCount: userMessageCount,
      sessionDuration
    });
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return NextResponse.json({
      error: 'Something went wrong. Please try again.',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'SLHS 303 Submit API is running'
  });
}
