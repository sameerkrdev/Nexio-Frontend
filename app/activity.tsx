import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FloatingNav } from "../components/FloatingNav";
import { type Payment } from "../services/payment.service";
import { useAuth } from "../contexts/AuthContext";
import { useInfiniteTransactions } from "../hooks/useInfiniteTransactions";

export default function ActivityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");

  // React Query infinite scroll
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteTransactions(user?.id, 20);

  // Flatten all pages into single array
  const payments = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => {
      if (Array.isArray(page)) return page;
      if (page?.data && Array.isArray(page.data)) return page.data;
      return [];
    });
  }, [data]);

  const [totalSpending, setTotalSpending] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Get currency from user's wallet
  const currency = user?.wallet?.currency || "USD";
  const currencySymbol = currency === "USD" ? "$" : "₹";

  // Calculate total spending when payments change
  useEffect(() => {
    if (!user || !payments.length) return;
    const spending = payments
      .filter(
        (payment) =>
          payment.senderId === user.id && payment.status === "completed",
      )
      .reduce(
        (sum, payment) => sum + parseFloat(payment.senderCurrencyAmount),
        0,
      );
    setTotalSpending(spending);
  }, [payments, user]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Handle scroll event for infinite scrolling
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;

    // Check if user has scrolled near the bottom
    if (
      layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  // Capitalize first letter of username
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Crypto icon mapping
  const getCryptoIcon = (cryptoType: string) => {
    const icons: Record<string, string> = {
      SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
      USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
      ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      LINK: "https://cryptologos.cc/logos/chainlink-link-logo.png",
    };
    return icons[cryptoType.toUpperCase()] || icons.SOL;
  };

  // Helper function to map payment data to UI format
  const mapPaymentToUI = (payment: Payment, index: number) => {
    const isSender = payment.senderId === user?.id;
    const amount = parseFloat(
      isSender ? payment.senderCurrencyAmount : payment.receiverCurrencyAmount,
    );

    const paymentCurrency = isSender
      ? payment.senderCurrency
      : payment.receiverCurrency;

    // Map status to icon and color
    let icon = "wallet";
    let color = "#71717A";
    let type = isSender ? "Sent" : "Received";
    let amountColor = isSender ? "text-red-500" : "text-green-500"; // Default for completed

    if (payment.status === "completed") {
      icon = isSender ? "arrow-up" : "arrow-down-right";
      color = isSender ? "#EF4444" : "#10B981";
      amountColor = isSender ? "text-red-500" : "text-green-500";
    } else if (payment.status === "pending") {
      icon = "time";
      color = "#FBBF24"; // more yellowish
      type = "Pending";
      amountColor = "text-yellow-500"; // Yellow for pending
    } else if (payment.status === "failed") {
      icon = "close";
      color = "#EF4444";
      type = "Failed";
      amountColor = "text-zinc-500"; // Gray for failed
    } else if (payment.status === "expired") {
      icon = "alert";
      color = "#71717A";
      type = "Expired";
      amountColor = "text-zinc-500"; // Gray for expired
    }

    // Format date
    const date = new Date(payment.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let dateStr = "";
    if (diffDays === 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) {
        dateStr = `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
      } else if (minutes > 0) {
        dateStr = `${minutes}m ago`;
      } else {
        dateStr = "Just now";
      }
    } else if (diffDays === 1) {
      dateStr = "Yesterday";
    } else {
      dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    // Display rules per counterparty type — kept in sync with home.tsx:
    //  - Sender + external recipient  → masked phone as name; no @username row
    //  - Sender + platform recipient  → recipient's real name + @recipientUsername
    //  - Receiver (always platform)   → sender's real name + @senderUsername
    const isExternalCounterparty =
      isSender && payment.recipientType === "external";

    let displayName: string;
    let displayUsername: string | null;
    let avatarSeed: string;

    if (isExternalCounterparty) {
      const ext = payment.externalRecipient;
      displayName =
        ext?.phoneMasked || ext?.displayName || payment.recipientUsername;
      displayUsername = null;
      avatarSeed = ext?.phoneNumber || payment.recipientUsername || "external";
    } else if (isSender) {
      displayName =
        payment.recipientName ||
        capitalizeFirstLetter(payment.recipientUsername);
      displayUsername = `@${payment.recipientUsername}`;
      avatarSeed = payment.recipientUsername;
    } else {
      const senderUsername = payment.senderUsername || "unknown";
      displayName =
        payment.senderName || capitalizeFirstLetter(senderUsername);
      displayUsername = `@${senderUsername}`;
      avatarSeed = senderUsername;
    }

    const avatarUrl = `https://robohash.org/${avatarSeed}?set=set4&size=200x200`;

    return {
      name: displayName,
      username: displayUsername,
      type,
      date: dateStr,
      amount: `${isSender ? "-" : "+"}${paymentCurrency === "USD" ? "$" : "₹"}${amount.toFixed(2)}`,
      color,
      icon,
      isCredit: !isSender,
      isSender,
      amountColor,
      cryptoIcon: getCryptoIcon(payment.cryptoType),
      avatarUrl,
      isExternal: isExternalCounterparty,
    };
  };

  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={require("../assets/bg6.png")}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0.2 }}
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-6 pt-6 pb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-zinc-500 text-sm font-myMedium mb-1">
                Total Spending
              </Text>
              <Text className="text-white text-3xl font-myMedium">
                {currencySymbol}
                {totalSpending.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center">
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <View className="px-6 mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["All", "Income", "Expenses", "Subscriptions"].map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  className={`px-6 py-2.5 rounded-full mr-3 border ${
                    filter === f
                      ? "bg-white border-white"
                      : "bg-[#121212] border-zinc-800"
                  }`}
                >
                  <Text
                    className={`font-myMedium text-sm ${
                      filter === f ? "text-black" : "text-zinc-400"
                    }`}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Transactions List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            onScroll={handleScroll}
            scrollEventThrottle={400}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#a3e635"
                colors={["#a3e635"]}
              />
            }
          >
            <View className="bg-[#121212] border rounded-t-[50px] pt-8 px-8 pb-48 border-t border-zinc-800/50 min-h-screen">
              <Text className="text-white text-xl font-myMedium mb-8">
                Recent Activity
              </Text>

              {isLoading ? (
                <View className="py-10 items-center">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              ) : !payments || payments.length === 0 ? (
                <View className="py-10 items-center">
                  <Ionicons name="receipt-outline" size={48} color="#52525B" />
                  <Text className="text-zinc-500 font-myMedium mt-4">
                    No transactions yet
                  </Text>
                </View>
              ) : (
                <>
                  <View className="gap-y-6">
                    {payments.map((payment) => {
                      const uiTx = mapPaymentToUI(payment, 0);
                      const isSender = payment.senderId === user?.id;
                      const amount = parseFloat(
                        isSender
                          ? payment.senderCurrencyAmount
                          : payment.receiverCurrencyAmount,
                      );
                      const paymentCurrency = isSender
                        ? payment.senderCurrency
                        : payment.receiverCurrency;

                      return (
                        <TouchableOpacity
                          key={payment.id}
                          className="flex-row items-center"
                          activeOpacity={0.7}
                          onPress={() => {
                            router.push({
                              pathname: "/transaction-detail",
                              params: {
                                id: payment.id,
                                status: payment.status,
                                type: isSender ? "Sent" : "Received",
                                amount: amount.toFixed(2),
                                currency: paymentCurrency,
                                cryptoAmount: payment.cryptoAmount,
                                cryptoType: payment.cryptoType,
                                recipientName:
                                  payment.recipientUsername || "Unknown",
                                recipientUsername: `@${payment.recipientUsername || "unknown"}`,
                                senderName: payment.senderUsername || "Unknown",
                                senderUsername: `@${payment.senderUsername || "unknown"}`,
                                date: new Date(
                                  payment.createdAt,
                                ).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }),
                                txHash: payment.txHash || "",
                                platformFee: payment.platformFeeAmount || "0",
                                isSender: isSender.toString(),
                              },
                            });
                          }}
                        >
                          <View className="w-14 h-14 rounded-full items-center justify-center mr-4 overflow-hidden bg-zinc-900 border border-zinc-800">
                            {uiTx.isExternal ? (
                              <Ionicons
                                name="business"
                                size={24}
                                color="white"
                              />
                            ) : (
                              <Image
                                source={{ uri: uiTx.avatarUrl }}
                                className="w-full h-full"
                              />
                            )}
                          </View>
                          <View className="flex-1">
                            <Text className="text-white text-lg font-myMedium">
                              {uiTx.name}
                            </Text>
                            {uiTx.username ? (
                              <Text className="text-zinc-400 text-sm font-myRegular">
                                {uiTx.username}
                              </Text>
                            ) : null}
                            <Text className="text-zinc-500 text-xs font-myRegular mt-0.5">
                              {uiTx.type} • {uiTx.date}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text
                              className={`text-lg font-myMedium ${uiTx.amountColor}`}
                            >
                              {uiTx.amount}
                            </Text>
                            <View className="flex-row items-center mt-1">
                              <Text className="text-zinc-500 text-xs font-myRegular mr-2">
                                From
                              </Text>
                              <Image
                                source={{ uri: uiTx.cryptoIcon }}
                                className="w-4 h-4 rounded-full"
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Loading More Indicator */}
                  {isFetchingNextPage && (
                    <View className="py-6 items-center">
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text className="text-zinc-500 text-sm font-myMedium mt-2">
                        Loading more...
                      </Text>
                    </View>
                  )}

                  {/* End of List Indicator */}
                  {!hasNextPage && payments.length > 0 && (
                    <View className="py-6 items-center">
                      <Text className="text-zinc-500 text-sm font-myMedium">
                        No more transactions
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>

          {/* Floating Navigation */}
          <FloatingNav onProfilePress={() => router.push("/profile")} />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
