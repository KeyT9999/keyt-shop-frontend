import axios from 'axios';
import API_BASE_URL from '../config/api';

export type AnnouncementDto = {
  _id: string;
  title?: string;
  message: string;
  isActive: boolean;
  updatedAt?: string;
} | null;

export type AnnouncementUpdatePayload = {
  title?: string;
  message: string;
  isActive: boolean;
};

export const announcementService = {
  async getActiveAnnouncement(token: string): Promise<AnnouncementDto> {
    const response = await axios.get(`${API_BASE_URL}/announcements/active`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getAdminCurrent(token: string): Promise<AnnouncementDto> {
    const response = await axios.get(`${API_BASE_URL}/announcements/admin/current`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateAdminCurrent(payload: AnnouncementUpdatePayload, token: string): Promise<{
    message: string;
    announcement: NonNullable<AnnouncementDto>;
  }> {
    const response = await axios.put(`${API_BASE_URL}/announcements/admin/current`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

