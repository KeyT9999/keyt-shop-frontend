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

