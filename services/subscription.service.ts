import { apiClient } from "./api";

export interface SubscriptionStatus {
  isActive: boolean;
  expiresAt: string | null;
  plan: "free" | "premium";
  price: number;
  currency: string;
  durationDays: number;
}

export interface InitSubscriptionResponse {
  checkoutUrl: string;
  paymentId: string;
  /** Dodo's subscription_id — pass to verify() after the user returns. */
  subscriptionId: string;
  expiresAt: string | null;
  totalAmount: number;
}

export interface VerifySubscriptionResponse {
  status: string;
  isActive: boolean;
  expiresAt: string | null;
}

class SubscriptionService {
  /** GET /api/v1/subscriptions/me — current plan + pricing for the upsell screen. */
  async getStatus(): Promise<SubscriptionStatus> {
    const response = await apiClient.get<SubscriptionStatus>(
      "/subscriptions/me",
      true,
    );
    return response.data!;
  }

  /**
   * POST /api/v1/subscriptions/init — creates a Dodo hosted checkout for the
   * premium subscription. Open the returned checkoutUrl in the browser; on
   * payment success Dodo's webhook activates the subscription server-side.
   *
   * Optional `returnUrl` overrides Dodo's redirect target. Defaults server-side
   * to `myapp://subscription-success` so WebBrowser.openAuthSessionAsync can
   * catch the return and close the in-app browser automatically.
   */
  async initCheckout(params?: {
    returnUrl?: string;
  }): Promise<InitSubscriptionResponse> {
    const response = await apiClient.post<InitSubscriptionResponse>(
      "/subscriptions/init",
      params ?? {},
      true,
    );
    return response.data!;
  }

  /**
   * POST /api/v1/subscriptions/verify — fallback path for when the user
   * returns to the app before Dodo's `subscription.active` webhook lands.
   * Backend asks Dodo for the subscription's current state and activates the
   * user locally if it's active. Safe to call repeatedly (idempotent).
   */
  async verify(subscriptionId: string): Promise<VerifySubscriptionResponse> {
    const response = await apiClient.post<VerifySubscriptionResponse>(
      "/subscriptions/verify",
      { subscriptionId },
      true,
    );
    return response.data!;
  }
}

export const subscriptionService = new SubscriptionService();
