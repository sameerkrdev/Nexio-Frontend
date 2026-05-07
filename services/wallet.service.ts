import { apiClient } from "./api";

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: "credit" | "debit";
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  status: "pending" | "completed" | "failed" | "reversed";
  reason:
    | "payment_received"
    | "withdrawal_initiated"
    | "withdrawal_refunded"
    | "fee_charged"
    | "admin_credit"
    | "admin_debit"
    | "reversal";
  title: string;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  counterpartyId: string | null;
  counterpartyUsername: string | null;
  counterpartyName: string | null;
  metadata: any;
  createdAt: string;
}

export interface WalletTransactionsResponse {
  data: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class WalletService {
  /**
   * Get wallet transactions with pagination
   */
  async getTransactions(
    page: number = 1,
    limit: number = 20,
  ): Promise<WalletTransactionsResponse> {
    const response = await apiClient.get<WalletTransactionsResponse>(
      `/wallet/transactions?page=${page}&limit=${limit}`,
      true, // authenticated
    );
    return response.data!;
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(transactionId: string): Promise<WalletTransaction> {
    const response = await apiClient.get<WalletTransaction>(
      `/wallet/transactions/${transactionId}`,
      true,
    );
    return response.data!;
  }
}

export const walletService = new WalletService();
