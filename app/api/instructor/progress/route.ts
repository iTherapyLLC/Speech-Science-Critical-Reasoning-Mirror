import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Verify instructor password from header
function verifyPassword(request: NextRequest): boolean {
  const password = request.headers.get('x-instructor-password')
  return password === process.env.INSTRUCTOR_PASSWORD
}

export interface StudentProgressRow {
  student_id: string
  student_name: string
  student_email: string
  section: string
  weeks: Record<number, {
    status: 'not_submitted' | 'ungraded' | 'graded'
    submission_id?: string
    total_score?: number
  }>
}

// GET - Get progress grid data
export async function GET(request: NextRequest) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section')

  try {
    // Get all students
    let studentQuery = supabase.from('students').select('*').order('name')
    if (section && section !== 'all') {
      studentQuery = studentQuery.eq('section', section)
    }
    const { data: students, error: studentError } = await studentQuery

    if (studentError) {
      console.error('Error fetching students:', studentError)
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    if (!students || students.length === 0) {
      return NextResponse.json({ progress: [], stats: { total: 0, at_risk: 0, ungraded: 0 } })
    }

    // Get all submissions with grades
    const { data: submissions, error: subError } = await supabase
      .from('conversations')
      .select(`
        id,
        student_email,
        week_number,
        submitted_at,
        submission:submissions(
          id,
          grade:grades(total_score, reflection_pass)
        )
      `)
      .not('submitted_at', 'is', null)

    if (subError) {
      console.error('Error fetching submissions:', subError)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    // Build submission lookup: email -> week -> data
    const submissionLookup: Record<string, Record<number, {
      submission_id: string
      total_score?: number
      reflection_pass?: boolean
    }>> = {}

    for (const sub of submissions || []) {
      if (!submissionLookup[sub.student_email]) {
        submissionLookup[sub.student_email] = {}
      }

      const grade = sub.submission?.[0]?.grade?.[0]
      submissionLookup[sub.student_email][sub.week_number] = {
        submission_id: sub.submission?.[0]?.id || sub.id,
        total_score: grade?.total_score,
        reflection_pass: grade?.reflection_pass,
      }
    }

    // Build progress grid
    const weeks = Array.from({ length: 14 }, (_, i) => i + 2) // Weeks 2-15

    const progress: StudentProgressRow[] = students.map(student => {
      const studentSubmissions = submissionLookup[student.email] || {}
      const weekData: StudentProgressRow['weeks'] = {}

      for (const week of weeks) {
        const sub = studentSubmissions[week]
        if (!sub) {
          weekData[week] = { status: 'not_submitted' }
        } else if (sub.total_score === undefined || sub.total_score === null) {
          weekData[week] = {
            status: 'ungraded',
            submission_id: sub.submission_id,
          }
        } else {
          weekData[week] = {
            status: 'graded',
            submission_id: sub.submission_id,
            total_score: sub.total_score + (sub.reflection_pass ? 1 : 0),
          }
        }
      }

      return {
        student_id: student.id,
        student_name: student.name,
        student_email: student.email,
        section: student.section,
        weeks: weekData,
      }
    })

    // Calculate stats
    let ungradedCount = 0
    let atRiskCount = 0 // Students missing 2+ weeks

    for (const student of progress) {
      let missingCount = 0
      for (const week of weeks) {
        if (student.weeks[week].status === 'not_submitted') {
          missingCount++
        } else if (student.weeks[week].status === 'ungraded') {
          ungradedCount++
        }
      }
      if (missingCount >= 2) {
        atRiskCount++
      }
    }

    return NextResponse.json({
      progress,
      stats: {
        total: students.length,
        at_risk: atRiskCount,
        ungraded: ungradedCount,
      },
    })
  } catch (error) {
    console.error('Error in progress GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
