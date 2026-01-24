/**
 * SLHS 303 Article Knowledge Base
 *
 * This file contains the ground truth for each week's article.
 * Used by the grading system to:
 * 1. Validate student claims against actual findings
 * 2. Check if limitations mentioned are from the correct article
 * 3. Flag submissions that don't match the assigned article
 * 4. Provide reference for good Socratic questions
 */

export interface ArticleKnowledge {
  week: number;
  title: string;
  author: string;
  researchQuestion: string;
  sampleAndMethod: string[];
  keyFindings: string[];
  confoundsAndLimitations: string[];
  commonMisconceptions: string[];
  clinicalConnection: string;
  courseThroughline: string;
  socraticQuestions: string[];
}

export const ARTICLE_KNOWLEDGE_BASE: Record<number, ArticleKnowledge> = {
  2: {
    week: 2,
    title: "Evidence-Based Practice in Speech-Language Pathology: Where Are We Now?",
    author: "Greenwell",
    researchQuestion: "How do speech-language pathologists currently understand, use, and experience barriers to evidence-based practice (EBP), and what predicts actual EBP use?",
    sampleAndMethod: [
      "317 practicing SLPs",
      "Online questionnaire assessing EBP knowledge and attitudes",
      "Frequency of EBP use",
      "Training exposure (graduate school, CF, career)",
      "Perceived barriers",
      "Multiple linear regression analyses",
    ],
    keyFindings: [
      "Greater EBP exposure in graduate school and CF predicted higher EBP use",
      "Time constraints were the most frequently cited barrier",
      "SLPs who perceived time as a barrier also endorsed more total barriers",
      "Career-long EBP training reduced perception of time as a barrier",
    ],
    confoundsAndLimitations: [
      "Self-report data (belief ≠ behavior)",
      "Sample skewed toward motivated respondents",
      "No objective measure of 'quality' of EBP decisions",
    ],
    commonMisconceptions: [
      "EBP means just following research papers",
      "Clinical experience conflicts with EBP",
      "Barriers mean EBP is unrealistic",
    ],
    clinicalConnection: "EBP is not a knowledge problem—it is a systems and workflow problem. Measurement literacy matters only if clinicians can realistically apply it.",
    courseThroughline: "Act I (Measurement): Evidence quality is meaningless without usable measurement systems and constraints awareness.",
    socraticQuestions: [
      "How does self-report limit conclusions about actual EBP use?",
      "Is 'lack of time' a measurement problem, a system problem, or both?",
      "What counts as evidence when research is incomplete?",
      "How might measurement quality affect EBP confidence?",
      "Can EBP fail even when evidence is strong?",
    ],
  },

  3: {
    week: 3,
    title: "Acoustic Perturbation Measures Improve with Increasing Vocal Intensity",
    author: "Brockmann-Bauser",
    researchQuestion: "How does vocal intensity (SPL) affect jitter, shimmer, and HNR in typical and disordered voices?",
    sampleAndMethod: [
      "58 female voice patients, 58 matched controls",
      "Sustained /a/ at soft, comfortable, loud",
      "Acoustic measures via Praat",
      "Linear mixed models",
    ],
    keyFindings: [
      "Increasing SPL → lower jitter & shimmer, higher HNR (p < .001)",
      "Voice pathology did not reliably elevate jitter/shimmer",
      "Professional voice use significantly affected measures",
    ],
    confoundsAndLimitations: [
      "Sustained vowels only",
      "SPL often uncontrolled in clinics",
      "Pathology masked by loudness effects",
    ],
    commonMisconceptions: [
      "Jitter and shimmer directly reflect pathology",
      "Acoustic measures are objective by default",
    ],
    clinicalConnection: "Uncontrolled loudness can fake improvement or hide disorder.",
    courseThroughline: "Source–Filter Theory: Source measures are altered by behavioral changes, not just physiology.",
    socraticQuestions: [
      "Why does loudness systematically improve perturbation measures?",
      "What happens if pathology changes loudness?",
      "Can a 'better' number be misleading?",
      "How should SPL be controlled clinically?",
      "What does this say about objectivity?",
    ],
  },

  4: {
    week: 4,
    title: "Sensitivity of Acoustic Voice Quality Measures in Simulated Reverberation",
    author: "Pääkkönen / Yousef",
    researchQuestion: "Which acoustic voice measures remain stable under increasing reverberation?",
    sampleAndMethod: [
      "5 healthy female speakers",
      "Sustained vowels convolved with 8 reverberation levels (T20 = 0–1.82s)",
      "Measures: jitter, shimmer, HNR, CPPs",
    ],
    keyFindings: [
      "CPPs stable across all reverberation",
      "Shimmer highly sensitive at mild reverberation",
      "Jitter & HNR stable only below ~1s T20",
    ],
    confoundsAndLimitations: [
      "Small sample",
      "Simulated reverberation",
      "Sustained vowels only",
    ],
    commonMisconceptions: [
      "Room acoustics don't matter",
      "All acoustic measures behave similarly",
    ],
    clinicalConnection: "Environment can distort signal without changing the voice.",
    courseThroughline: "Measurement ≠ physiology. Filters include rooms, not just vocal tracts.",
    socraticQuestions: [
      "Why is CPP more robust than shimmer?",
      "What counts as 'acceptable' recording conditions?",
      "How could reverberation mimic pathology?",
      "Should clinics standardize rooms?",
      "What is being measured—voice or environment?",
    ],
  },

  5: {
    week: 5,
    title: "Quantitative and Descriptive Comparison of Four Acoustic Analysis Systems",
    author: "Lebacq / Burris",
    researchQuestion: "How comparable and accurate are different acoustic analysis software systems?",
    sampleAndMethod: [
      "Synthesized + natural vowels",
      "Software: Praat, Wavesurfer, TF32, CSL",
      "Compared F0, F1–F4, bandwidths",
    ],
    keyFindings: [
      "F0 and F1–F4 generally comparable for adult males",
      "Large errors for children and females",
      "Bandwidth measures highly unreliable",
    ],
    confoundsAndLimitations: [
      "Default settings varied",
      "'Black box' algorithms",
      "No clinical outcome testing",
    ],
    commonMisconceptions: [
      "Software differences are trivial",
      "Defaults are safe",
    ],
    clinicalConnection: "Software choice can change diagnostic conclusions.",
    courseThroughline: "Act I: Measurement tools shape findings.",
    socraticQuestions: [
      "Should results be comparable across software?",
      "What does 'accuracy' mean here?",
      "How do defaults encode assumptions?",
      "When is comparison invalid?",
      "Should clinics standardize tools?",
    ],
  },

  6: {
    week: 6,
    title: "Predictors of Susceptibility to Noise and Speech Masking",
    author: "Lalonde & Werner",
    researchQuestion: "What predicts children's speech recognition in noise across masker types and hearing status?",
    sampleAndMethod: [
      "31 CNH, 41 CHL, ages 6.7–13",
      "Maskers: SSN vs two-talker speech",
      "Cognitive + linguistic predictors",
    ],
    keyFindings: [
      "TTS harder than SSN for all children",
      "Vocabulary predicted performance in both groups",
      "Attention predicted TTS only in CNH",
      "Audibility predicted TTS in CHL",
    ],
    confoundsAndLimitations: [
      "Cross-sectional",
      "Hearing aid variability",
      "No neural measures",
    ],
    commonMisconceptions: [
      "Speech-in-noise is purely auditory",
      "Age alone explains improvement",
    ],
    clinicalConnection: "Different mechanisms underlie energetic vs informational masking.",
    courseThroughline: "Source–Filter + Cognition: Filters include attention and language.",
    socraticQuestions: [
      "Why does TTS rely more on cognition?",
      "Why do predictors differ by hearing group?",
      "Is audibility enough?",
      "How should intervention differ?",
      "What does 'noise' really mean?",
    ],
  },

  7: {
    week: 7,
    title: "Effect of Contextual Information on Speech-in-Noise",
    author: "Roushan",
    researchQuestion: "How does linguistic context affect speech-in-noise perception across age?",
    sampleAndMethod: [
      "20 studies, 840 participants",
      "Meta-analysis comparing high vs low context sentences",
    ],
    keyFindings: [
      "Context improves SIN for all listeners",
      "Older adults benefit more at moderate SNRs",
      "Large heterogeneity across studies",
    ],
    confoundsAndLimitations: [
      "Variable sentence materials",
      "Context definitions differ",
      "High heterogeneity at low/high SNRs",
    ],
    commonMisconceptions: [
      "Context compensates fully for hearing loss",
      "Older adults always struggle more",
    ],
    clinicalConnection: "Top-down strategies matter most when bottom-up input is degraded but usable.",
    courseThroughline: "Act II (Hearing): Perception emerges from signal + expectation.",
    socraticQuestions: [
      "Why is context most helpful at moderate SNRs?",
      "When does context fail?",
      "Is context auditory or cognitive?",
      "How should SIN tests include context?",
      "What does heterogeneity imply?",
    ],
  },

  8: {
    week: 8,
    title: "The Myth of Categorical Perception",
    author: "McMurray (CP Critique Synthesis)",
    researchQuestion: "Is categorical perception a valid account of speech perception?",
    sampleAndMethod: [
      "Narrative review of 50+ years of behavioral and neural evidence",
    ],
    keyFindings: [
      "CP effects largely task-induced",
      "Perception is continuous, not categorical",
      "Listeners retain fine-grained detail",
    ],
    confoundsAndLimitations: [
      "Focus on lab paradigms",
      "Less coverage of clinical populations",
    ],
    commonMisconceptions: [
      "Categorical perception is how speech works",
      "Sharp boundaries = better perception",
    ],
    clinicalConnection: "Rigid categorization may harm speech-in-noise performance.",
    courseThroughline: "Act II: Flexibility > discreteness.",
    socraticQuestions: [
      "Why did CP persist despite evidence?",
      "What tasks create CP illusions?",
      "How does gradience help perception?",
      "Should therapy aim for sharp categories?",
      "What does this mean for diagnostics?",
    ],
  },

  9: {
    week: 9,
    title: "Acoustic Measurement of Overall Voice Quality",
    author: "Maryn",
    researchQuestion: "Which acoustic measures best correlate with perceptual voice quality?",
    sampleAndMethod: [
      "25 studies, meta-analysis",
      "Correlation of acoustic measures with perceptual ratings",
    ],
    keyFindings: [
      "Only a few measures reached r ≥ .60",
      "Many common measures lacked validity",
      "Continuous speech measures performed better",
    ],
    confoundsAndLimitations: [
      "Perceptual ratings vary by listener",
      "Heterogeneous protocols",
    ],
    commonMisconceptions: [
      "More measures = better diagnosis",
      "High correlation = clinical validity",
    ],
    clinicalConnection: "Not all numbers are meaningful.",
    courseThroughline: "Measurement validity ≠ convenience.",
    socraticQuestions: [
      "Why do many measures fail?",
      "What limits perceptual 'gold standards'?",
      "Should sustained vowels dominate?",
      "How should clinicians choose metrics?",
      "What does r really tell us?",
    ],
  },

  10: {
    week: 10,
    title: "Meta-Analysis on the Validity of AVQI",
    author: "Barsties et al.",
    researchQuestion: "Is AVQI a valid and clinically useful index of dysphonia?",
    sampleAndMethod: [
      "33 studies",
      "Diagnostic accuracy + concurrent validity meta-analysis",
    ],
    keyFindings: [
      "Sensitivity: 0.83, Specificity: 0.89",
      "AUC: 0.94",
      "Strong correlation with perceptual ratings (r ≈ .84)",
    ],
    confoundsAndLimitations: [
      "Requires standardized recording",
      "Language effects possible",
    ],
    commonMisconceptions: [
      "AVQI replaces perception",
      "Composite indices are foolproof",
    ],
    clinicalConnection: "AVQI is strong—but not context-free.",
    courseThroughline: "Source–Filter integration improves robustness.",
    socraticQuestions: [
      "Why do composites outperform single measures?",
      "What assumptions does AVQI embed?",
      "When might AVQI fail?",
      "How should it be used clinically?",
      "Is perceptual judgment still necessary?",
    ],
  },

  11: {
    week: 11,
    title: "What Acoustic Studies Tell Us About Vowels",
    author: "Kent & Vorperian",
    researchQuestion: "What do acoustic studies reveal about vowel development and disorder?",
    sampleAndMethod: [
      "Narrative review across development and pathology",
    ],
    keyFindings: [
      "Vowels are dynamic, not static",
      "Vowel mastery extends beyond early childhood",
      "Articulation tests poorly capture vowel errors",
    ],
    confoundsAndLimitations: [
      "Heterogeneous methods",
      "Language-specific focus",
    ],
    commonMisconceptions: [
      "Vowels are easy",
      "Static formants are enough",
    ],
    clinicalConnection: "Vowels drive intelligibility.",
    courseThroughline: "Filter dynamics matter.",
    socraticQuestions: [
      "Why are vowels understudied?",
      "How does dynamics challenge testing?",
      "What does 'mastery' mean?",
      "How should vowels be assessed?",
      "How does development complicate norms?",
    ],
  },

  12: {
    week: 12,
    title: "Production Benefits of Childhood Overhearing",
    author: "Knightly",
    researchQuestion: "Does childhood overhearing improve adult L2 pronunciation?",
    sampleAndMethod: [
      "3 groups of adults (n=15 each)",
      "Pronunciation vs morphosyntax measures",
    ],
    keyFindings: [
      "Overhearers showed better pronunciation",
      "No morphosyntax advantage",
      "Effects not explained by prosody",
    ],
    confoundsAndLimitations: [
      "Small samples",
      "Retrospective exposure reports",
    ],
    commonMisconceptions: [
      "Overhearing = bilingualism",
      "Grammar and pronunciation develop together",
    ],
    clinicalConnection: "Early auditory exposure tunes phonetic filters.",
    courseThroughline: "Source representations persist without use.",
    socraticQuestions: [
      "Why pronunciation but not grammar?",
      "What does this imply about sensitive periods?",
      "How is passive exposure encoded?",
      "Does this challenge CP?",
      "Clinical implications for heritage speakers?",
    ],
  },

  13: {
    week: 13,
    title: "Consistency in Phonetic Categorization Predicts SIN",
    author: "Rizzi & Bidelman",
    researchQuestion: "Does categorization consistency predict speech-in-noise perception?",
    sampleAndMethod: [
      "Adult listeners",
      "Vowel continua labeling + SIN tests",
      "Working memory measured",
    ],
    keyFindings: [
      "Consistency predicted SIN better than slope",
      "Working memory also predictive",
      "Categoricity itself was not key",
    ],
    confoundsAndLimitations: [
      "Adult-only",
      "Lab-based stimuli",
    ],
    commonMisconceptions: [
      "Sharper categories = better perception",
    ],
    clinicalConnection: "Stable perception beats rigid categorization.",
    courseThroughline: "Act II: Flexibility + reliability.",
    socraticQuestions: [
      "Why is consistency more important than slope?",
      "What does inconsistency reflect?",
      "How might noise amplify instability?",
      "Clinical implications?",
      "Does this refute CP?",
    ],
  },

  14: {
    week: 14,
    title: "Impact of Nasalance on CPP and HNR",
    author: "Madill",
    researchQuestion: "How does nasalance affect CPP and HNR?",
    sampleAndMethod: [
      "30 healthy females",
      "Vowel → nasalized → nasal",
      "CPP, HNR, intensity measured",
    ],
    keyFindings: [
      "CPP decreased with increasing nasalance",
      "CPP correlated with intensity",
      "HNR largely unaffected",
    ],
    confoundsAndLimitations: [
      "Healthy speakers only",
      "Within-subject design",
    ],
    commonMisconceptions: [
      "CPP purely reflects source",
    ],
    clinicalConnection: "Resonance alters acoustic 'source' metrics.",
    courseThroughline: "Source–Filter interaction is inseparable.",
    socraticQuestions: [
      "Why does nasality affect CPP?",
      "What does CPP actually measure?",
      "How should clinicians interpret CPP?",
      "When might CPP mislead?",
      "Should resonance be controlled?",
    ],
  },

  15: {
    week: 15,
    title: "Conducting High-Quality and Reliable Acoustic Analysis",
    author: "Murray",
    researchQuestion: "How can research assistants be trained to produce reliable acoustic analyses?",
    sampleAndMethod: [
      "Tutorial / best-practice synthesis",
      "Focus on training, monitoring, documentation",
    ],
    keyFindings: [
      "Reliability requires explicit protocols",
      "Recalibration is essential",
      "Documentation enables reproducibility",
    ],
    confoundsAndLimitations: [
      "No empirical testing",
      "Lab-focused",
    ],
    commonMisconceptions: [
      "Acoustic analysis is automatic",
      "Software ensures reliability",
    ],
    clinicalConnection: "Poor measurement training → unreliable data → bad decisions.",
    courseThroughline: "Act I: Measurement is a human process.",
    socraticQuestions: [
      "Where do most acoustic errors arise?",
      "Why is recalibration necessary?",
      "Can automation replace training?",
      "What counts as reproducibility?",
      "How does this mirror clinical practice?",
    ],
  },
};

