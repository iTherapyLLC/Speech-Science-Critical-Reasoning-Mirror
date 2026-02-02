import { NextRequest, NextResponse } from 'next/server';
import {
  buildWeeklyGradingPrompt,
  buildMidtermGradingPrompt,
  buildFinalGradingPrompt,
  type AssessmentMode,
} from '@/lib/grading-calibration';

const API_TIMEOUT_MS = 120000;
const MAX_SUBMISSION_LENGTH = 50000;

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Grade API request received`);

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body', errorCode: 'INVALID_JSON' },
        { status: 400 }
      );
    }

    const {
      mode,
      weekNumber,
      studentSubmission,
      conversationTranscript,
    }: {
      mode: AssessmentMode;
      weekNumber?: number;
      studentSubmission: string;
      conversationTranscript?: string;
    } = body;

    // Validate mode
    if (!mode || !['weekly', 'midterm', 'final'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid assessment mode. Must be weekly, midterm, or final.', errorCode: 'INVALID_MODE' },
        { status: 400 }
      );
    }

    // Validate submission
    if (!studentSubmission || typeof studentSubmission !== 'string' || studentSubmission.trim().length === 0) {
      return NextResponse.json(
        { error: 'Student submission is required.', errorCode: 'MISSING_SUBMISSION' },
        { status: 400 }
      );
    }

    if (studentSubmission.length > MAX_SUBMISSION_LENGTH) {
      return NextResponse.json(
        { error: 'Submission exceeds maximum length.', errorCode: 'SUBMISSION_TOO_LONG' },
        { status: 400 }
      );
    }

    // Validate week number for weekly mode
    if (mode === 'weekly') {
      const week = typeof weekNumber === 'number' ? weekNumber : parseInt(String(weekNumber), 10);
      if (isNaN(week) || week < 1 || week > 15) {
        return NextResponse.json(
          { error: 'Week number (1-15) is required for weekly grading.', errorCode: 'INVALID_WEEK' },
          { status: 400 }
        );
      }
    }

    // Build system prompt based on mode
    let systemPrompt: string;
    if (mode === 'midterm') {
      systemPrompt = buildMidtermGradingPrompt();
    } else if (mode === 'final') {
      systemPrompt = buildFinalGradingPrompt();
    } else {
      systemPrompt = buildWeeklyGradingPrompt(weekNumber || 2);
    }

    // Build user message
    let userMessage = '';
    if (conversationTranscript) {
      userMessage += `=== CONVERSATION TRANSCRIPT ===\n${conversationTranscript}\n\n`;
    }
    userMessage += `=== STUDENT SUBMISSION ===\n${studentSubmission}`;

    console.log(`[${requestId}] Calling Claude API (Opus 4.5) for ${mode} grading`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5-20250514',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error(`[${requestId}] Claude API error:`, claudeResponse.status, errorText);
        return NextResponse.json(
          { error: `Grading service error (${claudeResponse.status}). Please try again.`, errorCode: 'API_ERROR', debug: `Claude API returned ${claudeResponse.status}` },
          { status: 500 }
        );
      }

      const claudeData = await claudeResponse.json();
      const responseText = claudeData.content?.[0]?.text || '';

      console.log(`[${requestId}] Claude grading response received, length: ${responseText.length}`);

      // For exam modes, parse JSON response
      if (mode === 'midterm' || mode === 'final') {
        try {
          // Strip any markdown code fences if present
          const cleanedResponse = responseText
            .replace(/^```(?:json)?\s*/m, '')
            .replace(/\s*```\s*$/m, '')
            .trim();
          const gradingResult = JSON.parse(cleanedResponse);
          return NextResponse.json({
            success: true,
            mode,
            result: gradingResult,
          });
        } catch (parseError) {
          console.error(`[${requestId}] Failed to parse grading JSON:`, parseError);
          // Return raw text as fallback
          return NextResponse.json({
            success: true,
            mode,
            result: null,
            rawResponse: responseText,
          });
        }
      }

      // For weekly mode, return raw text (existing format)
      return NextResponse.json({
        success: true,
        mode: 'weekly',
        weekNumber,
        rawResponse: responseText,
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`[${requestId}] Request timed out`);
        return NextResponse.json(
          { error: 'Grading request timed out. Please try again.', errorCode: 'TIMEOUT' },
          { status: 504 }
        );
      }
      throw fetchError;
    }

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.', errorCode: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'SLHS 303 Grade API is running',
    version: '1.0 — Weekly + Midterm + Final grading',
    model: 'claude-opus-4-5-20250514',
    modes: ['weekly', 'midterm', 'final'],
  });
}
