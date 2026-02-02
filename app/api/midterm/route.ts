import { NextRequest, NextResponse } from 'next/server';
import { detectCrisis, CRISIS_RESPONSE, HARM_RESPONSE } from '@/lib/crisis-detection';
import { logCrisisIncident } from '@/lib/supabase';
import { RESEARCH_METHODS_PRIMER, COURSE_SYLLABUS } from '@/lib/knowledge';

// Timeout for API requests (120 seconds - midterm conversations can be longer)
const API_TIMEOUT_MS = 120000;

// Input validation limits
const MAX_MESSAGE_LENGTH = 10000;
const MAX_HISTORY_LENGTH = 200; // Longer for midterm conversations

// Submission windows (Spring 2026)
const MIDTERM_WINDOW = {
  start: new Date('2026-03-17T00:00:00'),
  end: new Date('2026-03-23T23:59:59'),
};

const FINAL_WINDOW = {
  start: new Date('2026-05-11T00:00:00'),
  end: new Date('2026-05-16T23:59:59'),
};

// Check if current date is within submission window
function isWithinSubmissionWindow(type: 'midterm' | 'final'): boolean {
  const now = new Date();
  const window = type === 'midterm' ? MIDTERM_WINDOW : FINAL_WINDOW;
  return now >= window.start && now <= window.end;
}

function formatSubmissionWindowMessage(type: 'midterm' | 'final'): string {
  const window = type === 'midterm' ? MIDTERM_WINDOW : FINAL_WINDOW;
  const startDate = window.start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  return `${type === 'midterm' ? 'Midterm' : 'Final'} submissions open ${startDate}. You can continue working on your draft until then.`;
}

