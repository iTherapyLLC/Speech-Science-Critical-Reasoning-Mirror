export const acts = [
  {
    number: "Foundations",
    title: "Foundations",
    description: "Building vocabulary and frameworks for everything that follows.",
    weeks: "1-2",
    displayLabel: "Foundations",
  },
  {
    number: "I",
    title: "Measurement Confounds",
    description: "Before we trust data, we learn how data can mislead.",
    weeks: "3-5",
    displayLabel: "Act I: Measurement Confounds",
  },
  {
    number: "II",
    title: "Perception Under Noise",
    description: "The signal is never clean.",
    weeks: "6-8",
    displayLabel: "Act II: Perception Under Noise",
  },
  {
    number: "III",
    title: "Voice & Phonation",
    description: "The voice is where the body meets intention.",
    weeks: "9-11",
    displayLabel: "Act III: Voice & Phonation",
  },
  {
    number: "IV",
    title: "Articulation & Motor Control",
    description: "Speech is shaped by what we practice.",
    weeks: "12-14",
    displayLabel: "Act IV: Articulation & Motor Control",
  },
  {
    number: "Finale",
    title: "Course Finale",
    description: "Connecting science to clinical responsibility.",
    weeks: "15",
    displayLabel: "Course Finale",
  },
]

export const courseInfo = {
  centralQuestion: "What has to be true for linguistic communication to be worth the energy?",
  courseCode: "SLHS 303",
  courseName: "Speech Science",
}

export interface WeekData {
  week: number
  topic: string
  teaser: string
  act: string
  article?: {
    title: string
    author: string
    notebookLMLink?: string
  }
  isFoundationWeek?: boolean
}

