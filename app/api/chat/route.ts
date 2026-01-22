import { NextRequest, NextResponse } from 'next/server';
import { detectCrisis, CRISIS_RESPONSE, HARM_RESPONSE } from '@/lib/crisis-detection';
import { logCrisisIncident } from '@/lib/supabase';
import {
  CONVERSATION_STARTERS,
  WEEKLY_ARTICLES,
  WEEK_REASONING_CONTENT,
  WEEK_1_PRACTICE_QUESTIONS
} from '@/lib/knowledge/syllabus';
import { weeksData } from '@/lib/weeks-data';

// Timeout for API requests (90 seconds)
const API_TIMEOUT_MS = 90000;

// Input validation limits
const MAX_MESSAGE_LENGTH = 10000;
const MAX_WEEK_NUMBER = 15;

// Helper to get article info for a week
function getArticleInfo(weekNumber: number): { title: string; author: string } | null {
  if (weekNumber === 1) return null;
  return WEEKLY_ARTICLES[weekNumber as keyof typeof WEEKLY_ARTICLES] || null;
}

// Helper to get week topic
function getWeekTopic(weekNumber: number): string {
  const week = weeksData.find(w => w.week === weekNumber);
  return week?.topic || `Week ${weekNumber}`;
}

// Helper to get week reasoning content
function getWeekReasoning(weekNumber: number) {
  return WEEK_REASONING_CONTENT[weekNumber] || WEEK_REASONING_CONTENT[2];
}

// Get the first question for a week using scientific reasoning structure
function getFirstQuestion(weekNumber: number): string {
  if (weekNumber === 1) {
    // Week 1: Practice week - first practice question
    return `Welcome! This is a practice conversation to help you get comfortable with the format.

Here's my first question: ${WEEK_1_PRACTICE_QUESTIONS[0]}

Take your best guess — there's no wrong answer here.`;
  }

  const articleInfo = getArticleInfo(weekNumber);
  const reasoning = getWeekReasoning(weekNumber);
  const weekTopic = getWeekTopic(weekNumber);

  return `This week we're discussing "${articleInfo?.title}" by ${articleInfo?.author}.

**Question 1 — THE CLAIM:**

This article makes claims about ${weekTopic.toLowerCase()}. Pick ONE specific claim — something like "X causes Y" or "When A happens, B changes."

${reasoning.keyClaimExamples.length > 0 ? `For example, a claim from this article might be:
${reasoning.keyClaimExamples.map(c => `• "${c}"`).join('\n')}` : ''}

What's one specific claim you noticed in this article?`;
}

