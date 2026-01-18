// PDF parsing and smart detection utility for instructor uploads
import { WEEKLY_ARTICLES } from './knowledge/syllabus';

// Student matching result
export interface StudentMatch {
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  matchType?: 'email' | 'exact_name' | 'partial_name';
}

// Week matching result
export interface WeekMatch {
  weekNumber?: number;
  articleTitle?: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  matchType?: 'week_number' | 'article_title' | 'article_author' | 'article_topic';
}

// Submission type matching result
export interface SubmissionTypeMatch {
  type: 'weekly' | 'midterm' | 'final';
  confidence: 'high' | 'medium' | 'low';
}

// Full detection result
export interface PDFDetectionResult {
  student: StudentMatch;
  week: WeekMatch;
  submissionType: SubmissionTypeMatch;
  extractedText: string;
  warnings: string[];
}

// Roster student type for matching
export interface RosterStudent {
  id: string;
  name: string;
  email: string;
  section: string;
}

// Article author to week mapping
const AUTHOR_TO_WEEK: Record<string, number> = {
  'greenwell': 2,
  'walsh': 2,
  'brockmann': 3,
  'brockmann-bauser': 3,
  'bauser': 3,
  'yousef': 4,
  'burris': 5,
  'lalonde': 6,
  'werner': 6,
  'roushan': 7,
  'mcmurray': 8,
  'maryn': 9,
  'barsties': 10,
  'kent': 11,
  'vorperian': 11,
  'knightly': 12,
  'rizzi': 13,
  'bidelman': 13,
  'madill': 14,
  'murray': 15,
};

// Topic keywords to week mapping
const TOPIC_TO_WEEK: Record<string, number> = {
  'evidence-based practice': 2,
  'ebp': 2,
  'perturbation': 3,
  'jitter': 3,
  'shimmer': 3,
  'vocal intensity': 3,
  'reverberation': 4,
  'room acoustics': 4,
  'software comparison': 5,
  'praat': 5,
  'acoustic analysis systems': 5,
  'noise masking': 6,
  'speech masking': 6,
  'babble': 6,
  'speech-in-noise': 6,
  'context effects': 7,
  'contextual information': 7,
  'categorical perception': 8,
  'phoneme boundaries': 8,
  'voice quality': 9,
  'cepstral peak prominence': 9,
  'cpp': 9,
  'cpps': 9,
  'avqi': 10,
  'acoustic voice quality index': 10,
  'vowels': 11,
  'formant': 11,
  'developing speech': 11,
  'disordered speech': 11,
  'vot': 12,
  'voice onset time': 12,
  'childhood overhearing': 12,
  'heritage language': 12,
  'phonetic categorization': 13,
  'categorization consistency': 13,
  'nasalance': 14,
  'hnr': 14,
  'harmonics-to-noise': 14,
  'high-quality acoustic analysis': 15,
  'reliable acoustic': 15,
};

/**
 * Detect student from extracted text
 */
export function detectStudent(text: string, roster: RosterStudent[]): StudentMatch {
  const lowerText = text.toLowerCase();

  // Strategy 1: Look for exact email match (highest confidence)
  for (const student of roster) {
    if (lowerText.includes(student.email.toLowerCase())) {
      return {
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        confidence: 'high',
        matchType: 'email',
      };
    }
  }

  // Strategy 2: Look for exact full name match (high confidence)
  for (const student of roster) {
    const nameLower = student.name.toLowerCase();
    if (lowerText.includes(nameLower)) {
      return {
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        confidence: 'high',
        matchType: 'exact_name',
      };
    }
  }

  // Strategy 3: Look for partial name match - first and last name separately (medium confidence)
  for (const student of roster) {
    const nameParts = student.name.toLowerCase().split(/\s+/);
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];

      // Both first and last name must appear
      if (firstName.length >= 3 && lastName.length >= 3 &&
          lowerText.includes(firstName) && lowerText.includes(lastName)) {
        return {
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          confidence: 'medium',
          matchType: 'partial_name',
        };
      }
    }
  }

  // Strategy 4: Look for any email pattern and try to match domain
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailPattern);
  if (emails) {
    for (const email of emails) {
      const emailLower = email.toLowerCase();
      for (const student of roster) {
        if (student.email.toLowerCase() === emailLower) {
          return {
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            confidence: 'high',
            matchType: 'email',
          };
        }
      }
    }
  }

  return { confidence: 'none' };
}

/**
 * Detect week number from extracted text
 */
