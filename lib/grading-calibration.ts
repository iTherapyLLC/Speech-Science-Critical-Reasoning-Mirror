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
    name: "AI-Generated Content",
    description: "Response appears to be written by ChatGPT or similar AI",
    examples: [
      "Overly polished academic language inconsistent with conversation",
      "Perfect structure with no personality or confusion expressed",
      "Uses terms or concepts not discussed in the conversation",
      "Reflection is sophisticated but conversation was minimal/thin",
      "Generic phrases like 'In conclusion' or 'It is important to note'",
    ],
    action: "Compare reflection to conversation transcript. If conversation is thin but reflection is polished, flag for review.",
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

SCORING PHILOSOPHY:
- If they attempted the scientific reasoning template with genuine effort → 6-8 points
- If they filled in blanks but answers are thin/generic → 4-6 points
- If sections are missing or clearly didn't engage → 2-4 points
- Reserve 0-2 points for non-submissions or obvious cheating
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
QUICK APPROVE CRITERIA (6/8 points):
Use quick approve when:
- All template sections are filled in
- No obvious AI generation or fabrication
- Student engaged with the actual article
- Limitations are present, even if not deeply analyzed

Quick approve scores: Article Engagement 2, Using Evidence 1, Critical Questioning 1, Clinical Connection 2
This reflects "honest effort" baseline.
`,
};

// ============================================================================
// SYSTEM PROMPT FOR AI-ASSISTED GRADING
// ============================================================================

export const GRADING_SYSTEM_PROMPT = `You are a grading assistant for SLHS 303 Speech and Hearing Science.

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

YOUR TASK:
1. Read the student's conversation transcript (their work)
2. Read their reflection (their summary)
3. Compare them — do they match in substance and sophistication?
4. Score each criterion (0/1/2) with brief justification
5. Flag if any flagging criteria are met

OUTPUT FORMAT:
Week: [number]
Article Engagement: [0/1/2] — [one sentence justification]
Using Evidence: [0/1/2] — [one sentence justification]
Critical Questioning: [0/1/2] — [one sentence justification]
Clinical Connection: [0/1/2] — [one sentence justification]
Total: [X]/8
Flagged: [Yes/No] — [reason if yes]
Feedback: [One constructive sentence for the student]
`;

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
