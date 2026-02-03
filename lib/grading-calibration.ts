/**
 * SLHS 303 Grading Calibration
 *
 * GRADING PHILOSOPHY (from syllabus):
 * - "The goal is for everyone to succeed"
 * - "Learning is iterative. Feedback and revision are built into the process"
 * - "The only way to fail this course is to disengage entirely"
 * - "Mastery is defined by where reasoning ends up, not by first attempts"
 *
 * WEEKLY RUBRIC (8 points total, 4 criteria × 2 points each):
 * 1. Article Engagement — Did they read and understand the article?
 * 2. Using Evidence — Do they point to specific findings?
 * 3. Critical Questioning — Do they identify limitations and explain why they matter?
 * 4. Clinical Connection — Do they make a specific real-world link?
 *
 * AI TOOLS POLICY:
 * - NotebookLM and similar tools are OPTIONAL study aids
 * - Students graded only on their own written work
 * - Tool disclosure is noted but does not affect scoring
 */

import {
  ARTICLE_KNOWLEDGE_BASE,
  validateClaim,
  validateLimitation,
  detectArticleMismatch,
  getArticleInfo,
  type ArticleKnowledge,
} from './article-knowledge-base';

export interface CalibrationExample {
  score: 0 | 1 | 2;
  label: string;
  description: string;
  example: string;
  feedback: string;
}

export interface RubricCriterion {
  name: string;
  description: string;
  scoringGuide: {
    zero: string;
    one: string;
    two: string;
  };
  examples: CalibrationExample[];
}

// ============================================================================
// GRADING PHILOSOPHY
// ============================================================================

export const GRADING_PHILOSOPHY = `
GRADING PHILOSOPHY (from syllabus):
- "The goal is for everyone to succeed"
- "Learning is iterative. Feedback and revision are built into the process"
- "The only way to fail this course is to disengage entirely"
- "Mastery is defined by where reasoning ends up, not by first attempts"

INSTRUCTOR FRAMING:
"It's like scientific journal review — 'Hey, this is good, but did you consider this?' And then if they take a chance and iterate, they get full points."

WHAT THIS MEANS FOR GRADING:
- Your role is SUPPORTIVE JOURNAL EDITOR, not harsh grader
- Students can REVISE for full credit on ALL assessments
- Feedback should be specific enough that students know EXACTLY what to do to improve
- Lead with STRENGTHS: "This is strong because..."
- Frame improvements POSITIVELY: "To earn full points on revision, consider adding..."
- When in doubt, round UP
- A student who shows genuine effort should score 7-8/8
`;

// ============================================================================
// WEEKLY RUBRIC CRITERIA (from syllabus)
// ============================================================================