export function detectWeek(text: string): WeekMatch {
  const lowerText = text.toLowerCase();

  // Strategy 1: Look for explicit "Week X" pattern (highest confidence)
  const weekPattern = /week\s*(\d{1,2})/gi;
  const weekMatches = [...text.matchAll(weekPattern)];
  if (weekMatches.length > 0) {
    // Get the most common week number if multiple found
    const weekCounts: Record<number, number> = {};
    for (const match of weekMatches) {
      const weekNum = parseInt(match[1]);
      if (weekNum >= 1 && weekNum <= 15) {
        weekCounts[weekNum] = (weekCounts[weekNum] || 0) + 1;
      }
    }

    const sortedWeeks = Object.entries(weekCounts).sort((a, b) => b[1] - a[1]);
    if (sortedWeeks.length > 0) {
      const weekNum = parseInt(sortedWeeks[0][0]);
      const articleInfo = WEEKLY_ARTICLES[weekNum as keyof typeof WEEKLY_ARTICLES];
      return {
        weekNumber: weekNum,
        articleTitle: articleInfo?.title,
        confidence: 'high',
        matchType: 'week_number',
      };
    }
  }

  // Strategy 2: Look for article author names (high confidence)
  for (const [author, week] of Object.entries(AUTHOR_TO_WEEK)) {
    // Look for author name with word boundaries
    const authorPattern = new RegExp(`\\b${author}\\b`, 'i');
    if (authorPattern.test(text)) {
      const articleInfo = WEEKLY_ARTICLES[week as keyof typeof WEEKLY_ARTICLES];
      return {
        weekNumber: week,
        articleTitle: articleInfo?.title,
        confidence: 'high',
        matchType: 'article_author',
      };
    }
  }

  // Strategy 3: Look for article title fragments (high confidence)
  for (const [weekStr, article] of Object.entries(WEEKLY_ARTICLES)) {
    const week = parseInt(weekStr);
    const titleLower = article.title.toLowerCase();

    // Look for significant portions of the title
    const titleWords = titleLower.split(/\s+/).filter(w => w.length > 4);
    const matchCount = titleWords.filter(word => lowerText.includes(word)).length;

    if (matchCount >= 3 || (titleWords.length <= 3 && matchCount >= 2)) {
      return {
        weekNumber: week,
        articleTitle: article.title,
        confidence: 'high',
        matchType: 'article_title',
      };
    }
  }

  // Strategy 4: Look for topic keywords (medium confidence)
  for (const [topic, week] of Object.entries(TOPIC_TO_WEEK)) {
    if (lowerText.includes(topic)) {
      const articleInfo = WEEKLY_ARTICLES[week as keyof typeof WEEKLY_ARTICLES];
      return {
        weekNumber: week,
        articleTitle: articleInfo?.title,
        confidence: 'medium',
        matchType: 'article_topic',
      };
    }
  }

  return { confidence: 'none' };
}

/**
 * Detect submission type (weekly, midterm, or final)
 */
export function detectSubmissionType(text: string): SubmissionTypeMatch {
  const lowerText = text.toLowerCase();

  // Check for midterm indicators
  const midtermPatterns = [
    'midterm',
    'act i',
    'act ii',
    'measurement confounds',
    'perception under noise',
    'synthesis paper',
    '2-3 page',
  ];

  const midtermMatches = midtermPatterns.filter(p => lowerText.includes(p)).length;

  // Check for final exam indicators
  const finalPatterns = [
    'final exam',
    'final paper',
    'act iii',
    'act iv',
    'central question',
    '4-5 page',
    'all four acts',
    'voice & phonation',
    'articulation & motor',
  ];

  const finalMatches = finalPatterns.filter(p => lowerText.includes(p)).length;

  if (finalMatches >= 2) {
    return { type: 'final', confidence: 'high' };
  }

  if (midtermMatches >= 2) {
    return { type: 'midterm', confidence: 'high' };
  }

  if (finalMatches === 1) {
    return { type: 'final', confidence: 'medium' };
  }

  if (midtermMatches === 1) {
    return { type: 'midterm', confidence: 'medium' };
  }

  // Default to weekly conversation
  return { type: 'weekly', confidence: 'medium' };
}

/**
 * Full PDF analysis combining all detection strategies
 */
export function analyzePDFText(text: string, roster: RosterStudent[]): PDFDetectionResult {
  const warnings: string[] = [];

  const student = detectStudent(text, roster);
  const week = detectWeek(text);
  const submissionType = detectSubmissionType(text);

  // Generate warnings for low confidence matches
  if (student.confidence === 'none') {
    warnings.push('Could not identify student from PDF. Please select manually.');
  } else if (student.confidence === 'medium' || student.confidence === 'low') {
    warnings.push(`Student match is uncertain (${student.matchType}). Please verify.`);
  }

  if (week.confidence === 'none') {
    warnings.push('Could not identify week from PDF. Please select manually.');
  } else if (week.confidence === 'medium' || week.confidence === 'low') {
    warnings.push(`Week match is uncertain (${week.matchType}). Please verify.`);
  }

  // Check for potential mismatches
  if (submissionType.type === 'midterm' && week.weekNumber && week.weekNumber !== 9) {
    warnings.push('PDF appears to be a midterm but detected week is not 9.');
  }

  if (submissionType.type === 'final' && week.weekNumber && week.weekNumber !== 15) {
    warnings.push('PDF appears to be a final exam but detected week is not from finals week.');
  }

  return {
    student,
    week,
    submissionType,
    extractedText: text.substring(0, 1000), // First 1000 chars for preview
    warnings,
  };
}

/**
 * Check if all detections are high confidence (for auto-confirm)
 */
export function canAutoConfirm(result: PDFDetectionResult): boolean {
  return (
    result.student.confidence === 'high' &&
    result.week.confidence === 'high' &&
    result.warnings.length === 0
  );
}
