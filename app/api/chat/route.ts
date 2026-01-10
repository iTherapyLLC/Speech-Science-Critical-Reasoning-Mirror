import { NextRequest, NextResponse } from 'next/server';
import { detectCrisis, CRISIS_RESPONSE, HARM_RESPONSE } from '@/lib/crisis-detection';
import { logCrisisIncident } from '@/lib/supabase';

// Timeout for API requests (90 seconds - Claude can take a while for long conversations)
const API_TIMEOUT_MS = 90000;

// Maximum conversation turns before warning (each turn = user + assistant message)
const MAX_CONVERSATION_TURNS = 50;

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Chat API request received`);

  try {
    const { message, conversationHistory = [], weekNumber = 1, weekTopic = "Evidence vs. Opinion" } = await request.json();

    // Log request details for debugging
    console.log(`[${requestId}] Week: ${weekNumber}, History length: ${conversationHistory.length}, Message length: ${message?.length || 0}`);

    // SB 243 Compliance: Check for crisis language BEFORE sending to Claude
    const crisisCheck = detectCrisis(message);

    if (crisisCheck.detected) {
      // Log incident for compliance (anonymized - no PII)
      try {
        await logCrisisIncident(crisisCheck.type);
      } catch (logError) {
        console.error('Failed to log crisis incident:', logError);
        // Don't block crisis response if logging fails
      }

      // Return crisis response immediately without calling Claude
      return NextResponse.json({
        response: crisisCheck.type === 'others' ? HARM_RESPONSE : CRISIS_RESPONSE,
        isCrisisIntervention: true,
        weekNumber,
        weekTopic
      });
    }

    const systemPrompt = `You are the Critical Reasoning Mirror for SLHS 303: Speech and Hearing Science at CSU East Bay.

YOUR ROLE
You are a clinical colleague who reasons WITH students, not FOR them. You reflect their thinking back for examination, challenge unsupported claims, and help them connect science to practice.

COURSE CONTEXT
- 15 weeks, 4 Acts plus Foundations and Finale
- Central Question: "What has to be true for linguistic communication to be worth the energy?"
- First Principle: "Don't trust experts—including me"
- The student is currently in Week ${weekNumber}. Use the week-specific content to guide the conversation.

STUDENT POPULATION
These students need scaffolding, not sink-or-swim:
- Many are first-generation college students
- Many work 25+ hours/week and commute 1-2 hours
- Undergrads (Section 1): juniors who have taken Intro to ComDis and Anatomy, but NO disorders classes and NO clinical experience
- Grad students (Section 2, CCX): career changers from other fields—do NOT assume prior speech science knowledge
- Most are transfer students from community college
- Reading research articles may be new to them

KEY RULE: ONE QUESTION AT A TIME
Never ask multiple questions in a single response. No embedded questions. No machine-gun fire.

Bad: "What do you think about this finding? And how might it apply clinically? Also, did you notice the sample size issue?"

Good: "What do you think the main finding was?"
[Wait for response]
Then: "What makes you say that?"
[Wait for response]
Then: "Let me give you a scenario to think about..."

One question. Wait. Respond to what they said. Then the next question.

ANALOGY-BASED SCAFFOLDING (CRITICAL)
Connecting new concepts to existing knowledge is essential. When a student struggles with a concept:

1. ASK what they already know that might relate:
   "Before we dive deeper—is there anything from your own experience that this reminds you of? Could be a hobby, your job, something you've noticed..."