// ============================================================================
// CLAIM VALIDATION HELPERS
// ============================================================================

/**
 * Check if a student's claim matches any key finding from the article
 * Returns match score: 0 = no match, 1 = partial match, 2 = strong match
 */
export function validateClaim(weekNumber: number, studentClaim: string): {
  score: 0 | 1 | 2;
  matchedFinding: string | null;
  feedback: string;
} {
  const article = ARTICLE_KNOWLEDGE_BASE[weekNumber];
  if (!article) {
    return { score: 0, matchedFinding: null, feedback: "Unknown week number" };
  }

  const claimLower = studentClaim.toLowerCase();

  // Check for strong matches (key terms from findings)
  for (const finding of article.keyFindings) {
    const findingLower = finding.toLowerCase();
    // Extract key terms (words longer than 4 chars, excluding common words)
    const keyTerms = findingLower.split(/\s+/).filter(word =>
      word.length > 4 &&
      !['their', 'which', 'these', 'those', 'about', 'would', 'could', 'should'].includes(word)
    );

    const matchCount = keyTerms.filter(term => claimLower.includes(term)).length;
    const matchRatio = keyTerms.length > 0 ? matchCount / keyTerms.length : 0;

    if (matchRatio >= 0.5) {
      return {
        score: 2,
        matchedFinding: finding,
        feedback: `Strong match with key finding: "${finding}"`,
      };
    }
    if (matchRatio >= 0.25) {
      return {
        score: 1,
        matchedFinding: finding,
        feedback: `Partial match with: "${finding}"`,
      };
    }
  }

  // Check if claim matches a misconception (flag!)
  for (const misconception of article.commonMisconceptions) {
    const miscLower = misconception.toLowerCase();
    const keyTerms = miscLower.split(/\s+/).filter(word => word.length > 4);
    const matchCount = keyTerms.filter(term => claimLower.includes(term)).length;
    if (keyTerms.length > 0 && matchCount / keyTerms.length >= 0.5) {
      return {
        score: 0,
        matchedFinding: null,
        feedback: `⚠️ Claim matches common misconception: "${misconception}"`,
      };
    }
  }

  return {
    score: 0,
    matchedFinding: null,
    feedback: "Claim doesn't clearly match article findings. May need review.",
  };
}