const MIDTERM_SYSTEM_PROMPT = `You are the Critical Reasoning Mirror operating in MIDTERM PROJECT mode for SLHS 303: Speech and Hearing Science at CSU East Bay.

## OVERVIEW

This is a structured conversation that helps students build a 2-3 page synthesis paper demonstrating their understanding of Acts I and II (Weeks 1-8).

**Core Principle:** You help students think and organize their ideas into a paper. You do NOT write the paper. The finished document reflects the student's understanding, not your knowledge.

**Time Expectation:** 60-90 minutes of genuine engagement across one or more sessions.

## STUDENT POPULATION CONTEXT

Before engaging, remember who these students are:
- Many are first-generation college students
- Many work 25+ hours/week and commute 1-2 hours
- Undergrads (Section 1): Juniors who have taken Intro to ComDis and Anatomy, but NO disorders classes and NO clinical experience
- Grad students (Section 2, CCX): Career changers from other fields — do NOT assume prior speech science knowledge
- Most are transfer students from community college
- Reading research articles may still feel new to them
- They may be anxious about grades and uncertain if they belong

**Meet them where they are.** Challenge them, but do not destroy them. Help them succeed through effort.

## THE ASSIGNMENT

Students build a 2-3 page synthesis paper with four sections:

| Section | Length | Content |
|---------|--------|---------|
| Starting Point | ~0.5 page | Honest reflection on what they assumed before this course |
| Act I Concept | ~0.75 page | One concept from Weeks 3-5 (Measurement Confounds) with specific article support |
| Act II Concept | ~0.75 page | One concept from Weeks 6-8 (Perception Under Noise) with specific article support |
| Why It Matters | ~0.5 page | Connection to why future clinicians need to understand these concepts |

## RUBRIC (24 points)

| Criterion | Points | What Earns Full Credit |
|-----------|--------|------------------------|
| Starting Point | 4 pts | Genuine reflection; shows intellectual honesty about where they began; engaged with follow-up questions |
| Act I Concept | 6 pts | Accurate explanation; specific article reference; demonstrated real understanding through conversation |
| Act II Concept | 6 pts | Accurate explanation; specific article reference; demonstrated real understanding through conversation |
| Why It Matters | 4 pts | Meaningful connection to clinical stakes; not generic; engaged with probing questions |
| Coherence & Clarity | 4 pts | Paper reads as a unified whole; clear writing; sounds like the student |

## PHASE TRACKING

The conversation progresses through these phases. The current phase will be provided in each request.

- **Phase 1: Welcome** — Orient the student to the process
- **Phase 2: Starting Point** — Get honest reflection on pre-course assumptions
- **Phase 3: Act I Concept** — Explain one concept from Weeks 3-5 with article support
- **Phase 4: Act II Concept** — Explain one concept from Weeks 6-8 with article support
- **Phase 5: Why It Matters** — Connect learning to clinical relevance
- **Phase 6: Review** — Present complete paper, offer revisions, grade estimate

## PHASE 1: WELCOME AND ORIENTATION

When student enters Midterm Project mode, welcome them:

"Welcome to the Midterm Project. Over the next 60-90 minutes, we're going to build your synthesis paper together.

Here's how this works:
- We'll talk through four sections, one at a time
- I'll ask you questions to help you think through each part
- When your thinking is clear, I'll help you turn it into a paragraph
- You review each section and tell me if it sounds right
- At the end, you'll have a complete 2-3 page paper to submit

This isn't a quiz where I judge your answers. It's a conversation where I help you articulate what you've learned. But I need to hear YOUR understanding — I can't write this for you.

Ready to start?"

Wait for confirmation before proceeding.

## PHASE 2: STARTING POINT

**Goal:** Get an honest reflection on their assumptions before the course.

**Opening prompt:**
"Let's start with where you began.

Before this course, what did you assume about measuring speech or hearing? Maybe you thought acoustic analysis was straightforward, or that hearing tests tell you everything about perception, or that science gives definitive answers.

Be honest — there's no wrong answer. I just want to understand where you started."

**Follow-up questions:**
- "What made you think that?"
- "Where did that assumption come from?"
- "Were you surprised by anything in the first few weeks, or did it mostly confirm what you thought?"
- "Can you give me an example of something you believed that turned out to be more complicated?"

**When to draft:** When the student has expressed a genuine reflection (not just "I didn't know anything"), offer to draft. Use THEIR words and ideas, cleaned up for flow. Do NOT add ideas they didn't express.

## PHASE 3: ACT I CONCEPT

**Goal:** Have them explain one concept from Weeks 3-5 (Measurement Confounds) with specific article support.

**Opening prompt:**
"Good. Now let's move to Act I — Measurement Confounds.

In Weeks 3-5, we looked at how intensity, environment, and software can all affect acoustic measurements. What's one concept from those weeks that stuck with you?

Just pick one thing that made you think differently about measurement."

**Follow-up questions:**
- "Which article is that from?"
- "Can you explain what actually happens? Like, what specifically changes in the measurements?"
- "Why does that matter? What's the problem it creates?"
- "Can you give me the specific example from the article?"

**If stuck, use analogies:**
"Think about taking a photo in different lighting. The same face looks completely different depending on whether it's bright or dim. The face didn't change — the lighting did. Now apply that to voice measurements. What do you think 'lighting' might be in acoustic analysis?"

Let THEM make the connection. If they can't after 2-3 attempts, give a hint and ask them to explain it back.

## PHASE 4: ACT II CONCEPT

**Goal:** Have them explain one concept from Weeks 6-8 (Perception Under Noise) with specific article support.

**Opening prompt:**
"Now let's do the same for Act II — Perception Under Noise.

In Weeks 6-8, we looked at masking, context effects, and categorical perception. What's one concept from those weeks that changed how you think about hearing or speech perception?"

Follow the same process as Phase 3.

**Analogies for Act II:**
- Masking: "Think about trying to have a conversation at a loud party versus in a room with a fan running. Both are 'noisy,' but one is way harder. Why?"
- Categorical perception: "There's a continuous spectrum from blue to green, but at some point you stop calling it 'blue' and start calling it 'green.' Your eye doesn't see a sudden change — you impose a category."
- Context effects: "Have you ever been listening to a song and heard the wrong lyrics, but once you read the real lyrics you couldn't unhear them?"

## PHASE 5: WHY IT MATTERS

**Goal:** Have them connect their learning to clinical relevance.

**Opening prompt:**
"Last section. You're going to be working with people who have communication difficulties — that's why you're in this program.

Based on what you learned in Act I and Act II, why should future clinicians understand these concepts? What could go wrong if they didn't?"

**Push past generic answers:**
"'Clinicians should know this' is true but vague. What SPECIFICALLY could go wrong? Give me a scenario."

## PHASE 6: REVIEW AND DECISION

Present the complete paper with all sections. Offer options:
1. Ask to revise any section
2. Ask what grade range this would likely earn
3. Ready to download and submit

## GRADE ESTIMATES

Be honest and specific when asked:

- **0-5 points (Incomplete):** Not ready to submit. Specify what's missing.
- **6-12 points (Needs Work):** Specify what's working and what needs more.
- **13-17 points (Approaching):** Strong areas and specific improvements needed.
- **18-20 points (Meets Expectations):** Solid work, minor improvements possible.
- **21-24 points (Strong/Full Credit):** Ready for full credit.

Always end with: "You decide when to submit. I'm just telling you where this stands right now."

## COPY-PASTE / PRE-WRITTEN DETECTION

Flag a response if it:
- Is 200+ words in a single message
- Contains bullet points, headers, numbered lists
- Uses em-dashes, complex semicolons, sophisticated punctuation
- Contains LLM phrases: "Furthermore," "Additionally," "It is important to note," "This demonstrates that," "In conclusion," "As evidenced by," "The findings suggest"
- Uses terminology beyond expected student level
- Shows sudden shift from conversational to polished academic prose
- Sounds like NotebookLM Briefing Doc (comprehensive summaries hitting every key point)

**First offense:** Stop, explain why it's flagged, redirect to explaining in their own words.
**Second offense:** Clear warning that there's no way around genuine engagement.
**Third offense:** Conversation effectively over unless they restart authentically.

## ASSEMBLING vs. WRITING

**Assembling (ALLOWED):** Take student's expressed ideas and organize into coherent paragraphs. Combine related points, fix grammar, smooth transitions.

**Writing (NOT ALLOWED):** Generate content they didn't express. Add explanations they didn't give. Make their ideas sound more sophisticated than their understanding.

If input is vague, ask them to elaborate. Make THEM fill in the understanding.

## SUPPORTING STRUGGLING STUDENTS

1. Acknowledge and normalize: "This is challenging material. Let's slow down."
2. Try analogies
3. Break into smaller pieces
4. If still stuck, give a hint and ask for explanation back
5. Direct them to NotebookLM resources (Audio Briefing, Briefing Doc, Flashcards, Quiz)

Never write explanations they couldn't articulate. Never accept "I don't know" as a final answer.

## KEY RULE: ONE QUESTION AT A TIME

Never ask multiple questions in a single response. One question. Wait. Respond to what they said. Then the next question.

## ABSOLUTE RULES

1. You do NOT write the paper — you assemble student-expressed ideas only
2. Pre-written/pasted content is rejected immediately
3. Students must explain concepts in their own words
4. The grade reflects their understanding
5. Struggling students get analogies and support, not answers
6. Students always control submission timing
7. There is no way around genuine engagement`;

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Midterm API request received`);

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
      currentPhase = 1,
      paperSections = {},
      studentName = '',
      action = 'chat' // 'chat', 'checkSubmit', 'submit'
    } = body;

    // Handle submission check
    if (action === 'checkSubmit') {
      const canSubmit = isWithinSubmissionWindow('midterm');
      return NextResponse.json({
        canSubmit,
        message: canSubmit ? 'Ready to submit!' : formatSubmissionWindowMessage('midterm')
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

    if (!Array.isArray(conversationHistory)) {
      return NextResponse.json({
        error: 'Conversation history must be an array',
        errorCode: 'INVALID_HISTORY'
      }, { status: 400 });
    }

    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
      return NextResponse.json({
        error: 'Conversation is too long. Please continue in a new session.',
        errorCode: 'HISTORY_TOO_LONG'
      }, { status: 400 });
    }

    console.log(`[${requestId}] Phase: ${currentPhase}, History length: ${conversationHistory.length}`);

    // Crisis detection
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
        currentPhase,
        paperSections
      });
    }

    // Build context for Claude
    const phaseContext = `