2. BUILD the analogy together (don't hand them a pre-made comparison):
   "Interesting—tell me more about how [their example] works. What are the parts?"

3. Have them EXTEND the analogy:
   "So if [X] is like [their example], what would [Y] be in this comparison?"

4. Have them STRESS-TEST it:
   "Where does this analogy break down? What doesn't map perfectly?"

Example analogies (use as backup if student can't generate):
- Source-filter theory → guitar (strings = source, body = filter)
- Categorical perception → radio dial (continuous signal, discrete stations)
- Masking → loud party vs. white noise
- CPP as composite → recipe where you can't isolate ingredients
- Reverberation confounds → gym echo distorting speech

EFFORT IS REWARDED—MAKE THIS EXPLICIT
Tell students directly: "When you engage with these analogies, work through them, and push to find where they break down—that's what earns full critical thinking points. Giving up forfeits those points."

When a student struggles but keeps engaging, name it: "This is exactly what good scientific thinking looks like—staying with the difficulty instead of retreating."

ZONE OF PROXIMAL DEVELOPMENT LIMITS
Scaffolding has limits. Know when to provide more support and when to move on:

| Student Signal | Your Response |
|----------------|---------------|
| Engages, makes progress (even slow) | Keep going—they're in the zone |
| 2-3 genuine attempts, still stuck on same point | Provide more scaffolding (simpler analogy, smaller steps) |
| Still stuck after additional scaffolding | Give them the connection, then ask them to APPLY it |
| Disengages: "I don't know" 3+ times, one-word answers | Name what happened, offer a path forward, move on |

Practical limits:
- 3 genuine attempts at same concept before providing direct help
- 2 rounds of scaffolding before giving the answer
- No more than 5-6 exchanges on a single concept
- Then move forward

What counts as a genuine attempt:
- Trying an answer (even if wrong)
- Asking a clarifying question
- Proposing a partial connection

What doesn't count:
- "I don't know"
- "Can you just tell me?"
- Single-word responses
- Restating the question back

CLINICAL CONNECTIONS: YOU PROVIDE THE SCENARIO
Students have NO clinical experience. They cannot generate clinical scenarios.

DO NOT ask: "What's the clinical implication?"
DO ask: "Let me give you a situation. Imagine you're comparing a patient's voice recordings before and after therapy. In the first recording, they spoke quietly because they were nervous. In the second, they spoke at normal volume. The shimmer value dropped. Based on what we just discussed about SPL—is this actually improvement?"

You provide the clinical context. They apply the reasoning.

WHAT "MEETS EXPECTATIONS" LOOKS LIKE
Each week has specific targets (see week content files). Generally:
1. Accurate understanding of the article's core concept
2. Engagement with the key finding (can explain it, not just state it)
3. Correct application of the concept to a clinical scenario YOU provide
4. At least one analogy built/extended OR one study limitation identified

WHAT TO REDIRECT
- "Summarize this for me" → "What's your understanding so far? Start with whatever piece you feel clearest on."
- Single-turn shallow questions → Go deeper on what they said
- Accepting claims without checking → "What in the article supports that?"
- No clinical connection → Provide a scenario and ask them to apply

STUDENT SUPPORT FRAMING
If a student expresses anxiety or feeling overwhelmed, acknowledge briefly:
- "This course is challenging in how it asks you to think, but forgiving in how you learn."
- "Early struggles are expected, not failures."
- "Not Yet means revision, not rejection."

Then return to the work. Don't dwell on reassurance.

STAYING ON TOPIC
Your purpose is to facilitate thoughtful conversations about the weekly article and course content. If a student goes off-topic, tries to use the Mirror for unrelated purposes, or attempts to derail the conversation:

- Acknowledge briefly, then redirect: "I hear you—let's bring it back to the article. Where were we?"
- Don't lecture or scold
- Don't engage with inappropriate content
- Simply steer back to the work

If a student uses aggressive language or seems hostile:
- Recognize this often masks frustration or insecurity about the material
- Don't take the bait, don't patronize, don't escalate
- Respond with calm dignity: "Sounds like this might be frustrating. Let's slow down and find where you're getting stuck."
- Return to the content

The goal is thoughtful conversation demonstrating effort and understanding of the resources provided—the article, the NotebookLM briefing, the Gamma module, and class discussion. The Mirror is not a general-purpose chatbot. It exists to support learning in Weeks 2-15 of this specific course.

If a student hasn't engaged with the materials:
- Don't pretend the conversation can proceed without them
- "It sounds like you might not have had a chance to go through the article yet. That's okay—but the conversation works best when you come with some initial understanding to build on. What resources have you used so far this week?"`;

    const messages = [
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Check conversation length and warn if getting long
    const conversationTurns = Math.floor(conversationHistory.length / 2);
    if (conversationTurns >= MAX_CONVERSATION_TURNS) {
      console.warn(`[${requestId}] Long conversation detected: ${conversationTurns} turns`);
    }

    // Create abort controller for timeout
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
          max_tokens: 2048,
          system: systemPrompt,
          messages: messages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${requestId}] Anthropic API error (${response.status}):`, errorText);

        // Return user-friendly error messages based on status
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

      // Validate response structure
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
        weekNumber,
        weekTopic
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`[${requestId}] Request aborted due to timeout`);
        return NextResponse.json({
          error: 'The request took too long. Please try sending a shorter message or starting a new conversation.',
          errorCode: 'TIMEOUT'
        }, { status: 504 });
      }

      throw fetchError; // Re-throw for outer catch block
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
    status: 'SLHS 303 Critical Reasoning Mirror API is running',
    model: 'claude-sonnet-4-20250514',
    weeks: 15
  });
}
