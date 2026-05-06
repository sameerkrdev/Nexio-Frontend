import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { FloatingNav } from "../components/FloatingNav";
import { connectPhantom } from "../lib/phantom";
import { useWallet } from "../store/walletStore";
import { useAuth } from "../contexts/AuthContext";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { router } from "expo-router";

import { userService } from "../services/user.service";

const connection = new Connection("https://api.devnet.solana.com");

export default function Profile() {
  const { address } = useWallet();
  const { user, logout, isLoading: authLoading, refreshUser } = useAuth();

  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetchBalance(address);

    if (user && user.solanaPublicKey !== address) {
      linkWallet(address);
    }
  }, [address, user]);

  const linkWallet = async (addr: string) => {
    try {
      await userService.patchMyWallet(addr);
      await refreshUser();
      console.log("Wallet linked successfully on backend!");
    } catch (e) {
      console.error("Failed to link wallet to backend", e);
    }
  };

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
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-zinc-400 font-myMedium mt-4">
          Loading profile...
        </Text>
      </View>
    );
  }

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
        <ScrollView showsVerticalScrollIndicator={false} className="px-6">
          <View className="items-center mt-10">
            {/* Profile Picture */}
            <View className="w-32 h-32 rounded-full border-2 border-zinc-800 p-1">
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
              <Text className="text-white text-2xl font-myMedium">
                {user?.name || "Guest User"}
              </Text>
              <Text className="text-zinc-500 text-base font-myRegular mt-1">
                @{user?.username || "guest"}
              </Text>
              {user?.phoneNumber && (
                <Text className="text-zinc-600 text-sm font-myRegular mt-1">
                  {user.phoneNumber}
                </Text>
              )}
            </View>

            {/* Wallet Card — shows after connecting */}
            {address ? (
              <View className="w-full mt-8 bg-[#121212] rounded-[40px] border border-zinc-800/50 p-8 items-center">
                {/* Connected badge */}
                <View className="flex-row items-center justify-center mb-6">
                  <View className="w-2 h-2 rounded-full bg-white mr-2" />
                  <Text className="text-white text-[10px] font-myMedium uppercase tracking-widest">
                    Phantom Connected
                  </Text>
                </View>

                {/* Balance */}
                <Text className="text-zinc-500 text-xs font-myMedium mb-2 uppercase tracking-widest">
                  SOL Balance
                </Text>
                {loadingBalance ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-3xl font-myMedium">
                    {balance !== null ? `${balance.toFixed(4)} SOL` : "—"}
                  </Text>
                )}

                {/* Wallet Address */}
                <View className="mt-8 w-full bg-white/5 rounded-2xl px-4 py-4 flex-row items-center justify-between border border-white/5">
                  <Text className="text-zinc-400 text-sm font-myMedium">
                    {`${address.slice(0, 6)}...${address.slice(-6)}`}
                  </Text>
                  <Ionicons name="copy-outline" size={16} color="#71717A" />
                </View>

                {/* Refresh */}
                <TouchableOpacity
                  onPress={() => fetchBalance(address)}
                  className="mt-6 flex-row items-center justify-center bg-white/5 px-6 py-2.5 rounded-full border border-white/5"
                >
                  <Ionicons name="refresh-outline" size={14} color="#ffffff" />
                  <Text className="text-white text-xs font-myMedium ml-2">
                    Refresh Balance
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Stats cards — shows before connecting */
              <View className="flex-row mt-10 gap-4">
                <View className="flex-1 bg-[#121212] p-5 rounded-[32px] border border-zinc-800/50 items-center">
                  <Text className="text-zinc-500 text-[10px] font-myMedium uppercase tracking-widest">
                    Member Since
                  </Text>
                  <Text className="text-white text-lg font-myMedium mt-1">
                    {user?.createdAt
                      ? new Date(user.createdAt).getFullYear()
                      : "2024"}
                  </Text>
                </View>
                <View className="flex-1 bg-[#121212] p-5 rounded-[32px] border border-zinc-800/50 items-center">
                  <Text className="text-zinc-500 text-[10px] font-myMedium uppercase tracking-widest">
                    Account Tier
                  </Text>
                  <Text className="text-white text-lg font-myMedium mt-1">
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
                className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${
                  address
                    ? "bg-[#121212] border border-[#AB9FF2]"
                    : "bg-[#AB9FF2]"
                }`}
              >
                <FontAwesome5
                  name="ghost"
                  size={20}
                  color={address ? "#AB9FF2" : "black"}
                />
                <Text
                  className={`text-base font-myMedium ml-2 ${address ? "text-[#AB9FF2]" : "text-black"}`}
                >
                  {address ? "Wallet Connected ✓" : "Link Phantom Wallet"}
                </Text>
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity className="w-full bg-[#121212] py-5 px-6 rounded-[32px] flex-row items-center justify-between border border-zinc-800/50">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center mr-4">
                    <Ionicons
                      name="settings-outline"
                      size={20}
                      color="#ffffff"
                    />
                  </View>
                  <Text className="text-white text-lg font-myMedium">
                    Account Settings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717A" />
              </TouchableOpacity>

              <TouchableOpacity className="w-full bg-[#121212] py-5 px-6 rounded-[32px] flex-row items-center justify-between border border-zinc-800/50">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center mr-4">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#ffffff"
                    />
                  </View>
                  <Text className="text-white text-lg font-myMedium">
                    Security & Privacy
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#71717A" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="w-full bg-red-500 py-4 rounded-2xl flex-row items-center justify-center mt-2"
              >
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text className="text-white text-lg font-myMedium ml-2">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="h-40" />
        </ScrollView>
        <FloatingNav />
      </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
