/**
 * SLHS 303 Grading Calibration Examples
 *
 * This file contains calibrated examples for each rubric criterion at each score level (0, 1, 2).
 * Use these to maintain consistency when grading student reflections.
 *
 * RUBRIC (8 points total, 4 criteria × 2 points each):
 * 1. Article Engagement (THE CLAIM) — Did they identify a specific claim from the article?
 * 2. Using Evidence (THE EVIDENCE) — Did they cite specific findings, numbers, or data?
 * 3. Critical Questioning (ASSUMPTION + PROBLEM) — Did they identify a limitation and explain why it matters?
 * 4. Clinical Connection (WHY IT MATTERS + TAKEAWAY) — Did they connect to clinical practice?
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
    name: "Article Engagement",
    templateSection: "THE CLAIM",
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
        example: "THE CLAIM: The article was about voice quality and how it's measured in clinics.",
        feedback: "This describes the topic, not a specific claim. A claim states that X causes Y or X is related to Y.",
      },
      {
        score: 1,
        label: "Vague/General",
        description: "Claim present but not specific",
        example: "THE CLAIM: The article claims that different factors can affect voice measurements.",
        feedback: "This is too general. Which factors? Affect measurements how? Be specific about what the researchers found.",
      },
      {
        score: 2,
        label: "Specific/Accurate",
        description: "Clear, specific claim with X→Y structure",
        example: "THE CLAIM: The article claims that jitter and shimmer values decrease (appear 'better') when participants speak at louder intensities, even though their actual voice health didn't change.",
        feedback: "Excellent! This is specific, accurate, and captures the key finding.",
      },
    ],
  },
  {
    name: "Using Evidence",
    templateSection: "THE EVIDENCE (from conversation Q3)",
    description: "Did the student cite specific findings, numbers, or data from the article?",
    scoringGuide: {
      zero: "No evidence cited, or evidence is fabricated/incorrect.",
      one: "General reference to findings without specific numbers or data.",
      two: "Specific numbers, percentages, or statistical findings accurately cited.",
    },
    examples: [
      {
        score: 0,
        label: "Missing/Fabricated",
        description: "No evidence or made-up numbers",
        example: "The researchers found that this was true in their study.",
        feedback: "No specific evidence cited. What did they actually find? What were the numbers?",
      },
      {
        score: 1,
        label: "General Reference",
        description: "Evidence mentioned but not specific",
        example: "The study showed that most SLPs don't use research regularly, and there were barriers to evidence-based practice.",
        feedback: "Good start, but how many SLPs? What percentage? What were the main barriers?",
      },
      {
        score: 2,
        label: "Specific Data",
        description: "Concrete numbers, percentages, or findings",
        example: "The study found that training predicted EBP use (p < .05), but only explained 17% of the variance. The top barriers were time constraints (78%) and difficulty accessing research (62%).",
        feedback: "Excellent! Specific numbers that demonstrate engagement with the actual data.",
      },
    ],
  },
  {
    name: "Critical Questioning",
    templateSection: "THE ASSUMPTION + THE PROBLEM",
    description: "Did the student identify a limitation/assumption AND explain why it matters?",
    scoringGuide: {
      zero: "No limitation identified, or limitation without explanation of why it matters.",
      one: "Limitation identified but explanation is weak or missing.",
      two: "Clear limitation with thoughtful explanation of its implications.",
    },
    examples: [
      {
        score: 0,
        label: "Missing/No Explanation",
        description: "No limitation or just 'small sample size' with nothing else",
        example: "THE ASSUMPTION: The study assumed things were accurate. THE PROBLEM: The sample size was small.",
        feedback: "This is too vague. What specific assumption? Why does sample size matter for THIS study?",
      },
      {
        score: 1,
        label: "Limitation Without Impact",
        description: "Identifies issue but doesn't explain why it matters",
        example: "THE ASSUMPTION: They assumed participants answered honestly about their practices. THE PROBLEM: People might not tell the truth on surveys.",
        feedback: "Good identification! But why does this matter? How would dishonest answers affect the conclusions?",
      },
      {
        score: 2,
        label: "Limitation + Clear Impact",
        description: "Clear limitation with explanation of implications",
        example: "THE ASSUMPTION: They assumed clinicians answered honestly about using research. THE PROBLEM: But what if clinicians said they use research to look good, when they actually don't? That would mean the real barriers are even bigger than the study found, and we might be overestimating how much EBP actually happens.",
        feedback: "Excellent! Clear assumption, specific problem, and thoughtful explanation of why it matters.",
      },
    ],
  },
  {
    name: "Clinical Connection",
    templateSection: "WHY IT MATTERS + MY TAKEAWAY",
    description: "Did the student connect findings to clinical practice in a meaningful way?",
    scoringGuide: {
      zero: "No clinical connection, or connection is generic/irrelevant.",
      one: "General connection to practice without specifics.",
      two: "Specific, thoughtful connection showing how findings would affect clinical decisions.",
    },
    examples: [
      {
        score: 0,
        label: "Missing/Generic",
        description: "No connection or completely generic",
        example: "WHY IT MATTERS: This is important for clinicians to know. MY TAKEAWAY: Clinicians should be aware of this.",
        feedback: "This could apply to any article. How specifically would this affect what a clinician does?",
      },
      {
        score: 1,
        label: "General Connection",
        description: "Relevant but not specific to the findings",
        example: "WHY IT MATTERS: Clinicians need to know about measurement issues. MY TAKEAWAY: I would be careful when measuring voices.",
        feedback: "On the right track, but how specifically? What would you do differently?",
      },
      {
        score: 2,
        label: "Specific Application",
        description: "Clear, actionable clinical implication",
        example: "WHY IT MATTERS: If a patient speaks quietly during the first assessment and louder during a follow-up, their jitter/shimmer might look 'improved' even if their voice didn't actually get better. MY TAKEAWAY: I would control for loudness by using a sound level meter and having patients match a target intensity, so I can trust that any changes I see are real improvements.",
        feedback: "Excellent! Specific scenario, clear problem, and actionable solution.",
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
    name: "Unauthorized AI-Generated Content",
    description: "Response appears to be written by ChatGPT, Gemini, or similar generative AI (NOT NotebookLM — see sanctioned tools below)",
    examples: [
      "Overly polished academic language inconsistent with conversation",
      "Perfect structure with no personality or confusion expressed",
      "Uses terms or concepts not discussed in the conversation OR in course scaffolding materials",
      "Reflection is sophisticated but conversation was minimal/thin",
      "Generic phrases like 'In conclusion' or 'It is important to note'",
    ],
    action: "Compare reflection to conversation transcript. If conversation is thin but reflection is polished, flag for review. NOTE: NotebookLM, podcasts, briefing docs, flashcards, and quizzes are SANCTIONED course tools — mentioning them is POSITIVE, not a flag.",
  },
  {
    name: "Article Mismatch",
    description: "Response discusses wrong article or fabricated findings",
    examples: [
      "Claims don't match the assigned week's article",
      "Cites findings not present in the article",
      "Discusses completely different topic than assigned",
    ],
    action: "Verify claims against article. If fabricated or wrong article, flag and assign 0 for Article Engagement.",
  },
  {
    name: "Word Count Violation",
    description: "Response significantly under or over word count",
    examples: [
      "Under 80 words (significantly incomplete)",
      "Over 200 words (didn't follow instructions)",
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
    action: "If misunderstanding affects multiple criteria, address in feedback and consider whether it's a teaching moment vs. a red flag.",
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

  conversationComparison: `
THE CONVERSATION IS THE WORK. THE REFLECTION IS THE SUMMARY.

When grading:
1. Read the conversation FIRST (this is their actual thinking)
2. Read the reflection (this should summarize the conversation)
3. Do they match in substance and sophistication?

RED FLAGS:
- Thin conversation + polished reflection = likely AI assistance
- Good conversation + thin reflection = penalize reflection only, not conversation
- Both thin = low engagement, grade accordingly
- Both substantive = good faith effort, grade generously
`,

  quickApprove: `
QUICK APPROVE CRITERIA (7/8 points):
Use quick approve when:
- All template sections are filled in
- No obvious AI generation or fabrication
- Student engaged with the actual article
- Limitations are present, even if not deeply analyzed

Quick approve scores: Article Engagement 2, Using Evidence 1, Critical Questioning 2, Clinical Connection 2
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

1. CLAIM VALIDATION:
   - Score 2: Claim is related to the article's findings — even if paraphrased or not perfectly worded. If they clearly read the article, give the 2.
   - Score 1: Claim is vague or only tangentially related
   - Score 0: Claim doesn't match article, matches a MISCONCEPTION, or is fabricated
   - FLAG if claim clearly belongs to a different week's article

2. LIMITATION VALIDATION:
   - Score 2: Identifies ANY real limitation AND gives some reasoning about why it matters. Does NOT need to match the exact list above — any valid limitation counts.
   - Score 1: Limitation named but no explanation of impact
   - Score 0: No limitation or irrelevant to this article

3. EVIDENCE VALIDATION:
   - Score 2: References ANY specific findings or details from the article — paraphrased findings absolutely count. "Most SLPs reported time as a barrier" = 2. "95% were ASHA members" = 2. They do NOT need exact p-values or percentages to earn full credit.
   - Score 1: Only vague references like "the study found stuff" with zero detail
   - Score 0: No evidence or fabricated statistics

4. CLINICAL CONNECTION:
   - Score 2: ANY connection to practice, their future career, or how findings affect real-world work. Statements like "I need to build research habits now" or "clinics should give SLPs time for research" = 2. Personal takeaways about their own growth as future clinicians = 2.
   - Score 1: ONLY if connection is a single throwaway sentence like "this is important for clinicians"
   - Score 0: Completely absent — no mention of practice, career, or real-world implications at all

${GRADING_GUIDANCE.conversationComparison}

=== FLAGGING CRITERIA ===
${FLAGGING_CRITERIA.map(f => `- ${f.name}: ${f.description}`).join('\n')}
- WRONG ARTICLE: Student discusses findings from a different week's article

SANCTIONED TOOLS (count POSITIVELY — do NOT flag):
- NotebookLM, Google NotebookLM podcasts
- Course briefing documents, flashcards, quizzes
- Any scaffolding materials provided by the instructor
If a student mentions using these tools, note it as a STRENGTH showing engagement.

=== YOUR TASK ===
1. Identify which KEY FINDINGS the student's claim matches (or doesn't)
2. Check if limitations match the CONFOUNDS & LIMITATIONS list
3. Verify evidence isn't fabricated
4. Assess clinical connection quality
5. Compare conversation to reflection (do they match?)
6. Flag ONLY if: article mismatch, unauthorized AI (ChatGPT/Gemini — NOT NotebookLM), or misconception

=== OUTPUT FORMAT ===
Use this EXACT format. For each criterion, provide scaffolded feedback that tells the student what they earned and what to do for full credit.

Week: ${weekNumber}
Article: ${article.title}
Claim Match: [Which key finding matches, or "No match" / "Misconception"]

Article Engagement: [0/1/2]
You earned [X]/2 on Article Engagement. [If 2: brief praise for what they did well. If <2: "To earn full points: [specific action — e.g., 'Identify a specific cause-and-effect claim like X causes Y, rather than describing the general topic.']"]

Using Evidence: [0/1/2]
You earned [X]/2 on Using Evidence. [If 2: brief praise. If <2: "To earn full points: [specific action — e.g., 'Cite a specific number or statistic from the article, such as a percentage or p-value.']"]

Critical Questioning: [0/1/2]
You earned [X]/2 on Critical Questioning. [If 2: brief praise. If <2: "To earn full points: [specific action — e.g., 'Name a specific assumption AND explain how it could change the conclusion.']"]

Clinical Connection: [0/1/2]
You earned [X]/2 on Clinical Connection. [If 2: brief praise. If <2: "To earn full points: [specific action — e.g., 'Describe a specific clinical scenario where this finding would change what you do.']"]

Total: [X]/8
Flagged: [Yes/No] — [reason if yes]
`;
}

// Base prompt without week-specific content (fallback)
export const GRADING_SYSTEM_PROMPT_BASE = `You are a GENEROUS, coaching-oriented grading assistant for SLHS 303 Speech and Hearing Science.

YOUR DEFAULT STANCE: Give the student credit. If they showed effort and engagement, lean toward the higher score. A submission that addresses all sections with genuine thought should score 7-8/8. Reserve scores below 6 for submissions that are clearly thin, missing sections, or fabricated.

${GRADING_GUIDANCE.population}

RUBRIC (8 points total):
${GRADING_RUBRIC.map(c => `
${c.name} (${c.templateSection}) — 0/1/2 points
- 0: ${c.scoringGuide.zero}
- 1: ${c.scoringGuide.one}
- 2: ${c.scoringGuide.two}
`).join('\n')}

${GRADING_GUIDANCE.conversationComparison}

FLAGGING CRITERIA:
${FLAGGING_CRITERIA.map(f => `- ${f.name}: ${f.description}`).join('\n')}

SANCTIONED TOOLS (count POSITIVELY — do NOT flag):
- NotebookLM, Google NotebookLM podcasts
- Course briefing documents, flashcards, quizzes
- Any scaffolding materials provided by the instructor

YOUR TASK:
1. Read the student's conversation transcript (their work)
2. Read their reflection (their summary)
3. Compare them — do they match in substance and sophistication?
4. Score each criterion (0/1/2) with scaffolded feedback
5. Flag ONLY if: unauthorized AI (ChatGPT/Gemini — NOT NotebookLM), article mismatch, or fabrication

OUTPUT FORMAT:
Week: [number]

Article Engagement: [0/1/2]
You earned [X]/2 on Article Engagement. [If 2: brief praise. If <2: "To earn full points: [specific action]"]

Using Evidence: [0/1/2]
You earned [X]/2 on Using Evidence. [If 2: brief praise. If <2: "To earn full points: [specific action]"]

Critical Questioning: [0/1/2]
You earned [X]/2 on Critical Questioning. [If 2: brief praise. If <2: "To earn full points: [specific action]"]

Clinical Connection: [0/1/2]
You earned [X]/2 on Clinical Connection. [If 2: brief praise. If <2: "To earn full points: [specific action]"]

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
3. TOOL USAGE COUNTS — If a student references NotebookLM, podcasts, or scaffolding materials, that shows engagement. Count it positively.
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
6. Note use of tools (NotebookLM, podcasts) positively — this is engagement, not cheating
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
7. Note use of tools (NotebookLM, podcasts) positively — this is engagement, not cheating
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
