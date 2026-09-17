import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import type {
  SpeakingReadingPassage,
  SpeakingQuestion,
  MockExamPack,
  SurvivalKit,
  FEExamSummary,
  FEExamDetail,
  PronunciationEvaluationResult,
  QAEvaluationResult,
  GreetingEvaluationResult
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
  },

  /**
   * Evaluate pronunciation audio via AI Speech Service (FastAPI / Node proxy)
   */
  async evaluatePronunciation(
    courseCode = 'jpd123',
    audioBlob: Blob,
    expectedText: string,
    passageId?: string
  ): Promise<PronunciationEvaluationResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'reading_practice.webm');
    formData.append('expectedText', expectedText);
    formData.append('courseCode', courseCode);
    if (passageId) formData.append('passageId', passageId);

    // Try Node backend proxy first
    try {
      const res = await axios.post(
        `${API_BASE_URL}/courses/${courseCode}/speaking/evaluate`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 45000
        }
      );
      return res.data.data;
    } catch (backendErr) {
      console.warn('Backend proxy failed, attempting direct AI microservice at :8001...', backendErr);
      const directRes = await axios.post(
        'http://127.0.0.1:8001/api/pronunciation/evaluate',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 45000
        }
      );
      return directRes.data.data;
    }
  },

  /**
   * Evaluate Q&A audio answer via AI Speech Service
   */
  async evaluateQA(
    courseCode = 'jpd123',
    audioBlob: Blob,
    questionJapanese: string,
    keywords: string[] = [],
    grammarPattern = '',
    referenceAnswers: any = null
  ): Promise<QAEvaluationResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'qa_answer.webm');
    formData.append('questionJapanese', questionJapanese);
    formData.append('keywords', JSON.stringify(keywords));
    if (grammarPattern) formData.append('grammarPattern', grammarPattern);
    if (referenceAnswers) formData.append('referenceAnswers', JSON.stringify(referenceAnswers));

    try {
      const res = await axios.post(
        `${API_BASE_URL}/courses/${courseCode}/speaking/evaluate-qa`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 45000
        }
      );
      return res.data.data;
    } catch (backendErr) {
      console.warn('Backend proxy failed, attempting direct AI microservice at :8001...', backendErr);
      const directRes = await axios.post(
        'http://127.0.0.1:8001/api/pronunciation/evaluate-qa',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 45000
        }
      );
      return directRes.data.data;
    }
  },

  /**
   * Evaluate greeting phrase audio (失礼します / 失礼しました)
   */
  async evaluateGreeting(
    courseCode = 'jpd123',
    audioBlob: Blob,
    targetPhrase = '失礼します'
  ): Promise<GreetingEvaluationResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'greeting.webm');
    formData.append('targetPhrase', targetPhrase);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/courses/${courseCode}/speaking/evaluate-greeting`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        }
      );
      return res.data.data;
    } catch (backendErr) {
      console.warn('Backend proxy failed, attempting direct AI microservice at :8001...', backendErr);
      const directRes = await axios.post(
        'http://127.0.0.1:8001/api/pronunciation/evaluate-greeting',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        }
      );
      return directRes.data.data;
    }
  }
};