export const GRADING_RUBRIC: RubricCriterion[] = [
  {
    name: "Article Engagement",
    description: "Did the student read the article and make an honest effort to understand the question, methods, and findings?",
    scoringGuide: {
      zero: "Did not read or major misunderstanding of the article",
      one: "Read but engagement is surface-level (summaries without understanding)",
      two: "Shows honest effort to understand the research question, methods, and findings",
    },
    examples: [
      {
        score: 0,
        label: "Did not read / Major misunderstanding",
        description: "No evidence of reading, or completely wrong about what the article says",
        example: "This article was about how voice therapy helps patients recover faster.",
        feedback: "This doesn't match the article we read this week. To earn full points: Re-read the article and describe the main research question the authors were trying to answer.",
      },
      {
        score: 1,
        label: "Surface-level",
        description: "Read but only summarizes without showing understanding",
        example: "The article was about voice measurements and how they can be affected by different things.",
        feedback: "You've captured the general topic, but this is surface-level. To earn full points: Explain WHAT the researchers found (their specific results) and WHY that matters.",
      },
      {
        score: 2,
        label: "Honest effort to understand",
        description: "Shows genuine engagement with the research question, methods, and findings",
        example: "The researchers asked whether speaking louder affects jitter and shimmer measurements in healthy voices. They found that louder voice systematically reduced perturbation values, which means clinicians might get 'better' scores just because a patient is speaking louder—not because their voice is actually healthier.",
        feedback: "Excellent engagement! You understood the research question, the key finding, and why it matters clinically.",
      },
    ],
  },
  {
    name: "Using Evidence",
    description: "Does the student point to specific findings, numbers, or details from the article?",
    scoringGuide: {
      zero: "No reference to article content",
      one: "Vague references without specific details",
      two: "Points to specific findings, numbers, or details from the article",
    },
    examples: [
      {
        score: 0,
        label: "No reference",
        description: "Makes claims but doesn't connect them to the article",
        example: "Voice quality is important for communication and clinicians should measure it carefully.",
        feedback: "This is a general statement that could apply to any article. To earn full points: Reference a specific finding from THIS article—what did the researchers actually find?",
      },
      {
        score: 1,
        label: "Vague references",
        description: "References the article but without specifics",
        example: "The article showed that measurements can change depending on how people speak.",
        feedback: "Good that you're referencing the article, but this is vague. To earn full points: Be specific—WHICH measurements changed? By how much? Under what conditions?",
      },
      {
        score: 2,
        label: "Specific details",
        description: "Cites specific findings, numbers, or methodological details",
        example: "The study found that when participants increased from 'comfortable' to 'loud' speaking, jitter decreased from 1.2% to 0.8% on average—a 33% change in the measurement even though nothing changed about voice health.",
        feedback: "Great use of specific evidence! You cited the actual numbers and explained what they mean.",
      },
    ],
  },
  {
    name: "Critical Questioning",
    description: "Does the student identify something limited or confusing and explain why it matters?",
    scoringGuide: {
      zero: "No questions raised about the research",
      one: "Notes a limitation but doesn't explain why it matters for the findings",
      two: "Identifies something limited or confusing AND explains why it matters",
    },
    examples: [
      {
        score: 0,
        label: "No questions raised",
        description: "Accepts the article at face value without questioning",
        example: "This was a well-designed study that proved voice measurements are affected by loudness.",
        feedback: "All research has limitations. To earn full points: Identify ONE thing that limits what we can conclude from this study, and explain why that limitation matters.",
      },
      {
        score: 1,
        label: "Limitation without impact",
        description: "Identifies a limitation but doesn't explain its significance",
        example: "A limitation is that they only tested healthy voices.",
        feedback: "Good observation! But WHY does that matter? To earn full points: Explain how testing only healthy voices affects what we can conclude about clinical populations.",
      },
      {
        score: 2,
        label: "Limitation + explanation",
        description: "Identifies limitation AND explains why it matters for the conclusions",
        example: "They only tested healthy voices, which matters because we don't know if the same loudness confound happens in disordered voices—maybe pathology interacts with intensity differently, so clinicians can't assume these findings apply to their patients.",
        feedback: "Excellent critical thinking! You identified the limitation AND explained exactly why it matters for applying these findings clinically.",
      },
    ],
  },
  {
    name: "Clinical Connection",
    description: "Does the student think about WHY this research matters or its real-world implications? (Note: These are FIRST-SEMESTER students with NO clinical experience — reward ANY thoughtful engagement with implications, including genuine uncertainty about applicability.)",
    scoringGuide: {
      zero: "No attempt to think about why this matters or its implications",
      one: "Generic 'this is important for SLPs' without reasoning",
      two: "ANY reasonable attempt to connect research to practice, express genuine uncertainty about implications, question validity/applicability, or wonder about real-world impact",
    },
    examples: [
      {
        score: 0,
        label: "No implications considered",
        description: "Discusses findings only in abstract terms with no thought about why it matters",
        example: "This study contributes to our understanding of acoustic measurement methodology.",
        feedback: "You've summarized the research well! To earn full points on revision: Add a sentence about WHY this matters — what are the implications of these findings? What questions does this raise about how research applies to practice?",
      },
      {
        score: 1,
        label: "Generic without reasoning",
        description: "Says it's important but doesn't explain why",
        example: "Clinicians should be careful when measuring voice.",
        feedback: "Good instinct that this has implications! To earn full points: Explain WHY clinicians should be careful — what could go wrong? What questions does this raise?",
      },
      {
        score: 2,
        label: "Thoughtful engagement with implications",
        description: "Shows genuine thinking about why research matters — can be a clinical scenario, genuine uncertainty, or questioning applicability",
        example: "One thing I am still unsure about is at what extent are there additional unmeasured factors that can misrepresent the data in this study.",
        feedback: "Excellent critical thinking! Your uncertainty about unmeasured factors shows you're thinking like a scientist about research validity — this IS clinically relevant thinking.",
      },
    ],
  },
];

// ============================================================================
// FLAGGING CRITERIA
// ============================================================================

export interface FlagCriterion {
  name: string;
  description: string;
  examples: string[];
  action: string;
}

export const FLAGGING_CRITERIA: FlagCriterion[] = [
  {
    name: "Wrong Article",
    description: "Response discusses a different article than assigned",
    examples: [
      "Claims don't match the assigned week's article",
      "Discusses completely different topic than assigned",
      "References authors/findings from another week",
    ],
    action: "Flag and assign 0 for Article Engagement. Note which article they appear to have used.",
  },
  {
    name: "Fabricated Content",
    description: "Response contains made-up statistics or findings",
    examples: [
      "Cites specific percentages or p-values not in the article",
      "Describes methodology or sample that doesn't match",
      "Invents author names or study details",
    ],
    action: "Flag for review. Score based on what IS accurate, but note the fabrication in feedback.",
  },
  {
    name: "No Engagement",
    description: "Response shows no evidence of reading or effort",
    examples: [
      "Single sentence or near-empty submission",
      "Generic text that could apply to any article",
      "Copy-pasted text unrelated to the assignment",
    ],
    action: "Score based on what's present (likely 0-2 total). Provide encouragement and specific guidance for resubmission.",
  },
];

