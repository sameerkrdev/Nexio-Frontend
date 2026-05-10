import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, pushToken } = useNotifications();

  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !localSettings[key];
    const newSettings = { ...localSettings, [key]: newValue };
    setLocalSettings(newSettings);
    await updateSettings({ [key]: newValue });
  };

  const handleTestNotification = () => {
    Alert.alert(
      "Test Notification",
      "A test notification will be sent to your device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            // TODO: Call backend to send test notification
            Alert.alert("Success", "Test notification sent!");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">
            Notification Settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Push Token Info */}
        {pushToken && (
          <View className="bg-white px-4 py-3 mb-2">
            <Text className="text-xs text-gray-500 mb-1">Push Token</Text>
            <Text className="text-xs text-gray-400 font-mono" numberOfLines={1}>
              {pushToken}
            </Text>
          </View>
        )}

        {/* Master Toggle */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Enable Notifications
              </Text>
              <Text className="text-sm text-gray-500">
                Turn off to stop all notifications
              </Text>
            </View>
            <Switch
              value={localSettings.enabled}
              onValueChange={() => handleToggle("enabled")}
              trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Notification Types */}
        <View className="bg-white px-4 py-2 mb-2">
          <Text className="text-xs font-semibold text-gray-500 uppercase mb-2 px-0 py-2">
            Notification Types
          </Text>

          <SettingItem
            icon="cash"
            iconColor="#10B981"
            title="Payment Alerts"
            description="Notifications for sent and received payments"
            value={localSettings.paymentAlerts}
            onToggle={() => handleToggle("paymentAlerts")}
            disabled={!localSettings.enabled}
          />

          <SettingItem
            icon="shield-checkmark"
            iconColor="#F59E0B"
            title="Security Alerts"
            description="Important security and account notifications"
            value={localSettings.securityAlerts}
            onToggle={() => handleToggle("securityAlerts")}
            disabled={!localSettings.enabled}
          />

          <SettingItem
            icon="megaphone"
            iconColor="#8B5CF6"
            title="Promotional"
            description="Updates, offers, and announcements"
            value={localSettings.promotional}
            onToggle={() => handleToggle("promotional")}
            disabled={!localSettings.enabled}
            isLast
          />
        </View>

        {/* Notification Behavior */}
        <View className="bg-white px-4 py-2 mb-2">
          <Text className="text-xs font-semibold text-gray-500 uppercase mb-2 px-0 py-2">
            Notification Behavior
          </Text>

          <SettingItem
            icon="volume-high"
            iconColor="#3B82F6"
            title="Sound"
            description="Play sound for notifications"
            value={localSettings.sound}
            onToggle={() => handleToggle("sound")}
            disabled={!localSettings.enabled}
          />

          <SettingItem
            icon="phone-portrait"
            iconColor="#3B82F6"
            title="Vibration"
            description="Vibrate for notifications"
            value={localSettings.vibration}
            onToggle={() => handleToggle("vibration")}
            disabled={!localSettings.enabled}
            isLast
          />
        </View>

        {/* Test Notification */}
        <TouchableOpacity
          onPress={handleTestNotification}
          className="bg-white px-4 py-4 mb-2 flex-row items-center justify-between"
          disabled={!localSettings.enabled}
        >
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="notifications" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Send Test Notification
              </Text>
              <Text className="text-sm text-gray-500">
                Test your notification settings
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Info */}
        <View className="px-4 py-6">
          <Text className="text-xs text-gray-500 text-center">
            Notifications help you stay updated with your transactions and
            account activity. You can customize which notifications you receive.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingItemProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isLast?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor,
  title,
  description,
  value,
  onToggle,
  disabled,
  isLast,
}) => {
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <View className="flex-row items-center flex-1 mr-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text
            className={`text-base font-medium ${
              disabled ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {title}
          </Text>
          <Text className="text-sm text-gray-500">{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
};
