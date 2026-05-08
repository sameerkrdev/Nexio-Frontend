import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  ImageBackground,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FloatingNav } from "../components/FloatingNav";
import { useRouter, useFocusEffect } from "expo-router";
import { useWallet } from "../store/walletStore";
import { useAuth } from "../contexts/AuthContext";
import { type Payment } from "../services/payment.service";
import { ProfileQRModal } from "../components/ProfileQRModal";
import { useQueryClient } from "@tanstack/react-query";
import { useSolBalance, useEthBalance } from "../hooks/useBalances";
import { useTransactions } from "../hooks/useTransactions";
import {
  HomeHeader,
  BalanceCard,
  WalletSection,
  RecentsSection,
  NoWalletSection,
  TransactionsSection,
  PasswordModal,
  SendDrawer,
} from "../components/home";

const MOCK_USERS = [
  {
    id: "1",
    name: "Gautam S.",
    username: "@gautam_s",
    avatar: "https://robohash.org/gautam_s?set=set4&size=200x200",
  },
  {
    id: "2",
    name: "Priya S.",
    username: "@priya23",
    avatar: "https://robohash.org/priya23?set=set4&size=200x200",
  },
  {
    id: "6",
    name: "Emma L.",
    username: "@emma_l",
    avatar: "https://robohash.org/emma_l?set=set4&size=200x200",
  },
  {
    id: "5",
    name: "David K.",
    username: "@david_k",
    avatar: "https://robohash.org/david_k?set=set4&size=200x200",
  },

  {
    id: "8",
    name: "Lisa M.",
    username: "@lisa_m",
    avatar: "https://robohash.org/lisa_m?set=set4&size=200x200",
  },
  {
    id: "9",
    name: "Ryan P.",
    username: "@ryan_p",
    avatar: "https://robohash.org/ryan_p?set=set4&size=200x200",
  },
  {
    id: "10",
    name: "Nina C.",
    username: "@nina_c",
    avatar: "https://robohash.org/nina_c?set=set4&size=200x200",
  },
  {
    id: "3",
    name: "Sarah T.",
    username: "@sarah_t",
    avatar: "https://robohash.org/sarah_t?set=set4&size=200x200",
  },
  {
    id: "4",
    name: "Mike R.",
    username: "@mike_r",
    avatar: "https://robohash.org/mike_r?set=set4&size=200x200",
  },
  {
    id: "7",
    name: "James W.",
    username: "@james_w",
    avatar: "https://robohash.org/james_w?set=set4&size=200x200",
  },
];

