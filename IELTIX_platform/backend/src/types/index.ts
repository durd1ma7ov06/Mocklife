export type ExamMode = 'IELTS' | 'MILLIY_BBM';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  targetBand: string;
  examDate: string;
  daysLeft: number;
  vipTier: 'FREE' | 'PRO' | 'MAX_VIP';
  activeExamMode: ExamMode;
  stats: {
    testsCompleted: number;
    overallBand: number;
    listeningBand: number;
    readingBand: number;
    writingBand: number;
    speakingBand: number;
    studyStreakDays: number;
  };
}

export interface VocabItem {
  id: string;
  word: string;
  definition: string;
  translationUz: string;
  partOfSpeech: string;
  cefrLevel: 'B2' | 'C1' | 'C2';
  exampleSentence: string;
  collocations: string[];
  savedAt: string;
  sourcePassage?: string;
}

export interface SpeakingQuestion {
  part: 1 | 2 | 3;
  topic: string;
  question: string;
  preparationTimeSec?: number;
  cuePoints?: string[];
}

export interface SpeakingEvaluationResult {
  overallBand: number;
  fluencyScore: number;
  lexicalScore: number;
  grammarScore: number;
  pronunciationScore: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    betterPhrasings: Array<{ original: string; suggested: string; reason: string }>;
  };
}

export interface WritingSubmission {
  taskType: 'TASK_1' | 'TASK_2';
  promptTitle: string;
  essayText: string;
  timeSpentMinutes: number;
  targetBand?: string;
}

export interface WritingEvaluationResult {
  overallBand: number;
  taskAchievementScore: number;
  coherenceCohesionScore: number;
  lexicalResourceScore: number;
  grammarAccuracyScore: number;
  wordCount: number;
  targetWordCount: number;
  feedback: {
    generalSummary: string;
    strengths: string[];
    weaknesses: string[];
    grammarCorrections: Array<{ original: string; correction: string; explanation: string }>;
    advancedVocabularySuggestions: Array<{ word: string; advancedAlternative: string }>;
  };
}

export interface ReadingTest {
  id: string;
  title: string;
  passageText: string;
  questions: Array<{
    id: number;
    type: 'TRUE_FALSE_NOT_GIVEN' | 'MULTIPLE_CHOICE' | 'SUMMARY_COMPLETION';
    prompt: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

export interface ExamReport {
  id: string;
  candidateName: string;
  candidateId: string;
  testDate: string;
  testType: string;
  overallBand: number;
  scores: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
  cefrLevel: 'C1' | 'C2' | 'B2';
  verificationCode: string;
  qrPayload: string;
  percentile: number;
}
