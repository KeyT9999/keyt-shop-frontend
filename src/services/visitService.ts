import axios from 'axios';
import API_BASE_URL from '../config/api';
import type { VisitStats } from '../types/visit';

export const visitService = {
  /**
   * Track a visit (called when page loads)
   */
  async trackVisit(userId?: string | null): Promise<void> {
    try {
      const path = window.location.pathname;
      const referrer = document.referrer || '';
      
      await axios.post(`${API_BASE_URL}/visits/track`, {
        path,
        referrer,
        userId: userId || null
      });
    } catch (err) {
      // Silently fail - don't break the app if tracking fails
      console.warn('Failed to track visit:', err);
    }
  },

  /**
   * Get visit statistics by period (Admin only)
   */
  async getVisitStats(token: string, period: '1m' | '2m' | '3m' | '6m' | '1y'): Promise<VisitStats> {
    const response = await axios.get(`${API_BASE_URL}/visits/stats`, {
      params: { period },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
