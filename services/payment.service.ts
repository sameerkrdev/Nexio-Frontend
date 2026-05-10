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
  senderUsername?: string; // Username of the sender
  recipientUsername: string;
  recipientUserId: string;
  cryptoType: string;
  cryptoAmount: string;
  platformFeeAmount: string;
  platformFeeCrypto: string;
  totalCryptoAmount: string;
  senderCurrency: string;
  senderCurrencyAmount: string;
  receiverCurrency: string;
  receiverCurrencyAmount: string;
  cryptoToSenderRate: string;
  senderToReceiverRate: string;
  platformFeePercent: string;
  rateSource: string;
  rateSnapshotAt: string;
  senderPublicKey: string;
  status: "pending" | "completed" | "failed" | "expired" | "cancelled";
  txHash: string | null;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
  failureReason: string | null;
}

export interface PaymentQuote {
  cryptoType: string;
  cryptoPriceInSenderCurrency: string;
  senderCurrency: string;
  receiverCurrency: string;
  senderToReceiverRate: string;
  platformFeePercent: string;
  rateSource: string;
  quoteExpiresIn: number;
}

export interface CreatePaymentParams {
  recipientUsername: string;
  senderCurrencyAmount: string; // The fiat amount sender wants to send
  senderCurrency: string; // e.g., "INR", "USD"
  receiverCurrency: string; // e.g., "INR", "USD"
  cryptoType: Currency; // e.g., "SOL", "USDC"
  cryptoToSenderRate: number; // Current rate: 1 crypto = X fiat
  senderToReceiverRate: number; // Fiat conversion rate from quote
  platformFeePercent: string; // e.g., "1.5"
}

class PaymentService {
  /**
   * Get a payment quote with live rates from the backend
   * This should be called BEFORE creating a payment to get accurate rates
   */
  async getQuote(
    recipientUsername: string,
    cryptoType: Currency,
    senderCurrency: string,
  ): Promise<PaymentQuote> {
    const response = await apiClient.get<PaymentQuote>(
      `/payments/quote?crypto=${cryptoType}&senderCurrency=${senderCurrency}&receiverUsername=${recipientUsername}`,
      true, // authenticated
    );
    return response.data!;
  }

  /**
   * Step 1: Create payment intent — returns an unsigned transaction to sign
   *
   * This method calculates all required amounts and rates before sending to backend:
   * - cryptoAmount: base amount in crypto (senderCurrencyAmount / cryptoToSenderRate)
   * - platformFeeAmount: fee in fiat (senderCurrencyAmount * platformFeePercent / 100)
   * - platformFeeCrypto: fee in crypto (platformFeeAmount / cryptoToSenderRate)
   * - totalCryptoAmount: total crypto to deduct (cryptoAmount + platformFeeCrypto)
   * - receiverCurrencyAmount: amount recipient receives (same as senderCurrencyAmount if same currency)
   */
  async createPayment(
    params: CreatePaymentParams,
  ): Promise<CreatePaymentResponse> {
    const {
      recipientUsername,
      senderCurrencyAmount,
      senderCurrency,
      receiverCurrency,
      cryptoType,
      cryptoToSenderRate,
      senderToReceiverRate,
      platformFeePercent,
    } = params;

    // Parse inputs
    const senderAmount = parseFloat(senderCurrencyAmount);
    const cryptoRate = cryptoToSenderRate;
    const fiatRate = senderToReceiverRate;
    const feePercent = parseFloat(platformFeePercent);

    // Calculate amounts with higher precision to match backend
    // Backend uses Decimal.js with full precision, so we minimize rounding

    // Calculate platform fee in fiat (keep full precision until final step)
    const platformFeeAmountRaw = (senderAmount * feePercent) / 100;
    const platformFeeAmount = platformFeeAmountRaw.toFixed(2);

    // Calculate crypto amount (base amount without fee)
    const cryptoAmountRaw = senderAmount / cryptoRate;
    const cryptoAmount = cryptoAmountRaw.toFixed(9);

    // Calculate platform fee in crypto (use raw fee amount for precision)
    const platformFeeCryptoRaw = platformFeeAmountRaw / cryptoRate;
    const platformFeeCrypto = platformFeeCryptoRaw.toFixed(9);

    // Calculate total crypto amount (use raw values to avoid compounding rounding)
    const totalCryptoAmountRaw = cryptoAmountRaw + platformFeeCryptoRaw;
    const totalCryptoAmount = totalCryptoAmountRaw.toFixed(9);

    // Calculate receiver amount using the fiat conversion rate from quote
    const receiverCurrencyAmountRaw = senderAmount * fiatRate;
    const receiverCurrencyAmount = receiverCurrencyAmountRaw.toFixed(2);

    const response = await apiClient.post<CreatePaymentResponse>(
      "/payments/initiate",
      {
        recipientUsername,
        cryptoType: cryptoType.toUpperCase(),
        cryptoAmount,
        platformFeeAmount,
        platformFeeCrypto,
        totalCryptoAmount,
        senderCurrency: senderCurrency.toUpperCase(),
        senderCurrencyAmount,
        receiverCurrency: receiverCurrency.toUpperCase(),
        receiverCurrencyAmount,
        cryptoToSenderRate: cryptoRate.toString(),
        senderToReceiverRate: fiatRate.toString(),
        platformFeePercent: platformFeePercent,
      },
      true, // authenticated
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
      true,
    );
    return response.data!;
  }

  /**
   * Get a single payment by ID
   */
  async getPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(
      `/payments/${paymentId}`,
      true,
    );
    return response.data!;
  }

  /**
   * Broadcast a signed transaction to Solana network
   * Note: In production, this should be done directly from client using @solana/web3.js
   * For now, we rely on Phantom's automatic broadcast after signing
   * @param signedTxBase64 - Base64 encoded signed transaction from Phantom
   * @returns Transaction signature
   */
  async broadcastTransaction(signedTxBase64: string): Promise<string> {
    const response = await apiClient.post<{ signature: string }>(
      "/payments/broadcast",
      { signedTransaction: signedTxBase64 },
      true,
    );
    return response.data!.signature;
  }

  /**
   * Get payment history for the current user
   * Returns all payments where user is either sender or recipient
   */
  async getPaymentHistory(
    page: number = 1,
    limit: number = 20,
    status?: "pending" | "completed" | "failed" | "expired" | "cancelled",
  ): Promise<{
    data: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let url = `/payments/history?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await apiClient.get<{
      data: Payment[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(url, true);

    // Backend returns { success: true, data: [...], total, page, limit, totalPages }
    // So response.data contains the whole object
    return response.data!;
  }
}

export const paymentService = new PaymentService();