// ============================================================================
// GRADING GUIDANCE
// ============================================================================

export const GRADING_GUIDANCE = {
  population: `
CRITICAL STUDENT CONTEXT — READ CAREFULLY:
- FIRST-SEMESTER students (undergrad and grad alike have only had ONE semester)
- Only prior relevant class: anatomy/physiology of speech and hearing
- ZERO clinical experience — no practicum, no patients, no real-world exposure
- High anxiety about grades — risk-averse culture
- Unfamiliar with iteration-based learning — expect "submit once, get what you get"
- Some ideological resistance to AI tools
- Struggle translating abstract concepts into understanding
- "Conscious incompetence phase" — they know they don't know, and it's uncomfortable

WHAT THIS MEANS FOR GRADING:
- Do NOT expect clinical knowledge or scenarios they haven't experienced
- Do NOT reference "school SLP with 60+ caseload" or similar real-world examples
- DO reward genuine intellectual engagement with the research
- DO reward uncertainty expressed thoughtfully (this IS clinical thinking developing)
- Keep feedback accessible — avoid jargon they haven't learned yet

SCORING STANCE — GENEROUS BY DEFAULT:
- 7-8 points: Genuine effort, all criteria addressed with thought
- 5-6 points: Partial effort, some criteria thin or generic
- 3-4 points: Minimal effort, missing criteria or surface-level throughout
- 0-2 points: No engagement or wrong article
- WHEN IN DOUBT, round UP
`,

  toolDisclosure: `
AI TOOLS POLICY (from syllabus):
- Tools like NotebookLM are OPTIONAL study aids
- Students graded only on their own written work submitted in Canvas
- Tool disclosure is noted but does NOT affect scoring
- A well-written response using NotebookLM gets the same score as one without
- A poorly-written response claiming no tools gets the same score as one with tools

SANCTIONED TOOLS (do NOT flag):
- NotebookLM, Google NotebookLM podcasts
- Course briefing documents, flashcards, quizzes
- Any scaffolding materials provided by the instructor

FLAG ONLY if:
- Discusses wrong article
- Contains fabricated statistics or findings
- Shows zero engagement with the actual assignment
`,

  feedbackFormat: `
FEEDBACK TONE — Like a supportive journal editor:
- LEAD WITH STRENGTHS: "This is strong because..." or "You did well to..."
- Frame improvements POSITIVELY: "To earn full points on revision, consider adding..."
- NEVER assume knowledge they don't have (no clinical scenarios they haven't experienced)
- Keep suggestions accessible and specific
- Remember: They CAN revise for full credit — your job is to help them succeed

For FULL POINTS: Lead with what they did well
For PARTIAL CREDIT: "This is a good start. To earn full points on revision: [SPECIFIC action]"

Bad feedback: "Be more specific" (vague)
Bad feedback: "Like a school SLP with 60+ caseload would..." (assumes clinical experience)
Good feedback: "You identified the limitation clearly. To earn full points on revision: Add one sentence explaining WHY this limitation matters for the conclusions."
`,

  clinicalConnectionGuidance: `
CRITICAL: CLINICAL CONNECTION FOR FIRST-SEMESTER STUDENTS

These students have ZERO clinical experience. The "Clinical Connection" criterion should be interpreted GENEROUSLY:

Score 2/2 for ANY of these:
- Hypothetical clinical scenario (even if imperfect)
- Genuine uncertainty about research implications
- Questioning the validity or applicability of findings
- Wondering how this affects real-world practice
- Expressing "I'm not sure how this would work in practice because..."

IMPORTANT: The "Student uncertainty" section ("One thing I am still unsure about is...") COUNTS toward Clinical Connection if it shows genuine engagement with implications.

EXAMPLE that earns 2/2:
"One thing I am still unsure about is at what extent are there additional unmeasured factors that can misrepresent the data in this study."
— This shows critical thinking about research validity, which IS clinically relevant thinking for future practitioners.

Do NOT penalize for:
- Not knowing clinical terminology
- Not describing specific clinical scenarios
- Expressing uncertainty instead of confidence
- Using hypotheticals or "what ifs"
`,
};

// ============================================================================
// SYSTEM PROMPT FOR AI-ASSISTED GRADING
// ============================================================================

/**
 * Build a week-specific grading prompt with article knowledge
 */
