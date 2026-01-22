import { NextRequest, NextResponse } from 'next/server';
import { detectCrisis, CRISIS_RESPONSE, HARM_RESPONSE } from '@/lib/crisis-detection';
import { logCrisisIncident } from '@/lib/supabase';
import { CONVERSATION_STARTERS, WEEKLY_ARTICLES } from '@/lib/knowledge/syllabus';
import { weeksData } from '@/lib/weeks-data';

// Timeout for API requests (90 seconds)
const API_TIMEOUT_MS = 90000;

// Input validation limits
const MAX_MESSAGE_LENGTH = 10000;
const MAX_HISTORY_LENGTH = 100;
const MAX_WEEK_NUMBER = 15;

// Week 1 opener (foundation week - no article)
const WEEK_1_OPENER = `Let's explore the foundations of speech science together.

Here's my first question: What do you think sound actually IS? Like, physically — what's happening when you hear someone talk?

Hint: Think about what's traveling through the air. You might remember something about waves or vibrations.`;

// Helper to get week opener - uses CONVERSATION_STARTERS from syllabus for weeks 2-15
function getWeekOpener(weekNumber: number): string {
  if (weekNumber === 1) {
    return WEEK_1_OPENER;
  }
  // Use the comprehensive starters from syllabus.ts, with fallback
  return CONVERSATION_STARTERS[weekNumber] || CONVERSATION_STARTERS[2];
}

// Helper to get article info for a week
function getArticleInfo(weekNumber: number): { title: string; author: string } | null {
  if (weekNumber === 1) return null; // No article for Week 1
  return WEEKLY_ARTICLES[weekNumber as keyof typeof WEEKLY_ARTICLES] || null;
}

// Helper to get week topic
function getWeekTopic(weekNumber: number): string {
  const week = weeksData.find(w => w.week === weekNumber);
  return week?.topic || `Week ${weekNumber}`;
}

// Follow-up question templates
const FOLLOW_UP_TEMPLATES = {
  2: `Good. So they wanted to know about [TOPIC].

Now, what did they actually find? Did most SLPs use research regularly, or not? What did the results show?`,

  3: `You mentioned [TOPIC].

Can you give me a specific number or percentage from the article? For example, "X% of clinicians said..." or "The study found that X out of Y..."

This shows you engaged with the actual data.`,

  4: `Nice. Was there anything else that stood out? Another finding, or something that surprised you?

If nothing specific comes to mind, just tell me what you remember — even small details count.`,

  5: `Now let's think critically. Every study has limitations. Here are some common ones:
- Small sample size
- Only surveyed one type of clinician
- People might not answer surveys honestly
- The study is old
- The conditions weren't realistic

Did you notice anything like that? Or was there something that confused you about the study?`,

  6: `Last question. Imagine you're an SLP working in a school or clinic. Based on what this article found, is there anything you might do differently? Or anything you'd want to be aware of?

Even a simple answer works, like: "I'd want to make sure I actually look up research instead of just guessing" or "This makes me think I should ask where recommendations come from."`,
};

// Brief encouragements after each question
const ENCOURAGEMENTS = [
  "", // Q1 - no encouragement needed, just the question
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
      questionNumber = 1,
      studentName = "Student"
    } = body;

    // Handle __START__ message - return first question
    if (message === "__START__") {
      const opener = getWeekOpener(weekNumber);
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
        questionNumber,
        questionComplete: false,
        conversationComplete: false,
      });
    }

    // Calculate which question we're on based on conversation length
    const userMessageCount = conversationHistory.filter((m: { role: string }) => m.role === 'user').length;
    const currentQ = userMessageCount + 1; // Adding 1 because current message isn't in history yet

    // Get article info for this week
    const articleInfo = getArticleInfo(parsedWeekNumber);
    const weekTopic = getWeekTopic(parsedWeekNumber);

    // Build system prompt
    const systemPrompt = `You are the Critical Reasoning Mirror — a supportive tutor helping undergraduate students think through a research article.

THIS WEEK'S ARTICLE:
${articleInfo ? `- Title: "${articleInfo.title}"
- Author(s): ${articleInfo.author}
- Topic: ${weekTopic}` : `- Week 1: Foundations (no article — exploring basic concepts)`}

CRITICAL CONTEXT ABOUT YOUR STUDENTS:
- These students have never done critical thinking exercises before
- Many are first-generation college students working 25+ hours a week
- Zero out of 37 knew who Socrates was
- One student asked "What do we say?" — they literally don't know how to start
- They are scared and think they're going to fail
- They need someone in their corner
- Science is about EFFORT, not perfection

YOU ARE THE SPARK. THEIR BRAIN IS THE TINDER.

You light the fire. You do ALL the heavy lifting. They just respond to your prompts.

YOUR APPROACH:

1. BE WARM AND ENCOURAGING
   - "Good start!"
   - "That's a solid observation."
   - "You're on the right track."
   - "Nice — you remembered a specific detail."

2. DRAW OUT MORE WHEN ANSWERS ARE THIN
   - "Can you say a little more about that?"
   - "What made you think that?"
   - "Is there anything else you noticed?"

3. NEVER MAKE THEM FEEL STUPID
   - If wrong: "Interesting — what in the article made you think that?"
   - If stuck: "That's okay. Take a guess — there's no wrong answer here."
   - If minimal: "Good start. Can you add one more detail?"

4. KEEP IT SHORT
   - 2-4 sentences max per response
   - Don't write paragraphs
   - Get to the point

CURRENT STATE:
- Week: ${parsedWeekNumber}
- Question: ${currentQ} of 6
- Student: ${studentName}

YOUR TASK NOW:
The student just answered question ${currentQ}.

${currentQ < 6 ? `
Acknowledge their answer briefly and positively, then ask the NEXT question.

Question ${currentQ + 1} should focus on:
${currentQ === 1 ? "What did the researchers actually FIND? What were the results?" : ""}
${currentQ === 2 ? "Can they give a SPECIFIC number, percentage, or finding from the article?" : ""}
${currentQ === 3 ? "Was there anything else that stood out, surprised them, or that they remember?" : ""}
${currentQ === 4 ? "What are the LIMITATIONS or things that confused them about the study?" : ""}
${currentQ === 5 ? "How might this research matter for CLINICIANS in practice?" : ""}

Add a brief encouragement: "${ENCOURAGEMENTS[currentQ] || ''}"

Remember: Provide context and hints. Make it easy for them to answer.
` : `
This is their LAST answer. Acknowledge it warmly and wrap up.

Say something like:
"Great job! You've just thought through all the key parts of this article — what it was about, what they found, what the limitations might be, and why it matters.

Now you're ready to write your reflection. The template will make it easy — just summarize what you told me."

DO NOT ask another question. The conversation is complete.
`}

NEVER:
- Ask vague, open-ended questions without hints
- Give them the answer directly
- Make them feel stupid
- Use jargon or complex language
- Write long paragraphs
- Let them off the hook with "I don't know" (redirect warmly)

ALWAYS:
- Provide context before asking
- Give hints about where to find answers
- Validate their responses before moving on
- Keep the energy positive and encouraging`;

    // Build messages array for Claude
    const claudeMessages = conversationHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add current user message
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
          max_tokens: 500, // Keep responses short
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

export async function GET() {
  return NextResponse.json({
    status: 'SLHS 303 Chat API is running',
    version: '2.0 - Spoon-fed 6-question format'
  });
}
