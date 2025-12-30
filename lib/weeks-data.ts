export const acts = [
  { number: "I", title: "Why Measurement Matters" },
  { number: "II", title: "How Hearing Works—and Fails" },
  { number: "III", title: "How Voice Is Produced" },
  { number: "IV", title: "How Articulation Shapes the Signal" },
  { number: "V", title: "Resonance and the Full Vocal Tract" },
  { number: "VI", title: "From Science to Practice" },
]

export interface WeekData {
  week: number
  topic: string
  act: string
  article: {
    title: string
    author: string
    notebookLMLink?: string
  }
}

export const weeksData: WeekData[] = [
  // Act I
  {
    week: 1,
    topic: "Evidence vs. Opinion",
    act: "I",
    article: {
      title: "Evidence-Based Practice in Speech-Language Pathology",
      author: "Greenwell",
      notebookLMLink: "https://notebooklm.google.com/notebook/9f12f740-3844-4c4c-86a8-a9b12c477d5a",
    },
  },
  {
    week: 2,
    topic: "Intensity Confounds",
    act: "I",
    article: {
      title: "Acoustic Perturbation Measures Improve with Increasing Vocal Intensity",
      author: "Brockmann-Bauser",
      notebookLMLink: "https://notebooklm.google.com/notebook/c5c06257-0e69-45d7-a102-d829d1f9647b",
    },
  },
  {
    week: 3,
    topic: "Environmental Confounds",
    act: "I",
    article: {
      title: "Sensitivity of Acoustic Voice Quality Measures in Simulated Reverberation",
      author: "Yousef",
      notebookLMLink: "https://notebooklm.google.com/notebook/6fc47ca1-0134-4a3a-a751-81c6b520feff",
    },
  },
  {
    week: 4,
    topic: "Tool Confounds",
    act: "I",
    article: {
      title: "Quantitative and Descriptive Comparison of Four Acoustic Analysis Systems",
      author: "Burris",
      notebookLMLink: "https://notebooklm.google.com/notebook/ad2b1c00-e15d-411a-9930-d75141a1ccfb",
    },
  },
  // Act II
  {
    week: 5,
    topic: "Auditory System & Speech-in-Noise",
    act: "II",
    article: {
      title: "Predictors of Susceptibility to Noise and Speech Masking",
      author: "Lalonde",
      notebookLMLink: "https://notebooklm.google.com/notebook/edf1d395-8ff8-47c5-9e1a-a19db25ba5ac",
    },
  },
  {
    week: 6,
    topic: "Context Effects",
    act: "II",
    article: {
      title: "Effect of Contextual Information on Speech-in-Noise Perception",
      author: "Roushan",
      notebookLMLink: "https://notebooklm.google.com/notebook/f3cac4dc-52a6-465c-af89-3db54c659759",
    },
  },
  {
    week: 7,
    topic: "Challenging Received Wisdom",
    act: "II",
    article: {
      title: "The Myth of Categorical Perception",
      author: "McMurray",
      notebookLMLink: "https://notebooklm.google.com/notebook/50dceb54-5b42-4766-9f6a-6c0b4ae5d5d4",
    },
  },
  // Act III
  {
    week: 8,
    topic: "Phonation I: Measurement Validity",
    act: "III",
    article: {
      title: "Acoustic Measurement of Overall Voice Quality: A Meta-Analysis",
      author: "Maryn",
      notebookLMLink: "https://notebooklm.google.com/notebook/429a9940-d212-46db-9a80-b95c2b8dcdcf",
    },
  },
  {
    week: 9,
    topic: "Phonation II: Source-Filter & Motor Control",
    act: "III",
    article: {
      title: "Meta-Analysis on the Validity of the Acoustic Voice Quality Index",
      author: "Batthyany",
      notebookLMLink: "https://notebooklm.google.com/notebook/c1979f7d-5d31-4db8-8cff-7ab835c10b0b",
    },
  },
  // Act IV
  {
    week: 10,
    topic: "Vowels & Dialectal Variation",
    act: "IV",
    article: {
      title: "What Acoustic Studies Tell Us About Vowels in Developing and Disordered Speech",
      author: "Kent",
      notebookLMLink: "https://notebooklm.google.com/notebook/ba082bbe-270a-4975-bf45-c6233424f6fb",
    },
  },
  {
    week: 11,
    topic: "Consonants & VOT",
    act: "IV",
    article: {
      title: "Production Benefits of Childhood Overhearing",
      author: "Knightly",
      notebookLMLink: "https://notebooklm.google.com/notebook/5df087ac-83a0-4172-bd00-df28a8885fa9",
    },
  },
  {
    week: 12,
    topic: "Coarticulation & Prosody",
    act: "IV",
    article: {
      title: "Consistency in Phonetic Categorization Predicts Speech-in-Noise Perception",
      author: "Rizzi",
      notebookLMLink: "https://notebooklm.google.com/notebook/4b4c1a43-08fc-456d-ae93-05b4c643020f",
    },
  },
  // Act V
  {
    week: 13,
    topic: "Resonance & Nasal Coupling",
    act: "V",
    article: {
      title: "The Impact of Nasalance on Cepstral Peak Prominence and HNR",
      author: "Madill",
      notebookLMLink: "https://notebooklm.google.com/notebook/dc093f57-06d2-4420-a9c5-5064e7f7ef90",
    },
  },
  // Act VI
  {
    week: 14,
    topic: "Instrumentation & Workflow",
    act: "VI",
    article: {
      title: "Conducting High-Quality and Reliable Acoustic Analysis",
      author: "Murray",
      notebookLMLink: "https://notebooklm.google.com/notebook/e0211310-4d37-4f1a-a41a-e2140f591e90",
    },
  },
  {
    week: 15,
    topic: "Integration & ASHA Standards",
    act: "VI",
    article: {
      title: "2020 Standards for the Certificate of Clinical Competence in SLP",
      author: "ASHA/CFCC",
      notebookLMLink: "https://notebooklm.google.com/notebook/abd253c5-0757-4c97-83b9-6f257e6b9501",
    },
  },
]