export const weeksData: WeekData[] = [
  // Foundations (Weeks 1-2)
  {
    week: 1,
    topic: "Foundations & Orientation",
    teaser: "Building vocabulary and frameworks",
    act: "Foundations",
    isFoundationWeek: true,
    // No article - this is the setup week
  },
  {
    week: 2,
    topic: "Evidence-Based Practice",
    teaser: "What counts as evidence?",
    act: "Foundations",
    article: {
      title: "Evidence-Based Practice in Speech-Language Pathology",
      author: "Greenwell & Walsh",
      notebookLMLink: "https://notebooklm.google.com/notebook/9f12f740-3844-4c4c-86a8-a9b12c477d5a",
    },
  },
  // Act I: Measurement Confounds (Weeks 3-5)
  {
    week: 3,
    topic: "Acoustic Perturbation Measures",
    teaser: "Jitter, shimmer, and their confounds",
    act: "I",
    article: {
      title: "Acoustic Perturbation Measures Improve with Increasing Vocal Intensity",
      author: "Brockmann-Bauser",
      notebookLMLink: "https://notebooklm.google.com/notebook/c5c06257-0e69-45d7-a102-d829d1f9647b",
    },
  },
  {
    week: 4,
    topic: "Reverberation & Measurement Stability",
    teaser: "Environment as confound",
    act: "I",
    article: {
      title: "Sensitivity of Acoustic Voice Quality Measures in Simulated Reverberation",
      author: "Yousef",
      notebookLMLink: "https://notebooklm.google.com/notebook/6fc47ca1-0134-4a3a-a751-81c6b520feff",
    },
  },
  {
    week: 5,
    topic: "Software Comparability",
    teaser: "Tools disagree with each other",
    act: "I",
    article: {
      title: "Quantitative and Descriptive Comparison of Four Acoustic Analysis Systems",
      author: "Burris",
      notebookLMLink: "https://notebooklm.google.com/notebook/ad2b1c00-e15d-411a-9930-d75141a1ccfb",
    },
  },
  // Act II: Perception Under Noise (Weeks 6-8)
  {
    week: 6,
    topic: "Noise vs. Speech Masking",
    teaser: "Why do different maskers create different challenges?",
    act: "II",
    article: {
      title: "Predictors of Susceptibility to Noise and Speech Masking",
      author: "Lalonde & Werner",
      notebookLMLink: "https://notebooklm.google.com/notebook/edf1d395-8ff8-47c5-9e1a-a19db25ba5ac",
    },
  },
  {
    week: 7,
    topic: "Context in Speech-in-Noise",
    teaser: "How expectations shape perception",
    act: "II",
    article: {
      title: "Effect of Contextual Information on Speech-in-Noise Perception",
      author: "Roushan",
      notebookLMLink: "https://notebooklm.google.com/notebook/f3cac4dc-52a6-465c-af89-3db54c659759",
    },
  },
  {
    week: 8,
    topic: "Categorical Perception Revisited",
    teaser: "Are phoneme boundaries walls or gradients?",
    act: "II",
    article: {
      title: "Categorical Perception Critique Synthesis",
      author: "CP Critique Synthesis",
      notebookLMLink: "https://notebooklm.google.com/notebook/50dceb54-5b42-4766-9f6a-6c0b4ae5d5d4",
    },
  },
  // Act III: Voice & Phonation (Weeks 9-11)
  {
    week: 9,
    topic: "Acoustic Voice Quality Meta-analysis",
    teaser: "Which acoustic measures predict perceived voice quality?",
    act: "III",
    article: {
      title: "Acoustic Measurement of Overall Voice Quality: A Meta-Analysis",
      author: "Maryn et al.",
      notebookLMLink: "https://notebooklm.google.com/notebook/429a9940-d212-46db-9a80-b95c2b8dcdcf",
    },
    // Note: Midterm Exam due end of this week (March 22, 2026)
  },
  {
    week: 10,
    topic: "AVQI Validity",
    teaser: "Can a composite index capture voice quality?",
    act: "III",
    article: {
      title: "Meta-Analysis on the Validity of the Acoustic Voice Quality Index",
      author: "Barsties et al.",
      notebookLMLink: "https://notebooklm.google.com/notebook/c1979f7d-5d31-4db8-8cff-7ab835c10b0b",
    },
    // Note: Spring Break follows (March 30 - April 3)
  },
  {
    week: 11,
    topic: "Vowels in Developing & Disordered Speech",
    teaser: "Why do vowels matter more than we thought?",
    act: "III",
    article: {
      title: "What Acoustic Studies Tell Us About Vowels in Developing and Disordered Speech",
      author: "Kent & Vorperian",
      notebookLMLink: "https://notebooklm.google.com/notebook/ba082bbe-270a-4975-bf45-c6233424f6fb",
    },
  },
  // Act IV: Articulation & Motor Control (Weeks 12-14)
  {
    week: 12,
    topic: "Production Benefits of Overhearing",
    teaser: "Can passive childhood exposure shape adult pronunciation?",
    act: "IV",
    article: {
      title: "Production Benefits of Childhood Overhearing",
      author: "Knightly et al.",
      notebookLMLink: "https://notebooklm.google.com/notebook/5df087ac-83a0-4172-bd00-df28a8885fa9",
    },
  },
  {
    week: 13,
    topic: "Categorization & Speech-in-Noise",
    teaser: "What predicts success in understanding speech in noise?",
    act: "IV",
    article: {
      title: "Consistency in Phonetic Categorization Predicts Speech-in-Noise Perception",
      author: "Rizzi & Bidelman",
      notebookLMLink: "https://notebooklm.google.com/notebook/4b4c1a43-08fc-456d-ae93-05b4c643020f",
    },
  },
  {
    week: 14,
    topic: "Nasalance Effects on CPP",
    teaser: "Is CPP a pure measure of laryngeal function?",
    act: "IV",
    article: {
      title: "The Impact of Nasalance on Cepstral Peak Prominence and HNR",
      author: "Nasalance Study",
      notebookLMLink: "https://notebooklm.google.com/notebook/dc093f57-06d2-4420-a9c5-5064e7f7ef90",
    },
  },
  // Course Finale (Week 15)
  {
    week: 15,
    topic: "High-Quality Acoustic Analysis",
    teaser: "How do you conduct high-quality acoustic analysis in clinical practice?",
    act: "Finale",
    article: {
      title: "Conducting High-Quality and Reliable Acoustic Analysis",
      author: "Murray et al.",
      notebookLMLink: "https://notebooklm.google.com/notebook/e0211310-4d37-4f1a-a41a-e2140f591e90",
    },
    // Note: Final Exam due May 14, 2026
  },
]
