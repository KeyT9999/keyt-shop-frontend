import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import type { EvidenceItem, EvidenceRequest } from '../types';

export async function fetchEvidence(request: EvidenceRequest): Promise<EvidenceItem[]> {
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

    return response.data?.evidence || [];
  } catch (error: any) {
    const apiMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Đã xảy ra lỗi khi tìm kiếm evidence.';
    throw new Error(apiMessage);
  }
}
