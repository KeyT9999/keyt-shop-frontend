import axios from 'axios';
import type { ChatGptAccount, OtpResponse } from '../types/chatgpt';

const API_BASE_URL = 'http://localhost:5000/api';

export const chatgptService = {
  /**
   * Get OTP for ChatGPT email
   */
  async getOtp(chatgptEmail: string, token: string): Promise<OtpResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/chatgpt/get-otp`,
      { chatgptEmail },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  /**
   * Get all ChatGPT accounts (Admin only)
   */
  async getAllAccounts(token: string): Promise<ChatGptAccount[]> {
    const response = await axios.get(`${API_BASE_URL}/chatgpt/accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Add ChatGPT account (Admin only)
   */
  async addAccount(
    chatgptEmail: string,
    secretKey: string,
    token: string
  ): Promise<{ account: ChatGptAccount; otp: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/chatgpt/accounts`,
      { chatgptEmail, secretKey },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  /**
   * Update ChatGPT account (Admin only)
   */
  async updateAccount(
    id: string,
    data: { chatgptEmail?: string; secretKey?: string },
    token: string
  ): Promise<{ account: ChatGptAccount; otp: string }> {
    const response = await axios.put(
      `${API_BASE_URL}/chatgpt/accounts/${id}`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  /**
   * Delete ChatGPT account (Admin only)
   */
  async deleteAccount(id: string, token: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/chatgpt/accounts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

