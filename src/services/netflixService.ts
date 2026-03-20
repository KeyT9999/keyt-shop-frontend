import axios from 'axios';
import API_BASE_URL from '../config/api';
import type { NetflixReplacementTicketSummary } from '../types/profile';

export interface RegenLinkResponse {
  success: boolean;
  pcLoginLink?: string;
  mobileLoginLink?: string;
  tokenExpires?: number;
  usedFallback?: boolean;
}

export interface ProvisionReplacementResponse {
  success: boolean;
  pcLoginLink?: string;
  mobileLoginLink?: string;
  tokenExpires?: number;
  cookie?: string;
}

const base = `${API_BASE_URL}/netflix`;

export const netflixService = {
  async regenLink(orderId: string, itemIndex: number, slotIndex: number): Promise<RegenLinkResponse> {
    const { data } = await axios.post<RegenLinkResponse>(
      `${base}/orders/${orderId}/items/${itemIndex}/slots/${slotIndex}/regen-link`
    );
    return data;
  },

  async createReplacementRequest(
    orderId: string,
    itemIndex: number,
    slotIndex: number,
    evidence: string
  ): Promise<{ success: boolean; ticketId: string; status: string }> {
    const { data } = await axios.post(`${base}/replacement-request`, {
      orderId,
      itemIndex,
      slotIndex,
      evidence
    });
    return data;
  },

  async provisionReplacement(ticketId: string): Promise<ProvisionReplacementResponse> {
    const { data } = await axios.post<ProvisionReplacementResponse>(`${base}/provision-replacement`, {
      ticketId
    });
    return data;
  },

  async listMyTickets(): Promise<{ tickets: NetflixReplacementTicketSummary[] }> {
    const { data } = await axios.get<{ tickets: NetflixReplacementTicketSummary[] }>(
      `${base}/replacement-tickets/me`
    );
    return data;
  }
};
