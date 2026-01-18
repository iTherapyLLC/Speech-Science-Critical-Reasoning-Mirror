import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import type { GradeInsert } from '@/lib/database.types'

// Verify instructor password from header
function verifyPassword(request: NextRequest): boolean {
  const password = request.headers.get('x-instructor-password')
  return password === process.env.INSTRUCTOR_PASSWORD
}

// POST - Create or update a grade
export async function POST(request: NextRequest) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  try {
    const body = await request.json()
    const {
      submission_id,
      article_engagement,
      evidence_reasoning,
      critical_thinking,
      clinical_connection,
      reflection_pass,
      grader_notes,
      graded_by,
    } = body

    // Validate required fields
    if (!submission_id) {
      return NextResponse.json({ error: 'submission_id is required' }, { status: 400 })
    }

    // Validate score ranges (0-2)
    const scores = [article_engagement, evidence_reasoning, critical_thinking, clinical_connection]
    for (const score of scores) {
      if (score === undefined || score === null || score < 0 || score > 2) {
        return NextResponse.json({
          error: 'All rubric scores must be between 0 and 2'
        }, { status: 400 })
      }
    }

    if (typeof reflection_pass !== 'boolean') {
      return NextResponse.json({
        error: 'reflection_pass must be a boolean'
      }, { status: 400 })
    }

    const gradeData: GradeInsert = {
      submission_id,
      article_engagement,
      evidence_reasoning,
      critical_thinking,
      clinical_connection,
      reflection_pass,
      grader_notes: grader_notes || null,
      graded_by: graded_by || 'Unknown',
    }

    // Upsert grade (update if exists for this submission)
    const { data, error } = await supabase
      .from('grades')
      .upsert(gradeData, {
        onConflict: 'submission_id',
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving grade:', error)
      return NextResponse.json({
        error: 'Failed to save grade',
        details: error.message
      }, { status: 500 })
    }

    // Also mark submission as reviewed
    await supabase
      .from('submissions')
      .update({
        reviewed: true,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submission_id)

    return NextResponse.json({
      success: true,
      grade: data,
    })
  } catch (error) {
    console.error('Error in grades POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get grade for a specific submission
export async function GET(request: NextRequest) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const submissionId = searchParams.get('submission_id')

  if (!submissionId) {
    return NextResponse.json({ error: 'submission_id is required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('submission_id', submissionId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching grade:', error)
      return NextResponse.json({ error: 'Failed to fetch grade' }, { status: 500 })
    }

    return NextResponse.json({ grade: data || null })
  } catch (error) {
    console.error('Error in grades GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
