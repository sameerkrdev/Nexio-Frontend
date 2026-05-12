import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWithdrawals } from "../hooks/useWithdrawals";
import { useAuth } from "../contexts/AuthContext";

export default function WithdrawalHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: withdrawalsData, isLoading, refetch } = useWithdrawals(1, 50);
  const withdrawals = withdrawalsData?.data || [];

  console.log("Withdrawals data:", withdrawalsData);
  console.log("Withdrawals array:", withdrawals);
  console.log("Is loading:", isLoading);

  const currency = user?.wallet?.currency || "USD";
  const currencySymbol = currency === "USD" ? "$" : "₹";

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "processing":
        return "time";
      case "pending":
        return "hourglass";
      case "failed":
        return "close-circle";
      case "cancelled":
        return "ban";
      case "refunded":
        return "return-up-back";
      default:
        return "wallet";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "processing":
        return "#3B82F6";
      case "pending":
        return "#FBBF24";
      case "failed":
        return "#EF4444";
      case "cancelled":
        return "#71717A";
      case "refunded":
        return "#8B5CF6";
      default:
        return "#71717A";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "processing":
        return "text-blue-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      case "cancelled":
        return "text-zinc-500";
      case "refunded":
        return "text-purple-500";
      default:
        return "text-zinc-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) {
        return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
      } else if (minutes > 0) {
        return `${minutes}m ago`;
      } else {
        return "Just now";
      }
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatMethodLabel = (method: string) => {
    return method
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={require("../assets/bg3.png")}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0.2 }}
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 rounded-full bg-zinc-900/60 items-center justify-center border border-zinc-800/50"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-myBold text-xl">
              Withdrawal History
            </Text>
            <View className="w-12" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ffffff"
                colors={["#ffffff"]}
              />
            }
          >
            <View className="px-6 pb-8">
              {isLoading ? (
                <View className="py-20 items-center">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              ) : !withdrawals || withdrawals.length === 0 ? (
                <View className="py-20 items-center">
                  <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
                    <Ionicons
                      name="receipt-outline"
                      size={40}
                      color="#52525B"
                    />
                  </View>
                  <Text className="text-white font-myBold text-xl mb-2">
                    No Withdrawals Yet
                  </Text>
                  <Text className="text-zinc-500 font-myMedium text-sm text-center max-w-[280px]">
                    Your withdrawal history will appear here
                  </Text>
                </View>
              ) : (
                <View className="gap-y-3">
                  {withdrawals.map((withdrawal) => (
                    <TouchableOpacity
                      key={withdrawal.id}
                      className="bg-white/5 border border-white/10 rounded-[20px] p-5"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center mb-3">
                        <View
                          className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                          style={{
                            backgroundColor: `${getStatusColor(withdrawal.status)}20`,
                          }}
                        >
                          <Ionicons
                            name={getStatusIcon(withdrawal.status) as any}
                            size={24}
                            color={getStatusColor(withdrawal.status)}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-myBold text-base mb-1">
                            {withdrawal.destination ||
                              formatMethodLabel(withdrawal.method)}
                          </Text>
                          <Text className="text-zinc-500 font-myMedium text-xs">
                            {formatMethodLabel(withdrawal.method)} •{" "}
                            {formatDate(withdrawal.createdAt)}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-red-500 font-myBold text-lg">
                            -{currencySymbol}
                            {parseFloat(withdrawal.amount).toFixed(2)}
                          </Text>
                          <Text
                            className={`font-myMedium text-xs mt-1 capitalize ${getStatusTextColor(withdrawal.status)}`}
                          >
                            {withdrawal.status}
                          </Text>
                        </View>
                      </View>

                      {/* Additional Details */}
                      <View className="border-t border-white/5 pt-3 flex-row justify-between">
                        <View>
                          <Text className="text-zinc-600 font-myMedium text-xs mb-1">
                            Fee
                          </Text>
                          <Text className="text-zinc-400 font-myMedium text-sm">
                            {currencySymbol}
                            {parseFloat(withdrawal.feeAmount).toFixed(2)}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-zinc-600 font-myMedium text-xs mb-1">
                            Net Amount
                          </Text>
                          <Text className="text-white font-myBold text-sm">
                            {currencySymbol}
                            {parseFloat(withdrawal.netAmount).toFixed(2)}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-zinc-600 font-myMedium text-xs mb-1">
                            Arrival
                          </Text>
                          <Text className="text-zinc-400 font-myMedium text-sm">
                            {withdrawal.estimatedArrival}
                          </Text>
                        </View>
                      </View>

                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
