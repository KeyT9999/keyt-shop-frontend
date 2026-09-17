import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import type {
  SpeakingReadingPassage,
  SpeakingQuestion,
  MockExamPack,
  SurvivalKit,
  FEExamSummary,
  FEExamDetail
} from '../types/speaking';

export const speakingApi = {
  /**
   * Get all reading passages (Mã đề A)
   */
  async getReadingPassages(courseCode = 'jpd123'): Promise<SpeakingReadingPassage[]> {
    const res = await axios.get(`${API_BASE_URL}/courses/${courseCode}/speaking/passages`);
    return res.data.data;
  },

  /**
   * Get single reading passage
   */
  async getReadingPassageById(courseCode = 'jpd123', id: string): Promise<SpeakingReadingPassage> {
    const res = await axios.get(`${API_BASE_URL}/courses/${courseCode}/speaking/passages/${id}`);
    return res.data.data;
  },

  /**
   * Get Q&A questions with filters
   */
  async getQAQuestions(
    courseCode = 'jpd123',
    filters?: { lesson?: number; hasImage?: boolean }
  ): Promise<SpeakingQuestion[]> {
    const params = new URLSearchParams();
    if (filters?.lesson) params.append('lesson', filters.lesson.toString());
    if (filters?.hasImage !== undefined) params.append('hasImage', filters.hasImage.toString());

    const res = await axios.get(
      `${API_BASE_URL}/courses/${courseCode}/speaking/questions?${params.toString()}`
    );
    return res.data.data;
  },

  /**
   * Get random Mock Exam Pack
   */
  async getMockExamPack(courseCode = 'jpd123'): Promise<MockExamPack> {
    const res = await axios.get(`${API_BASE_URL}/courses/${courseCode}/speaking/mock-exam-pack`);
    return res.data.data;
  },

  /**
   * Get Survival Kit
   */
  async getSurvivalKit(courseCode = 'jpd123'): Promise<SurvivalKit> {
    const res = await axios.get(`${API_BASE_URL}/courses/${courseCode}/speaking/survival-kit`);
    return res.data.data;
  },

  /**
   * Get FE Mock Exams
   */
  async getFeExams(courseCode = 'jpd123'): Promise<FEExamSummary[]> {
    const res = await axios.get(`${API_BASE_URL}/courses/${courseCode}/exams/fe-tests`);
    return res.data.data;
  },

  /**
   * Get FE Mock Exam Detail by slug
   */
  async getFeExamDetail(courseCode = 'jpd123', slug: string): Promise<FEExamDetail> {
    const res = await axios.get(`${API_BASE_URL}/courses/${courseCode}/exams/fe-tests/${slug}`);
    return res.data.data;
  }
};
