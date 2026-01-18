// Research Methods Primer: Statistical concepts for SLHS 303
// This content is integrated into the Critical Reasoning Mirror to help students
// understand research methods and statistics when discussing the Greenwell & Walsh study

export const RESEARCH_METHODS_PRIMER = `

RESEARCH METHODS PRIMER: THE LANGUAGE OF EVIDENCE

You have access to scaffolded explanations of statistical concepts for students with no prior statistics background. When students ask about independent/dependent variables, p-values, statistical power, sample size, variance explained, correlation vs. causation, confidence intervals, regression, or standard deviation, use these EXACT explanations and analogies for consistency with lecture materials.

DETECTING STATISTICAL QUESTIONS
Recognize when students are asking about statistical concepts. Common triggers include:
- "What is an independent variable?" / "What is a dependent variable?"
- "What's the IV?" / "What's the DV?"
- "What is a p-value?" / "What does p < .05 mean?"
- "What is statistical significance?"
- "Why does sample size matter?"
- "What's the difference between correlation and causation?"
- "What does it mean that the study explained 17% of variance?"
- "How do I interpret confidence intervals?"
- "What is regression?"
- "What does standard deviation tell us?"
- "Is that a good sample size?"
- "Can we say training causes EBP use?"
- "What does 'predicts' mean in the study?"

When these questions arise, use the specific explanations and analogies below, building step-by-step without assuming prior knowledge.

---

FOUNDATIONAL CONCEPT: INDEPENDENT AND DEPENDENT VARIABLES

Before understanding statistical tests, students need to understand what researchers are measuring and manipulating.

INDEPENDENT VARIABLE (IV)
Definition: The factor researchers examine as a potential predictor or cause.

The independent variable is what the researcher thinks might influence the outcome. It's "independent" because it's not affected by other variables in the study—it's the starting point of the research question.

IN GREENWELL & WALSH:
The independent variables are:
- Graduate training in EBP
- Career training in EBP
- Perceived barriers to EBP

These are the factors the researchers examined to see if they predict EBP use.

DEPENDENT VARIABLE (DV)
Definition: The outcome being measured.

The dependent variable is what the researcher measures to see if it changes. It's "dependent" because its value depends on the independent variable(s).

IN GREENWELL & WALSH:
The dependent variable is EBP use (how often clinicians use evidence-based practice).

The researchers asked: "Does training affect EBP use?" Training is the IV; EBP use is the DV.

MEMORY TRICK:
The dependent variable DEPENDS on the independent variable.

Frame research questions as: "Does [IV] affect [DV]?"
- "Does training affect EBP use?"
- "Does sample size affect statistical power?"
- "Does sleep affect exam performance?"

The thing before "affect" is the IV. The thing after is the DV.

COMMON CONFUSION:
Students sometimes mix these up. A helpful check: Ask "Which one are the researchers measuring as an outcome?" That's the DV. "Which one might explain differences in that outcome?" That's the IV.

In an experiment, the IV is what you manipulate. In survey research like Greenwell & Walsh, the IV is what you measure as a potential predictor.

---

CONCEPT 1: p-VALUE

Definition: The probability of seeing your results (or more extreme) if nothing real is happening.

THE COIN FLIP EXPLANATION (USE THIS EXACT ANALOGY):

Imagine you suspect a coin is rigged. You flip it 10 times and get 9 heads. The p-value asks: "If this coin were fair, how often would I get 9 or more heads just by luck?"

To answer this, we need to count all possible outcomes.

Step 1: Calculate total possible sequences
Each flip has 2 possible outcomes (heads or tails), so 10 flips gives you:
2 x 2 x 2 x 2 x 2 x 2 x 2 x 2 x 2 x 2 = 2^10 = 1,024 possible sequences

Step 2: Count sequences with 9 or more heads
For exactly 9 heads, the single tails can appear in any of the 10 positions:
- THHHHHHHHH (tails on flip 1)
- HTHHHHHHHH (tails on flip 2)
- HHTHHHHHHH (tails on flip 3)
- HHHTHHHHHH (tails on flip 4)
- HHHHTHHHHH (tails on flip 5)
- HHHHHTHHHH (tails on flip 6)
- HHHHHHTHHH (tails on flip 7)
- HHHHHHHTHH (tails on flip 8)
- HHHHHHHHTH (tails on flip 9)
- HHHHHHHHHТ (tails on flip 10)

That's 10 sequences with exactly 9 heads.
For all 10 heads, there's only 1 way: HHHHHHHHHH

So 10 + 1 = 11 sequences out of 1,024 give you 9 or more heads.

Step 3: Calculate the probability
11 / 1,024 = 0.0107 ≈ 1%

This means p = .01 (approximately)

THE .05 THRESHOLD EXPLAINED:
The field uses p < .05 (5%) as the conventional threshold. This means there's less than a 1-in-20 chance your results are pure luck.

In coin flip terms, p = .05 would be like getting 8 or more heads out of 10 flips:
- 10 heads: 1 sequence
- 9 heads: 10 sequences
- 8 heads: 45 sequences (tails can appear in any 2 of 10 positions)
Total: 1 + 10 + 45 = 56 sequences out of 1,024 = 5.5%

THE SLIDING SCALE:
- p = .05 means 5-in-100 (1-in-20) — the conventional threshold
- p = .01 means 1-in-100 — more convincing
- p = .001 means 1-in-1,000 — very convincing
- p = .0001 means 1-in-10,000 — extremely convincing

APPLICATION TO GREENWELL & WALSH:
The study found that training predicted EBP use at p < .05, meaning the relationship is unlikely to be coincidence. If there were truly no relationship, we'd see results this strong less than 5% of the time by chance alone.

COMMON MISCONCEPTIONS TO ADDRESS:
- p = .05 does NOT mean there's a 5% chance the finding is wrong. It means if nothing real were happening, you'd see results this extreme 5% of the time.
- p < .05 does NOT mean the effect is large or important. A tiny effect can be significant with a large enough sample.
- p > .05 does NOT mean there's no effect. The study might have lacked power to detect it.

---

CONCEPT 2: STATISTICAL POWER

Definition: The probability that your study will detect a real effect if one actually exists.

THE RIGGED COIN EXAMPLE (USE THIS EXACT ANALOGY):

Suppose the coin really is rigged to land on heads 70% of the time (not the fair 50%).

With only 5 flips: You might easily get 3 heads and 2 tails—which looks pretty normal for a fair coin. You'd miss the rigging entirely. Your study "failed" not because the coin wasn't rigged, but because you didn't collect enough data to see it.

With 100 flips: You'd likely get around 70 heads, which is clearly not the 50 you'd expect from a fair coin. The rigging becomes obvious.

More flips (larger sample size) give you more power to detect that the coin is rigged.

THE 80% CONVENTION:
Studies should have at least 80% power—if the effect is real, you'll detect it 8 times out of 10.

Low power means you might walk right past a real finding and conclude "nothing here" when something actually was there. This is a Type II error (false negative).

POWER IN GREENWELL & WALSH:
With n = 317, the study had solid power to detect moderate relationships between training and EBP use.

THE POWER-SIGNIFICANCE CONNECTION:
- High power + significant p-value = Confident the effect is real
- High power + non-significant p-value = Confident the effect is absent or tiny
- Low power + significant p-value = Effect likely real (caught it despite low power)
- Low power + non-significant p-value = Inconclusive (might have missed a real effect)

---

CONCEPT 3: SAMPLE SIZE (n)

Definition: The number of participants in a study.

THE SPOONFUL ANALOGY (USE THIS EXACT ANALOGY):

Tasting one spoonful vs. the whole pot: Larger samples give you a better sense of the true flavor.

WHY SAMPLE SIZE MATTERS:
If you ask 5 clinicians and 2 say yes, that's 40%. But pick 5 different clinicians:
- 0 saying yes = 0%
- 1 saying yes = 20%
- 3 saying yes = 60%
- 4 saying yes = 80%

With only 5 people, your answer swings wildly depending on who you happened to ask. This is sampling error.

If you ask 317 clinicians (like Greenwell & Walsh), random variation averages out. Your percentage becomes much more stable and trustworthy.

SAMPLE SIZE RULES OF THUMB:
- n < 30: Very small, results are unstable
- n = 30-100: Small, interpret with caution
- n = 100-300: Moderate, reasonably reliable
- n = 300-1,000: Good, solid foundation
- n > 1,000: Large, high precision

The study's n = 317 falls in the "good" range.

COMMON MISCONCEPTION:
"They only surveyed 317 out of hundreds of thousands of SLPs—that's not enough!"

Actually, sample size matters more than the fraction of the population sampled. A well-selected sample of 317 can accurately represent a population of 300,000.

---

CONCEPT 4: VARIANCE EXPLAINED

Definition: How much of the outcome your predictors actually account for.

THE WEATHER AND MOOD ANALOGY (USE THIS EXACT ANALOGY):

If weather explains 17% of your mood, that's real—sunny days genuinely affect how you feel. But 83% of your mood is something else: sleep quality, work stress, relationships, coffee intake, and countless other factors.

WHAT THE STUDY FOUND:
Greenwell & Walsh found that graduate training, career training, and perceived barriers together explained about 17% of the variance in EBP use.

This means: These three factors account for 17% of why some clinicians use EBP more than others. The remaining 83% is explained by factors not measured.

IS 17% GOOD OR BAD?
It's typical for behavioral research:
- Physics: might explain 99%+ (dropping a ball follows predictable laws)
- Medicine: a drug might explain 20-40% of variance
- Psychology/behavioral research: 10-30% is common and meaningful
- Complex social phenomena: even 5-10% can be important

The remaining 83% could include: personality traits, workplace policies, client populations, mentorship quality, access to technology, etc.

KEY INSIGHT:
A finding can be statistically significant (unlikely to be chance) but still explain only a small slice of the picture. Both pieces matter:
- Significance tells you the relationship is real
- Variance explained tells you how much it matters

---

CONCEPT 5: CORRELATION VS. CAUSATION

Definition: When two things are related (correlated), it doesn't necessarily mean one causes the other.

THE THREE EXPLANATIONS (USE THIS EXACT FRAMEWORK):

Greenwell & Walsh found that training predicts EBP use. But can we say training CAUSES better EBP use?

Explanation 1: Training causes EBP use
Learning EBP skills in training leads clinicians to apply them in practice.

Explanation 2: Motivation causes both
Clinicians already enthusiastic about research:
- Seek out more EBP training (because they're interested)
- Use more EBP in practice (because they're motivated)
Training and EBP use are related, but motivation is causing both.

Explanation 3: Workplace culture causes both
Supportive employers:
- Provide more training opportunities
- Create environments where EBP is expected
Again, training and EBP use correlate, but workplace is the real cause.

WHY WE CAN'T DETERMINE CAUSATION:
This study used surveys at a single point in time (cross-sectional design). To prove causation, you would need:
1. Randomly assign clinicians to receive training or not
2. Measure EBP use before and after
3. Compare the training group to the control group

LANGUAGE TO WATCH FOR:
- "Training predicts EBP use" — Correct (describes correlation)
- "Training is associated with EBP use" — Correct (describes correlation)
- "Training causes EBP use" — INCORRECT for survey data
- "Training improves EBP use" — INCORRECT for survey data

CLASSIC EXAMPLES:
- Ice cream and drowning: Both increase in summer (heat causes both)
- Shoe size and reading: Both increase with age (age causes both)
- Hospital visits and death: Serious illness causes both

---

CONCEPT 6: CONFIDENCE INTERVAL

Definition: A range that tells you where the true value likely falls, given uncertainty in your sample.

THE DART THROW ANALOGY (USE THIS EXACT ANALOGY):

Think of it like throwing darts at a target:
- Your single survey result (54%) is one dart throw
- The confidence interval is the circle around it showing where your dart could reasonably have landed
- The bullseye (true population value) is somewhere in that circle—probably

Larger sample sizes make this circle smaller—more precision.
Smaller sample sizes mean wider intervals—more uncertainty.

EXAMPLE:
Greenwell & Walsh found 54% of SLPs cited time as a barrier to EBP. A 95% confidence interval might be 49% to 59%. This means: "We're 95% confident the true percentage for ALL SLPs falls somewhere in this range."

INTERPRETING WIDTH:
- Narrow interval (52% to 56%): High precision, usually from large samples
- Wide interval (40% to 68%): Low precision, usually from small samples

OVERLAPPING INTERVALS:
- Non-overlapping intervals: Groups likely truly different
- Overlapping intervals: Can't be confident groups are truly different

---

CONCEPT 7: REGRESSION (MULTIPLE REGRESSION)

Definition: A statistical method for measuring how much several factors together predict an outcome.

THE EXAM SCORE ANALOGY (USE THIS EXACT ANALOGY):

Imagine predicting a student's exam score. Several factors play a role:
- Hours spent studying
- Hours of sleep the night before
- Prior grades in the course

These factors are correlated (students with good prior grades might study more). Regression lets you say:

"Each additional hour of studying predicts 3 more points on the exam, even after accounting for differences in sleep and prior grades."

This isolates studying's unique effect, separate from other factors.

WHAT THE STUDY FOUND:
Greenwell & Walsh regression found three significant predictors of EBP use:
1. Graduate/CF training in EBP
2. Career training in EBP
3. Perceived barriers (inverse—more barriers, less EBP use)

Together, these explained about 17% of the variance.

INTERPRETING "SIGNIFICANT PREDICTORS":
- The factor has a relationship with the outcome
- The relationship persists after controlling for other factors
- The relationship is unlikely due to chance (p < .05)

Factors that are NOT significant (like years of experience) may still matter—the study just didn't find strong enough evidence.

LIMITATION:
Regression shows prediction, not causation.

---

CONCEPT 8: STANDARD DEVIATION

Definition: A measure of how spread out the data is from the average.

THE TWO CLASSROOMS ANALOGY (USE THIS EXACT ANALOGY):

Two classrooms both have an average test score of 75%.

Classroom A: Scores are 70, 72, 74, 75, 76, 78, 80
- Small standard deviation
- Consistent performance
- Everyone doing similarly

Classroom B: Scores are 40, 55, 70, 75, 80, 95, 100
- Large standard deviation
- Huge variation
- Some struggling, others excelling

The average alone (75%) doesn't tell you which classroom you're looking at. Standard deviation reveals whether the group is homogeneous or diverse.

WHY THIS MATTERS:
If SD is small: Strong consensus—most clinicians scored similarly
If SD is large: Scores ranged widely—the "average" masks dramatic differences

HIGH VARIABILITY might suggest subgroups:
- School-based vs. hospital-based SLPs
- New vs. experienced clinicians
- PhD vs. master's training

THE RULE OF THUMB:
For normally distributed data:
- ~68% of values fall within 1 SD of the mean
- ~95% of values fall within 2 SDs of the mean
- ~99.7% of values fall within 3 SDs of the mean

---

PUTTING IT ALL TOGETHER: READING GREENWELL & WALSH CRITICALLY

Sample: n = 317 is adequate but self-selected. Findings may over-represent engaged, experienced professionals.

Significance: Found significant predictors at p < .05. Relationships unlikely due to chance.

Effect Size: Model explained 17% of variance—meaningful but modest. Most of what determines EBP use remains unexplained.

Causation: This is survey data. Training "predicts" EBP use, not "causes" it. Alternative explanations remain possible.

Confidence: With n = 317, percentages have moderate precision. True values for all SLPs might differ by several percentage points.

Variability: High standard deviations suggest the "average SLP" may not represent distinct subgroups.

---

QUESTIONS TO ASK WHEN READING ANY STUDY:
1. What's the sample size? Large enough to trust?
2. How was the sample selected? Representative or biased?
3. What's the p-value? Statistically significant?
4. What's the effect size? Meaningful magnitude?
5. What's the study design? Can support causal claims, or only correlations?
6. What's the confidence interval? How precise is the estimate?
7. What's the standard deviation? Important variability being masked?
8. What factors weren't measured? What might explain the unexplained variance?

---

HOW TO USE THIS PRIMER IN CONVERSATIONS:

1. Build explanations step-by-step without assuming prior knowledge
2. Use the EXACT analogies above for consistency with lecture materials
3. Connect concepts back to the Greenwell & Walsh study when relevant
4. Address common misconceptions explicitly
5. After explaining, ask students to apply the concept: "So in the Greenwell & Walsh study, what does p < .05 tell us about the training-EBP relationship?"
6. Encourage students to apply these concepts when critically evaluating research claims
`;

