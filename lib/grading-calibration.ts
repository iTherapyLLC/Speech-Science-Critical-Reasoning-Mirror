/**
 * SLHS 303 Grading Calibration Examples
 *
 * This file contains calibrated examples for each rubric criterion at each score level (0, 1, 2).
 * Use these to maintain consistency when grading student submissions.
 *
 * WEEKLY RUBRIC (8 points total, 4 criteria × 2 points each):
 * 1. The Claim — Did they identify a specific claim from the article? (X causes Y)
 * 2. The Limitation — Did they identify a limitation AND explain why it matters?
 * 3. My Question — Did they identify a useful follow-up question AND what they learned?
 * 4. Student Uncertainty — Did they express genuine uncertainty with reasoning?
 *
 * SUBMISSION FORMAT (120-150 words):
 * - This article claims that ___.
 * - One limitation is ___, which matters because ___.
 * - The follow-up question I found most useful was ___, and what I learned was ___.
 * - One thing I am still unsure about is ___, because ___.
 *
 * Students may disclose tool usage (NotebookLM, LLMs, etc.) and provide citations.
 * Tool disclosure is noted but grading focuses on whether content meets rubric standards.
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
  templateSection: string;
  description: string;
  scoringGuide: {
    zero: string;
    one: string;
    two: string;
  };
  examples: CalibrationExample[];
}

// ============================================================================
// RUBRIC CRITERIA WITH CALIBRATION EXAMPLES
// ============================================================================

export const GRADING_RUBRIC: RubricCriterion[] = [
  {
    name: "The Claim",
    templateSection: "This article claims that ___",
    description: "Did the student identify a specific, accurate claim from the article?",
    scoringGuide: {
      zero: "Missing, vague, or incorrect claim. Example: 'The article was about voice.'",
      one: "General claim present but lacks specificity. Example: 'The article claims that measurements can vary.'",
      two: "Specific, accurate claim with clear X→Y structure. Example: 'The article claims that speaking louder reduces jitter and shimmer values, even in healthy voices.'",
    },
    examples: [
      {
        score: 0,
        label: "Missing/Incorrect",
        description: "No claim identified or completely wrong",
        example: "This article claims that voice quality is important in clinics.",
        feedback: "This describes the topic, not a specific claim. A claim states that X causes Y or X is related to Y.",
      },
      {
        score: 1,
        label: "Vague/General",
        description: "Claim present but not specific",
        example: "This article claims that different factors can affect voice measurements.",
        feedback: "This is too general. Which factors? Affect measurements how? Be specific about what the researchers found.",
      },
      {
        score: 2,
        label: "Specific/Accurate",
        description: "Clear, specific claim with X→Y structure",
        example: "This article claims that jitter and shimmer values decrease (appear 'better') when participants speak at louder intensities, even though their actual voice health didn't change.",
        feedback: "Excellent! This is specific, accurate, and captures the key finding.",
      },
    ],
  },
  {
    name: "The Limitation",
    templateSection: "One limitation is ___, which matters because ___",
    description: "Did the student identify a limitation AND explain why it matters for the findings?",
    scoringGuide: {
      zero: "No limitation identified, or limitation without explanation of why it matters.",
      one: "Limitation identified but explanation is weak or missing.",
      two: "Clear limitation with thoughtful explanation of its implications for the findings.",
    },
    examples: [
      {
        score: 0,
        label: "Missing/No Explanation",
        description: "No limitation or just 'small sample size' with nothing else",
        example: "One limitation is the sample size was small.",
        feedback: "This is too vague. Why does sample size matter for THIS study? How does it affect what we can conclude?",
      },
      {
        score: 1,
        label: "Limitation Without Impact",
        description: "Identifies issue but doesn't explain why it matters",
        example: "One limitation is they assumed participants answered honestly, which matters because people might not tell the truth.",
        feedback: "Good identification! But be more specific: how would dishonest answers affect the specific conclusions of this study?",
      },
      {
        score: 2,
        label: "Limitation + Clear Impact",
        description: "Clear limitation with explanation of implications",
        example: "One limitation is the self-selected sample (95% ASHA members), which matters because these are likely more engaged professionals who already value research, so the real barriers for less-engaged SLPs might be even bigger than reported.",
        feedback: "Excellent! Clear limitation, specific to this study, and thoughtful explanation of how it affects the conclusions.",
      },
    ],
  },
  {
    name: "My Question",
    templateSection: "The follow-up question I found most useful was ___, and what I learned was ___",
    description: "Did the student identify a useful follow-up question AND what they learned from exploring it?",
    scoringGuide: {
      zero: "No question identified, or question with no learning outcome.",
      one: "Question present but learning outcome is vague or generic.",
      two: "Specific, relevant question with clear learning outcome from the article.",
    },
    examples: [
      {
        score: 0,
        label: "Missing/No Learning",
        description: "No question or question with nothing learned",
        example: "The follow-up question I found most useful was why this matters, and I learned that it does matter.",
        feedback: "This is circular. What specific question did you explore? What specific new understanding did you gain?",
      },
      {
        score: 1,
        label: "Question Without Depth",
        description: "Question present but learning is vague",
        example: "The follow-up question I found most useful was how this affects clinicians, and I learned that clinicians should be careful.",
        feedback: "Good question! But what specifically did you learn about how it affects clinicians? Be more concrete.",
      },
      {
        score: 2,
        label: "Question + Clear Learning",
        description: "Specific question with concrete learning outcome",
        example: "The follow-up question I found most useful was 'what would make this study stronger?' and I learned that using a random sample instead of self-selected respondents and adding objective measures of EBP use (not just self-report) would give more trustworthy results.",
        feedback: "Excellent! Clear question and specific, actionable learning that shows deeper engagement with the research.",
      },
    ],
  },
  {
    name: "Student Uncertainty",
    templateSection: "One thing I am still unsure about is ___, because ___",
    description: "Did the student express genuine uncertainty with reasoning about why?",
    scoringGuide: {
      zero: "No uncertainty expressed, or fake/performative uncertainty.",
      one: "Uncertainty expressed but reasoning is weak or missing.",
      two: "Genuine uncertainty with thoughtful reasoning about why it remains unclear.",
    },
    examples: [
      {
        score: 0,
        label: "Missing/Fake",
        description: "No uncertainty or obviously performative",
        example: "One thing I am still unsure about is everything, because this is complicated.",
        feedback: "This isn't genuine uncertainty. What specific aspect remains unclear to you after reading the article?",
      },
      {
        score: 1,
        label: "Uncertainty Without Reasoning",
        description: "Uncertainty present but reasoning is weak",
        example: "One thing I am still unsure about is how this applies to real clinics, because I haven't worked in one yet.",
        feedback: "This is a reasonable uncertainty, but the reasoning is about your experience, not about the article. What in the article itself leaves this unclear?",
      },
      {
        score: 2,
        label: "Genuine + Reasoned",
        description: "Authentic uncertainty with thoughtful reasoning",
        example: "One thing I am still unsure about is whether training alone can overcome systemic barriers like high caseloads, because the study showed training only explained 17% of the variance in EBP use, which means 83% is explained by other factors they didn't fully identify.",
        feedback: "Excellent! This shows you understood the findings AND can identify where the evidence leaves questions unanswered.",
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
    name: "Article Mismatch",
    description: "Response discusses wrong article or fabricated findings",
    examples: [
      "Claims don't match the assigned week's article",
      "Cites findings not present in the article",
      "Discusses completely different topic than assigned",
    ],
    action: "Verify claims against article. If fabricated or wrong article, flag and assign 0 for The Claim.",
  },
  {
    name: "Fabricated Content",
    description: "Response contains made-up statistics or findings",
    examples: [
      "Cites specific percentages or p-values not in the article",
      "Describes methodology or sample that doesn't match",
      "Invents author names or study details",
    ],
    action: "Flag for review. Score based on what IS accurate, but note the fabrication.",
  },
  {
    name: "Word Count Violation",
    description: "Response significantly under or over word count (target: 120-150 words)",
    examples: [
      "Under 80 words (significantly incomplete)",
      "Over 250 words (didn't follow instructions)",
    ],
    action: "Note in feedback but don't automatically penalize if content is good. Significant under-count usually means missing criteria.",
  },
  {
    name: "Critical Misunderstanding",
    description: "Student fundamentally misunderstands the article's main claim",
    examples: [
      "States the opposite of what the article found",
      "Confuses the variables (says X causes Y when article says Y causes X)",
      "Misinterprets correlation as causation when article explicitly didn't",
    ],
    action: "Address in feedback as a teaching moment. This is NOT automatic zero — grade what they got right.",
  },
];

// ============================================================================
// GRADING GUIDANCE
// ============================================================================

export const GRADING_GUIDANCE = {
  population: `
CRITICAL CONTEXT ABOUT THESE STUDENTS:
- These are undergraduates, many first-generation college students
- Zero out of 37 knew who Socrates was before this course
- They have never done critical thinking exercises before
- They are learning the PROCESS of scientific reasoning
- We are grading EFFORT and ENGAGEMENT, not expertise

SCORING PHILOSOPHY — GENEROUS BY DEFAULT:
- If they attempted the template with genuine effort → 7-8 points (this is the BASELINE for real engagement)
- If they filled in blanks but answers are thin/generic → 5-6 points
- If sections are missing or clearly didn't engage → 3-4 points
- Reserve 0-2 points ONLY for non-submissions or obvious cheating
- WHEN IN DOUBT, round UP. A 1 that's close to a 2 should be a 2.
- These students can resubmit for full credit — your job is to coach, not gatekeep.
`,

  toolDisclosure: `
TOOL USAGE AND CITATIONS:
Students may disclose using tools (NotebookLM, LLMs, etc.) and provide citations.
- Tool disclosure is NOTED but does not affect scoring
- Grading focuses on whether the CONTENT meets rubric standards
- A well-written response using NotebookLM gets the same score as one without
- A poorly-written response claiming no tools gets the same score as one with tools
- The question is always: Does this submission demonstrate understanding?

SANCTIONED TOOLS (do NOT flag):
- NotebookLM, Google NotebookLM podcasts, briefing docs, flashcards, quizzes
- Course scaffolding materials provided by the instructor
- LLMs used for learning (not for writing the submission)

FLAG ONLY if the submission:
- Discusses wrong article content
- Contains fabricated statistics or findings
- Is clearly copy-pasted boilerplate with no article-specific content
`,

  quickApprove: `
QUICK APPROVE CRITERIA (7/8 points):
Use quick approve when:
- All four template sections are filled in (claim, limitation, question, uncertainty)
- No obvious fabrication or wrong-article content
- Student engaged with the actual article
- Reasoning is present, even if not deeply analyzed

Quick approve scores: The Claim 2, The Limitation 2, My Question 1, Student Uncertainty 2
This reflects "honest effort" baseline. Most students who genuinely engage should land at 7-8.
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

  return `You are a GENEROUS, coaching-oriented grading assistant for SLHS 303 Speech and Hearing Science.

YOUR DEFAULT STANCE: Give the student credit. If they showed effort and engagement, lean toward the higher score. A submission that addresses all sections with genuine thought should score 7-8/8. Reserve scores below 6 for submissions that are clearly thin, missing sections, or fabricated.

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

=== RUBRIC (8 points total) ===
${GRADING_RUBRIC.map(c => `
${c.name} (${c.templateSection}) — 0/1/2 points
- 0: ${c.scoringGuide.zero}
- 1: ${c.scoringGuide.one}
- 2: ${c.scoringGuide.two}
`).join('\n')}

=== VALIDATION RULES (GENEROUS — round up when close) ===

1. THE CLAIM (2 pts):
   - Score 2: Claim is related to the article's findings — even if paraphrased or not perfectly worded. If they clearly read the article, give the 2.
   - Score 1: Claim is vague or only tangentially related
   - Score 0: Claim doesn't match article, matches a MISCONCEPTION, or is fabricated
   - FLAG if claim clearly belongs to a different week's article

2. THE LIMITATION (2 pts):
   - Score 2: Identifies ANY real limitation AND gives some reasoning about why it matters. Does NOT need to match the exact list above — any valid limitation counts.
   - Score 1: Limitation named but no explanation of impact
   - Score 0: No limitation or irrelevant to this article

3. MY QUESTION (2 pts):
   - Score 2: Identifies a relevant follow-up question AND describes something specific they learned from exploring it.
   - Score 1: Question present but learning outcome is vague or generic
   - Score 0: No question or no learning outcome

4. STUDENT UNCERTAINTY (2 pts):
   - Score 2: Expresses genuine uncertainty about something specific AND provides reasoning about why it remains unclear.
   - Score 1: Uncertainty expressed but reasoning is weak or missing
   - Score 0: No uncertainty expressed, or fake/performative uncertainty

${GRADING_GUIDANCE.toolDisclosure}

=== FLAGGING CRITERIA ===
${FLAGGING_CRITERIA.map(f => `- ${f.name}: ${f.description}`).join('\n')}
- WRONG ARTICLE: Student discusses findings from a different week's article

SANCTIONED TOOLS (BONUS, not required — NEVER deduct for absence):
- NotebookLM, Google NotebookLM podcasts
- Course briefing documents, flashcards, quizzes
- Any scaffolding materials provided by the instructor
If a student mentions using these tools, note it as a BONUS showing extra engagement. If they DON'T mention them, that's completely fine — never penalize or deduct for not using scaffolding tools.

=== YOUR TASK ===
1. Identify which KEY FINDINGS the student's claim matches (or doesn't)
2. Check if limitations match the CONFOUNDS & LIMITATIONS list
3. Assess whether follow-up question and learning are specific
4. Assess whether uncertainty is genuine and reasoned
5. Note any tool disclosures but grade on content quality
6. Flag ONLY if: article mismatch, fabricated content, or boilerplate

=== OUTPUT FORMAT ===
Use this EXACT format. For each criterion, provide scaffolded feedback that tells the student what they earned and what to do for full credit.

Week: ${weekNumber}
Article: ${article.title}
Claim Match: [Which key finding matches, or "No match" / "Misconception"]

The Claim: [0/1/2]
You earned [X]/2 on The Claim. [If 2: brief praise for what they did well. If <2: "To earn full points: [specific action — e.g., 'Identify a specific cause-and-effect claim like X causes Y, rather than describing the general topic.']"]

The Limitation: [0/1/2]
You earned [X]/2 on The Limitation. [If 2: brief praise. If <2: "To earn full points: [specific action — e.g., 'Name a specific limitation AND explain how it affects the conclusions.']"]

My Question: [0/1/2]
You earned [X]/2 on My Question. [If 2: brief praise. If <2: "To earn full points: [specific action — e.g., 'Describe a specific question you explored AND what you learned from investigating it.']"]

Student Uncertainty: [0/1/2]
You earned [X]/2 on Student Uncertainty. [If 2: brief praise. If <2: "To earn full points: [specific action — e.g., 'Express genuine uncertainty about something specific AND explain why it remains unclear.']"]

Total: [X]/8
Flagged: [Yes/No] — [reason if yes]
`;
}

// Base prompt without week-specific content (fallback)
export const GRADING_SYSTEM_PROMPT_BASE = `You are a GENEROUS, coaching-oriented grading assistant for SLHS 303 Speech and Hearing Science.

YOUR DEFAULT STANCE: Give the student credit. If they showed effort and engagement, lean toward the higher score. A submission that addresses all sections with genuine thought should score 7-8/8. Reserve scores below 6 for submissions that are clearly thin, missing sections, or fabricated.

${GRADING_GUIDANCE.population}

SUBMISSION FORMAT (120-150 words):
Students submit a paragraph using this template:
- This article claims that ___.
- One limitation is ___, which matters because ___.
- The follow-up question I found most useful was ___, and what I learned was ___.
- One thing I am still unsure about is ___, because ___.

Students may disclose tool usage (NotebookLM, LLMs) and provide citations.
Grade the CONTENT, not whether they used tools.

RUBRIC (8 points total):
${GRADING_RUBRIC.map(c => `
${c.name} (${c.templateSection}) — 0/1/2 points
- 0: ${c.scoringGuide.zero}
- 1: ${c.scoringGuide.one}
- 2: ${c.scoringGuide.two}
`).join('\n')}

${GRADING_GUIDANCE.toolDisclosure}

FLAGGING CRITERIA:
${FLAGGING_CRITERIA.map(f => `- ${f.name}: ${f.description}`).join('\n')}

YOUR TASK:
1. Read the student's written submission
2. Score each of the 4 criteria (0/1/2) based on content quality
3. Note any tool disclosures but grade on content merit
4. Flag ONLY if: wrong article, fabricated content, or obvious boilerplate

OUTPUT FORMAT:
Week: [number]

The Claim: [0/1/2]
You earned [X]/2 on The Claim. [If 2: brief praise. If <2: "To earn full points: [specific action]"]

The Limitation: [0/1/2]
You earned [X]/2 on The Limitation. [If 2: brief praise. If <2: "To earn full points: [specific action]"]

My Question: [0/1/2]
You earned [X]/2 on My Question. [If 2: brief praise. If <2: "To earn full points: [specific action]"]

Student Uncertainty: [0/1/2]
You earned [X]/2 on Student Uncertainty. [If 2: brief praise. If <2: "To earn full points: [specific action]"]

Total: [X]/8
Flagged: [Yes/No] — [reason if yes]
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
// MIDTERM RUBRIC (24 points total) — Covers Acts I–III, Due March 24
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
    focus: "Definitions, mechanisms, causal chains",
    scoringLevels: [
      { points: 8, description: "Accurate definitions; complete causal chains (pressure → vibration → measurement); mechanisms explained" },
      { points: 6, description: "Mostly accurate; minor gaps in causal chains or definitions" },
      { points: 4, description: "Partial; definitions present but without mechanisms" },
      { points: 2, description: "Superficial; vague or incomplete understanding" },
      { points: 0, description: "Missing or fundamentally wrong" },
    ],
    keyConcepts: [
      "Source-filter theory",
      "Jitter (timing instability)",
      "Shimmer (amplitude instability)",
      "Loudness confound",
      "CPP (cepstral peak prominence)",
    ],
    lookFor: [
      "Causal chains connecting pressure → vibration → measurement",
      "Distinction between source and filter contributions",
      "Understanding that jitter/shimmer are perturbation measures affected by intensity",
      "Recognition that CPP is more robust than perturbation measures",
    ],
  },
  {
    name: "Part 2: Interpreting Evidence",
    maxPoints: 8,
    focus: "Applying understanding to research",
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
      "Recognizing study limitations",
    ],
    lookFor: [
      "References to specific articles from Acts I–III",
      "Explains WHY findings occurred, not just WHAT was found",
      "Acknowledges limitations of cited research",
      "Connects evidence to broader course themes",
    ],
  },
  {
    name: "Part 3: Perception Under Noise",
    maxPoints: 4,
    focus: "Act II concepts",
    scoringLevels: [
      { points: 4, description: "Clear understanding of masking types; context effects; signal clarity" },
      { points: 3, description: "Good understanding with minor gaps" },
      { points: 2, description: "Confuses masking types or misattributes effects" },
      { points: 1, description: "Minimal understanding demonstrated" },
      { points: 0, description: "Missing or fundamentally wrong" },
    ],
    keyConcepts: [
      "Energetic masking (peripheral, frequency overlap)",
      "Informational masking (central, cognitive load)",
      "Context effects on perception",
      "Signal clarity and degradation",
    ],
    lookFor: [
      "Correct distinction between energetic (peripheral) and informational (central) masking",
      "Understanding of how context aids perception in noisy environments",
      "Application to clinical scenarios (e.g., hearing assessment environments)",
    ],
  },
  {
    name: "Part 4: Reflection",
    maxPoints: 4,
    focus: "Growth and remaining questions",
    scoringLevels: [
      { points: 4, description: "Specific growth identified; genuine remaining question; connects to course themes" },
      { points: 3, description: "Good reflection but generic remaining question" },
      { points: 2, description: "Surface-level 'I learned a lot' without specifics" },
      { points: 1, description: "Minimal effort" },
      { points: 0, description: "Missing" },
    ],
    keyConcepts: [],
    lookFor: [
      "Specific example of conceptual growth (before → after understanding)",
      "Genuine remaining question showing curiosity",
      "Connection between personal growth and course content",
    ],
  },
];

// ============================================================================
// FINAL RUBRIC (24 points total) — Covers All 4 Acts, Due May 14
// Central Question: "What has to be true for linguistic communication to be worth the energy?"
// ============================================================================

export const FINAL_RUBRIC: ExamRubricPart[] = [
  {
    name: "Part 1: Opening Reflection",
    maxPoints: 4,
    focus: "Growth since Week 1",
    scoringLevels: [
      { points: 4, description: "Specific Week 1 beliefs identified; clear conceptual shift; genuine growth articulated" },
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
    name: "Part 2: Act Insights (4 Acts × 2 pts)",
    maxPoints: 8,
    focus: "One key insight per Act with specific reference",
    scoringLevels: [
      { points: 8, description: "All 4 Acts addressed with specific insights and article references; explains why each matters" },
      { points: 6, description: "3-4 Acts addressed; some insights lack specificity or references" },
      { points: 4, description: "2-3 Acts addressed; generic insights or missing references" },
      { points: 2, description: "1-2 Acts addressed; superficial" },
      { points: 0, description: "Missing or wrong Acts" },
    ],
    keyConcepts: [
      "Act I: jitter/shimmer, loudness confound, CPP, source-filter theory",
      "Act II: energetic/informational masking, context effects, signal clarity",
      "Act III: subglottal pressure, Bernoulli effect, voice quality",
      "Act IV: motor learning, practice effects, articulatory coordination",
    ],
    lookFor: [
      "Per Act: specific insight (not just topic mention)",
      "Per Act: reference to a specific article or finding",
      "Per Act: explanation of why that insight matters",
      "Score 2 per Act if both insight + reference present; 1 if generic or missing reference; 0 if missing or wrong Act",
    ],
  },
  {
    name: "Part 3: Making Connections",
    maxPoints: 4,
    focus: "Cross-Act connections",
    scoringLevels: [
      { points: 4, description: "Sophisticated cross-Act connection; specific examples; bidirectional relationship identified" },
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
      { points: 4, description: "Synthesizes multiple Acts; specific evidence cited; acknowledges uncertainty" },
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
      { points: 4, description: "Specific clinical application identified; genuine remaining question demonstrates curiosity" },
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
// EXAM GRADING CALIBRATION PHILOSOPHY
// ============================================================================

export const EXAM_GRADING_PHILOSOPHY = `
CALIBRATION PHILOSOPHY FOR EXAM GRADING:

1. START FROM STRENGTHS — Score what they got right before noting gaps.
2. GENEROUS PARTIAL CREDIT — Reserve 0 only for blank responses or zero effort.
3. TOOL USAGE IS A BONUS, NOT A REQUIREMENT — If a student references NotebookLM, podcasts, or scaffolding materials, that shows extra engagement and is worth noting positively. But NOT mentioning these tools is perfectly fine — students demonstrate understanding in many ways. Never deduct points for not using or mentioning scaffolding tools.
4. INTELLECTUAL CURIOSITY VALUED — A genuinely interesting question or unexpected connection should be rewarded even if imperfect.
5. COACHING TONE — Feedback should say "To earn full points, try..." not "You failed to..."
6. RESUBMISSION CONTEXT — Students can resubmit for full credit, so feedback should be actionable and specific.
7. THE GOAL IS GROWTH, NOT PERFECTION — These are undergraduates learning scientific reasoning for the first time.

SCORING ANCHORS:
- 20-24 pts (83-100%): Strong understanding demonstrated across all parts
- 16-19 pts (67-79%): Good understanding with some gaps; actionable feedback given
- 12-15 pts (50-67%): Partial understanding; significant coaching feedback needed
- 8-11 pts (33-50%): Minimal engagement; major gaps
- 0-7 pts (<33%): Missing parts or fundamental misunderstanding
`;

// ============================================================================
// EXAM GRADING PROMPT BUILDERS
// ============================================================================

export function buildMidtermGradingPrompt(): string {
  return `You are a coaching-oriented grading assistant for the SLHS 303 Midterm Exam.

${GRADING_GUIDANCE.population}

${EXAM_GRADING_PHILOSOPHY}

=== MIDTERM RUBRIC (24 points total) ===
Covers Acts I–III. Students can resubmit for full credit.

${MIDTERM_RUBRIC.map(part => `
${part.name} (${part.maxPoints} pts) — Focus: ${part.focus}
${part.scoringLevels.map(l => `  ${l.points} pts: ${l.description}`).join('\n')}
${part.keyConcepts.length > 0 ? `Key concepts: ${part.keyConcepts.join('; ')}` : ''}
Look for: ${part.lookFor.join('; ')}
`).join('\n')}

=== SANCTIONED TOOLS (count POSITIVELY — do NOT flag) ===
- NotebookLM, Google NotebookLM podcasts
- Course briefing documents, flashcards, quizzes
- Any scaffolding materials provided by the instructor
If a student mentions using these tools, note it as a STRENGTH.

=== YOUR TASK ===
1. Read the student's midterm response carefully
2. Score each Part according to the rubric above
3. Start feedback with what they did well
4. For any points not earned, explain specifically what to add for a resubmission
5. Use coaching tone: "To earn full points, try..." not "You failed to..."
6. If a student mentions NotebookLM, podcasts, or scaffolding tools, note it as a bonus — but NEVER deduct for not mentioning them
7. Flag ONLY for unauthorized AI (ChatGPT/Gemini — NOT NotebookLM), fabrication, or plagiarism

=== FEEDBACK FORMAT ===
Each part's "feedback" field MUST use this scaffolded format:
"You earned X/Y on [Part Name]. [If full points: brief praise for what they did well.] [If less than full: 'To earn full points: [specific action they can take for resubmission].']"

=== OUTPUT FORMAT (JSON) ===
{
  "mode": "midterm",
  "parts": [
    { "name": "Part 1: Core Concepts", "score": X, "maxPoints": 8, "justification": "...", "feedback": "You earned X/8 on Core Concepts. To earn full points: [specific action]." },
    { "name": "Part 2: Interpreting Evidence", "score": X, "maxPoints": 8, "justification": "...", "feedback": "You earned X/8 on Interpreting Evidence. To earn full points: [specific action]." },
    { "name": "Part 3: Perception Under Noise", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Perception Under Noise. To earn full points: [specific action]." },
    { "name": "Part 4: Reflection", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Reflection. To earn full points: [specific action]." }
  ],
  "totalScore": X,
  "totalPossible": 24,
  "overallFeedback": "Start with strengths, then coaching for improvement",
  "flagged": false,
  "flagReason": ""
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no explanation outside the JSON.`;
}

export function buildFinalGradingPrompt(): string {
  return `You are a coaching-oriented grading assistant for the SLHS 303 Final Exam.

${GRADING_GUIDANCE.population}

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

=== SANCTIONED TOOLS (count POSITIVELY — do NOT flag) ===
- NotebookLM, Google NotebookLM podcasts
- Course briefing documents, flashcards, quizzes
- Any scaffolding materials provided by the instructor
If a student mentions using these tools, note it as a STRENGTH.

=== YOUR TASK ===
1. Read the student's final exam response carefully
2. Score each Part according to the rubric above
3. For Part 2 (Act Insights), score each Act separately (0-2 pts each) and sum
4. Start feedback with what they did well
5. For any points not earned, explain specifically what to add for a resubmission
6. Use coaching tone: "To earn full points, try..." not "You failed to..."
7. If a student mentions NotebookLM, podcasts, or scaffolding tools, note it as a bonus — but NEVER deduct for not mentioning them
8. Flag ONLY for unauthorized AI (ChatGPT/Gemini — NOT NotebookLM), fabrication, or plagiarism

=== FEEDBACK FORMAT ===
Each part's "feedback" field MUST use this scaffolded format:
"You earned X/Y on [Part Name]. [If full points: brief praise for what they did well.] [If less than full: 'To earn full points: [specific action they can take for resubmission].']"

=== OUTPUT FORMAT (JSON) ===
{
  "mode": "final",
  "parts": [
    { "name": "Part 1: Opening Reflection", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Opening Reflection. To earn full points: [specific action]." },
    { "name": "Part 2: Act Insights", "score": X, "maxPoints": 8, "justification": "Act I: X/2 — ...; Act II: X/2 — ...; Act III: X/2 — ...; Act IV: X/2 — ...", "feedback": "You earned X/8 on Act Insights. To earn full points: [specific action per Act that needs improvement]." },
    { "name": "Part 3: Making Connections", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Making Connections. To earn full points: [specific action]." },
    { "name": "Part 4: Central Question", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Central Question. To earn full points: [specific action]." },
    { "name": "Part 5: Looking Forward", "score": X, "maxPoints": 4, "justification": "...", "feedback": "You earned X/4 on Looking Forward. To earn full points: [specific action]." }
  ],
  "totalScore": X,
  "totalPossible": 24,
  "overallFeedback": "Start with strengths, then coaching for improvement",
  "flagged": false,
  "flagReason": ""
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no explanation outside the JSON.`;
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