export function buildGradingPrompt(weekNumber: number): string {
  const article = ARTICLE_KNOWLEDGE_BASE[weekNumber];
  if (!article) {
    return GRADING_SYSTEM_PROMPT_BASE;
  }

  return `You are a coaching-oriented grading assistant for SLHS 303 Speech and Hearing Science.

${GRADING_PHILOSOPHY}

${GRADING_GUIDANCE.population}

=== THIS WEEK'S ARTICLE (Week ${weekNumber}) ===
Title: "${article.title}"
Author: ${article.author}
Research Question: ${article.researchQuestion}

KEY FINDINGS (valid claims students should identify):
${article.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

CONFOUNDS & LIMITATIONS (valid limitations students should mention):
${article.confoundsAndLimitations.map((l, i) => `${i + 1}. ${l}`).join('\n')}

COMMON MISCONCEPTIONS (flag if student's claim matches these):
${article.commonMisconceptions.map((m, i) => `${i + 1}. "${m}"`).join('\n')}

CLINICAL CONNECTION: ${article.clinicalConnection}

SOCRATIC QUESTIONS (reference for good follow-up questions):
${article.socraticQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

=== WEEKLY RUBRIC (8 points total) ===
${GRADING_RUBRIC.map(c => `
${c.name} (2 pts): ${c.description}
- 0: ${c.scoringGuide.zero}
- 1: ${c.scoringGuide.one}
- 2: ${c.scoringGuide.two}
`).join('\n')}

=== VALIDATION RULES ===

1. ARTICLE ENGAGEMENT (2 pts):
   - Score 2: Shows they understood the research question and key findings
   - Score 1: Read but only summarizes without real understanding
   - Score 0: Didn't read, major misunderstanding, or WRONG ARTICLE
   - FLAG if discussing a different week's article

2. USING EVIDENCE (2 pts):
   - Score 2: References specific findings, numbers, or details
   - Score 1: Vague references without specifics
   - Score 0: No references to article content

3. CRITICAL QUESTIONING (2 pts):
   - Score 2: Identifies limitation AND explains why it matters
   - Score 1: Notes limitation but doesn't explain impact
   - Score 0: No critical questions raised

4. CLINICAL CONNECTION (2 pts) — INTERPRET GENEROUSLY FOR FIRST-SEMESTER STUDENTS:
   - Score 2: ANY thoughtful engagement with implications — hypothetical scenarios, genuine uncertainty about applicability, questioning validity, wondering about real-world impact
   - Score 1: Generic "this is important for SLPs" without reasoning
   - Score 0: No attempt to think about why this matters

   CRITICAL: The "Student uncertainty" section ("One thing I am still unsure about is...") COUNTS toward Clinical Connection if it shows genuine engagement with research implications or validity.

   EXAMPLE that earns 2/2: "One thing I am still unsure about is at what extent are there additional unmeasured factors that can misrepresent the data in this study." — This IS clinically relevant thinking.

${GRADING_GUIDANCE.toolDisclosure}

${GRADING_GUIDANCE.feedbackFormat}

=== FLAGGING CRITERIA ===
${FLAGGING_CRITERIA.map(f => `- ${f.name}: ${f.description}`).join('\n')}

=== YOUR TASK ===
1. Read the student's submission
2. Score each of the 4 criteria (0/1/2)
3. For each criterion, provide feedback using this format:
   - Full points: Brief praise for what they did well
   - Partial credit: "To earn full points: [SPECIFIC action for resubmission]"
4. Flag ONLY if: wrong article, fabricated content, or zero engagement

=== OUTPUT FORMAT ===
Week: ${weekNumber}
Article: ${article.title}

Article Engagement: [0/1/2]
[Feedback with specific guidance for improvement if needed]

Using Evidence: [0/1/2]
[Feedback with specific guidance for improvement if needed]

Critical Questioning: [0/1/2]
[Feedback with specific guidance for improvement if needed]

Clinical Connection: [0/1/2]
[Feedback with specific guidance for improvement if needed]

Total: [X]/8
Flagged: [Yes/No] — [reason if yes]

Remember: Students can REVISE for full credit. Make your feedback actionable.
`;
}

