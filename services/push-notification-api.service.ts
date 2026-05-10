import { apiClient } from "./api";
import { PushNotificationPayload } from "../types/notification.types";

class PushNotificationApiService {
  /**
   * Register device push token with backend
   */
  async registerPushToken(
    token: string,
    deviceInfo?: {
      platform: string;
      deviceId?: string;
      deviceName?: string;
    },
  ): Promise<void> {
    try {
      await apiClient.post("/notifications/register-token", {
        pushToken: token,
        ...deviceInfo,
      });
    } catch (error) {
      console.error("Failed to register push token:", error);
      throw error;
    }
  }

  /**
   * Unregister device push token
   */
  async unregisterPushToken(token: string): Promise<void> {
    try {
      await apiClient.post("/notifications/unregister-token", {
        pushToken: token,
      });
    } catch (error) {
      console.error("Failed to unregister push token:", error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: {
    paymentAlerts?: boolean;
    securityAlerts?: boolean;
    promotional?: boolean;
  }): Promise<void> {
    try {
      await apiClient.put("/notifications/preferences", preferences);
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
      throw error;
    }
  }

  /**
   * Get notification history from backend
   */
  async getNotificationHistory(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.get("/notifications/history", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get notification history:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read on backend
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }

  /**
   * Test notification (for development)
   */
  async sendTestNotification(type: string): Promise<void> {
    try {
      await apiClient.post("/notifications/test", { type });
    } catch (error) {
      console.error("Failed to send test notification:", error);
      throw error;
    }
  }
}

export const pushNotificationApiService = new PushNotificationApiService();
