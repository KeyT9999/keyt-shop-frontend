export interface CourseLanguageConfig {
  kind: 'japanese' | 'chinese';
  speechLocale: 'ja-JP' | 'zh-CN';
  languageName: 'Tiếng Nhật' | 'Tiếng Trung';
  readingName: 'Furigana' | 'Pinyin';
  writingName: 'Kanji' | 'Hán tự';
}

export function getCourseLanguage(courseCode?: string): CourseLanguageConfig {
  if ((courseCode || '').toUpperCase().startsWith('HSK')) {
    return {
      kind: 'chinese',
      speechLocale: 'zh-CN',
      languageName: 'Tiếng Trung',
      readingName: 'Pinyin',
      writingName: 'Hán tự'
    };
  }

  return {
    kind: 'japanese',
    speechLocale: 'ja-JP',
    languageName: 'Tiếng Nhật',
    readingName: 'Furigana',
    writingName: 'Kanji'
  };
}