// Base prompt without week-specific content (fallback)
export const GRADING_SYSTEM_PROMPT_BASE = `You are a coaching-oriented grading assistant for SLHS 303 Speech and Hearing Science.

${GRADING_PHILOSOPHY}

${GRADING_GUIDANCE.population}

=== WEEKLY RUBRIC (8 points total) ===
${GRADING_RUBRIC.map(c => `
${c.name} (2 pts): ${c.description}
- 0: ${c.scoringGuide.zero}
- 1: ${c.scoringGuide.one}
- 2: ${c.scoringGuide.two}
`).join('\n')}

${GRADING_GUIDANCE.toolDisclosure}

=== FLAGGING CRITERIA ===
${FLAGGING_CRITERIA.map(f => `- ${f.name}: ${f.description}`).join('\n')}

=== YOUR TASK ===
1. Read the student's submission
2. Score each of the 4 criteria (0/1/2)
3. For each criterion, provide feedback using this format:
   - Full points: Brief praise for what they did well
   - Partial credit: "To earn full points: [SPECIFIC action for resubmission]"
4. Flag ONLY if: wrong article, fabricated content, or zero engagement

=== OUTPUT FORMAT ===
Week: [number]

Article Engagement: [0/1/2]
[Feedback with specific guidance for improvement if needed]

Using Evidence: [0/1/2]
[Feedback with specific guidance for improvement if needed]

Critical Questioning: [0/1/2]
[Feedback with specific guidance for improvement if needed]

Clinical Connection: [0/1/2]
[Feedback with specific guidance for improvement if needed]

Total: [X]/8
Flagged: [Yes/No] — [reason if yes]

Remember: Students can REVISE for full credit. Make your feedback actionable.
`;

// Legacy export for backwards compatibility
export const GRADING_SYSTEM_PROMPT = GRADING_SYSTEM_PROMPT_BASE;

// ============================================================================
// WEEK-SPECIFIC GRADING NOTES
// ============================================================================

export const WEEK_GRADING_NOTES: Record<number, {
  keyClaimsToLookFor: string[];
  commonMistakes: string[];
  acceptableLimitations: string[];
}> = {
  2: {
    keyClaimsToLookFor: [
      "Training predicts EBP use but only explains 17% of variance",
      "Time and workload are top barriers",
      "Most SLPs report barriers to using research",
    ],
    commonMistakes: [
      "Saying 'SLPs don't use research' (too absolute — many do, with barriers)",
      "Missing the 17% variance point (key insight)",
    ],
    acceptableLimitations: [
      "Self-report bias",
      "Sample may not represent all settings",
      "Survey questions may have been leading",
    ],
  },
  3: {
    keyClaimsToLookFor: [
      "Jitter/shimmer improve (decrease) with louder voice",
      "Intensity affects perturbation measures in healthy voices",
      "Measurement confounds can mask or mimic pathology",
    ],
    commonMistakes: [
      "Confusing 'improve' (better scores) with 'healthier voice'",
      "Not understanding that lower jitter/shimmer = 'better' scores",
    ],
    acceptableLimitations: [
      "Only tested healthy voices",
      "Didn't control for effort or posture",
      "Lab conditions may not match clinic",
    ],
  },
  4: {
    keyClaimsToLookFor: [
      "Reverberation affects some measures more than others",
      "CPP is relatively robust; shimmer is highly sensitive",
      "Recording environment matters for measurement validity",
    ],
    commonMistakes: [
      "Thinking all measures are equally affected by reverb",
      "Not distinguishing which measures are robust vs. sensitive",
    ],
    acceptableLimitations: [
      "Simulated reverb may differ from real rooms",
      "Only tested specific reverb levels",
      "Didn't test how clinicians actually record",
    ],
  },
  5: {
    keyClaimsToLookFor: [
      "Different software gives different values for same recording",
      "Software defaults embed theoretical assumptions",
      "No 'gold standard' for acoustic measures",
    ],
    commonMistakes: [
      "Thinking one software is 'right' and others are 'wrong'",
      "Not understanding that disagreement is the finding",
    ],
    acceptableLimitations: [
      "Didn't test all available software",
      "Software versions may have changed",
      "User settings can vary",
    ],
  },
  // Add more weeks as needed...
};

// ============================================================================
// MIDTERM RUBRIC (24 points total) — Covers Acts I & II
// ============================================================================

export type AssessmentMode = 'weekly' | 'midterm' | 'final';

export interface ExamRubricPart {
  name: string;
  maxPoints: number;
  focus: string;
  scoringLevels: { points: number; description: string }[];
  keyConcepts: string[];
  lookFor: string[];
}

