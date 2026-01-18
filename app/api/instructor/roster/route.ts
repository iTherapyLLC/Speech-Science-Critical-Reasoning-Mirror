import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { StudentInsert } from '@/lib/database.types'

// Verify instructor password from header
function verifyPassword(request: NextRequest): boolean {
  const password = request.headers.get('x-instructor-password')
  return password === process.env.INSTRUCTOR_PASSWORD
}

// GET - List all students with stats
export async function GET(request: NextRequest) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section')

  try {
    let query = supabase
      .from('students')
      .select('*')
      .order('name')

    if (section && section !== 'all') {
      query = query.eq('section', section)
    }

    const { data: students, error } = await query

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    // Get submission counts for each student
    const studentsWithStats = await Promise.all(
      (students || []).map(async (student) => {
        // Count submissions
        const { count: submissionCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('student_email', student.email)
          .not('submitted_at', 'is', null)

        // Get average score from grades
        const { data: grades } = await supabase
          .from('submissions')
          .select(`
            id,
            conversation:conversations!inner(student_email),
            grade:grades(total_score)
          `)
          .eq('conversations.student_email', student.email)

        const scores = grades
          ?.filter(g => g.grade && g.grade.length > 0)
          .map(g => g.grade[0]?.total_score)
          .filter((s): s is number => s !== null && s !== undefined) || []

        const avgScore = scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          : null

        return {
          ...student,
          submission_count: submissionCount || 0,
          graded_count: scores.length,
          avg_score: avgScore,
        }
      })
    )

    return NextResponse.json({ students: studentsWithStats })
  } catch (error) {
    console.error('Error in roster GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Import students from CSV data
export async function POST(request: NextRequest) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  try {
    const body = await request.json()
    const { students } = body as { students: StudentInsert[] }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'No students provided' }, { status: 400 })
    }

    // Validate each student
    const errors: string[] = []
    const validStudents: StudentInsert[] = []

    for (let i = 0; i < students.length; i++) {
      const student = students[i]

      if (!student.name || typeof student.name !== 'string') {
        errors.push(`Row ${i + 1}: Missing or invalid name`)
        continue
      }

      if (!student.email || typeof student.email !== 'string' || !student.email.includes('@')) {
        errors.push(`Row ${i + 1}: Missing or invalid email`)
        continue
      }

      if (!student.section || !['01', '02'].includes(student.section)) {
        errors.push(`Row ${i + 1}: Section must be '01' or '02'`)
        continue
      }

      validStudents.push({
        name: student.name.trim(),
        email: student.email.toLowerCase().trim(),
        section: student.section as '01' | '02',
      })
    }

    if (validStudents.length === 0) {
      return NextResponse.json({
        error: 'No valid students to import',
        errors
      }, { status: 400 })
    }

    // Upsert students (update if email exists, insert if not)
    const { data, error } = await supabase
      .from('students')
      .upsert(validStudents, {
        onConflict: 'email',
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error('Error importing students:', error)
      return NextResponse.json({
        error: 'Failed to import students',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: validStudents.length,
      errors: errors.length > 0 ? errors : undefined,
      students: data,
    })
  } catch (error) {
    console.error('Error in roster POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a student (by ID in query param)
export async function DELETE(request: NextRequest) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('id')

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)

    if (error) {
      console.error('Error deleting student:', error)
      return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in roster DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
