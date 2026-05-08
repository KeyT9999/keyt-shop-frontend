import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import type { EvidenceRequest, EvidenceResponse } from '../types';

/**
 * Gọi API Evidence Checker.
 * Trả về { evidence, verdict } - verdict có thể null nếu Gemini fail ở bước tổng hợp.
 */
export async function fetchEvidence(request: EvidenceRequest): Promise<EvidenceResponse> {
  if (!request.apiKey || !request.apiKey.trim()) {
    throw new Error('Gemini API Key không được để trống.');
  }
  if (!request.query || !request.query.trim()) {
    throw new Error('Vui lòng nhập thông tin cần xác thực.');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/evidence`, {
      query: request.query.trim(),
      apiKey: request.apiKey.trim(),
      maxResults: request.maxResults ?? 5,
    });

    return {
      evidence: response.data?.evidence || [],
      verdict: response.data?.verdict || null,
    };
  } catch (error: any) {
    const apiMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Đã xảy ra lỗi khi tìm kiếm evidence.';
    throw new Error(apiMessage);
  }
}

export async function splitClaims(text: string, apiKey: string): Promise<string[]> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API Key không được để trống.');
  }
  if (!text || !text.trim()) {
    throw new Error('Vui lòng nhập văn bản cần tách claim.');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/evidence/split-claims`, {
      text: text.trim(),
      apiKey: apiKey.trim(),
    });

    return Array.isArray(response.data?.claims) ? response.data.claims : [];
  } catch (error: any) {
    const apiMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Đã xảy ra lỗi khi tách claim.';
    throw new Error(apiMessage);
  }
}
