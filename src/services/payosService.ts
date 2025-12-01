import axios from 'axios';
import { useAuthContext } from '../context/useAuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

export interface PaymentLinkResponse {
  success: boolean;
  checkoutUrl: string;
  qrCode: string;
  paymentLinkId: string;
}

export interface PaymentInfoResponse {
  success: boolean;
  order: {
    _id: string;
    status: string;
    checkoutUrl: string | null;
    qrCode: string | null;
  };
  paymentInfo: {
    id: string;
    orderCode: number;
    amount: number;
    amountPaid: number;
    amountRemaining: number;
    status: string;
    createdAt: string;
    transactions?: Array<{
      amount: number;
      description: string;
      accountNumber: string;
      reference: string;
      transactionDateTime: string;
    }>;
  } | null;
}

class PayOSService {
  /**
   * Create payment link for an order
   * @param orderId - Order ID
   * @param token - Authentication token
   */
  async createPaymentLink(orderId: string, token: string): Promise<PaymentLinkResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/payos/create-payment`,
      { orderId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }

  /**
   * Get payment information for an order
   * @param orderId - Order ID
   * @param token - Authentication token
   */
  async getPaymentInfo(orderId: string, token: string): Promise<PaymentInfoResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/payos/payment-info/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
}

export const payosService = new PayOSService();

