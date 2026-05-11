import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { openSolanaExplorer } from "../utils/explorer";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  // Parse transaction data from params
  const transactionId = params.id as string;
  const status = params.status as string;
  const type = params.type as string;
  const amount = params.amount as string;
  const currency = params.currency as string;
  const cryptoAmount = params.cryptoAmount as string;
  const cryptoType = params.cryptoType as string;
  const recipientName = params.recipientName as string;
  const recipientUsername = params.recipientUsername as string;
  const senderName = params.senderName as string;
  const senderUsername = params.senderUsername as string;
  const date = params.date as string;
  const txHash = params.txHash as string;
  const platformFee = params.platformFee as string;
  const isSender = params.isSender === "true";

  // Get status color and icon
  const getStatusInfo = () => {
    switch (status) {
      case "completed":
        return {
          color: "#10B981",
          bgColor: "bg-green-500/10",
          icon: "checkmark-circle",
          text: "Completed",
        };
      case "pending":
        return {
          color: "#FBBF24",
          bgColor: "bg-yellow-500/10",
          icon: "time",
          text: "Pending",
        };
      case "failed":
        return {
          color: "#EF4444",
          bgColor: "bg-red-500/10",
          icon: "close-circle",
          text: "Failed",
        };
      case "expired":
        return {
          color: "#71717A",
          bgColor: "bg-zinc-500/10",
          icon: "alert-circle",
          text: "Expired",
        };
      default:
        return {
          color: "#71717A",
          bgColor: "bg-zinc-500/10",
          icon: "help-circle",
          text: status,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const cryptoIcon = `https://cryptologos.cc/logos/${cryptoType.toLowerCase()}-${cryptoType === "SOL" ? "sol" : cryptoType === "USDC" ? "usd-coin-usdc" : cryptoType === "USDT" ? "tether-usdt" : cryptoType === "ETH" ? "ethereum-eth" : "solana-sol"}-logo.png`;
  const avatarUrl = `https://robohash.org/${isSender ? recipientUsername : senderUsername}?set=set4&size=200x200`;

  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={require("../assets/bg6.png")}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0.15 }}
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-myBold">
              Transaction Details
            </Text>
            <View className="w-12" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-6"
          >
            {/* Status Card */}
            <View className="bg-[#121212] rounded-[32px] border border-zinc-800/50 p-6 mb-6 items-center">
              <View
                className={`w-20 h-20 rounded-full ${statusInfo.bgColor} items-center justify-center mb-4`}
              >
                <Ionicons
                  name={statusInfo.icon as any}
                  size={40}
                  color={statusInfo.color}
                />
              </View>
              <Text className="text-zinc-500 text-sm font-myMedium mb-2">
                {isSender ? "Sent" : "Received"}
              </Text>
              <Text
                className={`text-4xl font-myBold mb-2 ${isSender ? "text-red-500" : "text-green-500"}`}
              >
                {isSender ? "-" : "+"}
                {currency === "USD" ? "$" : "₹"}
                {amount}
              </Text>
              <Text className="text-zinc-400 text-sm font-myMedium">
                {cryptoAmount} {cryptoType}
              </Text>
              <View
                className={`mt-4 px-4 py-2 rounded-full ${statusInfo.bgColor}`}
              >
                <Text
                  className="font-myMedium text-sm"
                  style={{ color: statusInfo.color }}
                >
                  {statusInfo.text}
                </Text>
              </View>
            </View>

            {/* User Info Card */}
            <View className="bg-[#121212] rounded-[32px] border border-zinc-800/50 p-6 mb-6">
              <Text className="text-zinc-500 text-xs font-myMedium uppercase tracking-widest mb-4">
                {isSender ? "Recipient" : "Sender"}
              </Text>
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 mr-4">
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-xl font-myBold">
                    {isSender ? recipientName : senderName}
                  </Text>
                  <Text className="text-zinc-400 text-sm font-myMedium">
                    {isSender ? recipientUsername : senderUsername}
                  </Text>
                </View>
              </View>
            </View>

            {/* Transaction Details */}
            <View className="bg-[#121212] rounded-[32px] border border-zinc-800/50 p-6 mb-6">
              <Text className="text-zinc-500 text-xs font-myMedium uppercase tracking-widest mb-4">
                Transaction Details
              </Text>

              {/* Transaction ID */}
              <View className="flex-row justify-between items-center py-3 border-b border-zinc-800/50">
                <Text className="text-zinc-400 text-sm font-myMedium">
                  Transaction ID
                </Text>
                <Text className="text-white text-sm font-myMedium">
                  {transactionId.slice(0, 8)}...{transactionId.slice(-8)}
                </Text>
              </View>

              {/* Date & Time */}
              <View className="flex-row justify-between items-center py-3 border-b border-zinc-800/50">
                <Text className="text-zinc-400 text-sm font-myMedium">
                  Date & Time
                </Text>
                <Text className="text-white text-sm font-myMedium">{date}</Text>
              </View>

              {/* Type */}
              <View className="flex-row justify-between items-center py-3 border-b border-zinc-800/50">
                <Text className="text-zinc-400 text-sm font-myMedium">
                  Type
                </Text>
                <Text className="text-white text-sm font-myMedium">{type}</Text>
              </View>

              {/* Crypto Type */}
              <View className="flex-row justify-between items-center py-3 border-b border-zinc-800/50">
                <Text className="text-zinc-400 text-sm font-myMedium">
                  Cryptocurrency
                </Text>
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: cryptoIcon }}
                    className="w-5 h-5 rounded-full mr-2"
                  />
                  <Text className="text-white text-sm font-myMedium">
                    {cryptoType}
                  </Text>
                </View>
              </View>

              {/* Platform Fee */}
              {platformFee && (
                <View className="flex-row justify-between items-center py-3 border-b border-zinc-800/50">
                  <Text className="text-zinc-400 text-sm font-myMedium">
                    Platform Fee
                  </Text>
                  <Text className="text-white text-sm font-myMedium">
                    {currency === "USD" ? "$" : "₹"}
                    {platformFee}
                  </Text>
                </View>
              )}

              {/* Transaction Hash */}
              {txHash && txHash !== "undefined" && (
                <View className="py-3">
                  <Text className="text-zinc-400 text-sm font-myMedium mb-2">
                    Transaction Hash
                  </Text>
                  <View className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                    <Text
                      className="text-white text-xs font-myRegular"
                      numberOfLines={2}
                    >
                      {txHash}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            {status === "completed" && txHash && txHash !== "undefined" && (
              <View className="mb-8">
                <TouchableOpacity
                  className="bg-white py-4 rounded-2xl items-center mb-3"
                  onPress={() => openSolanaExplorer(txHash)}
                >
                  <Text className="text-black text-base font-myBold">
                    View on Solana Explorer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-zinc-900 border border-zinc-800 py-4 rounded-2xl items-center"
                  onPress={() => {
                    // Share transaction
                    console.log("Share transaction");
                  }}
                >
                  <Text className="text-white text-base font-myBold">
                    Share Transaction
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="h-20" />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