const ASSETS = [
  {
    name: "Solana",
    symbol: "SOL",
    icon: "https://cryptologos.cc/logos/solana-sol-logo.png",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
];

export default function HomeScreen() {
  const { address } = useWallet();
  const router = useRouter();
  const { user, loginWithPassword } = useAuth();
  const queryClient = useQueryClient();

  // React Query hooks for data fetching
  const {
    data: solBalance = "0.0000",
    isLoading: solLoading,
    refetch: refetchSol,
  } = useSolBalance(address);

  const {
    data: ethBalance = "0.0000",
    isLoading: ethLoading,
    refetch: refetchEth,
  } = useEthBalance(address);

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useTransactions(user?.id, 1, 5);

  // Extract transactions from response
  const transactions: Payment[] = React.useMemo(() => {
    if (!transactionsData) return [];
    if (Array.isArray(transactionsData)) return transactionsData;
    if (transactionsData.data && Array.isArray(transactionsData.data)) {
      return transactionsData.data;
    }
    return [];
  }, [transactionsData]);

  const [balances, setBalances] = useState({ sol: "0.0000", eth: "0.0000" });

  // Update balances when React Query data changes
  useEffect(() => {
    setBalances({
      sol: solBalance,
      eth: ethBalance,
    });
  }, [solBalance, ethBalance]);

  useFocusEffect(
    useCallback(() => {
      setIsBalanceVisible(false);
    }, []),
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Debug: Log when profile state changes
  useEffect(() => {
    console.log("isProfileOpen changed to:", isProfileOpen);
  }, [isProfileOpen]);
  const [isSendDrawerOpen, setIsSendDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("SOL");
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Get currency from user's wallet
  const currency = user?.wallet?.currency || "USD";

  // Pull to refresh handler
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSol(), refetchEth(), refetchTransactions()]);
    setRefreshing(false);
  }, [refetchSol, refetchEth, refetchTransactions]);

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

    // Format date with time (like activity screen)
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
    const avatarUrl = `https://robohash.org/${username}?set=set4&size=200x200`;

    return {
      name: capitalizeFirstLetter(username),
      username: `@${username}`,
      type,
      date: dateStr,
      amount: `${isSender ? "-" : "+"}${paymentCurrency === "USD" ? "$" : "₹"}${amount.toFixed(2)}`,
      color,
      icon,
      isSender, // Add this to determine text color
      amountColor, // Add amount color based on status
      cryptoIcon: getCryptoIcon(payment.cryptoType), // Add crypto icon
      avatarUrl, // Add avatar URL
    };
  };

  const handleVerifyPassword = async () => {
    if (!passwordInput || !user?.username) return;
    setIsVerifying(true);
    setPasswordError("");
    try {
      await loginWithPassword(user.username, passwordInput);
      setIsBalanceVisible(true);
      setIsPasswordModalVisible(false);
      setPasswordInput("");
    } catch (error) {
      setPasswordError("Incorrect password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

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
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#a3e635"
                colors={["#a3e635"]}
              />
            }
          >
            <View className="px-6 pt-6 pb-8">
              <HomeHeader
                userName={user?.name}
                userUsername={user?.username}
                onProfilePress={() => {
                  console.log("Profile picture pressed");
                  setIsProfileOpen(true);
                }}
              />

              <BalanceCard
                currency={currency}
                isBalanceVisible={isBalanceVisible}
                balance={user?.wallet?.balance}
                userName={user?.name}
                userUsername={user?.username}
                onViewBalancePress={() => setIsPasswordModalVisible(true)}
              />

              {address ? (
                <View>
                  <WalletSection
                    selectedAsset={selectedAsset}
                    balances={balances}
                    isAssetDropdownOpen={isAssetDropdownOpen}
                    assets={ASSETS}
                    onAssetDropdownToggle={() =>
                      setIsAssetDropdownOpen(!isAssetDropdownOpen)
                    }
                    onAssetSelect={(symbol) => {
                      setSelectedAsset(symbol);
                      setIsAssetDropdownOpen(false);
                    }}
                    onTransferPress={() => router.push("/send-choice")}
                  />

                  <RecentsSection
                    users={MOCK_USERS}
                    onUserPress={(user) => {
                      router.push({
                        pathname: "/send",
                        params: {
                          name: user.name,
                          username: user.username,
                          avatar: user.avatar,
                        },
                      });
                    }}
                  />
                </View>
              ) : (
                <NoWalletSection
                  onConnectPress={() => router.push("/profile")}
                />
              )}
            </View>

            <TransactionsSection
              transactions={transactions}
              isLoading={isLoadingTransactions}
              mapPaymentToUI={mapPaymentToUI}
              onSeeAllPress={() => router.push("/activity")}
              onTransactionPress={(payment) => {
                const isSender = payment.senderId === user?.id;
                const amount = parseFloat(
                  isSender
                    ? payment.senderCurrencyAmount
                    : payment.receiverCurrencyAmount,
                );
                const currency = isSender
                  ? payment.senderCurrency
                  : payment.receiverCurrency;

                router.push({
                  pathname: "/transaction-detail",
                  params: {
                    id: payment.id,
                    status: payment.status,
                    type: isSender ? "Sent" : "Received",
                    amount: amount.toFixed(2),
                    currency: currency,
                    cryptoAmount: payment.cryptoAmount,
                    cryptoType: payment.cryptoType,
                    recipientName: payment.recipientUsername || "Unknown",
                    recipientUsername: `@${payment.recipientUsername || "unknown"}`,
                    senderName: payment.senderUsername || "Unknown",
                    senderUsername: `@${payment.senderUsername || "unknown"}`,
                    date: new Date(payment.createdAt).toLocaleString("en-US", {
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
            />
          </ScrollView>
        </SafeAreaView>
        <FloatingNav />
      </ImageBackground>

      <ProfileQRModal
        visible={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />

      <SendDrawer
        visible={isSendDrawerOpen}
        users={MOCK_USERS}
        onClose={() => setIsSendDrawerOpen(false)}
        onUserPress={(user) => {
          setIsSendDrawerOpen(false);
          router.push({
            pathname: "/send",
            params: {
              id: user.id,
              name: user.name,
              username: user.username,
              avatar: user.avatar,
            },
          });
        }}
      />

      <PasswordModal
        visible={isPasswordModalVisible}
        passwordInput={passwordInput}
        passwordError={passwordError}
        isVerifying={isVerifying}
        onPasswordChange={(text) => {
          setPasswordInput(text);
          setPasswordError("");
        }}
        onVerify={handleVerifyPassword}
        onClose={() => {
          setIsPasswordModalVisible(false);
          setPasswordInput("");
          setPasswordError("");
        }}
      />
    </View>
  );
}
