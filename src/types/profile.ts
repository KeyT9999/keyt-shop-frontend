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
  }>;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  note?: string;
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

