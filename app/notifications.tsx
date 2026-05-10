import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "../components/notifications/NotificationItem";
import { StoredNotification } from "../types/notification.types";

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: StoredNotification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.paymentId) {
      router.push({
        pathname: "/transaction-detail",
        params: { id: notification.data.paymentId },
      });
    } else if (notification.data?.withdrawalId) {
      router.push("/withdrawal-history");
    }
  };

  const handleDelete = async (notificationId: string) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNotification(notificationId),
        },
      ],
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: clearAll,
        },
      ],
    );
  };

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const groupedNotifications = groupByDate(filteredNotifications);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">
              Notifications
            </Text>
          </View>

          <View className="flex-row items-center space-x-2">
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllAsRead}
                className="px-3 py-2 bg-blue-50 rounded-lg"
              >
                <Text className="text-blue-600 text-sm font-medium">
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleClearAll}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setFilter("all")}
            className={`px-4 py-2 rounded-full ${
              filter === "all" ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filter === "all" ? "text-white" : "text-gray-600"
              }`}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("unread")}
            className={`px-4 py-2 rounded-full ${
              filter === "unread" ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filter === "unread" ? "text-white" : "text-gray-600"
              }`}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Ionicons name="notifications-off" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 text-lg font-semibold mb-2">
              No notifications
            </Text>
            <Text className="text-gray-500 text-center px-8">
              {filter === "unread"
                ? "You're all caught up!"
                : "You'll see notifications here when you receive them"}
            </Text>
          </View>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <View key={date}>
              <View className="px-4 py-2 bg-gray-50">
                <Text className="text-xs font-semibold text-gray-500 uppercase">
                  {date}
                </Text>
              </View>
              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleNotificationPress(notification)}
                  onDelete={() => handleDelete(notification.id)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to group notifications by date
function groupByDate(
  notifications: StoredNotification[],
): Record<string, StoredNotification[]> {
  const groups: Record<string, StoredNotification[]> = {};

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(notification);
  });

  return groups;
}
