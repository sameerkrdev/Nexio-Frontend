/**
 * In-memory store for the pending payment intent.
 * Set before opening Phantom for signing, read after redirect.
 */
let pendingPaymentId: string | null = null;
let pendingRecipientUsername: string | null = null;
let pendingCurrency: string | null = null;

export const setPendingPayment = (
  paymentId: string,
  recipientUsername: string,
  currency: string
) => {
  pendingPaymentId = paymentId;
  pendingRecipientUsername = recipientUsername;
  pendingCurrency = currency;
};

export const getPendingPayment = () => ({
  paymentId: pendingPaymentId,
  recipientUsername: pendingRecipientUsername,
  currency: pendingCurrency,
});

export const clearPendingPayment = () => {
  pendingPaymentId = null;
  pendingRecipientUsername = null;
  pendingCurrency = null;
};