// Brief encouragements between questions
const ENCOURAGEMENTS = [
  "", // Q1
  "Good. Keep going.",
  "You're halfway there.",
  "Nice thinking.",
  "Almost done.",
  "Last question.",
];

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Chat API request received`);

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        error: 'Invalid request body',
        errorCode: 'INVALID_JSON'
      }, { status: 400 });
    }

    const {
      message,
      conversationHistory = [],
      weekNumber = 2,
      studentName = "Student"
    } = body;

    // Handle __START__ message - return first question
    if (message === "__START__") {
      const opener = getFirstQuestion(weekNumber);
      return NextResponse.json({
        response: opener,
        questionComplete: false,
        conversationComplete: false,
        weekNumber,
        questionNumber: 1,
      });
    }

    // Input validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        error: 'Message is required and must be a string',
        errorCode: 'INVALID_MESSAGE'
      }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({
        error: `Message is too long. Please keep messages under ${MAX_MESSAGE_LENGTH.toLocaleString()} characters.`,
        errorCode: 'MESSAGE_TOO_LONG'
      }, { status: 400 });
    }

    if (message.trim().length === 0) {
      return NextResponse.json({
        error: 'Message cannot be empty',
        errorCode: 'EMPTY_MESSAGE'
      }, { status: 400 });
    }

    // Validate week number
    const parsedWeekNumber = typeof weekNumber === 'number' ? weekNumber : parseInt(weekNumber, 10);
    if (isNaN(parsedWeekNumber) || parsedWeekNumber < 1 || parsedWeekNumber > MAX_WEEK_NUMBER) {
      return NextResponse.json({
        error: 'Invalid week number',
        errorCode: 'INVALID_WEEK'
      }, { status: 400 });
    }

    // SB 243 Compliance: Check for crisis language BEFORE sending to Claude
    const crisisCheck = detectCrisis(message);

    if (crisisCheck.detected) {
      try {
        await logCrisisIncident(crisisCheck.type);
      } catch (logError) {
        console.error('Failed to log crisis incident:', logError);
      }

      return NextResponse.json({
        response: crisisCheck.type === 'others' ? HARM_RESPONSE : CRISIS_RESPONSE,
        isCrisisIntervention: true,
        weekNumber: parsedWeekNumber,
        questionComplete: false,
        conversationComplete: false,
      });
    }

    // Calculate which question we're on based on conversation length
    const userMessageCount = conversationHistory.filter((m: { role: string }) => m.role === 'user').length;
    const currentQ = userMessageCount + 1;

    // Get week-specific content
    const articleInfo = getArticleInfo(parsedWeekNumber);
    const weekTopic = getWeekTopic(parsedWeekNumber);
    const reasoning = getWeekReasoning(parsedWeekNumber);
    const isWeek1 = parsedWeekNumber === 1;

    // Build the scientific reasoning system prompt
    const systemPrompt = buildScientificReasoningPrompt({
      weekNumber: parsedWeekNumber,
      articleInfo,
      weekTopic,
      reasoning,
      currentQ,
      studentName,
      isWeek1,
    });

    // Build messages array for Claude
    const claudeMessages = conversationHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    claudeMessages.push({
      role: 'user',
      content: message,
    });

    console.log(`[${requestId}] Calling Claude API, question ${currentQ} of 6`);

    // Call Claude API
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
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          system: systemPrompt,
          messages: claudeMessages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error(`[${requestId}] Claude API error:`, claudeResponse.status, errorText);
        return NextResponse.json({
          error: 'I had trouble thinking. Please try again.',
          errorCode: 'API_ERROR'
        }, { status: 500 });
      }

      const claudeData = await claudeResponse.json();
      const responseText = claudeData.content?.[0]?.text || '';

      console.log(`[${requestId}] Claude response received, length: ${responseText.length}`);

      return NextResponse.json({
        response: responseText,
        questionComplete: true,
        conversationComplete: currentQ >= 6,
        weekNumber: parsedWeekNumber,
        questionNumber: currentQ,
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`[${requestId}] Request timed out`);
        return NextResponse.json({
          error: 'The request took too long. Please try again.',
          errorCode: 'TIMEOUT'
        }, { status: 504 });
      }
      throw fetchError;
    }

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return NextResponse.json({
      error: 'Something went wrong. Please try again.',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// Build the scientific reasoning system prompt
function buildScientificReasoningPrompt(params: {
  weekNumber: number;
  articleInfo: { title: string; author: string } | null;
  weekTopic: string;
  reasoning: typeof WEEK_REASONING_CONTENT[number];
  currentQ: number;
  studentName: string;
  isWeek1: boolean;
}): string {
  const { weekNumber, articleInfo, weekTopic, reasoning, currentQ, studentName, isWeek1 } = params;

  // Week 1 has a simpler prompt (practice week, no article)
  if (isWeek1) {
    return buildWeek1Prompt(currentQ, studentName);
  }

  return `You are the Critical Reasoning Mirror — a supportive tutor teaching undergraduate students SCIENTIFIC REASONING through a research article.

THIS WEEK'S ARTICLE:
- Title: "${articleInfo?.title}"
- Author(s): ${articleInfo?.author}
- Topic: ${weekTopic}

WEEK-SPECIFIC CONTENT TO USE:
- Key insight: "${reasoning.keyInsight}"
- Assumption to probe: "${reasoning.assumptionToProbe}"
- Common confounds: ${reasoning.commonConfounds.map(c => `"${c}"`).join(', ')}

CRITICAL CONTEXT ABOUT YOUR STUDENTS:
- These students have NEVER done critical thinking exercises before
- Zero out of 37 knew who Socrates was
- One asked "What do we say?" — they literally don't know how to start
- They are scared and think they're going to fail
- They need someone in their corner
- Science is about EFFORT, not perfection

YOU ARE THE SPARK. THEIR BRAIN IS THE TINDER.

You light the fire. You do ALL the heavy lifting. They just respond to your prompts.

SCIENTIFIC REASONING STRUCTURE (6 Questions):
Your questions guide students through this reasoning chain:
1. THE CLAIM — Identify a specific claim from the article
2. WHY IT MATTERS — Explain clinical relevance
3. THE EVIDENCE — Find specific data supporting the claim
4. THE ASSUMPTION — Identify what has to be true for the claim to work
5. THE PROBLEM/CONFOUND — What could explain results differently?
6. BETTER TEST + TAKEAWAY — How to fix it? What do they actually trust?

CURRENT STATE:
- Week: ${weekNumber}
- Question: ${currentQ} of 6
- Student: ${studentName}

YOUR TASK NOW:
The student just answered question ${currentQ}.

${getQuestionGuidance(currentQ, reasoning)}

YOUR APPROACH:
1. Start every exchange with brief validation ("Good start!", "Nice observation.")
2. If answer is thin: "Can you say a little more?" or "What made you think that?"
3. If stuck: "That's okay. Take a guess — there's no wrong answer here."
4. If wrong: "Interesting — what in the article made you think that?"
5. Keep responses to 2-4 sentences max
6. Always provide hints and examples for the next question

NEVER:
- Ask vague questions without context or hints
- Give them the answer directly
- Make them feel stupid
- Use jargon without immediately explaining it
- Write long paragraphs
- Let them off with "I don't know" (redirect warmly)

