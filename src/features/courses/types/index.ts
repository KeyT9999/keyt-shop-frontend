export type SectionType = 'vocabulary' | 'kanji' | 'grammar' | 'exam';

export type MemoryStatus = 'new' | 'learning' | 'familiar' | 'mastered';

export type LearningMode = 'flashcard' | 'typing' | 'multichoice' | 'table';

export interface UserItemProgress {
  status: MemoryStatus;
  masteryScore: number;
  streak: number;
  isBookmarked: boolean;
}

export interface VocabularyItem {
  _id: string;
  order: number;
  term: string;
  reading: string;
  romaji?: string;
  partOfSpeech: string;
  meaning: string;
  examples?: Array<{
    japanese: string;
    reading: string;
    vietnamese: string;
  }>;
  audioUrl?: string;
  userProgress?: UserItemProgress;
}

export interface KanjiItem {
  _id: string;
  order: number;
  character: string;
  hanViet?: string;
  meaning: string[];
  onyomi: string[];
  kunyomi: string[];
  strokeCount?: number;
  mnemonic?: string;
  jlptLevel?: string;
  exampleWords?: Array<{
    term: string;
    reading: string;
    meaning: string;
  }>;
  userProgress?: UserItemProgress;
}

export interface GrammarItem {
  _id: string;
  order: number;
  title: string;
  pattern: string;
  meaning: string;
  explanation?: string;
  structures?: string[];
  examples?: Array<{
    japanese: string;
    reading: string;
    vietnamese: string;
  }>;
  notes?: string[];
}

export interface CourseLesson {
  _id: string;
  courseCode: string;
  sectionType: SectionType;
  lessonCode: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  itemCount: number;
  userProgress?: {
    masteredItems: number;
    percentCompleted: number;
  };
}

export interface CourseSectionMeta {
  type: SectionType;
  title: string;
  japaneseTitle: string;
  kanjiChar: string;
  description: string;
  totalLessons: number;
  totalItems: number;
  userMastered: number;
  percent: number;
  colorTheme: 'rose' | 'orange' | 'indigo' | 'emerald';
}

export interface CourseData {
  course: {
    _id: string;
    code: string;
    title: string;
    shortDescription: string;
    description: string;
    level: string;
    thumbnail: string;
    stats: {
      totalVocabulary: number;
      totalKanji: number;
      totalGrammar: number;
      totalExams: number;
    };
  };
  sections: CourseSectionMeta[];
  userProgress: {
    overallPercent: number;
    lastAccessedLesson: {
      lessonId: string;
      slug: string;
      sectionType: string;
      title: string;
    } | null;
  };
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  questionNumber: number;
  vocabularyId: string;
  term: string;
  reading: string;
  partOfSpeech: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  correctMeaning: string;
}
