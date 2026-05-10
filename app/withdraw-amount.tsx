import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import {
  useWithdrawalAccounts,
  useAvailableMethods,
} from "../hooks/useWithdrawals";

type KeypadButtonProps = {
  val: string;
  icon?: string;
  onPress: (val: string) => void;
};

const KeypadButton = ({ val, icon, onPress }: KeypadButtonProps) => (
  <TouchableOpacity
    activeOpacity={0.5}
    onPress={() => onPress(val)}
    className="w-[30%] h-[72px] items-center justify-center rounded-3xl active:bg-zinc-900"
  >
    {icon ? (
      <Ionicons name={icon as any} size={32} color="#A1A1AA" />
    ) : (
      <Text className="text-white font-myMedium text-3xl">{val}</Text>
    )}
  </TouchableOpacity>
);

export default function WithdrawAmountScreen() {
  const router = useRouter();
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const { user } = useAuth();
  const { data: accounts } = useWithdrawalAccounts();
  const { data: methods, isLoading: methodsLoading } = useAvailableMethods();

  const [amount, setAmount] = useState("0");

  const currency = user?.wallet?.currency || "USD";
  const currencySymbol = currency === "USD" ? "$" : "₹";
  const balance = parseFloat(user?.wallet?.balance || "0");

  const account = accounts?.find((a) => a.id === accountId);
  const methodInfo = methods?.availableMethods.find(
    (m) => m.method === account?.method,
  );

  const handleKeyPress = (val: string) => {
    if (val === "back") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
      return;
    }
    if (val === "." && amount.includes(".")) return;
    if (amount === "0" && val !== ".") {
      setAmount(val);
    } else {
      if (amount.length >= 8) return;
      setAmount((prev) => prev + val);
    }
  };

  const handleReview = () => {
    const numAmount = parseFloat(amount);

    if (numAmount === 0) {
      Alert.alert("Invalid Amount", "Please enter an amount");
      return;
    }

    if (numAmount > balance) {
      Alert.alert("Insufficient Balance", "You don't have enough balance");
      return;
    }

    if (methodInfo) {
      const minAmount = parseFloat(methodInfo.minAmount || "0");
      const maxAmount = parseFloat(methodInfo.maxAmount || "999999");

      if (numAmount < minAmount) {
        Alert.alert(
          "Amount Too Low",
          `Minimum withdrawal is ${currencySymbol}${minAmount}`,
        );
        return;
      }

      if (numAmount > maxAmount) {
        Alert.alert(
          "Amount Too High",
          `Maximum withdrawal is ${currencySymbol}${maxAmount}`,
        );
        return;
      }
    }

    router.push({
      pathname: "/withdraw-confirm",
      params: {
        accountId,
        amount,
      },
    });
  };

  if (!account) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Account not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={require("../assets/bg3.png")}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0 }}
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 flex-col justify-between">
          <View>
            <View className="px-6 py-4 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View className="w-12" />
            </View>

            <View className="items-center mt-2">
              <View className="bg-zinc-900/80 border border-zinc-800 rounded-full flex-row items-center p-1.5 pr-6">
                <View className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center mr-3">
                  <Ionicons name="wallet-outline" size={16} color="white" />
                </View>
                <Text className="text-zinc-400 font-myMedium text-sm">
                  To{" "}
                  <Text className="text-white font-myBold">
                    {account.displayName}
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-1 justify-center items-center">
            <Text className="text-zinc-600 font-myBold uppercase tracking-[0.2em] mb-4 text-xs">
              Enter Amount
            </Text>
            <View className="flex-row items-center">
              <Text
                className={`font-myBold mr-1 text-5xl ${amount === "0" ? "text-zinc-800" : "text-white"}`}
              >
                {currencySymbol}
              </Text>
              <Text
                className={`font-myBold tracking-tight text-7xl ${amount === "0" ? "text-zinc-700" : "text-white"}`}
              >
                {amount}
              </Text>
            </View>

            {methodsLoading ? (
              <ActivityIndicator
                size="small"
                color="#52525B"
                className="mt-2"
              />
            ) : methodInfo ? (
              <View className="items-center mt-2">
                <Text className="text-zinc-600 font-myMedium text-xs">
                  Fee: {methodInfo.fee} • {methodInfo.estimatedTime}
                </Text>
                <Text className="text-zinc-600 font-myMedium mt-1 text-xs">
                  Min: {currencySymbol}
                  {methodInfo.minAmount} • Max: {currencySymbol}
                  {methodInfo.maxAmount}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="pb-8">
            <View className="flex-row flex-wrap justify-between px-8 gap-y-2 mb-8">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
                (num) => (
                  <KeypadButton key={num} val={num} onPress={handleKeyPress} />
                ),
              )}
              <KeypadButton
                val="back"
                icon="backspace-outline"
                onPress={handleKeyPress}
              />
            </View>

            <View className="px-6">
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={amount === "0"}
                className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${
                  amount !== "0"
                    ? "bg-white"
                    : "bg-zinc-900 border border-zinc-800"
                }`}
                onPress={handleReview}
              >
                <Text
                  className={`font-myMedium text-lg ${amount !== "0" ? "text-black" : "text-zinc-500"}`}
                >
                  Review Withdrawal
                </Text>
                {amount !== "0" && (
                  <View className="ml-2">
                    <Ionicons name="arrow-forward" size={20} color="black" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
