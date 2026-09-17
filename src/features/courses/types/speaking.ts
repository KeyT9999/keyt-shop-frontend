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

export interface QuestionWordItem {
  word: string;
  furigana: string;
  meaning: string;
  responseGuide: string;
  exampleQ: string;
  exampleA: string;
}

export interface ReflexItem {
  id: number;
  question: string;
  reflex: string;
  lesson: string;
  explanation: string;
}

export interface GrammarTableRow {
  form: string;
  pattern: string;
  example: string;
}

export interface SubGrammarItem {
  pattern: string;
  meaning: string;
  example: string;
}

export interface EventVsExistenceItem {
  pattern: string;
  meaning: string;
  example: string;
}

export interface EventVsExistence {
  locationDe: EventVsExistenceItem;
  locationNi: EventVsExistenceItem;
}

export interface GrammarTables {
  verbs: GrammarTableRow[];
  iAdjectives: GrammarTableRow[];
  naAdjectives: GrammarTableRow[];
  subGrammar: SubGrammarItem[];
  eventVsExistence: EventVsExistence;
}

export interface ThreeStepMethodItem {
  step: number;
  title: string;
  desc: string;
}

export interface ImageStrategy {
  title: string;
  rule: string;
  demoFpt: string;
  demoQuestion: string;
  demoAnswer: string;
  tip: string;
}

export interface ReadingTips {
  title: string;
  structure: string;
  goldenRule: string;
  exampleBefore: string;
  exampleAfter: string;
  stallAdvice: string;
}

export interface SurvivalKit {
  manners: SurvivalManner[];
  rubricSummary: RubricItem[];
  particlesCheatSheet: ParticleCheatSheetItem[];
  questionWordsSystem?: QuestionWordItem[];
  reflexList20?: ReflexItem[];
  grammarTables?: GrammarTables;
  threeStepMethod?: ThreeStepMethodItem[];
  imageStrategy?: ImageStrategy;
  readingTips?: ReadingTips;
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

export interface PronunciationWordEvaluation {
  word: string;
  reading: string;
  romaji: string;
  moras: string[];
  score: number;
  status: 'correct' | 'warning' | 'error' | 'missing';
  feedback: string;
  spoken?: string;
}

export interface PronunciationEvaluationResult {
  expected: string;
  transcript: string;
  score: number; // /100
  feScore: number; // /45
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  summary: string;
  metrics: {
    accuracy: number;
    pronunciation: number;
    fluency: number;
    rhythm: number;
  };
  details: {
    moraRate: number;
    expectedMoras: number;
    speechDurationSec: number;
    hesitationCount: number;
    characterErrorRate: number;
  };
  words: PronunciationWordEvaluation[];
  courseCode?: string;
  passageId?: string;
}

export interface QAEvaluationResult {
  transcript: string;
  score: number; // 0 - 15
  maxScore: number; // 15
  matchedLevel: 'level1' | 'level2' | 'level3' | 'incomplete';
  matchedKeywords: string[];
  missingKeywords: string[];
  hasPoliteEnding: boolean;
  pronunciationScore: number;
  feedback: string;
}

export interface GreetingEvaluationResult {
  transcript: string;
  target: string;
  passed: boolean;
  score: number; // 0 - 10
  maxScore: number; // 10
  feedback: string;
}


