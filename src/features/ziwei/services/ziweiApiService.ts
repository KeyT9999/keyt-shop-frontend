const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ZiweiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SavedZiweiRecord {
  _id: string;
  name: string;
  gender: 'male' | 'female';
  year: number;
  month: number;
  day: number;
  clockHour: number;
  clockMinute: number;
  unknownTime: boolean;
  city: string;
  longitude: number;
  utcOffsetMinutes: number;
  wuxingJuName?: string;
  mingMainStars?: string;
  aiReadings?: Record<string, string>;
  updatedAt?: string;
}

export const ziweiApiService = {
  async interpretChart(params: {
    chartSummary: string;
    topic?: string;
    messages?: ZiweiChatMessage[];
  }): Promise<{ reply: string; topic: string; provider?: string }> {
    const res = await fetch(`${API_BASE_URL}/ziwei/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.success) {
      throw new Error(
        payload.message || 'Không thể kết nối tới Đại Sư AI lúc này. Vui lòng thử lại sau giây lát.'
      );
    }
    return payload.data;
  },

  async analyzeHeming(params: {
    chartASummary: string;
    chartBSummary: string;
    question?: string;
  }): Promise<{ reply: string; provider?: string }> {
    const res = await fetch(`${API_BASE_URL}/ziwei/heming`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.success) {
      throw new Error(
        payload.message || 'Không thể phân tích Hợp Hôn lúc này. Vui lòng thử lại sau giây lát.'
      );
    }
    return payload.data;
  },

  async listRecords(token: string): Promise<SavedZiweiRecord[]> {
    const res = await fetch(`${API_BASE_URL}/ziwei/records`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Không thể tải danh sách lá số đã lưu.');
    }
    return payload.data || [];
  },

  async saveRecord(
    token: string,
    record: Omit<SavedZiweiRecord, '_id' | 'updatedAt'>
  ): Promise<SavedZiweiRecord> {
    const res = await fetch(`${API_BASE_URL}/ziwei/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(record),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Không thể lưu lá số.');
    }
    return payload.data;
  },

  async deleteRecord(token: string, id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/ziwei/records/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Không thể xóa lá số.');
    }
  },
};
