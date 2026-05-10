export enum NotificationType {
  PAYMENT_SENT = "payment_sent",
  PAYMENT_RECEIVED = "payment_received",
  PAYMENT_VERIFIED = "payment_verified",
  FIAT_PAYOUT_COMPLETED = "fiat_payout_completed",
  TRANSACTION_FAILED = "transaction_failed",
  WALLET_CONNECTED = "wallet_connected",
  KYC_APPROVED = "kyc_approved",
  KYC_REJECTED = "kyc_rejected",
  SECURITY_ALERT = "security_alert",
  PROMOTIONAL = "promotional",
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string | number | boolean>;
  timestamp: number;
  read: boolean;
  imageUrl?: string;
}

export interface PushNotificationPayload {
  to: string | string[]; // Expo push token(s)
  sound?: "default" | null;
  title: string;
  body: string;
  data?: Record<string, string | number | boolean>;
  badge?: number;
  channelId?: string;
  priority?: "default" | "normal" | "high" | "max";
  subtitle?: string;
  categoryId?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  paymentAlerts: boolean;
  securityAlerts: boolean;
  promotional: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface StoredNotification extends NotificationData {
  createdAt: string;
}