ALWAYS:
- Validate before moving on
- Give specific examples of what good answers look like
- Reference THIS article's content
- Keep energy positive and encouraging`;
}

// Get question-specific guidance for the system prompt
function getQuestionGuidance(currentQ: number, reasoning: typeof WEEK_REASONING_CONTENT[number]): string {
  if (currentQ >= 6) {
    return `This is their LAST answer. Acknowledge it warmly and wrap up.

Say something like:
"You did it! You just worked through the scientific reasoning process:
- You identified a claim
- You found the evidence
- You spotted an assumption
- You thought of what could go wrong
- You proposed a better test
- You decided what you actually trust

This is exactly how scientists think. Now click Continue to write your reflection — the template matches what we just talked through."

DO NOT ask another question. The conversation is complete.`;
  }

  const guidance: Record<number, string> = {
    1: `Acknowledge their claim, then ask Question 2 — WHY IT MATTERS:

"Good. You identified: [restate their claim briefly].

Now, why would that claim matter for someone working with patients? Even a guess is fine. Think: If this is true, what would a clinician need to know or do differently?"

${ENCOURAGEMENTS[1]}`,

    2: `Acknowledge their clinical connection, then ask Question 3 — THE EVIDENCE:

"Nice. What EVIDENCE did the researchers give for that claim?

Look for specific numbers, percentages, or findings. Something like 'X% of participants...' or 'The results showed that...'

What evidence supports the claim you picked?"

${ENCOURAGEMENTS[2]}`,

    3: `Acknowledge their evidence, then ask Question 4 — THE ASSUMPTION:

"Good — you found specific data. Now here's where we think critically.

For their claim to be true, what has to be ASSUMED? An assumption is something that has to be true for their conclusion to work, but they didn't directly test.

Examples of assumptions:
• They assumed the measurement was accurate
• They assumed participants answered honestly
• They assumed their sample represented the real population
• ${reasoning.assumptionToProbe}

What assumption did you notice, or what would HAVE to be true for their claim to work?"

${ENCOURAGEMENTS[3]}`,

    4: `Acknowledge their assumption, then ask Question 5 — THE CONFOUND:

"Nice thinking. Now here's the key critical reasoning skill: What's a CONFOUND?

A confound is something ELSE that could explain their results — something OTHER than what they're claiming.

Common confounds for this study:
${reasoning.commonConfounds.map(c => `• ${c}`).join('\n')}

What's one thing that could mess up their results or explain their findings differently?"

${ENCOURAGEMENTS[4]}`,

    5: `Acknowledge their confound, then ask Question 6 — BETTER TEST + TAKEAWAY:

"Good critical thinking! Last question — two parts:

1. How could they FIX that problem in a future study? What would make you trust the results more?

2. Given everything we discussed — what do you ACTUALLY trust from this article? What's the takeaway you'd feel confident using in clinical practice?"

${ENCOURAGEMENTS[5]}`,
  };

  return guidance[currentQ] || guidance[1];
}

// Build Week 1 practice prompt (no article)
function buildWeek1Prompt(currentQ: number, studentName: string): string {
  return `You are the Critical Reasoning Mirror — a supportive tutor helping students explore foundational speech science concepts.

THIS IS WEEK 1: PRACTICE WEEK (No article — exploring basic concepts)

CRITICAL CONTEXT:
- This is their FIRST conversation with you
- They have never done critical thinking exercises
- They are nervous and don't know what to expect
- This week is UNGRADED practice
- Goal: Get comfortable with the format

CURRENT STATE:
- Week: 1 (Practice)
- Question: ${currentQ} of 6
- Student: ${studentName}

PRACTICE QUESTIONS FOR WEEK 1:
1. What is sound? How does it travel?
2. What's the difference between frequency and amplitude?
3. Why does speech feel automatic, and why is that a problem for scientists?
4. What does 'falsifiable' mean? Why does it matter?
5. Why might two clinicians disagree even with the same evidence?
6. What's one thing you're curious about in speech science?

YOUR TASK:
${currentQ < 6 ? `
The student just answered question ${currentQ}.

Acknowledge their answer warmly (even if it's not perfect — this is practice!), then ask question ${currentQ + 1}:

"${WEEK_1_PRACTICE_QUESTIONS[currentQ]}"

Be encouraging. This is about getting comfortable, not being right.
` : `
This is their last answer. Wrap up warmly:

"Great job! You just completed your first Mirror conversation.

This week was practice — no grades, no pressure. You explored some foundational concepts that we'll build on all semester.

Starting next week, you'll read research articles and use a scientific reasoning template. But the format will feel familiar now.

Click Continue to see what the reflection looks like (this week it's simplified since there was no article)."

DO NOT ask another question.`}

KEEP IT SIMPLE:
- 2-3 sentences max
- Celebrate any attempt
- No jargon
- Extra encouraging since this is their first time`;
}

export async function GET() {
  return NextResponse.json({
    status: 'SLHS 303 Chat API is running',
    version: '3.0 - Scientific Reasoning Structure'
  });
}
