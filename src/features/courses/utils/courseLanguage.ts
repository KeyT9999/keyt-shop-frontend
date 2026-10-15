export interface CourseLanguageConfig {
  kind: 'japanese' | 'chinese' | 'english';
  speechLocale: 'ja-JP' | 'zh-CN' | 'en-GB' | 'en-US';
  languageName: 'Tiếng Nhật' | 'Tiếng Trung' | 'Tiếng Anh';
  languageShortName: 'Nhật' | 'Trung' | 'Anh';
  readingName: 'Furigana' | 'Pinyin' | 'IPA';
  writingName: 'Kanji' | 'Hán tự' | 'Từ tiếng Anh';
}

export function getCourseLanguage(courseCode?: string): CourseLanguageConfig {
  const normalizedCode = (courseCode || '').toUpperCase();
  if (normalizedCode.startsWith('HSK')) {
    return {
      kind: 'chinese',
      speechLocale: 'zh-CN',
      languageName: 'Tiếng Trung',
      languageShortName: 'Trung',
      readingName: 'Pinyin',
      writingName: 'Hán tự'
    };
  }

  if (normalizedCode.startsWith('ENG') || normalizedCode.startsWith('TOEIC') || normalizedCode.includes('HACKERS')) {
    return {
      kind: 'english',
      speechLocale: (normalizedCode.startsWith('TOEIC') || normalizedCode.includes('HACKERS')) ? 'en-US' : 'en-GB',
      languageName: 'Tiếng Anh',
      languageShortName: 'Anh',
      readingName: 'IPA',
      writingName: 'Từ tiếng Anh'
    };
  }

  return {
    kind: 'japanese',
    speechLocale: 'ja-JP',
    languageName: 'Tiếng Nhật',
    languageShortName: 'Nhật',
    readingName: 'Furigana',
    writingName: 'Kanji'
  };
}
