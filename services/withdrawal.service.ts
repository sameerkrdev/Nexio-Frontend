import { apiClient } from "./api";

export type WithdrawalMethod =
  | "UPI"
  | "BANK_TRANSFER"
  | "IMPS"
  | "NEFT"
  | "ZELLE"
  | "ACH"
  | "WIRE"
  | "FASTER_PAYMENTS"
  | "SEPA"
  | "SEPA_INSTANT"
  | "PAYNOW"
  | "FAST"
  | "ZENGIN"
  | "OSKO"
  | "NPP"
  | "INTERAC"
  | "EFT";

export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export interface WithdrawalMethodInfo {
  method: WithdrawalMethod;
  label: string;
  description: string;
  estimatedTime: string;
  fee: string | null;
  minAmount: string | null;
  maxAmount: string | null;
  isMocked: boolean;
  isAvailableForUser: boolean;
}

export interface AvailableMethodsResponse {
  countryCode: string;
  currency: string;
  isMocked: boolean;
  defaultMethod: WithdrawalMethod;
  methods: WithdrawalMethodInfo[];
  availableMethods: WithdrawalMethodInfo[];
}

export interface WithdrawalAccount {
  id: string;
  method: WithdrawalMethod;
  displayName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  amount: string;
  feeAmount: string;
  netAmount: string;
  currency: string;
  method: WithdrawalMethod;
  status: WithdrawalStatus;
  destination: string | null;
  estimatedArrival: string;
  isMocked: boolean;
  providerReference: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateWithdrawalAccountInput {
  method: WithdrawalMethod;
  nickname?: string;
  // UPI
  upiId?: string;
  // Bank Transfer (India)
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  bankName?: string;
  // ACH (US)
  routingNumber?: string;
  accountType?: "checking" | "savings";
  // Zelle
  zelleEmail?: string;
  zellePhone?: string;
  // SEPA
  iban?: string;
  // Faster Payments (UK)
  sortCode?: string;
  // Zengin (Japan)
  bankCode?: string;
  branchCode?: string;
  // PayNow/FAST (Singapore)
  paynowId?: string;
  // Interac (Canada)
  email?: string;
  // EFT (Canada)
  transitNumber?: string;
  institutionNumber?: string;
  // Osko/NPP (Australia)
  bsb?: string;
}

class WithdrawalService {
  async getAvailableMethods(): Promise<AvailableMethodsResponse> {
    const response = await apiClient.get<AvailableMethodsResponse>(
      "/withdrawals/methods",
      true,
    );
    return response.data!;
  }

  async listAccounts(): Promise<WithdrawalAccount[]> {
    const response = await apiClient.get<WithdrawalAccount[]>(
      "/withdrawal-accounts",
      true,
    );
    // Backend returns { success: true, accounts: [...] }
    // But TypeScript expects the generic type, so we need to cast
    const responseData = response as any;
    return responseData.accounts || [];
  }

  async addAccount(
    input: CreateWithdrawalAccountInput,
  ): Promise<WithdrawalAccount> {
    const response = await apiClient.post<WithdrawalAccount>(
      "/withdrawal-accounts",
      input,
      true,
    );
    return response.data!;
  }

  async setDefaultAccount(accountId: string): Promise<WithdrawalAccount> {
    const response = await apiClient.patch<WithdrawalAccount>(
      `/withdrawal-accounts/${accountId}/default`,
      {},
      true,
    );
    return response.data!;
  }

  async removeAccount(accountId: string): Promise<void> {
    await apiClient.delete(`/withdrawal-accounts/${accountId}`, true);
  }

  async createWithdrawal(
    accountId: string,
    amount: number,
    note?: string,
  ): Promise<Withdrawal> {
    const response = await apiClient.post<Withdrawal>(
      "/withdrawals",
      { accountId, amount, note },
      true,
    );
    return response.data!;
  }

  async listWithdrawals(
    page = 1,
    limit = 20,
    status?: WithdrawalStatus,
  ): Promise<{
    data: Withdrawal[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let url = `/withdrawals?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get<{
      data: Withdrawal[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(url, true);
    // Backend returns { success: true, data: [...], total, page, limit, totalPages }
    // The data is at the top level, not nested under response.data
    const responseData = response as any;
    return {
      data: responseData.data || [],
      total: responseData.total || 0,
      page: responseData.page || 1,
      limit: responseData.limit || 20,
      totalPages: responseData.totalPages || 1,
    };
  }

  async getWithdrawalById(id: string): Promise<Withdrawal> {
    const response = await apiClient.get<Withdrawal>(
      `/withdrawals/${id}`,
      true,
    );
    return response.data!;
  }

  async cancelWithdrawal(id: string): Promise<Withdrawal> {
    const response = await apiClient.post<{ withdrawal: Withdrawal }>(
      `/withdrawals/${id}/cancel`,
      {},
      true,
    );
    return response.data!.withdrawal;
  }
}

export const withdrawalService = new WithdrawalService();
