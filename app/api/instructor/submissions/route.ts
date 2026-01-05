import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

function verifyPassword(request: Request): boolean {
  const authHeader = request.headers.get("x-instructor-password")
  return authHeader === process.env.INSTRUCTOR_PASSWORD
}

export async function GET(request: Request) {
  if (!verifyPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)

  const week = searchParams.get("week")
  const flaggedOnly = searchParams.get("flagged") === "true"
  const unreviewedOnly = searchParams.get("unreviewed") === "true"

  let query = supabase
    .from("submission_details")
    .select("*")
    .order("submitted_at", { ascending: false })

  if (week && week !== "all") {
    query = query.eq("week_number", parseInt(week))
  }

  if (flaggedOnly) {
    query = query.eq("flagged", true)
  }

  if (unreviewedOnly) {
    query = query.eq("reviewed", false)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ submissions: data })
}
