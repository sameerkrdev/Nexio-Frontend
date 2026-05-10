import React, { useEffect, useRef } from "react";
import { View, Text, Animated, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NotificationType } from "../../types/notification.types";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface NotificationToastProps {
  title: string;
  body: string;
  type?: NotificationType;
  visible: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  title,
  body,
  type,
  visible,
  onPress,
  onDismiss,
  duration = 4000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getIconAndColor = (): { icon: IoniconsName; color: string } => {
    switch (type) {
      case NotificationType.PAYMENT_RECEIVED:
        return { icon: "arrow-down-circle", color: "#10B981" };
      case NotificationType.PAYMENT_SENT:
        return { icon: "arrow-up-circle", color: "#3B82F6" };
      case NotificationType.PAYMENT_VERIFIED:
        return { icon: "checkmark-circle", color: "#10B981" };
      case NotificationType.TRANSACTION_FAILED:
        return { icon: "close-circle", color: "#EF4444" };
      case NotificationType.SECURITY_ALERT:
        return { icon: "shield-checkmark", color: "#F59E0B" };
      case NotificationType.WALLET_CONNECTED:
        return { icon: "wallet", color: "#8B5CF6" };
      default:
        return { icon: "notifications", color: "#3B82F6" };
    }
  };

  const { icon, color } = getIconAndColor();

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: Platform.OS === "ios" ? 50 : 10,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="flex-row items-start p-4">
          {/* Icon */}
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${color}15` }}
          >
            <Ionicons name={icon} size={24} color={color} />
          </View>

          {/* Content */}
          <View className="flex-1 mr-2">
            <Text className="text-gray-900 font-semibold text-base mb-1">
              {title}
            </Text>
            <Text className="text-gray-600 text-sm" numberOfLines={2}>
              {body}
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={handleDismiss}
            className="w-6 h-6 items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