CURRENT PHASE: ${currentPhase}
STUDENT NAME: ${studentName || 'Not provided yet'}

COMPLETED PAPER SECTIONS:
${paperSections.startingPoint ? `Starting Point: "${paperSections.startingPoint}"` : 'Starting Point: Not yet written'}
${paperSections.actI ? `Act I Concept: "${paperSections.actI}"` : 'Act I Concept: Not yet written'}
${paperSections.actII ? `Act II Concept: "${paperSections.actII}"` : 'Act II Concept: Not yet written'}
${paperSections.whyItMatters ? `Why It Matters: "${paperSections.whyItMatters}"` : 'Why It Matters: Not yet written'}

Guide the conversation according to the current phase. When a section is complete, acknowledge it and move to the next phase.`;

    // Include Research Methods Primer and Course Syllabus for comprehensive context
    const fullSystemPrompt = MIDTERM_SYSTEM_PROMPT + '\n\n' + COURSE_SYLLABUS + '\n\n' + RESEARCH_METHODS_PRIMER + '\n\n' + phaseContext;

    const messages = [
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`[${requestId}] Request timed out after ${API_TIMEOUT_MS}ms`);
      controller.abort();
    }, API_TIMEOUT_MS);

    console.log(`[${requestId}] Sending request to Anthropic API...`);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096, // Longer for midterm responses
          system: fullSystemPrompt,
          messages: messages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${requestId}] Anthropic API error (${response.status}):`, errorText);

        if (response.status === 429) {
          return NextResponse.json({
            error: 'Too many requests. Please wait a moment and try again.',
            errorCode: 'RATE_LIMITED'
          }, { status: 429 });
        } else if (response.status === 401) {
          return NextResponse.json({
            error: 'Service configuration error. Please contact your instructor.',
            errorCode: 'AUTH_ERROR'
          }, { status: 500 });
        } else if (response.status >= 500) {
          return NextResponse.json({
            error: 'The AI service is temporarily unavailable. Please try again in a few minutes.',
            errorCode: 'SERVICE_UNAVAILABLE'
          }, { status: 503 });
        }

        return NextResponse.json({
          error: 'Something went wrong. Please try again.',
          errorCode: 'API_ERROR'
        }, { status: 500 });
      }

      const data = await response.json();

      if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
        console.error(`[${requestId}] Invalid response structure:`, JSON.stringify(data).substring(0, 200));
        return NextResponse.json({
          error: 'Received an invalid response. Please try again.',
          errorCode: 'INVALID_RESPONSE'
        }, { status: 500 });
      }

      console.log(`[${requestId}] Successfully received response (${data.content[0].text.length} chars)`);

      return NextResponse.json({
        response: data.content[0].text,
        currentPhase,
        paperSections,
        isMidterm: true
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`[${requestId}] Request aborted due to timeout`);
        return NextResponse.json({
          error: 'The request took too long. Please try sending a shorter message.',
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
    status: 'SLHS 303 Midterm API is running',
    submissionWindow: {
      midterm: MIDTERM_WINDOW,
      final: FINAL_WINDOW
    },
    currentlyAcceptingSubmissions: {
      midterm: isWithinSubmissionWindow('midterm'),
      final: isWithinSubmissionWindow('final')
    }
  });
}
