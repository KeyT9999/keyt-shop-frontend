import axios from 'axios';
import API_BASE_URL from '../config/api';

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileMime: string;
}

export async function uploadChatFile(
  file: File,
  auth: { token?: string; sessionId?: string }
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  } else if (auth.sessionId) {
    headers['X-Session-ID'] = auth.sessionId;
  }

  const res = await axios.post(`${API_BASE_URL}/chat/upload`, formData, { headers });
  return res.data;
}
