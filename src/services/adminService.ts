import axios from 'axios';
import type { AdminStats, UserOtpInfo, UserLoginHistoryResponse, OrderStats, OrdersListResponse, OrderFilters } from '../types/admin';
import type { Product } from '../types/product';
import type { Order } from '../types/profile';
import API_BASE_URL from '../config/api';

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

  /**
   * Get order statistics
   */
  async getOrderStats(token: string): Promise<OrderStats> {
    const response = await axios.get(`${API_BASE_URL}/admin/orders/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get all orders with filters, search, pagination
   */
  async getOrders(filters: OrderFilters, token: string): Promise<OrdersListResponse> {
    const params = new URLSearchParams();
    
    if (filters.orderStatus) params.append('orderStatus', filters.orderStatus);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.customerEmail) params.append('customerEmail', filters.customerEmail);
    if (filters.customerPhone) params.append('customerPhone', filters.customerPhone);
    if (filters.customerName) params.append('customerName', filters.customerName);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axios.get(`${API_BASE_URL}/admin/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, token: string): Promise<Order> {
    const response = await axios.get(`${API_BASE_URL}/admin/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Confirm order
   */
  async confirmOrder(orderId: string, token: string): Promise<{ message: string; order: Order }> {
    const response = await axios.put(`${API_BASE_URL}/admin/orders/${orderId}/confirm`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Start processing order
   */
  async startProcessingOrder(orderId: string, token: string): Promise<{ message: string; order: Order }> {
    const response = await axios.put(`${API_BASE_URL}/admin/orders/${orderId}/processing`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Complete order
   */
  async completeOrder(orderId: string, token: string): Promise<{ message: string; order: Order }> {
    const response = await axios.put(`${API_BASE_URL}/admin/orders/${orderId}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, token: string): Promise<{ message: string; order: Order }> {
    const response = await axios.put(`${API_BASE_URL}/admin/orders/${orderId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Update order (adminNotes, orderStatus, paymentStatus)
   */
  async updateOrder(
    orderId: string,
    data: { adminNotes?: string; orderStatus?: string; paymentStatus?: string },
    token: string
  ): Promise<{ message: string; order: Order }> {
    const response = await axios.put(`${API_BASE_URL}/admin/orders/${orderId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

};

