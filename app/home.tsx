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
import { BlurView } from "expo-blur";

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

  useFocusEffect(
    useCallback(() => {
      setIsBalanceVisible(false);
    }, []),
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSendDrawerOpen, setIsSendDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("SOL");
  const [balances, setBalances] = useState({ sol: "0.0000", eth: "0.0000" });
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Get currency from user's wallet
  const currency = user?.wallet?.currency || "USD";

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
                    onPress={() => setIsProfileOpen(true)}
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
                              const validUser = user as typeof MOCK_USERS[0];
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
            <View className="bg-[#121212] border rounded-t-[50px] pt-5 px-8 pb-48 border-t border-zinc-800/50">
              {/* Handle Bar (Pill) */}
              <View className="w-12 h-1 bg-zinc-800 rounded-full mb-5 self-center" />

              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-white text-xl font-myMedium">
                  Latest Transactions
                </Text>
                <TouchableOpacity>
                  <Text className="text-zinc-500 font-myMedium">See all</Text>
                </TouchableOpacity>
              </View>

              {/* Transaction List */}
              <View className="gap-y-6">
                {[
                  {
                    name: "Steam Purchase",
                    type: "Entertainment",
                    date: "Jun 23",
                    amount: "-$42.00",
                    color: "#3B82F6",
                    icon: "game-controller",
                  },
                  {
                    name: "PayPal Transfer",
                    type: "Income",
                    date: "Jun 22",
                    amount: "+$2,500.00",
                    color: "#10B981",
                    icon: "wallet",
                  },
                  {
                    name: "Spotify Premium",
                    type: "Subscription",
                    date: "Jun 21",
                    amount: "-$9.99",
                    color: "#1DB954",
                    icon: "musical-notes",
                  },
                ].map((tx, i) => (
                  <View key={i} className="flex-row items-center">
                    <View
                      style={{ backgroundColor: tx.color + "20" }}
                      className="w-14 h-14 rounded-full items-center justify-center mr-4"
                    >
                      <Ionicons
                        name={tx.icon as any}
                        size={24}
                        color={tx.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-lg font-myMedium">
                        {tx.name}
                      </Text>
                      <Text className="text-zinc-500 text-sm font-myRegular">
                        {tx.type} • {tx.date}
                      </Text>
                    </View>
                    <Text
                      className={`text-lg font-myMedium ${tx.amount.startsWith("+") ? "text-green-500" : "text-white"}`}
                    >
                      {tx.amount}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <FloatingNav onProfilePress={() => setIsProfileOpen(true)} />
        </SafeAreaView>

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
                  Ryan Dev
                </Text>
                <Text className="text-zinc-500 text-lg font-myMedium">
                  @ryan_nexio
                </Text>
              </View>

              {/* QR Code Container */}
              <View className="bg-white p-6 rounded-[32px] mb-10">
                <View className="p-4 border-2 border-zinc-100 rounded-2xl">
                  <MaterialCommunityIcons
                    name="qrcode"
                    size={200}
                    color="black"
                  />
                </View>
              </View>

              <Text className="text-zinc-400 text-center text-base font-myMedium px-10 mb-10 leading-6">
                Scan this QR code to quickly send or receive money with Ryan.
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsProfileOpen(false)}
                className="bg-zinc-800 w-full py-4 rounded-2xl items-center mb-4"
              >
                <Text className="text-white text-lg font-mySemiBold">
                  Close
                </Text>
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
                Please enter your account password to securely view your
                balance.
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
      </ImageBackground>
    </View>
  );
}