/**
 * Check if a student's limitation matches the article's confounds/limitations
 */
export function validateLimitation(weekNumber: number, studentLimitation: string): {
  score: 0 | 1 | 2;
  matchedLimitation: string | null;
  feedback: string;
} {
  const article = ARTICLE_KNOWLEDGE_BASE[weekNumber];
  if (!article) {
    return { score: 0, matchedLimitation: null, feedback: "Unknown week number" };
  }

  const limitLower = studentLimitation.toLowerCase();

  for (const limitation of article.confoundsAndLimitations) {
    const limLower = limitation.toLowerCase();
    const keyTerms = limLower.split(/\s+/).filter(word => word.length > 3);
    const matchCount = keyTerms.filter(term => limitLower.includes(term)).length;
    const matchRatio = keyTerms.length > 0 ? matchCount / keyTerms.length : 0;

    if (matchRatio >= 0.4) {
      return {
        score: 2,
        matchedLimitation: limitation,
        feedback: `Matches article limitation: "${limitation}"`,
      };
    }
    if (matchRatio >= 0.2) {
      return {
        score: 1,
        matchedLimitation: limitation,
        feedback: `Partial match with: "${limitation}"`,
      };
    }
  }

  // Generic limitations are worth partial credit
  const genericLimitations = [
    'sample size', 'small sample', 'self-report', 'selection bias',
    'generalizability', 'correlation', 'causation', 'confound'
  ];

  if (genericLimitations.some(g => limitLower.includes(g))) {
    return {
      score: 1,
      matchedLimitation: null,
      feedback: "Generic limitation mentioned. More specificity to this article would improve score.",
    };
  }

  return {
    score: 0,
    matchedLimitation: null,
    feedback: "Limitation doesn't match article. May be wrong article or didn't engage with content.",
  };
}

