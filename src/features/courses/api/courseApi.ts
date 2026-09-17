import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import type {
  CourseData,
  CourseLesson,
  SectionType,
  QuizQuestion,
  LearningMode
} from '../types';

export const courseApi = {
  /**
   * Get Course Overview
   */
  async getCourse(courseCode: string, token?: string | null): Promise<CourseData> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_BASE_URL}/courses/${courseCode}`, { headers });
    return res.data.data;
  },

  /**
   * Get Lessons in Section
   */
  async getSectionLessons(
    courseCode: string,
    sectionType: SectionType,
    token?: string | null
  ): Promise<CourseLesson[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_BASE_URL}/courses/${courseCode}/${sectionType}/lessons`, {
      headers
    });
    return res.data.data;
  },

  /**
   * Get Lesson Items
   */
  async getLessonItems(
    courseCode: string,
    sectionType: SectionType,
    slug: string,
    token?: string | null
  ) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(
      `${API_BASE_URL}/courses/${courseCode}/${sectionType}/lessons/${slug}/items`,
      { headers }
    );
    return res.data.data;
  },

  /**
   * Get Dynamic Quiz
   */
  async getQuiz(courseCode: string, slug: string, limit = 10): Promise<QuizQuestion[]> {
    const res = await axios.get(
      `${API_BASE_URL}/courses/${courseCode}/vocabulary/lessons/${slug}/quiz?limit=${limit}`
    );
    return res.data.data;
  },

  /**
   * Record Vocabulary learning attempt
   */
  async recordVocabularyResult(
    vocabularyId: string,
    mode: LearningMode,
    isCorrect: boolean,
    token: string
  ) {
    const res = await axios.post(
      `${API_BASE_URL}/learning/vocabulary/${vocabularyId}/record`,
      { mode, isCorrect },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
  },

  /**
   * Toggle Bookmark
   */
  async toggleBookmark(vocabularyId: string, token: string) {
    const res = await axios.post(
      `${API_BASE_URL}/learning/vocabulary/${vocabularyId}/bookmark`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
  },

  /**
   * Verify Typing answer
   */
  async verifyTyping(
    vocabularyId: string,
    input: string,
    direction: 'ja-to-vi' | 'vi-to-ja' = 'ja-to-vi'
  ) {
    const res = await axios.post(`${API_BASE_URL}/learning/typing/verify`, {
      vocabularyId,
      input,
      direction
    });
    return res.data.data;
  }
};
