export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  displayName?: string | null;
  avatar?: string | null;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  } | null;
  loginType: 'login-common' | 'login-google';
  admin: boolean;
  geminiApiKey?: string | null;
  settings: {
    notifications?: {
      email?: boolean;
      promotions?: boolean;
    };
    theme?: 'light' | 'dark';
    language?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  email?: string;
  phone?: string | null;
  displayName?: string | null;
  avatar?: string | null;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  } | null;
  settings?: {
    notifications?: {
      email?: boolean;
      promotions?: boolean;
    };
    theme?: 'light' | 'dark';
    language?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface Order {
  _id: string;
  userId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
    requiredFieldsData?: Array<{
      label: string;
      value: string;
    }>;
    feedback?: {
      rating: number;
      comment: string;
      createdAt: string;
    };
  }>;
  totalAmount: number;
  // Order status - workflow của đơn hàng
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  // Payment status - trạng thái thanh toán (tách riêng với order status)
  paymentStatus: 'pending' | 'paid' | 'failed';
  // Backward compatibility - giữ field cũ (optional)
  status?: 'pending' | 'paid' | 'cancelled';
  note?: string;
  // Admin management fields
  confirmedAt?: string;
  confirmedBy?: {
    _id: string;
    username: string;
    email: string;
  } | string;
  processingAt?: string;
  completedAt?: string;
  adminNotes?: string;
  // PayOS payment fields
  payosOrderCode?: number;
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpRequest {
  id: string;
  chatgptEmail: string;
  requestedAt: string;
}

export interface UserActivity {
  otpRequests: OtpRequest[];
}

export interface LoginHistory {
  id: string;
  ipAddress: string;
  userAgent?: string;
  loginTime: string;
}

export interface OrderFilters {
  orderStatus?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | '';
  paymentStatus?: 'pending' | 'paid' | 'failed' | '';
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'date' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceData {
  invoice: {
    orderId: string;
    orderNumber: string;
    createdAt: string;
    customer: Order['customer'];
    items: Order['items'];
    totalAmount: number;
    currency: string;
    orderStatus: Order['orderStatus'];
    paymentStatus: Order['paymentStatus'];
    note?: string;
    adminNotes?: string;
    confirmedAt?: string;
    processingAt?: string;
    completedAt?: string;
    confirmedBy?: Order['confirmedBy'];
  };
}

export interface OrderFeedbackData {
  productId: string;
  rating: number;
  comment?: string;
}

