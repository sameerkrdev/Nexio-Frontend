import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FloatingNav } from "../components/FloatingNav";
import { connectPhantom } from "../lib/phantom";
import { useWallet } from "../store/walletStore";
import { useAuth } from "../contexts/AuthContext";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { router } from "expo-router";

const connection = new Connection("https://api.devnet.solana.com");

export default function Profile() {
  const { address } = useWallet();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetchBalance(address);
  }, [address]);

  const fetchBalance = async (addr: string) => {
    try {
      setLoadingBalance(true);
      const pubKey = new PublicKey(addr);
      const bal = await connection.getBalance(pubKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (e) {
      console.error("Balance fetch failed", e);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/authentication");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Show loading state while fetching user
  if (authLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator size="large" color="#a3e635" />
        <Text className="text-zinc-400 font-myMedium mt-4">
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="px-6">
          <View className="items-center mt-10">
            {/* Profile Picture */}
            <View className="w-32 h-32 rounded-full border-4 border-lime-400 p-1">
              <View className="w-full h-full rounded-full overflow-hidden bg-zinc-800">
                <Image
                  source={{
                    uri: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg",
                  }}
                  className="w-full h-full"
                />
              </View>
            </View>

            {/* Name */}
            <View className="items-center mt-6">
              <Text className="text-white text-3xl font-myBold">
                {user?.name || "Guest User"}
              </Text>
              <Text className="text-zinc-500 text-lg font-myMedium mt-1">
                @{user?.username || "guest"}
              </Text>
              {user?.phoneNumber && (
                <Text className="text-zinc-600 text-sm font-myMedium mt-1">
                  {user.phoneNumber}
                </Text>
              )}
            </View>

            {/* Wallet Card — shows after connecting */}
            {address ? (
              <View className="w-full mt-8 bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
                {/* Connected badge */}
                <View className="flex-row items-center mb-4">
                  <View className="w-2 h-2 rounded-full bg-lime-400 mr-2" />
                  <Text className="text-lime-400 text-xs font-myBold uppercase tracking-widest">
                    Phantom Connected
                  </Text>
                </View>

                {/* Balance */}
                <Text className="text-zinc-500 text-sm font-myMedium mb-1">
                  SOL Balance
                </Text>
                {loadingBalance ? (
                  <ActivityIndicator color="#a3e635" />
                ) : (
                  <Text className="text-white text-4xl font-myBold">
                    {balance !== null ? `${balance.toFixed(4)} SOL` : "—"}
                  </Text>
                )}

                {/* Wallet Address */}
                <View className="mt-4 bg-zinc-800 rounded-2xl px-4 py-3 flex-row items-center justify-between">
                  <Text className="text-zinc-400 text-sm font-myMedium">
                    {`${address.slice(0, 6)}...${address.slice(-6)}`}
                  </Text>
                  <Ionicons name="copy-outline" size={16} color="#71717a" />
                </View>

                {/* Refresh */}
                <TouchableOpacity
                  onPress={() => fetchBalance(address)}
                  className="mt-4 flex-row items-center justify-center"
                >
                  <Ionicons name="refresh-outline" size={16} color="#a3e635" />
                  <Text className="text-lime-400 text-sm font-myMedium ml-2">
                    Refresh Balance
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Stats cards — shows before connecting */
              <View className="flex-row mt-10 gap-4">
                <View className="flex-1 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 items-center">
                  <Text className="text-zinc-500 text-xs font-myBold uppercase">
                    Member Since
                  </Text>
                  <Text className="text-white text-lg font-myBold mt-1">
                    {user?.createdAt
                      ? new Date(user.createdAt).getFullYear()
                      : "2024"}
                  </Text>
                </View>
                <View className="flex-1 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 items-center">
                  <Text className="text-zinc-500 text-xs font-myBold uppercase">
                    Account Tier
                  </Text>
                  <Text className="text-lime-400 text-lg font-myBold mt-1">
                    Pro
                  </Text>
                </View>
              </View>
            )}

            {/* Actions */}
            <View className="w-full mt-8 gap-4">
              {/* Phantom Wallet Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={connectPhantom}
                className={`w-full py-5 rounded-3xl flex-row items-center justify-center ${
                  address
                    ? "bg-zinc-800 border border-[#AB9FF2]"
                    : "bg-[#AB9FF2]"
                }`}
              >
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={24}
                  color={address ? "#AB9FF2" : "black"}
                />
                <Text
                  className={`text-xl font-myBold ml-3 ${address ? "text-[#AB9FF2]" : "text-black"}`}
                >
                  {address ? "Wallet Connected ✓" : "Link Phantom Wallet"}
                </Text>
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity className="w-full bg-zinc-900/80 py-5 px-6 rounded-3xl flex-row items-center justify-between border border-zinc-800">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-blue-500/10 rounded-full items-center justify-center mr-4">
                    <Ionicons
                      name="settings-outline"
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  <Text className="text-white text-lg font-mySemiBold">
                    Account Settings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717A" />
              </TouchableOpacity>

              <TouchableOpacity className="w-full bg-zinc-900/80 py-5 px-6 rounded-3xl flex-row items-center justify-between border border-zinc-800">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-orange-500/10 rounded-full items-center justify-center mr-4">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#F59E0B"
                    />
                  </View>
                  <Text className="text-white text-lg font-mySemiBold">
                    Security & Privacy
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717A" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="w-full bg-zinc-900/80 py-5 px-6 rounded-3xl flex-row items-center justify-center border border-zinc-800 mt-4"
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text className="text-red-500 text-lg font-myBold ml-2">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="h-40" />
        </ScrollView>
        <FloatingNav />
      </SafeAreaView>
    </View>
  );
}
