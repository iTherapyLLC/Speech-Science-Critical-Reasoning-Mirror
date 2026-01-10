import { NextResponse } from "next/server"

// Simple in-memory rate limiting for auth attempts
// In production, consider using Redis or a dedicated rate limiting service
const authAttempts = new Map<string, { count: number; resetTime: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  // Fallback for local development
  return "unknown"
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = authAttempts.get(ip)

  if (!record) {
    return false
  }

  // Reset if window has passed
  if (now > record.resetTime) {
    authAttempts.delete(ip)
    return false
  }

  return record.count >= MAX_ATTEMPTS
}

function recordAttempt(ip: string): void {
  const now = Date.now()
  const record = authAttempts.get(ip)

  if (!record || now > record.resetTime) {
    authAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS })
  } else {
    record.count++
  }
}

export async function POST(request: Request) {
  const clientIP = getClientIP(request)

  // Check rate limit
  if (isRateLimited(clientIP)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in 15 minutes." },
      { status: 429 }
    )
  }

  let password: string
  try {
    const body = await request.json()
    password = body.password
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }

  const correctPassword = process.env.INSTRUCTOR_PASSWORD

  if (!correctPassword) {
    return NextResponse.json(
      { error: "Instructor password not configured" },
      { status: 500 }
    )
  }

  // Record the attempt before checking password
  recordAttempt(clientIP)

  if (password === correctPassword) {
    // Clear attempts on successful login
    authAttempts.delete(clientIP)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 })
}
