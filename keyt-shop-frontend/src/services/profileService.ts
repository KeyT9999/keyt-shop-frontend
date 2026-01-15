import axios from 'axios';
import type {
  UserProfile,
  UpdateProfileData,
  ChangePasswordData,
  Order,
  UserActivity,
  LoginHistory,
  OrderFilters,
  OrdersListResponse,
  InvoiceData,
  OrderFeedbackData
} from '../types/profile';
import API_BASE_URL from '../config/api';

class ProfileService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await axios.get(`${API_BASE_URL}/user/profile`);
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<{ message: string; user: Partial<UserProfile> }> {
    const response = await axios.put(`${API_BASE_URL}/user/profile`, data);
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await axios.put(`${API_BASE_URL}/user/password`, data);
    return response.data;
  }

  /**
   * Get user's order history with filters, search, and sort
   */
  async getOrders(filters?: OrderFilters): Promise<OrdersListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.orderStatus) params.append('orderStatus', filters.orderStatus);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    const response = await axios.get(`${API_BASE_URL}/user/orders?${params.toString()}`);
    return response.data;
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await axios.get(`${API_BASE_URL}/user/orders/${orderId}`);
    return response.data;
  }

  /**
   * Get order invoice data
   */
  async getOrderInvoice(orderId: string): Promise<InvoiceData> {
    const response = await axios.get(`${API_BASE_URL}/user/orders/${orderId}/invoice`);
    return response.data;
  }

  /**
   * Submit feedback/review for an order item
   */
  async submitOrderFeedback(orderId: string, feedbackData: OrderFeedbackData): Promise<{ message: string; feedback: any }> {
    const response = await axios.post(`${API_BASE_URL}/user/orders/${orderId}/feedback`, feedbackData);
    return response.data;
  }

  /**
   * Get user activity (OTP requests)
   */
  async getActivity(): Promise<UserActivity> {
    const response = await axios.get(`${API_BASE_URL}/user/activity`);
    return response.data;
  }

  /**
   * Get user's login history
   */
  async getLoginHistory(): Promise<LoginHistory[]> {
    const response = await axios.get(`${API_BASE_URL}/user/login-history`);
    return response.data;
  }

  /**
   * Logout all devices
   */
  async logoutAll(): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/user/logout-all`);
    return response.data;
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_BASE_URL}/user/account`, {
      data: { password }
    });
    return response.data;
  }

  /**
   * Request password reset OTP
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    return response.data;
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { token });
    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, { email });
    return response.data;
  }

  /**
   * Get user's Gemini API key status
   */
  async getGeminiApiKeyStatus(): Promise<{ hasKey: boolean }> {
    const response = await axios.get(`${API_BASE_URL}/user/gemini-api-key`);
    return response.data;
  }

  /**
   * Save or update Gemini API key
   */
  async saveGeminiApiKey(apiKey: string): Promise<{ message: string }> {
    const response = await axios.put(`${API_BASE_URL}/user/gemini-api-key`, { apiKey });
    return response.data;
  }
}

export const profileService = new ProfileService();

