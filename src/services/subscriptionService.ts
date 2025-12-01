import axios from 'axios';
import type { ServiceSubscription, SubscriptionImportResult } from '../types/subscription';
import API_BASE_URL from '../config/api';

export const subscriptionService = {
  /**
   * Get all subscriptions with filters (Admin only)
   */
  async getAll(
    token: string,
    filters?: { q?: string; status?: string; before?: string }
  ): Promise<ServiceSubscription[]> {
    const params = new URLSearchParams();
    if (filters?.q) params.append('q', filters.q);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.before) params.append('before', filters.before);

    const response = await axios.get(
      `${API_BASE_URL}/subscriptions?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  /**
   * Create subscription (Admin only)
   */
  async create(
    data: {
      customerEmail: string;
      contactZalo?: string;
      contactInstagram?: string;
      serviceName: string;
      startDate: string;
      endDate: string;
    },
    token: string
  ): Promise<ServiceSubscription> {
    const response = await axios.post(
      `${API_BASE_URL}/subscriptions`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  /**
   * Update subscription (Admin only)
   */
  async update(
    id: string,
    data: Partial<ServiceSubscription>,
    token: string
  ): Promise<ServiceSubscription> {
    const response = await axios.put(
      `${API_BASE_URL}/subscriptions/${id}`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  /**
   * Delete subscription (Admin only)
   */
  async delete(id: string, token: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/subscriptions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  /**
   * Import subscriptions from text (Admin only)
   */
  async import(data: string, token: string): Promise<SubscriptionImportResult> {
    const response = await axios.post(
      `${API_BASE_URL}/subscriptions/import`,
      { data },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  /**
   * Send reminder for subscription (Admin only)
   */
  async sendReminder(id: string, token: string): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/subscriptions/${id}/send-reminder`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }
};

