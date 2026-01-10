// Progress tracking for SLHS 303 Critical Reasoning Mirror
// Tracks weekly conversation completion and unlocks midterm/final

export interface WeekProgress {
  week: number;
  completed: boolean;
  exchangeCount: number;
  completedAt?: string;
}

export interface MidtermProgress {
  started: boolean;
  currentPhase: number;
  paperSections: {
    startingPoint?: string;
    actI?: string;
    actII?: string;
    whyItMatters?: string;
  };
  submitted: boolean;
  submittedAt?: string;
  lastSavedAt?: string;
}

export interface StudentProgress {
  studentName: string;
  weeks: WeekProgress[];
  midterm: MidtermProgress;
  final: MidtermProgress; // Same structure as midterm
}

// Minimum exchanges required for a conversation to count as "complete"
export const MIN_EXCHANGES_FOR_COMPLETION = 10;

// Week requirements for unlocking assessments
export const MIDTERM_REQUIRED_WEEKS = [2, 3, 4, 5, 6, 7, 8]; // Weeks 2-8
export const FINAL_REQUIRED_WEEKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]; // All weeks

// Submission windows (Spring 2026)
export const SUBMISSION_WINDOWS = {
  midterm: {
    start: new Date('2026-03-17T00:00:00'),
    end: new Date('2026-03-23T23:59:59'),
    label: 'Week 9 (March 17-23, 2026)'
  },
  final: {
    start: new Date('2026-05-11T00:00:00'),
    end: new Date('2026-05-16T23:59:59'),
    label: 'Finals Week (May 11-16, 2026)'
  }
};

// Initialize empty progress
export function createEmptyProgress(studentName: string = ''): StudentProgress {
  const weeks: WeekProgress[] = [];
  for (let i = 1; i <= 15; i++) {
    weeks.push({
      week: i,
      completed: false,
      exchangeCount: 0
    });
  }

  return {
    studentName,
    weeks,
    midterm: {
      started: false,
      currentPhase: 1,
      paperSections: {},
      submitted: false
    },
    final: {
      started: false,
      currentPhase: 1,
      paperSections: {},
      submitted: false
    }
  };
}

// Check if a week's conversation meets completion criteria
export function isWeekComplete(progress: StudentProgress, weekNumber: number): boolean {
  const weekProgress = progress.weeks.find(w => w.week === weekNumber);
  if (!weekProgress) return false;
  return weekProgress.completed && weekProgress.exchangeCount >= MIN_EXCHANGES_FOR_COMPLETION;
}

// Update week progress after a conversation
export function updateWeekProgress(
  progress: StudentProgress,
  weekNumber: number,
  exchangeCount: number,
  markComplete: boolean = false
): StudentProgress {
  const updatedWeeks = progress.weeks.map(w => {
    if (w.week === weekNumber) {
      return {
        ...w,
        exchangeCount: Math.max(w.exchangeCount, exchangeCount),
        completed: markComplete || (w.completed && exchangeCount >= MIN_EXCHANGES_FOR_COMPLETION),
        completedAt: markComplete ? new Date().toISOString() : w.completedAt
      };
    }
    return w;
  });

  return {
    ...progress,
    weeks: updatedWeeks
  };
}

// Check if midterm is unlocked
export function isMidtermUnlocked(progress: StudentProgress): boolean {
  return MIDTERM_REQUIRED_WEEKS.every(weekNum => isWeekComplete(progress, weekNum));
}

// Check if final is unlocked
export function isFinalUnlocked(progress: StudentProgress): boolean {
  // All weeks must be complete AND midterm must be submitted
  const allWeeksComplete = FINAL_REQUIRED_WEEKS.every(weekNum => isWeekComplete(progress, weekNum));
  return allWeeksComplete && progress.midterm.submitted;
}

// Get completion stats
export function getCompletionStats(progress: StudentProgress): {
  completedWeeks: number;
  totalRequiredWeeks: number;
  midtermProgress: number; // 0-100
  finalProgress: number; // 0-100
} {
  const completedMidtermWeeks = MIDTERM_REQUIRED_WEEKS.filter(w => isWeekComplete(progress, w)).length;
  const completedFinalWeeks = FINAL_REQUIRED_WEEKS.filter(w => isWeekComplete(progress, w)).length;

  return {
    completedWeeks: progress.weeks.filter(w => w.completed).length,
    totalRequiredWeeks: 14, // Weeks 2-15
    midtermProgress: Math.round((completedMidtermWeeks / MIDTERM_REQUIRED_WEEKS.length) * 100),
    finalProgress: Math.round((completedFinalWeeks / FINAL_REQUIRED_WEEKS.length) * 100)
  };
}

// Check if currently within submission window
export function isWithinSubmissionWindow(type: 'midterm' | 'final'): boolean {
  const now = new Date();
  const window = SUBMISSION_WINDOWS[type];
  return now >= window.start && now <= window.end;
}

// Get message for locked assessment
export function getLockedMessage(type: 'midterm' | 'final', progress: StudentProgress): string {
  if (type === 'midterm') {
    const completedCount = MIDTERM_REQUIRED_WEEKS.filter(w => isWeekComplete(progress, w)).length;
    const remaining = MIDTERM_REQUIRED_WEEKS.length - completedCount;
    if (remaining > 0) {
      return `Complete ${remaining} more weekly conversation${remaining > 1 ? 's' : ''} (Weeks 2-8) to unlock`;
    }
    return 'Ready to start!';
  } else {
    // Final exam
    if (!progress.midterm.submitted) {
      return 'Complete the Midterm Project first';
    }
    const completedCount = FINAL_REQUIRED_WEEKS.filter(w => isWeekComplete(progress, w)).length;
    const remaining = FINAL_REQUIRED_WEEKS.length - completedCount;
    if (remaining > 0) {
      return `Complete ${remaining} more weekly conversation${remaining > 1 ? 's' : ''} to unlock`;
    }
    return 'Ready to start!';
  }
}

// Get submission window message
export function getSubmissionWindowMessage(type: 'midterm' | 'final'): string {
  const window = SUBMISSION_WINDOWS[type];
  const now = new Date();

  if (now < window.start) {
    return `Submissions open ${window.label}. You can work on your draft now.`;
  } else if (now > window.end) {
    return `Submission window has closed.`;
  } else {
    return `Submission window is open until ${window.end.toLocaleDateString()}.`;
  }
}

// Local storage keys
const STORAGE_KEY = 'slhs303_progress';

// Save progress to localStorage
export function saveProgress(progress: StudentProgress): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}

// Load progress from localStorage
export function loadProgress(): StudentProgress | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Clear progress (for testing or reset)
export function clearProgress(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
