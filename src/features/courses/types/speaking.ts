export interface SpeakingTargetKanji {
  character: string;
  reading: string;
  hanViet: string;
}

export interface SpeakingReadingPassage {
  id: string;
  code: string;
  title: string;
  topic: string;
  wordCount: number;
  contentJapanese: string;
  contentFurigana: string;
  contentVietnamese: string;
  targetKanji: SpeakingTargetKanji[];
  targetKatakana: string[];
  prepTimeSeconds: number;
  readingTimeSeconds: number;
}

export interface SpeakingAnswerLevel {
  japanese: string;
  reading: string;
  vietnamese: string;
}

export interface SpeakingQuestion {
  id: string;
  lesson: number;
  hasImage: boolean;
  imageType?: string;
  imageDescription?: string;
  questionJapanese: string;
  questionFurigana: string;
  questionVietnamese: string;
  grammarPattern: string;
  keywords: string[];
  answers: {
    level1_short: SpeakingAnswerLevel;
    level2_polite: SpeakingAnswerLevel;
    level3_expanded: SpeakingAnswerLevel;
  };
}

export interface SurvivalManner {
  situation: string;
  japanese: string;
  romaji: string;
  vietnamese: string;
  tip: string;
}

export interface RubricItem {
  section: string;
  maxScore: number;
  criteria: string;
}

export interface ParticleMeaning {
  role: string;
  example: string;
}

export interface ParticleCheatSheetItem {
  particle: string;
  meanings: ParticleMeaning[];
}

export interface SurvivalKit {
  manners: SurvivalManner[];
  rubricSummary: RubricItem[];
  particlesCheatSheet: ParticleCheatSheetItem[];
}

export interface MockExamPack {
  examCode: string;
  readingPassage: SpeakingReadingPassage;
  qaQuestions: SpeakingQuestion[];
  durationEstimateMinutes: number;
  prepTimeSeconds: number;
}

export interface FEExamQuestionItem {
  id: string;
  order: number;
  source: string;
  questionNumber: string;
  category: 'grammar' | 'vocabulary' | 'kanji' | 'particles' | 'reading';
  question: string;
  options: string[];
  correctAnswer: string;
  correctAnswerText: string;
  explanation: string;
}

export interface FEExamSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  totalQuestions: number;
}

export interface FEExamDetail extends FEExamSummary {
  questions: FEExamQuestionItem[];
}

export interface MockExamScorecard {
  examCode: string;
  date: string;
  readingScore: number; // max 45
  readingDetails: {
    kanjiScore: number; // max 15
    katakanaScore: number; // max 10
    hiraganaScore: number; // max 20
    fluencyScore: number;
  };
  qaScore: number; // max 45 (15 * 3)
  qaDetails: Array<{
    questionId: string;
    questionText: string;
    studentAnswerText: string;
    score: number;
    feedback: string;
  }>;
  mannerScore: number; // max 10
  totalScore: number; // max 100
  passed: boolean; // >= 50
  generalFeedback: string;
}
