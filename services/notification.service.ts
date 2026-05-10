import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NotificationData,
  NotificationSettings,
  NotificationType,
  StoredNotification,
} from "../types/notification.types";

const NOTIFICATION_STORAGE_KEY = "@nexio_notifications";
const NOTIFICATION_SETTINGS_KEY = "@nexio_notification_settings";
const PUSH_TOKEN_KEY = "@nexio_push_token";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification system
   * - Request permissions
   * - Configure Android channels
   * - Register for push notifications
   */
  async initialize(): Promise<string | null> {
    try {
      // Configure Android notification channels
      if (Platform.OS === "android") {
        await this.setupAndroidChannels();
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn("Notification permissions not granted");
        return null;
      }

      // Register for push notifications
      const token = await this.registerForPushNotifications();
      this.pushToken = token;

      // Store token locally
      if (token) {
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      }

      return token;
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
      return null;
    }
  }

  /**
   * Setup Android notification channels with high importance
   */
  private async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync("payment", {
      name: "Payment Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#10B981",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync("security", {
      name: "Security Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: "#EF4444",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync("general", {
      name: "General Notifications",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: "#3B82F6",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync("promotional", {
      name: "Promotional",
      importance: Notifications.AndroidImportance.LOW,
      sound: null,
      enableVibrate: false,
      showBadge: false,
    });
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Notification permission not granted");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  /**
   * Register for Expo push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn("Push notifications only work on physical devices");
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.warn("No Expo project ID found");
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId || undefined,
      });

      return tokenData.data;
    } catch (error) {
      console.error("Failed to get push token:", error);
      return null;
    }
  }

  /**
   * Get stored push token
   */
  async getPushToken(): Promise<string | null> {
    if (this.pushToken) return this.pushToken;

    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      this.pushToken = token;
      return token;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, string | number | boolean>,
    seconds: number = 0,
  ): Promise<string> {
    const channelId = this.getChannelId(data?.type as NotificationType);

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
        ...(Platform.OS === "android" && { channelId }),
      },
      trigger: seconds > 0 ? { seconds } : null,
    });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get notification channel based on type
   */
  private getChannelId(type?: NotificationType): string {
    switch (type) {
      case NotificationType.PAYMENT_SENT:
      case NotificationType.PAYMENT_RECEIVED:
      case NotificationType.PAYMENT_VERIFIED:
      case NotificationType.FIAT_PAYOUT_COMPLETED:
        return "payment";
      case NotificationType.SECURITY_ALERT:
      case NotificationType.KYC_REJECTED:
        return "security";
      case NotificationType.PROMOTIONAL:
        return "promotional";
      default:
        return "general";
    }
  }

  /**
   * Store notification locally
   */
  async storeNotification(notification: NotificationData): Promise<void> {
    try {
      const stored = await this.getStoredNotifications();
      const newNotification: StoredNotification = {
        ...notification,
        createdAt: new Date().toISOString(),
      };

      stored.unshift(newNotification);

      // Keep only last 100 notifications
      const trimmed = stored.slice(0, 100);

      await AsyncStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(trimmed),
      );
    } catch (error) {
      console.error("Error storing notification:", error);
    }
  }

  /**
   * Get all stored notifications
   */
  async getStoredNotifications(): Promise<StoredNotification[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting stored notifications:", error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      );
      await AsyncStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updated = notifications.map((n) => ({ ...n, read: true }));
      await AsyncStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const filtered = notifications.filter((n) => n.id !== notificationId);
      await AsyncStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(filtered),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getStoredNotifications();
      return notifications.filter((n) => !n.read).length;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  /**
   * Update badge count
   */
  async updateBadgeCount(count?: number): Promise<void> {
    try {
      const badgeCount =
        count !== undefined ? count : await this.getUnreadCount();
      await Notifications.setBadgeCountAsync(badgeCount);
    } catch (error) {
      console.error("Error updating badge count:", error);
    }
  }

  /**
   * Get notification settings
   */
  async getSettings(): Promise<NotificationSettings> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return data
        ? JSON.parse(data)
        : {
            enabled: true,
            paymentAlerts: true,
            securityAlerts: true,
            promotional: false,
            sound: true,
            vibration: true,
          };
    } catch (error) {
      console.error("Error getting notification settings:", error);
      return {
        enabled: true,
        paymentAlerts: true,
        securityAlerts: true,
        promotional: false,
        sound: true,
        vibration: true,
      };
    }
  }

  /**
   * Update notification settings
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
