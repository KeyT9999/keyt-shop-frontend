export interface AdminStats {
  chatGptAccounts: {
    total: number;
  };
  subscriptions: {
    total: number;
    active: number;
    expired: number;
    endingTomorrow: number;
    endingToday: number;
  };
  otpRequests: {
    totalUsers: number;
    totalRequests: number;
  };
}

export interface UserOtpInfo {
  user: {
    _id: string;
    username: string;
    email: string;
  };
  count: number;
  lastRequest: string;
}

export interface UserLoginHistory {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  ipAddress: string;
  userAgent?: string;
  loginTime: string;
  createdAt: string;
}

export interface UserLoginHistoryResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    admin: boolean;
  };
  history: UserLoginHistory[];
  first2Ips: string[];
  distinctIpCount: number;
}

// Import Order type from profile
import type { Order } from './profile';

export interface OrderStats {
  todayOrders: number;
  pendingConfirmation: number;
  processing: number;
  todayRevenue: number;
  monthRevenue: number;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderFilters {
  orderStatus?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  search?: string;
  startDate?: string;
  endDate?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

