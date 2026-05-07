import React, { useState, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FloatingNav } from "../components/FloatingNav";
import { paymentService, type Payment } from "../services/payment.service";
import { useAuth } from "../contexts/AuthContext";

export default function ActivityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSpending, setTotalSpending] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Get currency from user's wallet
  const currency = user?.wallet?.currency || "USD";
  const currencySymbol = currency === "USD" ? "$" : "₹";

  // Generate consistent color based on username using hash
  const getAvatarColorFromName = (name: string) => {
    const colors = [
      "#7C3AED", // deep purple
      "#2563EB", // royal blue
      "#0891B2", // dark cyan
      "#059669", // emerald green
      "#CA8A04", // golden yellow
      "#EA580C", // burnt orange
      "#DC2626", // crimson red
      "#DB2777", // magenta pink
      "#6366F1", // soft indigo
      "#8B5CF6", // lavender purple
      "#06B6D4", // bright cyan
      "#10B981", // mint green
    ];

    // Simple hash function to convert name to a number
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Use absolute value and modulo to get consistent index
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Get initial from username
  const getInitial = (username: string) => {
    return username.charAt(0).toUpperCase();
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

    const username = isSender
      ? payment.recipientUsername
      : payment.senderUsername || "unknown";
    const avatarBgColor = getAvatarColorFromName(username);
    const initial = getInitial(username);

    return {
      name: capitalizeFirstLetter(username),
      username: `@${username}`,
      type,
      date: dateStr,
      amount: `${isSender ? "-" : "+"}${paymentCurrency === "USD" ? "$" : "₹"}${amount.toFixed(2)}`,
      color,
      icon,
      isCredit: !isSender,
      isSender, // Add this for consistent color logic
      amountColor, // Add amount color based on status
      cryptoIcon: getCryptoIcon(payment.cryptoType), // Add crypto icon
      avatarBgColor, // Add avatar background color (consistent per username)
      initial, // Add initial letter
    };
  };

  // Fetch transactions (initial load)
  const fetchTransactions = async (
    pageNum: number = 1,
    append: boolean = false,
  ) => {
    if (!user) return;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await paymentService.getPaymentHistory(pageNum, 20);
      // console.log("Activity response:", response);

      // Handle different response structures
      let newPayments: Payment[] = [];
      let total = 0;
      let totalPagesCount = 1;

      if (Array.isArray(response)) {
        // If response is directly an array
        newPayments = response;
      } else if (response && response.data) {
        // Normal case: response has data property
        newPayments = Array.isArray(response.data) ? response.data : [];
        total = response.total || 0;
        totalPagesCount = response.totalPages || 1;
      }

      if (append) {
        // Append to existing payments for infinite scroll
        setPayments((prev) => [...prev, ...newPayments]);
      } else {
        // Replace payments for initial load
        setPayments(newPayments);
      }

      setTotalPages(totalPagesCount);
      setPage(pageNum);
      setHasMore(pageNum < totalPagesCount);

      // Calculate total spending (sum of sent payments)
      const allPayments = append ? [...payments, ...newPayments] : newPayments;
      const spending = allPayments
        .filter(
          (payment) =>
            payment.senderId === user.id && payment.status === "completed",
        )
        .reduce(
          (sum, payment) => sum + parseFloat(payment.senderCurrencyAmount),
          0,
        );
      setTotalSpending(spending);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      if (!append) {
        setPayments([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more transactions when scrolling
  const loadMoreTransactions = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchTransactions(page + 1, true);
    }
  };

  // Handle scroll event for infinite scrolling
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;

    // Check if user has scrolled near the bottom
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      loadMoreTransactions();
    }
  };

  useEffect(() => {
    fetchTransactions(1, false);
  }, [user]);

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
                    {payments.map((payment, index) => {
                      const uiTx = mapPaymentToUI(payment, index);
                      return (
                        <TouchableOpacity
                          key={payment.id}
                          className="flex-row items-center"
                        >
                          <View
                            style={{
                              backgroundColor: `${uiTx.avatarBgColor}`,
                            }}
                            className="w-14 h-14 rounded-full items-center justify-center mr-4"
                          >
                            <Text className="text-white text-xl font-myBold">
                              {uiTx.initial}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-white text-lg font-myMedium">
                              {uiTx.name}
                            </Text>
                            <Text className="text-zinc-400 text-sm font-myRegular">
                              {uiTx.username}
                            </Text>
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
                  {isLoadingMore && (
                    <View className="py-6 items-center">
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text className="text-zinc-500 text-sm font-myMedium mt-2">
                        Loading more...
                      </Text>
                    </View>
                  )}

                  {/* End of List Indicator */}
                  {!hasMore && payments.length > 0 && (
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
