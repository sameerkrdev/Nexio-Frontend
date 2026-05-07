import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ImageBackground,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FloatingNav } from "../components/FloatingNav";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useWallet } from "../store/walletStore";
import { balanceService } from "../services/balance.service";
import { useAuth } from "../contexts/AuthContext";
import { paymentService, type Payment } from "../services/payment.service";
import { BlurView } from "expo-blur";
import { WalletQRCode } from "../components/WalletQRCode";

const MOCK_USERS = [
  {
    id: "1",
    name: "Alex M.",
    username: "@alex_m",
    avatar:
      "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg",
  },
  {
    id: "2",
    name: "Priya S.",
    username: "@priya23",
    avatar:
      "https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg",
  },
  {
    id: "3",
    name: "Sarah T.",
    username: "@sarah_t",
    avatar:
      "https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg",
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
  // console.log(user);

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
  const [balances, setBalances] = useState({ sol: "0.0000", eth: "0.0000" });
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Get currency from user's wallet
  const currency = user?.wallet?.currency || "USD";

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
      isSender, // Add this to determine text color
      amountColor, // Add amount color based on status
      cryptoIcon: getCryptoIcon(payment.cryptoType), // Add crypto icon
      avatarBgColor, // Add avatar background color (consistent per username)
      initial, // Add initial letter
    };
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoadingTransactions(true);
    try {
      const response = await paymentService.getPaymentHistory(1, 5);

      // Handle different response structures
      let payments: Payment[] = [];

      if (Array.isArray(response)) {
        // If response is directly an array (shouldn't happen but handle it)
        payments = response;
      } else if (response && response.data) {
        // Normal case: response.data contains the payments array
        payments = Array.isArray(response.data) ? response.data : [];
      }

      // console.log("Extracted payments:", payments);
      setTransactions(payments);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]); // Set empty array on error
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

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

  useEffect(() => {
    if (address) {
      const fetchBalances = async () => {
        const sol = await balanceService.getSolBalance(address);
        const eth = await balanceService.getEthBalance(address);
        setBalances({ sol, eth });
      };
      fetchBalances();
    }
  }, [address]);

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
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="px-6 pt-6 pb-8">
              <View className="flex-row items-center justify-between mb-8">
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => {
                      console.log("Profile picture pressed");
                      setIsProfileOpen(true);
                    }}
                    activeOpacity={0.7}
                    className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 mr-4"
                  >
                    <Image
                      source={{
                        uri: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg",
                      }}
                      className="w-full h-full"
                    />
                  </TouchableOpacity>
                  <View>
                    <Text className="text-zinc-500 text-[10px] font-myMedium">
                      Hey,
                    </Text>
                    <Text className="text-white text-lg font-myMedium">
                      {user?.name}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity className="w-12 h-12 items-center justify-center">
                  <Ionicons name="search" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* My Card Section (Now at Top) */}
              <View className="mb-4">
                <ImageBackground
                  source={require("../assets/card.png")}
                  className="w-full aspect-[1.3] rounded-[32px] relative overflow-hidden p-8 justify-between"
                  imageStyle={{ borderRadius: 32 }}
                  resizeMode="stretch"
                >
                  {/* Top Right: Currency Display */}
                  <View className="absolute top-6 right-6 z-50">
                    <View className="bg-black/30 px-3 py-1.5 rounded-xl flex-row items-center border border-white/10">
                      <Text className="text-white text-xs font-myMedium">
                        {currency === "INR" && "🇮🇳 INR"}
                        {currency === "USD" && "🇺🇸 USD"}
                        {currency === "JPY" && "🇯🇵 JPY"}
                        {currency === "EUR" && "�� EUR"}
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Left: Balance and User Identity */}
                  <View className="mt-auto">
                    {/* Balance */}
                    <View className="mb-4">
                      <Text className="text-white/40 text-[10px] font-myMedium uppercase tracking-widest mb-1">
                        Current Balance
                      </Text>
                      {isBalanceVisible ? (
                        <Text className="text-white text-3xl font-myMedium">
                          {user?.wallet?.currency === "USD" ? "$" : "₹"}{" "}
                          {user?.wallet?.balance}
                        </Text>
                      ) : (
                        <TouchableOpacity
                          onPress={() => setIsPasswordModalVisible(true)}
                          className="bg-white/10 px-4 py-2 mt-1 rounded-xl border border-white/20 items-center self-start flex-row gap-2 blur-md"
                        >
                          <Ionicons name="eye" size={14} color="#ffffff" />
                          <Text className="text-white font-myMedium text-sm">
                            View Balance
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* User Info */}
                    <View>
                      <Text className="text-white text-lg font-myMedium">
                        {user?.name}
                      </Text>
                      <Text className="text-white/60 font-myRegular text-xs">
                        {user?.username}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>

              {/* Conditional Wallet Section (Now Below Card) */}
              {address ? (
                <View>
                  {/* Compact Real Balances Container */}
                  <View className="mb-0 bg-[#121212]/70 p-4 rounded-[25px] border border-zinc-800/50 flex-row items-center justify-between">
                    {/* Left: Asset Selector */}
                    <View className="relative">
                      <TouchableOpacity
                        onPress={() =>
                          setIsAssetDropdownOpen(!isAssetDropdownOpen)
                        }
                        className="bg-zinc-900/50 px-3 py-2 rounded-2xl flex-row items-center border border-zinc-800"
                      >
                        <Image
                          source={{
                            uri: ASSETS.find((a) => a.symbol === selectedAsset)
                              ?.icon,
                          }}
                          className="w-5 h-5 rounded-full"
                        />
                        <Ionicons
                          name="chevron-down"
                          size={12}
                          color="#71717A"
                          className="ml-1"
                        />
                      </TouchableOpacity>

                      {isAssetDropdownOpen && (
                        <View className="absolute top-12 left-0 bg-zinc-900 rounded-2xl p-2 border border-zinc-800 z-50 w-40">
                          {ASSETS.map((asset) => (
                            <TouchableOpacity
                              key={asset.symbol}
                              onPress={() => {
                                setSelectedAsset(asset.symbol);
                                setIsAssetDropdownOpen(false);
                              }}
                              className={`p-3 rounded-xl mb-1 flex-row items-center ${selectedAsset === asset.symbol ? "bg-zinc-800" : ""}`}
                            >
                              <Image
                                source={{ uri: asset.icon }}
                                className="w-6 h-6 rounded-full mr-3"
                              />
                              <Text
                                className={`text-xs font-myMedium ${selectedAsset === asset.symbol ? "text-white" : "text-zinc-500"}`}
                              >
                                {asset.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Middle: Balance */}
                    <View className="flex-1 px-4">
                      <Text className="text-white text-xl font-myMedium">
                        {selectedAsset === "SOL" ? balances.sol : balances.eth}{" "}
                        {selectedAsset}
                      </Text>
                    </View>

                    {/* Right: Icon-only Transfer Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => router.push("/send-choice")}
                      className="bg-white w-12 h-12 rounded-2xl items-center justify-center"
                    >
                      <Ionicons name="arrow-up" size={20} color="black" />
                    </TouchableOpacity>
                  </View>

                  {/* Friends Section */}
                  <View className="mt-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-white text-lg font-myMedium">
                        Friends
                      </Text>
                      <TouchableOpacity>
                        <Text className="text-white font-myMedium text-sm">
                          View all
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between">
                      {[
                        ...MOCK_USERS,
                        {
                          id: "4",
                          name: "Add",
                          avatar: "plus",
                          isAdd: true,
                        },
                      ].map((user, i) => (
                        <TouchableOpacity
                          key={i}
                          className="items-center"
                          onPress={() => {
                            if (user.id === "4") {
                              setIsSendDrawerOpen(true);
                            } else {
                              const validUser = user as (typeof MOCK_USERS)[0];
                              router.push({
                                pathname: "/send",
                                params: {
                                  name: validUser.name,
                                  username: validUser.username,
                                  avatar: validUser.avatar,
                                },
                              });
                            }
                          }}
                        >
                          <View className="w-24 h-24 rounded-full border border-zinc-800 p-1 mb-2 items-center justify-center overflow-hidden">
                            {"isAdd" in user && user.isAdd ? (
                              <View className="w-full h-full bg-zinc-900/80 items-center justify-center rounded-full">
                                <Ionicons
                                  name="add"
                                  size={24}
                                  color="#ffffff"
                                />
                              </View>
                            ) : (
                              <Image
                                source={{ uri: user.avatar }}
                                className="w-full h-full rounded-full"
                              />
                            )}
                          </View>
                          <Text className="text-white text-[10px] font-myMedium">
                            {user.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                <View className="bg-[#121212] px-5 py-3 rounded-[40px] border border-zinc-800/50 items-center">
                  <View className="flex-row items-center justify-center gap-4 mb-2">
                    <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center">
                      <Ionicons
                        name="wallet-outline"
                        size={24}
                        color="#71717A"
                      />
                    </View>
                    <Text className="text-white text-lg font-myMedium">
                      No Wallet Connected
                    </Text>
                  </View>
                  <Text className="text-zinc-500 text-center font-myRegular text-sm mb-8 px-4 leading-5">
                    Connect your Phantom wallet to manage and transfer your
                    digital assets securely.
                  </Text>

                  <TouchableOpacity
                    onPress={() => router.push("/profile")}
                    className="bg-white py-3.5 rounded-2xl w-full items-center"
                  >
                    <Text className="text-black font-myMedium text-base">
                      Connect Now
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Latest Transactions Section (Dark Panel with Handle Bar) */}
            <View className="bg-[#121212] border rounded-t-[50px] pt-5 px-8 pb-40 border-t border-zinc-800/50">
              {/* Handle Bar (Pill) */}
              <View className="w-12 h-1 bg-zinc-800 rounded-full mb-5 self-center" />

              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-white text-xl font-myMedium">
                  Latest Transactions
                </Text>
                <TouchableOpacity onPress={() => router.push("/activity")}>
                  <Text className="text-zinc-500 font-myMedium">See all</Text>
                </TouchableOpacity>
              </View>

              {/* Transaction List */}
              {isLoadingTransactions ? (
                <View className="py-10 items-center">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              ) : !transactions || transactions.length === 0 ? (
                <View className="py-10 items-center">
                  <Ionicons name="receipt-outline" size={48} color="#52525B" />
                  <Text className="text-zinc-500 font-myMedium mt-4">
                    No transactions yet
                  </Text>
                </View>
              ) : (
                <View className="gap-y-6">
                  {transactions.map((payment, index) => {
                    const uiTx = mapPaymentToUI(payment, index);
                    return (
                      <View key={payment.id} className="flex-row items-center">
                        <View
                          style={{ backgroundColor: uiTx.avatarBgColor }}
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
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
        <FloatingNav
          onProfilePress={() => {
            console.log("Opening profile drawer...");
            setIsProfileOpen(true);
          }}
        />
      </ImageBackground>

      {/* Profile Drawer / QR Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isProfileOpen}
        onRequestClose={() => setIsProfileOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/80 justify-end"
          onPress={() => setIsProfileOpen(false)}
        >
          <Pressable
            className="bg-[#121212] rounded-t-[40px] p-8 border-t border-zinc-800 items-center"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <View className="w-12 h-1 bg-zinc-700 rounded-full mb-8" />

            {/* User Info */}
            <View className="items-center mb-10">
              <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-lime-400 mb-4">
                <Image
                  source={{
                    uri: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg",
                  }}
                  className="w-full h-full"
                />
              </View>
              <Text className="text-white text-3xl font-myMedium">
                {user?.name || "User"}
              </Text>
              <Text className="text-zinc-500 text-lg font-myMedium">
                @{user?.username || "username"}
              </Text>
            </View>

            {/* QR Code Container */}
            <View className="bg-white p-6 rounded-[32px] mb-10">
              <View className="p-4 border-2 border-zinc-100 rounded-2xl">
                {/* Use WalletQRCode if address exists, fallback to icon */}
                {user?.username ? (
                  <WalletQRCode
                    name={user?.name ?? null}
                    walletAddress={user?.solanaPublicKey ?? null}
                    username={user?.username ?? null}
                    avatar={""}
                    size={200}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="qrcode"
                    size={200}
                    color="black"
                  />
                )}
              </View>
            </View>

            <Text className="text-zinc-400 text-center text-base font-myMedium px-10 mb-10 leading-6">
              Scan this QR code to quickly send or receive money.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsProfileOpen(false)}
              className="bg-zinc-800 w-full py-4 rounded-2xl items-center mb-4"
            >
              <Text className="text-white text-lg font-mySemiBold">Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Send Drawer */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSendDrawerOpen}
        onRequestClose={() => setIsSendDrawerOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/80 justify-end"
          onPress={() => setIsSendDrawerOpen(false)}
        >
          <Pressable
            className="bg-[#121212] rounded-t-[40px] p-8 border-t border-zinc-800"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <View className="w-12 h-1 bg-zinc-700 rounded-full mb-8 self-center" />

            <Text className="text-white text-2xl font-myMedium mb-6">
              Send to
            </Text>

            {/* Users List */}
            {MOCK_USERS.map((user) => (
              <TouchableOpacity
                key={user.id}
                className="flex-row items-center bg-zinc-900/60 p-4 rounded-3xl border border-zinc-800 mb-4"
                onPress={() => {
                  setIsSendDrawerOpen(false);
                  router.push({
                    pathname: "/send",
                    params: user,
                  });
                }}
              >
                <Image
                  source={{ uri: user.avatar }}
                  className="w-14 h-14 rounded-full border-2 border-lime-400 mr-4"
                />
                <View className="flex-1">
                  <Text className="text-white font-myMedium text-lg">
                    {user.name}
                  </Text>
                  <Text className="text-zinc-500 text-sm font-myMedium">
                    {user.username}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#71717A" />
              </TouchableOpacity>
            ))}

            <View className="h-10" />
          </Pressable>
        </Pressable>
      </Modal>
      {/* Password Verification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPasswordModalVisible}
        onRequestClose={() => {
          setIsPasswordModalVisible(false);
          setPasswordInput("");
          setPasswordError("");
        }}
      >
        <Pressable
          className="flex-1 bg-black/80 justify-center items-center p-6"
          onPress={() => {
            setIsPasswordModalVisible(false);
            setPasswordInput("");
            setPasswordError("");
          }}
        >
          <Pressable
            className="bg-[#121212] px-5 py-6 rounded-[40px] border border-zinc-800/50 items-center w-full"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-center gap-4 mb-2 mt-2">
              <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#71717A"
                />
              </View>
              <Text className="text-white text-lg font-myMedium">
                Enter Password
              </Text>
            </View>

            <Text className="text-zinc-500 text-center font-myRegular text-sm mb-6 px-4 leading-5">
              Please enter your account password to securely view your balance.
            </Text>

            <View className="w-full mb-0 relative justify-center px-2">
              <TextInput
                value={passwordInput}
                onChangeText={(text) => {
                  setPasswordInput(text);
                  setPasswordError("");
                }}
                secureTextEntry
                placeholder="Account password"
                placeholderTextColor="#52525B"
                className="w-full bg-zinc-900/50 text-white font-myMedium text-base p-4 rounded-2xl border border-zinc-800 text-center"
                autoFocus
              />
            </View>

            {passwordError ? (
              <Text className="text-red-500 text-xs font-myMedium mb-4 self-start pl-4">
                {passwordError}
              </Text>
            ) : (
              <View className="h-4 mb-4" />
            )}

            <View className="w-full px-2">
              <TouchableOpacity
                onPress={handleVerifyPassword}
                disabled={isVerifying || !passwordInput}
                className={`w-full py-3.5 rounded-2xl items-center justify-center flex-row mb-2 ${!passwordInput ? "bg-zinc-800" : "bg-white"}`}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="black" />
                ) : (
                  <Text
                    className={`text-base font-myMedium ${!passwordInput ? "text-zinc-500" : "text-black"}`}
                  >
                    Verify & Unlock
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
