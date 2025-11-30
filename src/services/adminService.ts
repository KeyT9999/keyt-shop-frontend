import axios from 'axios';
import type { AdminStats, UserOtpInfo, UserLoginHistoryResponse } from '../types/admin';
import type { Product } from '../types/product';

const API_BASE_URL = 'http://localhost:5000/api';

export const adminService = {
  /**
   * Get admin dashboard stats
   */
  async getDashboardStats(token: string): Promise<AdminStats> {
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get user login history
   */
  async getUserLoginHistory(userId: string, token: string): Promise<UserLoginHistoryResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/admin/user-login-history/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  /**
   * Get OTP requests stats
   */
  async getOtpRequests(token: string): Promise<UserOtpInfo[]> {
    const response = await axios.get(`${API_BASE_URL}/admin/otp-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get all users with OTP info
   */
  async getUsers(token: string): Promise<{
    users: Array<{
      _id: string;
      username: string;
      email: string;
      admin: boolean;
    }>;
    otpInfoMap: Record<string, UserOtpInfo>;
  }> {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Create new user
   */
  async createUser(
    userData: { username: string; email: string; password: string; admin?: boolean },
    token: string
  ): Promise<{ message: string; user: { _id: string; username: string; email: string; admin: boolean } }> {
    const response = await axios.post(`${API_BASE_URL}/admin/users`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    userData: { username?: string; email?: string; password?: string; admin?: boolean },
    token: string
  ): Promise<{ message: string; user: { _id: string; username: string; email: string; admin: boolean } }> {
    const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(userId: string, token: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get all products
   */
  async getProducts(token: string): Promise<Product[]> {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Create new product
   */
  async createProduct(
    productData: Partial<Product>,
    token: string
  ): Promise<{ message: string; product: Product }> {
    if (!token) {
      throw new Error('Token không tồn tại. Vui lòng đăng nhập lại.');
    }
    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    productData: Partial<Product>,
    token: string
  ): Promise<{ message: string; product: Product }> {
    if (!token) {
      throw new Error('Token không tồn tại. Vui lòng đăng nhập lại.');
    }
    const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  /**
   * Delete product
   */
  async deleteProduct(productId: string, token: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_BASE_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get all categories
   */
  async getCategories(token: string): Promise<Array<{ _id: string; name: string; description?: string }>> {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Create new category
   */
  async createCategory(
    categoryData: { name: string; description?: string },
    token: string
  ): Promise<{ message: string; category: { _id: string; name: string; description?: string } }> {
    const response = await axios.post(`${API_BASE_URL}/categories`, categoryData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Delete category
   */
  async deleteCategory(categoryId: string, token: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

};

