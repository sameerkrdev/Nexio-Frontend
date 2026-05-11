import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { useWithdrawalById } from "../hooks/useWithdrawals";

const symbolFor = (currency?: string): string => {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "JPY":
      return "¥";
    default:
      return "₹";
  }
};

const formatMethodLabel = (method: string) =>
  method
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

export default function WithdrawSuccessScreen() {
  const { withdrawalId } = useLocalSearchParams<{ withdrawalId: string }>();
  const { data: withdrawal } = useWithdrawalById(withdrawalId || "");

  const goHome = () => router.replace("/home");
  const currencySymbol = symbolFor(withdrawal?.currency);

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/bg6.png")}
        className="absolute inset-0"
        resizeMode="cover"
        imageStyle={{ opacity: 0.25 }}
      />

      {/* Subtle green tint overlay on success */}
      <Animated.View
        entering={FadeInDown.duration(800)}
        className="absolute inset-0 bg-[#10B981]/10"
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-20 items-center pb-10">
            {/* Triple-nested success icon */}
            <Animated.View
              entering={ZoomIn.delay(100).springify().damping(14).stiffness(100)}
              className="mb-8"
            >
              <View className="w-32 h-32 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 items-center justify-center">
                <View className="w-24 h-24 rounded-full bg-[#10B981]/20 items-center justify-center">
                  <View className="w-16 h-16 rounded-full bg-[#10B981] items-center justify-center shadow-lg shadow-[#10B981]">
                    <Ionicons name="checkmark" size={36} color="white" />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Title */}
            <Animated.Text
              entering={FadeInUp.delay(300).springify()}
              className="text-white text-3xl font-myBold text-center mb-3"
            >
              Withdrawal Initiated
            </Animated.Text>

            <Animated.Text
              entering={FadeInUp.delay(400).springify()}
              className="text-zinc-400 text-base font-myMedium text-center max-w-[300px] mb-10 leading-6"
            >
              Your withdrawal request has been submitted successfully. Funds
              will arrive in your account soon.
            </Animated.Text>

            {/* Withdrawal Details Card */}
            {withdrawal && (
              <Animated.View
                entering={FadeInUp.delay(500).springify()}
                className="w-full bg-[#064E3B]/40 border border-[#10B981]/20 rounded-[32px] p-6 mb-8"
              >
                <DetailRow
                  label="Amount"
                  value={`${currencySymbol}${parseFloat(withdrawal.amount).toFixed(2)}`}
                />
                <DetailRow
                  label="Fee"
                  value={`${currencySymbol}${parseFloat(withdrawal.feeAmount).toFixed(2)}`}
                />
                <View className="h-px bg-zinc-800/50 my-2" />
                <DetailRow
                  label="Net Amount"
                  value={`${currencySymbol}${parseFloat(withdrawal.netAmount).toFixed(2)}`}
                  highlight
                />
                <DetailRow
                  label="Method"
                  value={formatMethodLabel(withdrawal.method)}
                />
                <DetailRow
                  label="Status"
                  value={
                    withdrawal.status.charAt(0).toUpperCase() +
                    withdrawal.status.slice(1)
                  }
                />
                <DetailRow
                  label="Estimated Arrival"
                  value={withdrawal.estimatedArrival}
                />
              </Animated.View>
            )}

            {/* Action Buttons */}
            <Animated.View
              entering={FadeInUp.delay(700).springify()}
              className="w-full gap-y-4 mt-auto mb-8"
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={goHome}
                className="w-full h-[64px] rounded-[32px] bg-white flex-row items-center justify-center"
              >
                <Text className="text-black text-lg font-myBold mr-2">
                  Back to Dashboard
                </Text>
                <Ionicons name="arrow-forward" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/withdrawal-history")}
                className="w-full h-[64px] rounded-[32px] bg-zinc-900/80 border border-zinc-800 flex-row items-center justify-center"
              >
                <Ionicons name="time-outline" size={18} color="#71717A" />
                <Text className="text-zinc-400 text-sm font-myMedium ml-2">
                  View Withdrawal History
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-white/5 last:border-0">
      <Text className="text-zinc-100 font-myMedium text-sm">{label}</Text>
      <Text
        className={`font-myBold text-sm ${
          highlight ? "text-[#10B981]" : "text-white"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
