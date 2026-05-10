import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAuth } from "../contexts/AuthContext";
import {
  useWithdrawalAccounts,
  useAvailableMethods,
  useCreateWithdrawal,
} from "../hooks/useWithdrawals";

export default function WithdrawConfirmScreen() {
  const router = useRouter();
  const { accountId, amount } = useLocalSearchParams<{
    accountId: string;
    amount: string;
  }>();
  const { user } = useAuth();
  const { data: accounts } = useWithdrawalAccounts();
  const { data: methods } = useAvailableMethods();
  const createWithdrawal = useCreateWithdrawal();

  const [note, setNote] = useState("");

  const currency = user?.wallet?.currency || "USD";
  const currencySymbol = currency === "USD" ? "$" : "₹";
  const numAmount = parseFloat(amount || "0");

  const account = accounts?.find((a) => a.id === accountId);
  const methodInfo = methods?.availableMethods.find(
    (m) => m.method === account?.method,
  );

  // Calculate fee
  const feeAmount = methodInfo?.fee === "Free" ? 0 : 0; // Will be calculated by backend
  const netAmount = numAmount - feeAmount;

  const handleConfirm = async () => {
    if (!accountId) return;

    try {
      const result = await createWithdrawal.mutateAsync({
        accountId,
        amount: numAmount,
        note: note.trim() || undefined,
      });

      router.replace({
        pathname: "/withdraw-success",
        params: {
          withdrawalId: result.id,
        },
      });
    } catch (error: any) {
      Alert.alert("Withdrawal Failed", error.message || "Something went wrong");
    }
  };

  if (!account || !methodInfo) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

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
          <View className="px-6 py-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={createWithdrawal.isPending}
              className="w-12 h-12 rounded-full bg-zinc-900/60 items-center justify-center border border-zinc-800/50"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={createWithdrawal.isPending ? "#3F3F46" : "white"}
              />
            </TouchableOpacity>
            <Text className="text-white font-myBold ml-5 text-xl">
              Review Withdrawal
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          >
            {/* Account Card */}
            <Animated.View
              entering={FadeInUp.delay(80).springify()}
              className="bg-[#121212] border border-zinc-800/50 rounded-[32px] p-6 mb-5 items-center"
            >
              <View className="w-16 h-16 rounded-full bg-lime-400/10 items-center justify-center mb-4">
                <Ionicons name="wallet-outline" size={32} color="#a3e635" />
              </View>
              <Text className="text-white font-myBold text-2xl">
                {account.displayName}
              </Text>
              <Text className="text-zinc-500 font-myMedium mt-1 text-base">
                {methodInfo.label}
              </Text>
            </Animated.View>

            {/* Amount Breakdown */}
            <Animated.View
              entering={FadeInUp.delay(160).springify()}
              className="bg-[#121212] border border-zinc-800/50 rounded-[32px] p-6 mb-6"
            >
              <View className="flex-row items-center mb-5">
                <Ionicons name="cash-outline" size={24} color="#a3e635" />
                <Text className="text-white font-myBold ml-3 text-lg">
                  Amount Details
                </Text>
              </View>

              <FeeRow
                label="Withdrawal amount"
                value={`${currencySymbol}${numAmount.toFixed(2)}`}
              />
              <FeeRow label="Processing fee" value={methodInfo.fee || "Free"} />

              <View className="h-px bg-zinc-800 my-3" />

              <FeeRow
                label="You will receive"
                value={`${currencySymbol}${numAmount.toFixed(2)}`}
                highlight
              />

              {/* Estimated Time */}
              <View className="mt-5 bg-zinc-800/40 rounded-2xl px-4 py-3 flex-row items-center justify-center border border-zinc-800/50">
                <Ionicons name="time-outline" size={14} color="#a3e635" />
                <Text className="text-zinc-500 font-myMedium ml-2 text-xs">
                  {methodInfo.estimatedTime}
                </Text>
              </View>
            </Animated.View>

            {/* Info Note */}
            <Animated.View
              entering={FadeInUp.delay(240).springify()}
              className="flex-row items-start bg-[#121212] border border-zinc-800/50 rounded-2xl px-4 py-3 mb-8"
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#71717A"
                style={{ marginTop: 1 }}
              />
              <Text className="text-zinc-600 font-myMedium ml-2 flex-1 leading-5 text-xs">
                Funds will be transferred to your registered {methodInfo.label}{" "}
                account. Processing time may vary.
              </Text>
            </Animated.View>

            {/* Confirm Button */}
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              {createWithdrawal.isPending ? (
                <View className="w-full h-[72px] rounded-[36px] bg-[#121212] border border-zinc-800/50 flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white font-myBold mx-3 text-lg">
                    Processing...
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleConfirm}
                  className="w-full h-[72px] rounded-[36px] bg-white items-center justify-center"
                >
                  <Text className="text-black font-myBold text-lg">
                    Confirm Withdrawal
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function FeeRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-start py-[10px]">
      <Text className="text-zinc-500 font-myMedium flex-1 mr-4 text-sm">
        {label}
      </Text>
      <Text
        className={`font-myBold text-sm ${highlight ? "text-white" : "text-white"}`}
      >
        {value}
      </Text>
    </View>
  );
}
