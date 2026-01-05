// Crisis detection keywords and patterns based on Stanford research
// These patterns detect both explicit and veiled crisis language
// California SB 243 compliance - effective January 1, 2026

export const CRISIS_PATTERNS = {
  explicit: [
    /\b(kill myself|suicide|suicidal|end my life|want to die|rather be dead|better off dead)\b/i,
    /\b(self.?harm|cut myself|cutting myself|hurt myself|hurting myself)\b/i,
    /\b(overdose|take all my pills|swallow pills)\b/i,
    /\b(no reason to live|can't go on|can't take it anymore)\b/i,
    /\b(goodbye forever|final goodbye|this is the end)\b/i,
  ],
  veiled: [
    /\b(won't be a problem (much longer|anymore|soon))\b/i,
    /\b(won't have to worry about me)\b/i,
    /\b(giving away my|who should I leave my)\b/i,
    /\b(no point in anything|nothing matters anymore)\b/i,
    /\b(everyone would be better off without me)\b/i,
    /\b(I've made my decision|made up my mind about everything)\b/i,
    /\b(finally found a way out|found my solution)\b/i,
  ],
  harm_to_others: [
    /\b(kill|murder|shoot|stab|attack)\s+(him|her|them|someone|people|everyone)\b/i,
    /\b(bring a (gun|weapon|knife) to)\b/i,
    /\b(make them pay|they'll regret|revenge)\b/i,
  ],
}

export const CRISIS_RESPONSE = `I need to pause our academic discussion because I'm noticing some concerning themes in what you're sharing. Your safety matters more than any assignment.

**If you're in crisis or having thoughts of suicide:**
- **National Suicide Prevention Lifeline:** Call or text **988** (24/7)
- **Crisis Text Line:** Text **HOME** to **741741**
- **CSUEB Counseling Services:** (510) 885-3690
- **Emergency:** 911

These feelings are real, and you deserve support from people trained to help. Would you like to talk about connecting with one of these resources?

Our conversation about the course material will be here whenever you're ready to return to it.`

export const HARM_RESPONSE = `I need to stop our conversation here. If you or someone else is in immediate danger, please contact:

- **Emergency Services:** 911
- **CSUEB Campus Police:** (510) 885-3791

I'm not able to continue this conversation, but trained professionals are available to help.`

export type CrisisType = "self" | "others" | null

export interface CrisisCheckResult {
  detected: boolean
  type: CrisisType
}

export function detectCrisis(text: string): CrisisCheckResult {
  // Check for harm to others first (highest priority)
  for (const pattern of CRISIS_PATTERNS.harm_to_others) {
    if (pattern.test(text)) {
      return { detected: true, type: "others" }
    }
  }

  // Check explicit self-harm patterns
  for (const pattern of CRISIS_PATTERNS.explicit) {
    if (pattern.test(text)) {
      return { detected: true, type: "self" }
    }
  }

  // Check veiled patterns
  for (const pattern of CRISIS_PATTERNS.veiled) {
    if (pattern.test(text)) {
      return { detected: true, type: "self" }
    }
  }

  return { detected: false, type: null }
}
