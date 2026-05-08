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
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
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

  if (!user) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-zinc-400 font-myMedium">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={require("../assets/bg3.png")}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0.2 }}
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="px-6 pt-6 pb-8">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-white text-2xl font-myMedium">
                  Profile
                </Text>

                <TouchableOpacity className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center">
                  <Ionicons name="settings-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Profile Card */}
              <View className="mb-6">
                <View className="bg-[#121212] rounded-[32px] p-6 border border-zinc-800/50">
                  <View className="flex-row items-center">
                    {/* Profile Picture */}
                    <View className="w-20 h-20 rounded-full border-2 border-zinc-800 overflow-hidden mr-4">
                      <Image
                        source={{
                          uri: `https://robohash.org/${user.username!}?set=set4&size=200x200`,
                        }}
                        className="w-full h-full"
                      />
                    </View>

                    {/* User Info */}
                    <View className="flex-1">
                      <Text className="text-white text-xl font-myMedium">
                        {user?.name || "Guest User"}
                      </Text>
                      <Text className="text-zinc-400 text-sm font-myRegular mt-1">
                        @{user?.username || "guest"}
                      </Text>
                      {user?.phoneNumber && (
                        <Text className="text-zinc-500 text-xs font-myRegular mt-1">
                          {user.phoneNumber}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Wallet Section */}
              {address ? (
                <View className="mb-6">
                  <Text className="text-white text-lg font-myMedium mb-4">
                    Wallet
                  </Text>
                  <View className="bg-[#121212] rounded-[32px] p-6 border border-zinc-800/50">
                    {/* Connected Status */}
                    <View className="flex-row items-center justify-between mb-6">
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <Text className="text-zinc-400 text-xs font-myMedium uppercase tracking-widest">
                          Phantom Connected
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => fetchBalance(address)}
                        className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10"
                      >
                        <Ionicons
                          name="refresh-outline"
                          size={14}
                          color="#ffffff"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Balance */}
                    <View className="mb-6">
                      <Text className="text-zinc-500 text-xs font-myMedium mb-2">
                        SOL Balance
                      </Text>
                      {loadingBalance ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text className="text-white text-3xl font-myMedium">
                          {balance !== null ? `${balance.toFixed(4)}` : "—"}
                        </Text>
                      )}
                    </View>

                    {/* Wallet Address */}
                    <View className="bg-white/5 rounded-2xl px-4 py-3 flex-row items-center justify-between border border-white/5">
                      <Text className="text-zinc-400 text-sm font-myMedium flex-1">
                        {`${address.slice(0, 8)}...${address.slice(-8)}`}
                      </Text>
                      <TouchableOpacity className="ml-2">
                        <Ionicons
                          name="copy-outline"
                          size={18}
                          color="#71717A"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="mb-6">
                  <Text className="text-white text-lg font-myMedium mb-4">
                    Wallet
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={connectPhantom}
                    className="bg-[#a59ae9] rounded-[20px] p-6 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 bg-black/5 rounded-2xl items-center justify-center mr-4">
                        <FontAwesome5 name="ghost" size={20} color="white" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-black text-lg font-mySemiBold">
                          Connect Phantom
                        </Text>
                        <Text className="text-black/60 text-sm font-myMedium">
                          Link your wallet to get started
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Settings Section */}
              <View className="mb-6">
                <Text className="text-white text-lg font-myMedium mb-4">
                  Settings
                </Text>
                <View className="gap-y-3">
                  <TouchableOpacity className="bg-[#121212] rounded-[24px] p-5 flex-row items-center justify-between border border-zinc-800/50">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center mr-4">
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color="#ffffff"
                        />
                      </View>
                      <Text className="text-white text-base font-myMedium">
                        Account Settings
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#71717A"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity className="bg-[#121212] rounded-[24px] p-5 flex-row items-center justify-between border border-zinc-800/50">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center mr-4">
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={20}
                          color="#ffffff"
                        />
                      </View>
                      <Text className="text-white text-base font-myMedium">
                        Security & Privacy
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#71717A"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity className="bg-[#121212] rounded-[24px] p-5 flex-row items-center justify-between border border-zinc-800/50">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center mr-4">
                        <Ionicons
                          name="notifications-outline"
                          size={20}
                          color="#ffffff"
                        />
                      </View>
                      <Text className="text-white text-base font-myMedium">
                        Notifications
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#71717A"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity className="bg-[#121212] rounded-[24px] p-5 flex-row items-center justify-between border border-zinc-800/50">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center mr-4">
                        <Ionicons
                          name="help-circle-outline"
                          size={20}
                          color="#ffffff"
                        />
                      </View>
                      <Text className="text-white text-base font-myMedium">
                        Help & Support
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#71717A"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-[#121212] rounded-[24px] p-5 flex-row items-center justify-center border border-red-500/20 mb-6"
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text className="text-red-500 text-base font-myMedium ml-2">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Padding for FloatingNav */}
            <View className="h-32" />
          </ScrollView>

          <FloatingNav />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
