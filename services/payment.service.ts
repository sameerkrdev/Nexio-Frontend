import { apiClient } from "./api";

export type Currency = "SOL" | "USDT" | "USDC" | "LINK";

export interface FeeBreakdown {
  baseAmount: string;
  networkFee: string;
  networkFeeCurrency: "SOL";
  serviceFee: string;
  totalAmount: string;
  currency: Currency;
}

export interface CreatePaymentResponse {
  paymentId: string;
  recipientUsername: string;
  feeBreakdown: FeeBreakdown;
  transaction: string; // base64-encoded unsigned Solana transaction
  expiresAt: string;
}

export interface Payment {
  id: string;
  senderId: string;
  recipientUsername: string;
  recipientUserId: string;
  amount: string;
  totalAmount: string | null;
  currency: Currency;
  senderPublicKey: string;
  status: "pending" | "completed" | "failed" | "expired" | "cancelled";
  txHash: string | null;
  feeBreakdown: FeeBreakdown | null;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
  failureReason: string | null;
}

class PaymentService {
  /**
   * Step 1: Create payment intent — returns an unsigned transaction to sign
   */
  async createPayment(
    recipientUsername: string,
    amount: string,
    currency: Currency
  ): Promise<CreatePaymentResponse> {
    const response = await apiClient.post<CreatePaymentResponse>(
      "/payments/create",
      { recipientUsername, amount, currency },
      true // authenticated
    );
    return response.data!;
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      `/payments/${paymentId}/cancel`,
      {},
      true
    );
    return response.data!;
  }

  /**
   * Get a single payment by ID
   */
  async getPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(
      `/payments/${paymentId}`,
      true
    );
    return response.data!;
  }
}

export const paymentService = new PaymentService();
