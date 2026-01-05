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

  // Get total submissions
  const { count: totalCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })

  // Get flagged count
  const { count: flaggedCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("flagged", true)

  // Get unreviewed count
  const { count: unreviewedCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("reviewed", false)

  // Get submissions this week (last 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { count: thisWeekCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneWeekAgo.toISOString())

  // Get submissions by week number
  const { data: weekStats } = await supabase
    .from("submission_details")
    .select("week_number")

  const weekCounts: Record<number, number> = {}
  weekStats?.forEach((s: { week_number: number }) => {
    weekCounts[s.week_number] = (weekCounts[s.week_number] || 0) + 1
  })

  return NextResponse.json({
    stats: {
      total: totalCount || 0,
      flagged: flaggedCount || 0,
      unreviewed: unreviewedCount || 0,
      thisWeek: thisWeekCount || 0,
      byWeek: weekCounts,
    },
  })
}
