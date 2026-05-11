/**
 * In-memory store for the pending payment intent.
 * Set before opening Phantom for signing, read after redirect.
 */
export type PendingPaymentType = "platform" | "external";

let pendingPaymentId: string | null = null;
let pendingRecipientUsername: string | null = null;
let pendingCurrency: string | null = null;
let pendingType: PendingPaymentType = "platform";
let pendingRecipientDisplayName: string | null = null;

export const setPendingPayment = (
  paymentId: string,
  recipientUsername: string,
  currency: string,
  type: PendingPaymentType = "platform",
  recipientDisplayName?: string
) => {
  pendingPaymentId = paymentId;
  pendingRecipientUsername = recipientUsername;
  pendingCurrency = currency;
  pendingType = type;
  pendingRecipientDisplayName = recipientDisplayName ?? null;
};

export const getPendingPayment = () => ({
  paymentId: pendingPaymentId,
  recipientUsername: pendingRecipientUsername,
  currency: pendingCurrency,
  type: pendingType,
  recipientDisplayName: pendingRecipientDisplayName,
});

export const clearPendingPayment = () => {
  pendingPaymentId = null;
  pendingRecipientUsername = null;
  pendingCurrency = null;
  pendingType = "platform";
  pendingRecipientDisplayName = null;
};