export const MIDTERM_RUBRIC: ExamRubricPart[] = [
  {
    name: "Part 1: Core Concepts",
    maxPoints: 8,
    focus: "Definitions, mechanisms, causal chains — explain WHY things happen, not just THAT they happen",
    scoringLevels: [
      { points: 8, description: "Accurate definitions with complete causal chains (e.g., loudness → pressure → vibration stability → measurement); mechanisms explained" },
      { points: 6, description: "Mostly accurate; minor gaps in causal chains or definitions" },
      { points: 4, description: "Partial understanding; definitions present but mechanisms unclear" },
      { points: 2, description: "Superficial; vague definitions without mechanisms" },
      { points: 0, description: "Missing or fundamentally wrong" },
    ],
    keyConcepts: [
      "Source-filter theory",
      "Jitter (cycle-to-cycle timing instability)",
      "Shimmer (cycle-to-cycle amplitude instability)",
      "Loudness confound (intensity affects perturbation measures)",
      "CPP (cepstral peak prominence)",
    ],
    lookFor: [
      "Causal chains: loudness → subglottal pressure → vibration stability → measurement",
      "Distinction between source and filter contributions",
      "Understanding that jitter/shimmer are perturbation measures affected by intensity",
      "Recognition that CPP is more robust than perturbation measures",
    ],
  },
  {
    name: "Part 2: Interpreting Evidence",
    maxPoints: 8,
    focus: "Applying understanding to research — connecting findings to mechanisms",
    scoringLevels: [
      { points: 8, description: "Correctly interprets findings; identifies variables; connects to mechanisms; notes limitations" },
      { points: 6, description: "Good interpretation with minor gaps in variable identification or limitation awareness" },
      { points: 4, description: "Partial interpretation; misses connections between findings and mechanisms" },
      { points: 2, description: "Superficial; restates findings without interpretation" },
      { points: 0, description: "Missing or fundamentally wrong" },
    ],
    keyConcepts: [
      "Identifying independent and dependent variables",
      "Connecting findings to underlying mechanisms",
      "Recognizing study limitations and their implications",
    ],
    lookFor: [
      "References to specific articles from Acts I & II",
      "Explains WHY findings occurred, not just WHAT was found",
      "Acknowledges limitations of cited research",
      "Connects evidence to broader course themes",
    ],
  },
  {
    name: "Part 3: Perception Under Noise",
    maxPoints: 4,
    focus: "Act II concepts — masking, context effects, signal clarity",
    scoringLevels: [
      { points: 4, description: "Clear understanding of masking types; context effects; how listeners extract signal from noise" },
      { points: 3, description: "Good understanding with minor gaps" },
      { points: 2, description: "Confuses masking types or misattributes effects" },
      { points: 1, description: "Minimal understanding demonstrated" },
      { points: 0, description: "Missing or fundamentally wrong" },
    ],
    keyConcepts: [
      "Energetic masking (peripheral, frequency overlap)",
      "Informational masking (central, cognitive load)",
      "Context effects on speech perception",
      "Signal clarity and degradation",
    ],
    lookFor: [
      "Correct distinction between energetic (peripheral) and informational (central) masking",
      "Understanding of how context aids perception in noisy environments",
      "Application to clinical scenarios",
    ],
  },
  {
    name: "Part 4: Reflection",
    maxPoints: 4,
    focus: "Growth and remaining questions",
    scoringLevels: [
      { points: 4, description: "Specific growth identified (before → after); genuine remaining question; connects to course themes" },
      { points: 3, description: "Good reflection but remaining question is generic" },
      { points: 2, description: "Surface-level 'I learned a lot' without specifics" },
      { points: 1, description: "Minimal effort" },
      { points: 0, description: "Missing" },
    ],
    keyConcepts: [],
    lookFor: [
      "Specific example of conceptual growth (what they believed before vs. now)",
      "Genuine remaining question showing intellectual curiosity",
      "Connection between personal growth and course content",
    ],
  },
];

// ============================================================================
// FINAL RUBRIC (24 points total) — Covers All 4 Acts
// Central Question: "What has to be true for linguistic communication to be worth the energy?"
// ============================================================================

