import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import type { SubmissionUpdate } from "@/lib/database.types"

function verifyPassword(request: Request): boolean {
  const authHeader = request.headers.get("x-instructor-password")
  return authHeader === process.env.INSTRUCTOR_PASSWORD
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from("submission_details")
    .select("*")
    .eq("submission_id", id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ submission: data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const supabase = createServiceClient()

  const updateData: SubmissionUpdate = {}

  if (body.score !== undefined) {
    updateData.score = body.score
  }

  if (body.flagged !== undefined) {
    updateData.flagged = body.flagged
    if (!body.flagged) {
      updateData.flag_reason = null
    }
  }

  if (body.flag_reason !== undefined) {
    updateData.flag_reason = body.flag_reason
  }

  if (body.reviewed !== undefined) {
    updateData.reviewed = body.reviewed
    if (body.reviewed) {
      updateData.reviewed_at = new Date().toISOString()
    } else {
      updateData.reviewed_at = null
    }
  }

  if (body.reviewer_notes !== undefined) {
    updateData.reviewer_notes = body.reviewer_notes
  }

  const { data, error } = await supabase
    .from("submissions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ submission: data })
}