/**
 * Detect if submission appears to be about wrong article
 */
export function detectArticleMismatch(weekNumber: number, fullText: string): {
  isMismatch: boolean;
  suspectedWeek: number | null;
  confidence: 'low' | 'medium' | 'high';
  reason: string;
} {
  const correctArticle = ARTICLE_KNOWLEDGE_BASE[weekNumber];
  if (!correctArticle) {
    return { isMismatch: false, suspectedWeek: null, confidence: 'low', reason: "Unknown week" };
  }

  const textLower = fullText.toLowerCase();

  // Check for correct article markers
  const correctMarkers = [
    correctArticle.author.toLowerCase(),
    ...correctArticle.keyFindings.map(f => f.toLowerCase().split(' ').slice(0, 3).join(' ')),
  ];
  const correctMatchCount = correctMarkers.filter(m => textLower.includes(m.split(' ')[0])).length;

  // Check for other article markers
  let bestOtherMatch = { week: 0, count: 0 };
  for (const [weekStr, article] of Object.entries(ARTICLE_KNOWLEDGE_BASE)) {
    const week = parseInt(weekStr);
    if (week === weekNumber) continue;

    const otherMarkers = [
      article.author.toLowerCase(),
      ...article.keyFindings.map(f => f.toLowerCase().split(' ').slice(0, 3).join(' ')),
    ];
    const matchCount = otherMarkers.filter(m => textLower.includes(m.split(' ')[0])).length;

    if (matchCount > bestOtherMatch.count) {
      bestOtherMatch = { week, count: matchCount };
    }
  }

  if (bestOtherMatch.count > correctMatchCount && bestOtherMatch.count >= 2) {
    return {
      isMismatch: true,
      suspectedWeek: bestOtherMatch.week,
      confidence: bestOtherMatch.count >= 3 ? 'high' : 'medium',
      reason: `Content appears to match Week ${bestOtherMatch.week} (${ARTICLE_KNOWLEDGE_BASE[bestOtherMatch.week]?.title}) rather than Week ${weekNumber}`,
    };
  }

  if (correctMatchCount === 0) {
    return {
      isMismatch: true,
      suspectedWeek: null,
      confidence: 'medium',
      reason: "No clear connection to assigned article content",
    };
  }

  return {
    isMismatch: false,
    suspectedWeek: null,
    confidence: 'low',
    reason: "Content appears to match assigned article",
  };
}

/**
 * Get article info for display
 */
export function getArticleInfo(weekNumber: number): ArticleKnowledge | null {
  return ARTICLE_KNOWLEDGE_BASE[weekNumber] || null;
}

/**
 * Get all valid claims for a week (for reference)
 */
export function getValidClaims(weekNumber: number): string[] {
  const article = ARTICLE_KNOWLEDGE_BASE[weekNumber];
  return article?.keyFindings || [];
}

/**
 * Get valid limitations for a week (for reference)
 */
export function getValidLimitations(weekNumber: number): string[] {
  const article = ARTICLE_KNOWLEDGE_BASE[weekNumber];
  return article?.confoundsAndLimitations || [];
}

/**
 * Get Socratic questions for a week (reference for good follow-up questions)
 */
export function getSocraticQuestions(weekNumber: number): string[] {
  const article = ARTICLE_KNOWLEDGE_BASE[weekNumber];
  return article?.socraticQuestions || [];
}