export const FINAL_RUBRIC: ExamRubricPart[] = [
  {
    name: "Part 1: Opening Reflection",
    maxPoints: 4,
    focus: "Growth since Week 1",
    scoringLevels: [
      { points: 4, description: "Specific Week 1 beliefs identified; clear conceptual shift articulated; genuine tone" },
      { points: 3, description: "Good reflection but lacks specificity about Week 1 starting point" },
      { points: 2, description: "Generic 'I learned a lot' without specific before/after" },
      { points: 1, description: "Minimal effort" },
      { points: 0, description: "Missing" },
    ],
    keyConcepts: [],
    lookFor: [
      "Specific reference to what they believed in Week 1",
      "Clear articulation of how understanding has shifted",
      "Genuine tone (not performative)",
    ],
  },
  {
    name: "Part 2: Act Insights",
    maxPoints: 8,
    focus: "One key insight per Act with specific evidence (2 pts each × 4 Acts)",
    scoringLevels: [
      { points: 8, description: "All 4 Acts addressed with specific insights and article references; explains why each matters" },
      { points: 6, description: "3-4 Acts addressed; some insights lack specificity or references" },
      { points: 4, description: "2-3 Acts addressed; generic insights or missing references" },
      { points: 2, description: "1-2 Acts addressed; superficial" },
      { points: 0, description: "Missing or wrong Acts" },
    ],
    keyConcepts: [
      "Act I: Measurement — jitter/shimmer, loudness confound, CPP, source-filter theory",
      "Act II: Perception — energetic/informational masking, context effects, signal clarity",
      "Act III: Production — subglottal pressure, Bernoulli effect, voice quality",
      "Act IV: Learning — motor learning, practice effects, articulatory coordination",
    ],
    lookFor: [
      "Per Act: specific insight (not just topic mention)",
      "Per Act: reference to a specific article or finding",
      "Per Act: explanation of why that insight matters",
      "Score 2 per Act if insight + reference present; 1 if generic/missing reference; 0 if missing",
    ],
  },
  {
    name: "Part 3: Making Connections",
    maxPoints: 4,
    focus: "Cross-Act connections — linking concepts from different parts of the course",
    scoringLevels: [
      { points: 4, description: "Sophisticated cross-Act connection with specific examples; bidirectional relationship" },
      { points: 3, description: "Good connection but one-directional" },
      { points: 2, description: "Surface-level connection without specifics" },
      { points: 1, description: "Unclear or forced connection" },
      { points: 0, description: "Missing" },
    ],
    keyConcepts: [],
    lookFor: [
      "Connection spans at least 2 Acts",
      "Specific examples from each Act used",
      "Bidirectional reasoning (A affects B AND B affects A)",
      "Not just 'both are about speech' but actual mechanistic link",
    ],
  },
  {
    name: "Part 4: Central Question",
    maxPoints: 4,
    focus: "What has to be true for linguistic communication to be worth the energy?",
    scoringLevels: [
      { points: 4, description: "Synthesizes multiple Acts; cites specific evidence; acknowledges uncertainty" },
      { points: 3, description: "Good synthesis but limited evidence or no acknowledgment of uncertainty" },
      { points: 2, description: "Superficial answer; single-perspective" },
      { points: 1, description: "Single-Act answer without synthesis" },
      { points: 0, description: "Missing" },
    ],
    keyConcepts: [],
    lookFor: [
      "Draws on evidence from multiple Acts",
      "Specific examples supporting their answer",
      "Acknowledges that some aspects remain uncertain",
      "Goes beyond 'communication is important' to address energy cost specifically",
    ],
  },
  {
    name: "Part 5: Looking Forward",
    maxPoints: 4,
    focus: "Clinical application and remaining curiosity",
    scoringLevels: [
      { points: 4, description: "Specific clinical application; genuine remaining question showing curiosity" },
      { points: 3, description: "One element strong, one weak" },
      { points: 2, description: "Generic clinical connection and/or generic question" },
      { points: 1, description: "Minimal" },
      { points: 0, description: "Missing" },
    ],
    keyConcepts: [],
    lookFor: [
      "Specific clinical scenario where course knowledge applies",
      "Genuine remaining question (not 'I wonder what else there is')",
      "Connection between clinical application and course content",
    ],
  },
];

// ============================================================================
// EXAM GRADING PHILOSOPHY
// ============================================================================

export const EXAM_GRADING_PHILOSOPHY = `
EXAM GRADING PHILOSOPHY:

From the syllabus:
- "Traditional exams reward memorization. This course assesses understanding."
- "The goal is for everyone to succeed"
- "Learning is iterative. Feedback and revision are built into the process"

WHAT THIS MEANS:
1. Students can REVISE for full credit — feedback must be actionable
2. Score what they got RIGHT before noting gaps
3. Generous partial credit — reserve 0 only for blank or zero effort
4. Coaching tone: "To earn full points, try..." NOT "You failed to..."
5. Intellectual curiosity valued — interesting questions should be rewarded
6. Look for UNDERSTANDING, not just correct terminology

SCORING ANCHORS:
- 20-24 pts (83-100%): Strong understanding across all parts
- 16-19 pts (67-79%): Good understanding with some gaps
- 12-15 pts (50-67%): Partial understanding; needs coaching
- 8-11 pts (33-50%): Minimal engagement; major gaps
- 0-7 pts (<33%): Missing parts or fundamental misunderstanding

TOOL USAGE:
- NotebookLM, podcasts, course materials are ALLOWED study aids
- If mentioned, note as strength showing extra engagement
- NEVER penalize for not mentioning tools
`;

// ============================================================================
// EXAM GRADING PROMPT BUILDERS
// ============================================================================

