import type { GymServerProfilePayload } from '../types/gym';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const gymSyncService = {
  async fetchProfile(token: string): Promise<GymServerProfilePayload | null> {
    const res = await fetch(`${API_BASE_URL}/gym/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Không thể tải hồ sơ lịch tập (${res.status}).`);
    }

    const body = (await res.json()) as ApiEnvelope<GymServerProfilePayload | null>;
    return body.data ?? null;
  },

  async saveProfile(
    token: string,
    payload: Omit<GymServerProfilePayload, 'updatedAt'>
  ): Promise<GymServerProfilePayload | null> {
    const res = await fetch(`${API_BASE_URL}/gym/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Không thể đồng bộ lịch tập lên máy chủ (${res.status}).`);
    }

    const body = (await res.json()) as ApiEnvelope<GymServerProfilePayload | null>;
    return body.data ?? null;
  },
};
