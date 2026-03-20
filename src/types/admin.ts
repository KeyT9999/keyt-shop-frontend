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
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminNetflixReplacementTicket {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  consumed: boolean;
  evidence: string;
  decisionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  itemIndex: number;
  slotIndex: number;
  requester: {
    _id: string;
    username: string;
    email: string;
  } | null;
  handledBy: {
    _id: string;
    username: string;
    email: string;
  } | null;
  order: {
    _id: string;
    orderCode?: number;
    orderStatus?: Order['orderStatus'];
    paymentStatus?: Order['paymentStatus'];
    totalAmount?: number;
    createdAt?: string;
    customer?: Order['customer'];
  };
  item: {
    index: number;
    name: string;
    quantity: number;
    price: number;
    currency: string;
  } | null;
  slot: {
    index: number;
    logId?: string;
    cookieNumber?: number;
    provisionStatus?: 'pending' | 'ok' | 'failed';
    tokenExpires?: number;
    provisionedAt?: string | null;
    lastRegenAt?: string | null;
    regenFallbackCount?: number;
    pcLoginLink?: string;
    mobileLoginLink?: string;
  } | null;
}

export interface AdminNetflixReplacementTicketsResponse {
  tickets: AdminNetflixReplacementTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
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

