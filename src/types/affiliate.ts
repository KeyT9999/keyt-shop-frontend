export interface AffiliateProfile {
  _id: string;
  referralCode: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  availableBalance: number;
  pendingBalance: number;
  reservedBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateEarning {
  _id: string;
  orderId: string;
  orderCode?: number;
  itemIndex: number;
  segmentIndex: number;
  productId: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  currency: string;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'available' | 'void' | 'paid_out';
  paidOutAt?: string | null;
  availableAt?: string | null;
  voidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateWithdrawal {
  _id: string;
  amount: number;
  currency: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  adminNote?: string;
  approvedAt?: string | null;
  paidAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateDashboardResponse {
  minimumWithdrawalAmount: number;
  profile: AffiliateProfile;
  earnings: AffiliateEarning[];
  withdrawals: AffiliateWithdrawal[];
}

export interface AdminAffiliateUserSummary {
  _id: string;
  username?: string;
  email?: string;
  displayName?: string | null;
}

export interface AdminAffiliateOverviewResponse {
  stats: {
    totalGenerated: number;
    totalPaidOut: number;
    totalPending: number;
    totalAvailable: number;
    pendingWithdrawals: number;
  };
  topAffiliates: Array<
    AffiliateProfile & {
      userId: AdminAffiliateUserSummary | string;
    }
  >;
  recentEarnings: Array<
    AffiliateEarning & {
      referrerUserId?: AdminAffiliateUserSummary | string;
      buyerUserId?: AdminAffiliateUserSummary | string;
    }
  >;
  recentWithdrawals: Array<
    AffiliateWithdrawal & {
      userId?: AdminAffiliateUserSummary | string;
      processedBy?: AdminAffiliateUserSummary | string;
    }
  >;
}

export interface AdminAffiliateEarningsResponse {
  earnings: Array<
    AffiliateEarning & {
      referrerUserId?: AdminAffiliateUserSummary | string;
      buyerUserId?: AdminAffiliateUserSummary | string;
      withdrawalId?: {
        _id?: string;
        status?: string;
        paidAt?: string | null;
        amount?: number;
      } | string;
    }
  >;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminAffiliateWithdrawalsResponse {
  withdrawals: Array<
    AffiliateWithdrawal & {
      userId?: AdminAffiliateUserSummary | string;
      processedBy?: AdminAffiliateUserSummary | string;
    }
  >;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
