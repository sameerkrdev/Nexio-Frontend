import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWallet } from "../store/walletStore";
import { useAuth } from "../contexts/AuthContext";
import { balanceService } from "../services/balance.service";
import { useEffect } from "react";

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
      <Text className="text-white text-3xl font-myMedium">{val}</Text>
    )}
  </TouchableOpacity>
);

export default function SendScreen() {
  const { name, username, avatar } = useLocalSearchParams<{
    name: string;
    username: string;
    avatar: string;
  }>();

  const { address } = useWallet();
  const { user } = useAuth();
  
  const fiatCurrency = user?.wallet?.currency || "INR";
  const fiatSymbol = fiatCurrency === "USD" ? "$" : fiatCurrency === "EUR" ? "€" : fiatCurrency === "JPY" ? "¥" : "₹";
  
  const [amount, setAmount] = useState("0");
  const [selectedAsset, setSelectedAsset] = useState({
    name: "Solana",
    symbol: "SOL",
    balance: "0.00",
    icon: "https://cryptologos.cc/logos/solana-sol-logo.png",
  });
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [assets, setAssets] = useState([
    {
      name: "Solana",
      symbol: "SOL",
      balance: "0.00",
      icon: "https://cryptologos.cc/logos/solana-sol-logo.png",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      balance: "0.00",
      icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    },
    {
      name: "Tether",
      symbol: "USDT",
      balance: "0.00",
      icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    },
  ]);
  const router = useRouter();

  useEffect(() => {
    if (address) {
      const fetchBalances = async () => {
        const solBal = await balanceService.getSolBalance(address);
        const newAssets = assets.map((a) =>
          a.symbol === "SOL" ? { ...a, balance: solBal } : a
        );
        setAssets(newAssets);
        if (selectedAsset.symbol === "SOL") {
          setSelectedAsset(newAssets[0]);
        }
      };
      fetchBalances();
    }
  }, [address]);

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

  // Navigate to the review/confirmation screen — no backend call yet
  const handleReview = () => {
    if (amount === "0") return;
    router.push({
      pathname: "/payment-confirm",
      params: {
        fiatAmount: amount,
        fiatCurrency,
        currency: selectedAsset.symbol,
        recipientUsername: username,
        recipientName: name,
        recipientAvatar: avatar,
      },
    });
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
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

            {/* Asset Selector */}
            <TouchableOpacity
              onPress={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
              className="flex-row items-center bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800"
            >
              <Image
                source={{ uri: selectedAsset.icon }}
                className="w-5 h-5 rounded-full mr-2"
              />
              <Text className="text-white font-myBold text-sm mr-2">
                {selectedAsset.symbol}
              </Text>
              <Ionicons
                name={isAssetDropdownOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color="#A1A1AA"
              />
            </TouchableOpacity>

            <View className="w-12" />
          </View>

          {/* Asset Dropdown Menu */}
          {isAssetDropdownOpen && (
            <View className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-zinc-900 border border-zinc-800 rounded-3xl p-2 z-50 shadow-2xl">
              {assets.map((asset) => (
                <TouchableOpacity
                  key={asset.symbol}
                  onPress={() => {
                    setSelectedAsset(asset);
                    setIsAssetDropdownOpen(false);
                  }}
                  className={`flex-row items-center p-4 rounded-2xl ${selectedAsset.symbol === asset.symbol ? "bg-zinc-800" : ""}`}
                >
                  <Image
                    source={{ uri: asset.icon }}
                    className="w-8 h-8 rounded-full mr-4"
                  />
                  <View className="flex-1">
                    <Text className="text-white font-myBold">{asset.name}</Text>
                    <Text className="text-zinc-500 text-xs font-myMedium">
                      {asset.balance} {asset.symbol} available
                    </Text>
                  </View>
                  {selectedAsset.symbol === asset.symbol && (
                    <Ionicons name="checkmark-circle" size={20} color="#A3E635" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View className="items-center mt-2">
            <View className="bg-zinc-900/80 border border-zinc-800 rounded-full flex-row items-center p-1.5 pr-6">
              <Image
                source={{
                  uri: avatar || "https://ui-avatars.com/api/?name=" + name,
                }}
                className="w-8 h-8 rounded-full mr-3 border border-lime-400"
              />
              <Text className="text-zinc-400 text-sm font-myMedium">
                To <Text className="text-white font-myBold">{name}</Text>
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-1 justify-center items-center">
          <Text className="text-zinc-600 text-xs font-myBold uppercase tracking-[0.2em] mb-4">
            Enter Amount
          </Text>
          <View className="flex-row items-center">
            <Text
              className={
                "text-5xl font-myBold mr-1 " +
                (amount === "0" ? "text-zinc-800" : "text-lime-400")
              }
            >
              {fiatSymbol}
            </Text>
            <Text
              className={
                "text-7xl font-myBold tracking-tight " +
                (amount === "0" ? "text-zinc-700" : "text-white")
              }
            >
              {amount}
            </Text>
          </View>
          <Text className="text-zinc-600 text-xs font-myMedium mt-2">
            Sending via {selectedAsset.name} ({selectedAsset.symbol})
          </Text>
          {amount !== "0" && (
            <Text className="text-zinc-600 text-xs font-myMedium mt-1">
              +0.5% service fee on next screen
            </Text>
          )}
        </View>

        <View className="pb-8">
          <View className="flex-row flex-wrap justify-between px-8 gap-y-2 mb-8">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
              (num) => (
                <KeypadButton key={num} val={num} onPress={handleKeyPress} />
              )
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
              className={
                "w-full py-5 rounded-3xl flex-row items-center justify-center " +
                (amount !== "0"
                  ? "bg-[#A3E635]"
                  : "bg-zinc-900 border border-zinc-800")
              }
              onPress={handleReview}
            >
              <Text
                className={
                  "text-xl font-myBold " +
                  (amount !== "0" ? "text-black" : "text-zinc-500")
                }
              >
                Review Payment
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
    </View>
  );
}
