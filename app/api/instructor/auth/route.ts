import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { password } = await request.json()
  const correctPassword = process.env.INSTRUCTOR_PASSWORD

  if (!correctPassword) {
    return NextResponse.json(
      { error: "Instructor password not configured" },
      { status: 500 }
    )
  }

  if (password === correctPassword) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 })
}
