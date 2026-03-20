import axios from 'axios';
import API_BASE_URL from '../config/api';
import type {
  AffiliateDashboardResponse,
  AdminAffiliateOverviewResponse,
  AdminAffiliateEarningsResponse,
  AdminAffiliateWithdrawalsResponse,
  AffiliateWithdrawal
} from '../types/affiliate';

const base = `${API_BASE_URL}/affiliate`;
const adminBase = `${API_BASE_URL}/admin/affiliate`;

export const affiliateService = {
  async getMyDashboard(): Promise<AffiliateDashboardResponse> {
    const { data } = await axios.get<AffiliateDashboardResponse>(`${base}/me`);
    return data;
  },

  async updateBankInfo(payload: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
  }): Promise<AffiliateDashboardResponse['profile']> {
    const { data } = await axios.put(`${base}/me/bank`, payload);
    return data.profile;
  },

  async requestWithdrawal(amount: number): Promise<{ message: string; withdrawal: AffiliateWithdrawal }> {
    const { data } = await axios.post(`${base}/withdrawals`, { amount });
    return data;
  },

  async getAdminOverview(token: string): Promise<AdminAffiliateOverviewResponse> {
    const { data } = await axios.get<AdminAffiliateOverviewResponse>(`${adminBase}/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },

  async getAdminEarnings(
    params: { status?: 'pending' | 'available' | 'void' | 'paid_out'; page?: number; limit?: number },
    token: string
  ): Promise<AdminAffiliateEarningsResponse> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    const { data } = await axios.get<AdminAffiliateEarningsResponse>(
      `${adminBase}/earnings${query.toString() ? `?${query.toString()}` : ''}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return data;
  },

  async getAdminWithdrawals(
    params: { status?: 'pending' | 'approved' | 'paid' | 'rejected'; page?: number; limit?: number },
    token: string
  ): Promise<AdminAffiliateWithdrawalsResponse> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    const { data } = await axios.get<AdminAffiliateWithdrawalsResponse>(
      `${adminBase}/withdrawals${query.toString() ? `?${query.toString()}` : ''}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return data;
  },

  async approveWithdrawal(withdrawalId: string, adminNote: string, token: string) {
    const { data } = await axios.put(
      `${adminBase}/withdrawals/${withdrawalId}/approve`,
      { adminNote },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  },

  async rejectWithdrawal(withdrawalId: string, adminNote: string, token: string) {
    const { data } = await axios.put(
      `${adminBase}/withdrawals/${withdrawalId}/reject`,
      { adminNote },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  },

  async markWithdrawalPaid(withdrawalId: string, adminNote: string, token: string) {
    const { data } = await axios.put(
      `${adminBase}/withdrawals/${withdrawalId}/pay`,
      { adminNote },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  }
};