export function buildMidtermGradingPrompt(): string {
  return `You are a coaching-oriented grading assistant for the SLHS 303 Midterm Exam.

${GRADING_PHILOSOPHY}

${EXAM_GRADING_PHILOSOPHY}

=== MIDTERM RUBRIC (24 points total) ===
Covers Acts I & II. Students can resubmit for full credit.

Key syllabus guidance: "Explain WHY things happen, not just THAT they happen"
Example: "Trace causal chains (e.g., loudness → pressure → vibration stability → measurement)"

${MIDTERM_RUBRIC.map(part => `
${part.name} (${part.maxPoints} pts) — Focus: ${part.focus}
${part.scoringLevels.map(l => `  ${l.points} pts: ${l.description}`).join('\n')}
${part.keyConcepts.length > 0 ? `Key concepts: ${part.keyConcepts.join('; ')}` : ''}
Look for: ${part.lookFor.join('; ')}
`).join('\n')}

=== AI TOOLS POLICY ===
- NotebookLM, podcasts, course materials are ALLOWED
- If mentioned, note as strength
- NEVER flag or penalize for using study aids
- Flag ONLY: unauthorized AI writing the submission, fabrication, or plagiarism

=== YOUR TASK ===
1. Read the student's midterm response
2. Score each Part according to the rubric
3. Start feedback with what they did well
4. For any points not earned: "To earn full points: [SPECIFIC action for resubmission]"
5. Remember: Students can revise for full credit

=== OUTPUT FORMAT (JSON) ===
{
  "mode": "midterm",
  "parts": [
    { "name": "Part 1: Core Concepts", "score": X, "maxPoints": 8, "justification": "...", "feedback": "You earned X/8 on Core Concepts. [Praise or specific guidance]" },
    { "name": "Part 2: Interpreting Evidence", "score": X, "maxPoints": 8, "justification": "...", "feedback": "You earned X/8 on Interpreting Evidence. [Praise or specific guidance]" },
    { "name": "Part 3: Perception Under Noise", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Perception Under Noise. [Praise or specific guidance]" },
    { "name": "Part 4: Reflection", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Reflection. [Praise or specific guidance]" }
  ],
  "totalScore": X,
  "totalPossible": 24,
  "overallFeedback": "Start with strengths, then coaching for improvement",
  "flagged": false,
  "flagReason": ""
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences.`;
}

export function buildFinalGradingPrompt(): string {
  return `You are a coaching-oriented grading assistant for the SLHS 303 Final Exam.

${GRADING_PHILOSOPHY}

${EXAM_GRADING_PHILOSOPHY}

=== FINAL RUBRIC (24 points total) ===
Covers all 4 Acts. Students can resubmit for full credit.
Central Question: "What has to be true for linguistic communication to be worth the energy?"

${FINAL_RUBRIC.map(part => `
${part.name} (${part.maxPoints} pts) — Focus: ${part.focus}
${part.scoringLevels.map(l => `  ${l.points} pts: ${l.description}`).join('\n')}
${part.keyConcepts.length > 0 ? `Key concepts: ${part.keyConcepts.join('; ')}` : ''}
Look for: ${part.lookFor.join('; ')}
`).join('\n')}

=== AI TOOLS POLICY ===
- NotebookLM, podcasts, course materials are ALLOWED
- If mentioned, note as strength
- NEVER flag or penalize for using study aids
- Flag ONLY: unauthorized AI writing the submission, fabrication, or plagiarism

=== YOUR TASK ===
1. Read the student's final exam response
2. Score each Part according to the rubric
3. For Part 2 (Act Insights), score each Act separately (0-2 pts each)
4. Start feedback with what they did well
5. For any points not earned: "To earn full points: [SPECIFIC action for resubmission]"
6. Remember: Students can revise for full credit

=== OUTPUT FORMAT (JSON) ===
{
  "mode": "final",
  "parts": [
    { "name": "Part 1: Opening Reflection", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Opening Reflection. [Praise or specific guidance]" },
    { "name": "Part 2: Act Insights", "score": X, "maxPoints": 8, "justification": "Act I: X/2 — ...; Act II: X/2 — ...; Act III: X/2 — ...; Act IV: X/2 — ...", "feedback": "You earned X/8 on Act Insights. [Praise or specific guidance per Act]" },
    { "name": "Part 3: Making Connections", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Making Connections. [Praise or specific guidance]" },
    { "name": "Part 4: Central Question", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Central Question. [Praise or specific guidance]" },
    { "name": "Part 5: Looking Forward", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Looking Forward. [Praise or specific guidance]" }
  ],
  "totalScore": X,
  "totalPossible": 24,
  "overallFeedback": "Start with strengths, then coaching for improvement",
  "flagged": false,
  "flagReason": ""
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences.`;
}

export function buildWeeklyGradingPrompt(weekNumber: number): string {
  return buildGradingPrompt(weekNumber);
}

// Helper function to get calibration example by criterion and score
export function getCalibrationExample(
  criterionName: string,
  score: 0 | 1 | 2
): CalibrationExample | undefined {
  const criterion = GRADING_RUBRIC.find(c => c.name === criterionName);
  return criterion?.examples.find(e => e.score === score);
}

// Helper function to get all examples for a criterion
export function getCriterionExamples(criterionName: string): CalibrationExample[] {
  const criterion = GRADING_RUBRIC.find(c => c.name === criterionName);
  return criterion?.examples || [];
}
