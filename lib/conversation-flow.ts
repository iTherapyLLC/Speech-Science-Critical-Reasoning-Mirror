// Types and constants for conversation flow tracking

export interface AreasAddressed {
  articleEngagement: boolean;
  evidenceBasedReasoning: boolean;
  criticalThinking: boolean;
  clinicalConnection: boolean;
  reflection: boolean;
}

export interface ConversationFlowState {
  areasAddressed: AreasAddressed;
  exchangeCount: number;
  guideExpanded: boolean;
}

export interface RubricArea {
  id: keyof AreasAddressed;
  name: string;
  description: string;
  points: string;
  icon: 'BookOpen' | 'Target' | 'Brain' | 'Stethoscope' | 'MessageSquare';
}

export const RUBRIC_AREAS: RubricArea[] = [
  {
    id: 'articleEngagement',
    name: 'Article Engagement',
    description: 'Research question, methods, findings',
    points: '0-2 pts',
    icon: 'BookOpen'
  },
  {
    id: 'evidenceBasedReasoning',
    name: 'Evidence-Based Reasoning',
    description: 'Use specific data to support claims',
    points: '0-2 pts',
    icon: 'Target'
  },
  {
    id: 'criticalThinking',
    name: 'Critical Thinking',
    description: 'Limitations, alternatives, confounds',
    points: '0-2 pts',
    icon: 'Brain'
  },
  {
    id: 'clinicalConnection',
    name: 'Clinical Connection',
    description: 'Real clinical practice applications',
    points: '0-2 pts',
    icon: 'Stethoscope'
  },
  {
    id: 'reflection',
    name: 'Reflection',
    description: 'Awareness of learning or thinking changes',
    points: 'Pass/Fail',
    icon: 'MessageSquare'
  },
];

export const MIN_EXCHANGES = 6;

export function createInitialFlowState(): ConversationFlowState {
  return {
    areasAddressed: {
      articleEngagement: false,
      evidenceBasedReasoning: false,
      criticalThinking: false,
      clinicalConnection: false,
      reflection: false,
    },
    exchangeCount: 0,
    guideExpanded: true,
  };
}

export function countAddressedAreas(areas: AreasAddressed): number {
  return Object.values(areas).filter(Boolean).length;
}

export function getMissingAreas(areas: AreasAddressed): string[] {
  const missing: string[] = [];

  for (const area of RUBRIC_AREAS) {
    if (!areas[area.id]) {
      missing.push(area.name);
    }
  }

  return missing;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Detect which rubric areas have been addressed based on conversation content.
 * Uses simple keyword/phrase detection as an initial implementation.
 * Can be enhanced later with Claude-based assessment if needed.
 */
export function detectAreas(messages: Message[]): Partial<AreasAddressed> {
  const text = messages.map(m => m.content).join(' ').toLowerCase();

  return {
    articleEngagement: /\b(found|study|research|method|participant|result|finding|author|paper|article)\b/.test(text),
    evidenceBasedReasoning: /\b(data|evidence|percent|significant|table|figure|shows?|demonstrate|statistic|p-value|correlation)\b/.test(text),
    criticalThinking: /\b(limitation|confound|alternative|bias|sample size|generalize|validity|reliability|control|variable)\b/.test(text),
    clinicalConnection: /\b(clinic|patient|therapy|treatment|practice|real[- ]?world|session|assessment|intervention|slp|speech[- ]?language)\b/.test(text),
    // Reflection is typically captured in the submission modal, not conversation
  };
}

/**
 * Merge detected areas with existing areas state (only turns false->true, never true->false)
 */
export function mergeAreasAddressed(
  current: AreasAddressed,
  detected: Partial<AreasAddressed>
): AreasAddressed {
  return {
    articleEngagement: current.articleEngagement || (detected.articleEngagement ?? false),
    evidenceBasedReasoning: current.evidenceBasedReasoning || (detected.evidenceBasedReasoning ?? false),
    criticalThinking: current.criticalThinking || (detected.criticalThinking ?? false),
    clinicalConnection: current.clinicalConnection || (detected.clinicalConnection ?? false),
    reflection: current.reflection || (detected.reflection ?? false),
  };
}
