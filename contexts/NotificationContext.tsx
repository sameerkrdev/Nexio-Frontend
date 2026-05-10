import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { notificationService } from "../services/notification.service";
import {
  NotificationData,
  NotificationSettings,
  StoredNotification,
} from "../types/notification.types";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  pushToken: string | null;
  notifications: StoredNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  showInAppNotification: (
    title: string,
    body: string,
    data?: Record<string, string | number | boolean>,
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    paymentAlerts: true,
    securityAlerts: true,
    promotional: false,
    sound: true,
    vibration: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { isAuthenticated, userId } = useAuth();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
    loadNotifications();
    loadSettings();

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Register push token when user logs in
  useEffect(() => {
    if (isAuthenticated && userId && pushToken) {
      registerPushTokenWithBackend(pushToken, userId);
    }
  }, [isAuthenticated, userId, pushToken]);

  /**
   * Initialize notification system
   */
  const initializeNotifications = async () => {
    try {
      const token = await notificationService.initialize();
      setPushToken(token);

      // Listen for notifications received while app is foregrounded
      notificationListener.current =
        Notifications.addNotificationReceivedListener(
          handleNotificationReceived,
        );

      // Listen for user tapping on notifications
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          handleNotificationResponse,
        );
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  };

  /**
   * Handle notification received (foreground)
   */
  const handleNotificationReceived = async (
    notification: Notifications.Notification,
  ) => {
    console.log("📬 Notification received:", notification);

    const notificationData: NotificationData = {
      id: notification.request.identifier,
      type: notification.request.content.data?.type,
      title: notification.request.content.title || "",
      body: notification.request.content.body || "",
      data: notification.request.content.data,
      timestamp: Date.now(),
      read: false,
    };

    // Store notification
    await notificationService.storeNotification(notificationData);

    // Refresh notifications list
    await loadNotifications();

    // Update badge
    await notificationService.updateBadgeCount();
  };

  /**
   * Handle notification tapped/opened
   */
  const handleNotificationResponse = async (
    response: Notifications.NotificationResponse,
  ) => {
    console.log("👆 Notification tapped:", response);

    const data = response.notification.request.content.data;
    const notificationId = response.notification.request.identifier;

    // Mark as read
    await notificationService.markAsRead(notificationId);
    await loadNotifications();

    // Handle deep linking based on notification type
    handleDeepLink(data);
  };

  /**
   * Handle deep linking from notification
   */
  const handleDeepLink = (data: Record<string, string | number | boolean>) => {
    if (!data) return;

    switch (data.type) {
      case "payment_sent":
      case "payment_received":
      case "payment_verified":
        if (data.paymentId) {
          router.push({
            pathname: "/transaction-detail",
            params: { id: data.paymentId },
          });
        } else {
          router.push("/activity");
        }
        break;

      case "fiat_payout_completed":
        if (data.withdrawalId) {
          router.push("/withdrawal-history");
        }
        break;

      case "transaction_failed":
        if (data.transactionId) {
          router.push({
            pathname: "/transaction-detail",
            params: { id: data.transactionId },
          });
        }
        break;

      case "wallet_connected":
        router.push("/profile");
        break;

      case "kyc_approved":
      case "kyc_rejected":
      case "security_alert":
        router.push("/profile");
        break;

      default:
        router.push("/home");
    }
  };

  /**
   * Load notifications from storage
   */
  const loadNotifications = async () => {
    try {
      const stored = await notificationService.getStoredNotifications();
      setNotifications(stored);

      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load notification settings
   */
  const loadSettings = async () => {
    try {
      const stored = await notificationService.getSettings();
      setSettings(stored);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  /**
   * Register push token with backend
   */
  const registerPushTokenWithBackend = async (
    token: string,
    userId: string,
  ) => {
    try {
      const { Platform } = await import("react-native");
      const deviceInfo = {
        platform: Platform.OS,
        deviceId: undefined, // Can be added with expo-device
        deviceName: undefined,
      };

      // Import the API service
      const { pushNotificationApiService } =
        await import("../services/push-notification-api.service");

      await pushNotificationApiService.registerPushToken(token, deviceInfo);
      console.log("Push token registered with backend successfully");
    } catch (error) {
      console.error("Failed to register push token:", error);
    }
  };

  /**
   * Refresh notifications
   */
  const refreshNotifications = async () => {
    await loadNotifications();
  };

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    await loadNotifications();
    await notificationService.updateBadgeCount();
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    await loadNotifications();
    await notificationService.updateBadgeCount(0);
  };

  /**
   * Delete a notification
   */
  const deleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    await loadNotifications();
    await notificationService.updateBadgeCount();
  };

  /**
   * Clear all notifications
   */
  const clearAll = async () => {
    await notificationService.clearAllNotifications();
    await loadNotifications();
    await notificationService.updateBadgeCount(0);
  };

  /**
   * Update notification settings
   */
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    await notificationService.updateSettings(newSettings);
    await loadSettings();
  };

  /**
   * Show in-app notification (toast)
   */
  const showInAppNotification = (
    title: string,
    body: string,
    data?: Record<string, string | number | boolean>,
  ) => {
    notificationService.scheduleLocalNotification(title, body, data);
  };

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        notifications,
        unreadCount,
        settings,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        updateSettings,
        showInAppNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
