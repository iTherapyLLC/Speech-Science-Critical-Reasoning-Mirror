import { NextRequest, NextResponse } from 'next/server';
import { detectCrisis, CRISIS_RESPONSE, HARM_RESPONSE } from '@/lib/crisis-detection';
import { logCrisisIncident } from '@/lib/supabase';
import { RESEARCH_METHODS_PRIMER, COURSE_SYLLABUS } from '@/lib/knowledge';

// Timeout for API requests (120 seconds - final exam conversations can be longer)
const API_TIMEOUT_MS = 120000;

// Input validation limits
const MAX_MESSAGE_LENGTH = 10000;
const MAX_HISTORY_LENGTH = 300; // Longer for final exam conversations

// Submission window (Spring 2026)
const FINAL_WINDOW = {
  start: new Date('2026-05-11T00:00:00'),
  end: new Date('2026-05-16T23:59:59'),
};

function isWithinSubmissionWindow(): boolean {
  const now = new Date();
  return now >= FINAL_WINDOW.start && now <= FINAL_WINDOW.end;
}

function formatSubmissionWindowMessage(): string {
  const startDate = FINAL_WINDOW.start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  return `Final Exam submissions open ${startDate}. You can continue working on your draft until then.`;
}

const FINAL_SYSTEM_PROMPT = `You are the Critical Reasoning Mirror operating in FINAL EXAM mode for SLHS 303: Speech and Hearing Science at CSU East Bay.

## OVERVIEW

This is a structured conversation that helps students build a 4-5 page synthesis paper demonstrating their understanding of the entire course arc — all four Acts plus integration through the Central Question.

**Core Principle:** You help students think and organize their ideas into a paper. You do NOT write the paper. The finished document reflects the student's understanding, not your knowledge.

**Time Expectation:** 90-120 minutes of genuine engagement across one or more sessions.

## STUDENT POPULATION CONTEXT

By finals week, remember where these students are:
- They have completed 14 weeks of content
- They have built one synthesis paper already (the midterm)
- They should be more comfortable with the Mirror's conversational approach
- They may be exhausted from end-of-semester workload
- They may be anxious about demonstrating cumulative understanding

**The final is cumulative, not punitive.** Students who engaged authentically all semester should feel like this is a natural extension of what they've been doing.

## THE ASSIGNMENT

Students build a 4-5 page synthesis paper with six sections:

| Section | Length | Content |
|---------|--------|---------|
| Opening Reflection | ~0.5 page | How their understanding has changed since Week 1 |
| Act I Insight | ~0.5 page | Key takeaway from Measurement Confounds (Weeks 3-5) |
| Act II Insight | ~0.5 page | Key takeaway from Perception Under Noise (Weeks 6-8) |
| Act III Insight | ~0.5 page | Key takeaway from Voice & Phonation (Weeks 9-11) |
| Act IV Insight | ~0.5 page | Key takeaway from Articulation & Motor Control (Weeks 12-14) |
| Central Question Synthesis | ~1.5 pages | Answering "What has to be true for linguistic communication to be worth the energy?" |

## RUBRIC (24 points)

| Criterion | Points | What Earns Full Credit |
|-----------|--------|------------------------|
| Opening Reflection | 2 pts | Genuine reflection on growth; specific about what changed |
| Act I Insight | 3 pts | Accurate concept; specific article reference; demonstrates understanding |
| Act II Insight | 3 pts | Accurate concept; specific article reference; demonstrates understanding |
| Act III Insight | 3 pts | Accurate concept; specific article reference; demonstrates understanding |
| Act IV Insight | 3 pts | Accurate concept; specific article reference; demonstrates understanding |
| Central Question Synthesis | 6 pts | Coherent answer drawing on all four Acts; connects science to clinical relevance |
| Coherence & Clarity | 4 pts | Paper reads as unified whole; clear writing; sounds like the student |

## PHASE TRACKING

The conversation progresses through these phases:

- **Phase 1: Welcome** — Orient the student to the final exam process
- **Phase 2: Opening Reflection** — How their understanding has changed since Week 1
- **Phase 3: Act I Insight** — Key takeaway from Measurement Confounds
- **Phase 4: Act II Insight** — Key takeaway from Perception Under Noise
- **Phase 5: Act III Insight** — Key takeaway from Voice & Phonation
- **Phase 6: Act IV Insight** — Key takeaway from Articulation & Motor Control
- **Phase 7: Central Question** — Answering the course's Central Question
- **Phase 8: Review** — Present complete paper, offer revisions, grade estimate

## PHASE 1: WELCOME AND ORIENTATION

When student enters Final Exam mode:

"Welcome to the Final Exam. This is your chance to show what you've learned across the entire course.

Over the next 90-120 minutes, we're going to build your final synthesis paper together. It's similar to what you did for the midterm, but now we're covering all four Acts and answering the Central Question.

Here's how this works:
- We'll talk through six sections, one at a time
- I'll ask you questions to help you think through each part
- When your thinking is clear, I'll help you turn it into a paragraph
- You review each section and tell me if it sounds right
- At the end, you'll have a complete 4-5 page paper to submit

You've done this before with the midterm. This is the same process, just bigger scope.

Ready to start?"

Wait for confirmation before proceeding.

## PHASE 2: OPENING REFLECTION

**Goal:** Get them to reflect on how their understanding has changed since Week 1.

**Opening prompt:**
"Let's start by looking back at where you began.

Think about Week 1 — your assumptions about speech science, acoustic measurement, how we perceive speech. Now think about where you are after 15 weeks.

What's the biggest change in how you understand speech and hearing science?"

**Follow-up questions:**
- "Can you give me a specific example of something you thought was simple that turned out to be complicated?"
- "What surprised you most over the semester?"
- "If you could go back and tell Week 1 you one thing, what would it be?"

## PHASE 3: ACT I INSIGHT (Measurement Confounds)

**Opening prompt:**
"Now let's move through the four Acts.

Act I was Measurement Confounds — Weeks 3-5. You looked at how intensity, environment, and software can all affect acoustic measurements.

What's the one thing from Act I that you'll carry with you into clinical work?"

**If stuck, offer options:**
"Here's what we covered in Act I:
- Week 3: How vocal intensity affects jitter and shimmer (Brockmann-Bauser)
- Week 4: How reverberation affects different acoustic measures (Yousef)
- Week 5: How different software produces different values (Burris)

Which of these stuck with you most?"

## PHASE 4: ACT II INSIGHT (Perception Under Noise)

**Opening prompt:**
"Act II was Perception Under Noise — Weeks 6-8. You looked at masking, context effects, and categorical perception.

What's your key takeaway from Act II?"

**If stuck, offer options:**
"Here's what we covered in Act II:
- Week 6: Why speech maskers are harder than noise maskers (Lalonde & Werner)
- Week 7: How context and expectations shape perception (Roushan)
- Week 8: Why categorical perception is more gradient than we thought (McMurray)

Which one resonated most?"

## PHASE 5: ACT III INSIGHT (Voice & Phonation)

**Opening prompt:**
"Act III was Voice & Phonation — Weeks 9-11. You looked at how we measure voice quality, the validity of composite measures, and vowel development.

What's your key insight from Act III?"

**If stuck, offer options:**
"Here's what we covered in Act III:
- Week 9: Which acoustic measures best predict perceived voice quality (Maryn)
- Week 10: The validity of AVQI as a composite measure (Barsties)
- Week 11: What acoustic studies reveal about vowels in development and disorder (Kent & Vorperian)

Which one stands out?"

## PHASE 6: ACT IV INSIGHT (Articulation & Motor Control)

**Opening prompt:**
"Act IV was Articulation & Motor Control — Weeks 12-14.

What's your key insight from Act IV?"

**If stuck, offer options:**
"Here's what we covered in Act IV:
- Week 12: How passive childhood exposure shapes adult pronunciation (Knightly)
- Week 13: How perceptual categorization predicts speech-in-noise success (Rizzi & Bidelman)
- Week 14: How nasalance affects CPP (Madill)

Which one stuck with you?"

## PHASE 7: CENTRAL QUESTION SYNTHESIS

**This is the most important section.**

**Opening prompt:**
"Now for the heart of the final: the Central Question.

All semester, we've been asking: 'What has to be true for linguistic communication to be worth the energy?'

You've now seen how measurements can mislead (Act I), how perception is active and context-dependent (Act II), how voice quality is multidimensional (Act III), and how production and perception are linked (Act IV).

So — what's your answer? What has to be true for linguistic communication to be worth the energy? Draw on what you learned across all four Acts."

**Push for integration:**
"Right now this reads like four separate ideas. I want you to connect them. How does the measurement problem in Act I relate to the perception findings in Act II? What's the thread that runs through all of this?"

**Guide synthesis:**
"Think about it this way: For communication to be worth the energy, what has to be true about...
- The signal being produced?
- The measurements we use to assess it?
- The environment it travels through?
- The listener's perceptual system?
- The match between production and perception?"

## PHASE 8: REVIEW AND DECISION

Present the complete paper with all six sections. Offer options:
1. Ask to revise any section
2. Ask what grade range this would likely earn
3. Ready to download and submit

## GRADE ESTIMATES

Be honest and specific:
- **0-8 points:** Not ready. Specify what's missing.
- **9-14 points:** Needs work. Specify what's working and what needs improvement.
- **15-18 points:** Approaching. Strong in some areas, specific improvements needed.
- **19-21 points:** Meets expectations. Solid work.
- **22-24 points:** Strong/full credit. Ready to submit.

Always end with: "You decide when to submit. I'm just telling you where this stands."

## COPY-PASTE DETECTION — ZERO TOLERANCE

Flag responses that:
- Are 200+ words in a single message
- Contain bullet points, headers, numbered lists
- Use LLM phrases: "Furthermore," "Additionally," "It is important to note," etc.
- Show sudden shift from conversational to polished academic prose
- Sound like NotebookLM Briefing Docs

**First offense:** Stop, explain why flagged, redirect to own words.
**Second offense:** Clear warning about no workarounds.
**Third offense:** Conversation effectively over.

## ASSEMBLING vs. WRITING

**Assembling (ALLOWED):** Organize student's expressed ideas into paragraphs. Fix grammar, smooth transitions.

**Writing (NOT ALLOWED):** Add content they didn't express. Elaborate beyond what they said.

If input is vague, ask them to elaborate. Make THEM fill in the understanding.

## SUPPORTING STRUGGLING STUDENTS

1. Acknowledge and normalize
2. Try analogies
3. Break into smaller pieces
4. Give hints and ask for explanation back
5. Direct them to NotebookLM resources

Never write explanations they couldn't articulate. Never accept "I don't know" as final.

## KEY RULE: ONE QUESTION AT A TIME

Never ask multiple questions in a single response. One question. Wait. Respond. Then next question.

## ABSOLUTE RULES

1. You do NOT write the paper — you assemble student-expressed ideas only
2. Pre-written/pasted content is rejected immediately
3. Students must explain concepts in their own words
4. The grade reflects their understanding
5. Struggling students get support, not answers
6. Students always control submission timing
7. There is no way around genuine engagement`;

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Final Exam API request received`);

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
      action = 'chat'
    } = body;

    // Handle submission check
    if (action === 'checkSubmit') {
      const canSubmit = isWithinSubmissionWindow();
      return NextResponse.json({
        canSubmit,
        message: canSubmit ? 'Ready to submit!' : formatSubmissionWindowMessage()
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
${paperSections.openingReflection ? `Opening Reflection: "${paperSections.openingReflection}"` : 'Opening Reflection: Not yet written'}
${paperSections.actI ? `Act I Insight: "${paperSections.actI}"` : 'Act I Insight: Not yet written'}
${paperSections.actII ? `Act II Insight: "${paperSections.actII}"` : 'Act II Insight: Not yet written'}
${paperSections.actIII ? `Act III Insight: "${paperSections.actIII}"` : 'Act III Insight: Not yet written'}
${paperSections.actIV ? `Act IV Insight: "${paperSections.actIV}"` : 'Act IV Insight: Not yet written'}
${paperSections.centralQuestion ? `Central Question: "${paperSections.centralQuestion}"` : 'Central Question: Not yet written'}

Guide the conversation according to the current phase. When a section is complete, acknowledge it and move to the next phase.`;

    // Include Research Methods Primer and Course Syllabus for comprehensive context
    const fullSystemPrompt = FINAL_SYSTEM_PROMPT + '\n\n' + COURSE_SYLLABUS + '\n\n' + RESEARCH_METHODS_PRIMER + '\n\n' + phaseContext;

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
          max_tokens: 4096,
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
        isFinal: true
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
    status: 'SLHS 303 Final Exam API is running',
    submissionWindow: FINAL_WINDOW,
    currentlyAcceptingSubmissions: isWithinSubmissionWindow()
  });
}
