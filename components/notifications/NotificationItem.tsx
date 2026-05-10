import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  StoredNotification,
  NotificationType,
} from "../../types/notification.types";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface NotificationItemProps {
  notification: StoredNotification;
  onPress: () => void;
  onDelete?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const getIconAndColor = (): {
    icon: IoniconsName;
    color: string;
    bg: string;
  } => {
    switch (notification.type) {
      case NotificationType.PAYMENT_RECEIVED:
        return { icon: "arrow-down-circle", color: "#10B981", bg: "#ECFDF5" };
      case NotificationType.PAYMENT_SENT:
        return { icon: "arrow-up-circle", color: "#3B82F6", bg: "#EFF6FF" };
      case NotificationType.PAYMENT_VERIFIED:
        return { icon: "checkmark-circle", color: "#10B981", bg: "#ECFDF5" };
      case NotificationType.FIAT_PAYOUT_COMPLETED:
        return { icon: "cash", color: "#10B981", bg: "#ECFDF5" };
      case NotificationType.TRANSACTION_FAILED:
        return { icon: "close-circle", color: "#EF4444", bg: "#FEF2F2" };
      case NotificationType.SECURITY_ALERT:
        return { icon: "shield-checkmark", color: "#F59E0B", bg: "#FFFBEB" };
      case NotificationType.WALLET_CONNECTED:
        return { icon: "wallet", color: "#8B5CF6", bg: "#F5F3FF" };
      case NotificationType.KYC_APPROVED:
        return {
          icon: "checkmark-done-circle",
          color: "#10B981",
          bg: "#ECFDF5",
        };
      case NotificationType.KYC_REJECTED:
        return { icon: "alert-circle", color: "#EF4444", bg: "#FEF2F2" };
      case NotificationType.PROMOTIONAL:
        return { icon: "megaphone", color: "#8B5CF6", bg: "#F5F3FF" };
      default:
        return { icon: "notifications", color: "#3B82F6", bg: "#EFF6FF" };
    }
  };

  const { icon, color, bg } = getIconAndColor();

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-start p-4 border-b border-gray-100 ${
        !notification.read ? "bg-blue-50/30" : "bg-white"
      }`}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: bg }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-start justify-between mb-1">
          <Text
            className={`flex-1 text-base ${
              notification.read
                ? "text-gray-700"
                : "text-gray-900 font-semibold"
            }`}
          >
            {notification.title}
          </Text>
          {!notification.read && (
            <View className="w-2 h-2 rounded-full bg-blue-500 ml-2 mt-1" />
          )}
        </View>

        <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
          {notification.body}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400 text-xs">
            {formatTime(notification.timestamp)}
          </Text>

          {onDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-2 py-1"
            >
              <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