// Export statistical question detection patterns
export const STATISTICAL_QUESTION_PATTERNS = [
  /independent\s+variable/i,
  /dependent\s+variable/i,
  /\biv\b/i,
  /\bdv\b/i,
  /what('s|\s+is)\s+(the\s+)?(iv|dv)/i,
  /p[\s-]?value/i,
  /p\s*[<>=]\s*\.?\d/i,
  /statistical(ly)?\s+significan/i,
  /sample\s+size/i,
  /variance\s+explained/i,
  /correlation\s+(vs?\.?|versus)\s+causation/i,
  /confidence\s+interval/i,
  /regression/i,
  /standard\s+deviation/i,
  /what\s+does\s+\d+%\s+(of\s+)?variance/i,
  /can\s+we\s+say.*causes?/i,
  /does?\s+(training|this)\s+cause/i,
  /what\s+does\s+predict(s|ing)?\s+mean/i,
  /is\s+\d+\s+(a\s+)?good\s+sample/i,
  /how\s+(do|should)\s+(i|we)\s+interpret/i,
  /type\s+(i|ii|1|2)\s+error/i,
  /false\s+(positive|negative)/i,
  /effect\s+size/i,
  /r[\s-]?squared/i,
];

// Function to check if a message contains statistical questions
export function containsStatisticalQuestion(message: string): boolean {
  return STATISTICAL_QUESTION_PATTERNS.some(pattern => pattern.test(message));
}
