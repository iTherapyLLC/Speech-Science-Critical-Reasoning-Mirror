import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Verify instructor password from header
function verifyPassword(request: NextRequest): boolean {
  const password = request.headers.get('x-instructor-password')
  return password === process.env.INSTRUCTOR_PASSWORD
}

// GET - Export grades as CSV for Canvas
export async function GET(request: NextRequest) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section')
  const format = searchParams.get('format') || 'canvas'

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
      return NextResponse.json({ error: 'No students found' }, { status: 404 })
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

    // Build grade lookup: email -> week -> score
    const gradeLookup: Record<string, Record<number, number | null>> = {}

    for (const sub of submissions || []) {
      if (!gradeLookup[sub.student_email]) {
        gradeLookup[sub.student_email] = {}
      }

      const grade = sub.submission?.[0]?.grade?.[0]
      if (grade) {
        // Add reflection point if passed
        const totalWithReflection = grade.total_score + (grade.reflection_pass ? 1 : 0)
        gradeLookup[sub.student_email][sub.week_number] = totalWithReflection
      } else {
        // Submitted but not graded
        gradeLookup[sub.student_email][sub.week_number] = null
      }
    }

    // Build CSV based on format
    if (format === 'canvas') {
      // Canvas format: Student,Email,Week 2,Week 3,...,Week 15
      const weeks = Array.from({ length: 14 }, (_, i) => i + 2) // Weeks 2-15

      const headers = ['Student', 'Email', ...weeks.map(w => `Week ${w}`)]
      const rows = students.map(student => {
        const studentGrades = gradeLookup[student.email] || {}
        const weekScores = weeks.map(w => {
          const score = studentGrades[w]
          if (score === undefined) return '' // Not submitted
          if (score === null) return 'NS' // Submitted but not graded
          return score.toString()
        })
        return [student.name, student.email, ...weekScores]
      })

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="slhs303-grades-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else if (format === 'detailed') {
      // Detailed format with all rubric components
      const { data: detailedGrades } = await supabase
        .from('grades')
        .select(`
          submission_id,
          article_engagement,
          evidence_reasoning,
          critical_thinking,
          clinical_connection,
          reflection_pass,
          total_score,
          graded_at,
          submission:submissions(
            conversation:conversations(
              student_name,
              student_email,
              week_number
            )
          )
        `)

      const headers = [
        'Student',
        'Email',
        'Week',
        'Article Engagement',
        'Evidence Reasoning',
        'Critical Thinking',
        'Clinical Connection',
        'Reflection',
        'Total Score',
        'Graded At'
      ]

      const rows = (detailedGrades || [])
        .filter(g => g.submission?.conversation)
        .map(g => {
          const conv = g.submission.conversation
          return [
            conv.student_name,
            conv.student_email,
            conv.week_number,
            g.article_engagement,
            g.evidence_reasoning,
            g.critical_thinking,
            g.clinical_connection,
            g.reflection_pass ? 'Pass' : 'Fail',
            g.total_score + (g.reflection_pass ? 1 : 0),
            new Date(g.graded_at).toLocaleDateString()
          ]
        })

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="slhs303-detailed-grades-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Error in export GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
