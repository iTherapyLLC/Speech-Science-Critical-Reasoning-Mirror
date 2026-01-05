export const acts = [
  {
    number: "I",
    title: "Measurement & Evidence",
    description: "Before we trust data, we learn how data misleads.",
    weeks: "1-4",
  },
  {
    number: "II",
    title: "Hearing & Perception Under Noise",
    description: "The signal is never clean.",
    weeks: "5-7",
  },
  {
    number: "III",
    title: "Voice as a Measured System",
    description: "What does 'voice quality' actually mean?",
    weeks: "8-9",
  },
  {
    number: "IV",
    title: "Articulation & Timing",
    description: "Speech is dynamic, not static.",
    weeks: "10-12",
  },
  {
    number: "V",
    title: "Resonance & Filter Interactions",
    description: "The filter changes the source.",
    weeks: "13",
  },
  {
    number: "VI",
    title: "Integration & Professional Practice",
    description: "Connecting science to clinical responsibility.",
    weeks: "14-15",
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
  article: {
    title: string
    author: string
    notebookLMLink?: string
  }
}

export const weeksData: WeekData[] = [
  // Act I: Measurement & Evidence
  {
    week: 1,
    topic: "Evidence vs. Opinion",
    teaser: "What counts as evidence?",
    act: "I",
    article: {
      title: "Evidence-Based Practice in Speech-Language Pathology",
      author: "Greenwell",
      notebookLMLink: "https://notebooklm.google.com/notebook/9f12f740-3844-4c4c-86a8-a9b12c477d5a",
    },
  },
  {
    week: 2,
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
    week: 3,
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
    week: 4,
    topic: "Software Comparability",
    teaser: "Tools disagree with each other",
    act: "I",
    article: {
      title: "Quantitative and Descriptive Comparison of Four Acoustic Analysis Systems",
      author: "Burris",
      notebookLMLink: "https://notebooklm.google.com/notebook/ad2b1c00-e15d-411a-9930-d75141a1ccfb",
    },
  },
  // Act II: Hearing & Perception Under Noise
  {
    week: 5,
    topic: "Noise vs. Speech Masking",
    teaser: "Different noise, different interference",
    act: "II",
    article: {
      title: "Predictors of Susceptibility to Noise and Speech Masking",
      author: "Lalonde",
      notebookLMLink: "https://notebooklm.google.com/notebook/edf1d395-8ff8-47c5-9e1a-a19db25ba5ac",
    },
  },
  {
    week: 6,
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
    week: 7,
    topic: "Categorical Perception Revisited",
    teaser: "Boundaries are gradients, not walls",
    act: "II",
    article: {
      title: "The Myth of Categorical Perception",
      author: "McMurray",
      notebookLMLink: "https://notebooklm.google.com/notebook/50dceb54-5b42-4766-9f6a-6c0b4ae5d5d4",
    },
  },
  // Act III: Voice as a Measured System
  {
    week: 8,
    topic: "Acoustic Voice Quality Meta-analysis",
    teaser: "What predicts perceived quality?",
    act: "III",
    article: {
      title: "Acoustic Measurement of Overall Voice Quality: A Meta-Analysis",
      author: "Maryn",
      notebookLMLink: "https://notebooklm.google.com/notebook/429a9940-d212-46db-9a80-b95c2b8dcdcf",
    },
  },
  {
    week: 9,
    topic: "AVQI Validity",
    teaser: "Can one index capture voice?",
    act: "III",
    article: {
      title: "Meta-Analysis on the Validity of the Acoustic Voice Quality Index",
      author: "Barsties",
      notebookLMLink: "https://notebooklm.google.com/notebook/c1979f7d-5d31-4db8-8cff-7ab835c10b0b",
    },
  },
  // Act IV: Articulation & Timing
  {
    week: 10,
    topic: "Vowels in Developing & Disordered Speech",
    teaser: "Formants as clinical markers",
    act: "IV",
    article: {
      title: "What Acoustic Studies Tell Us About Vowels in Developing and Disordered Speech",
      author: "Kent",
      notebookLMLink: "https://notebooklm.google.com/notebook/ba082bbe-270a-4975-bf45-c6233424f6fb",
    },
  },
  {
    week: 11,
    topic: "VOT & Phonetic Timing",
    teaser: "Milliseconds matter",
    act: "IV",
    article: {
      title: "Production Benefits of Childhood Overhearing",
      author: "Knightly",
      notebookLMLink: "https://notebooklm.google.com/notebook/5df087ac-83a0-4172-bd00-df28a8885fa9",
    },
  },
  {
    week: 12,
    topic: "Categorization Consistency",
    teaser: "How reliably do we classify speech sounds?",
    act: "IV",
    article: {
      title: "Consistency in Phonetic Categorization Predicts Speech-in-Noise Perception",
      author: "Rizzi",
      notebookLMLink: "https://notebooklm.google.com/notebook/4b4c1a43-08fc-456d-ae93-05b4c643020f",
    },
  },
  // Act V: Resonance & Filter Interactions
  {
    week: 13,
    topic: "Nasalance Effects on CPP",
    teaser: "When resonance affects phonation measures",
    act: "V",
    article: {
      title: "The Impact of Nasalance on Cepstral Peak Prominence and HNR",
      author: "Madill",
      notebookLMLink: "https://notebooklm.google.com/notebook/dc093f57-06d2-4420-a9c5-5064e7f7ef90",
    },
  },
  // Act VI: Integration & Professional Practice
  {
    week: 14,
    topic: "High-Quality Acoustic Analysis",
    teaser: "Best practices for clinical measurement",
    act: "VI",
    article: {
      title: "Conducting High-Quality and Reliable Acoustic Analysis",
      author: "Murray",
      notebookLMLink: "https://notebooklm.google.com/notebook/e0211310-4d37-4f1a-a41a-e2140f591e90",
    },
  },
  {
    week: 15,
    topic: "ASHA 2020 Certification Standards",
    teaser: "What the profession expects of you",
    act: "VI",
    article: {
      title: "2020 Standards for the Certificate of Clinical Competence in SLP",
      author: "ASHA/CFCC",
      notebookLMLink: "https://notebooklm.google.com/notebook/abd253c5-0757-4c97-83b9-6f257e6b9501",
    },
  },
]
