export interface ServiceSubscription {
  _id: string;
  customerEmail: string;
  contactZalo?: string;
  contactInstagram?: string;
  serviceName: string;
  startDate: string;
  endDate: string;
  preExpiryNotified: boolean;
  manualReminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionImportResult {
  success: number;
  failed: number;
  errors: string[];
}

