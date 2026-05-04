import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { FloatingNav } from "../components/FloatingNav";

export default function Wallet() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSendDrawerOpen, setIsSendDrawerOpen] = useState(false);

  const MOCK_USERS = [
    { id: '1', name: 'Alex M.', username: '@alex_m', avatar: 'https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg' },
    { id: '2', name: 'Priya S.', username: '@priya23', avatar: 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg' },
    { id: '3', name: 'Sarah T.', username: '@sarah_t', avatar: 'https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg' },
  ];

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="px-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mt-4">
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setIsProfileOpen(true)}
              className="flex-row items-center"
            >
              <View className="w-14 h-14 rounded-full border-2 border-lime-400 items-center justify-center">
                <View className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
                  <Image
                    source={{
                      uri: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg",
                    }}
                    className="w-full h-full"
                  />
                </View>
              </View>
              <View className="ml-3">
                <Text className="text-white text-xl font-myBold">
                  Hello, Ryan
                </Text>
                <Text className="text-zinc-500 text-sm font-myMedium">
                  Good morning!
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
              <View className="relative">
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="white"
                />
                <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-lime-400 rounded-full border-2 border-zinc-900" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <View className="mt-8">
            <ImageBackground
              source={require("../assets/gradient-bg.png")}
              className="w-full p-6 rounded-[32px] border border-zinc-800 overflow-hidden relative"
              imageStyle={{ borderRadius: 32 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="text-zinc-400 text-sm font-myMedium mr-2">
                    Total Balance
                  </Text>
                  <Ionicons name="eye-outline" size={16} color="#A1A1AA" />
                </View>
                <TouchableOpacity className="flex-row items-center bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700">
                  <Text className="text-white text-xs font-myMedium mr-1">
                    My Accounts
                  </Text>
                  <Ionicons name="chevron-down" size={12} color="white" />
                </TouchableOpacity>
              </View>

              <Text className="text-white text-4xl font-myBold mt-4">
                ₹1,24,560.00
              </Text>

              <View className="flex-row items-center mt-8 pt-6 border-t border-zinc-800/50">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="mr-2">🇮🇳</Text>
                    <Text className="text-zinc-400 text-xs font-myMedium">
                      INR
                    </Text>
                  </View>
                  <Text className="text-white text-lg font-mySemiBold">
                    ₹1,02,450.00
                  </Text>
                </View>
                <View className="w-[1px] h-10 bg-zinc-800 mx-4" />
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="mr-2">🇺🇸</Text>
                    <Text className="text-zinc-400 text-xs font-myMedium">
                      USD
                    </Text>
                  </View>
                  <Text className="text-white text-lg font-mySemiBold">
                    $265.40
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Quick Actions */}
          <View className="flex-row mt-6 gap-4">
            <TouchableOpacity 
              className="flex-1 bg-[#1E291B] p-5 rounded-3xl border border-[#2D3A2A] flex-row items-center"
              onPress={() => setIsSendDrawerOpen(true)}
            >
              <View className="w-10 h-10 bg-[#34D399]/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="arrow-up" size={20} color="#34D399" />
              </View>
              <View>
                <Text className="text-white font-myBold text-lg">Send</Text>
                <Text className="text-zinc-500 text-xs font-myMedium">
                  Money abroad
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-[#231E2D] p-5 rounded-3xl border border-[#342D42] flex-row items-center">
              <View className="w-10 h-10 bg-[#A78BFA]/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="arrow-down" size={20} color="#A78BFA" />
              </View>
              <View>
                <Text className="text-white font-myBold text-lg">Receive</Text>
                <Text className="text-zinc-500 text-xs font-myMedium">
                  From anywhere
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Convert */}
          <View className="mt-8 bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-myBold">Quick Convert</Text>
              <Text className="text-zinc-500 text-[10px] font-myMedium">
                Live rate: 1 USD = ₹83.12 •
              </Text>
            </View>

            <View className="flex-row items-center justify-between relative">
              <View className="flex-1">
                <Text className="text-zinc-500 text-xs font-myMedium mb-2">
                  You Send
                </Text>
                <Text className="text-white text-2xl font-myBold">₹10,000</Text>
                <TouchableOpacity className="flex-row items-center bg-zinc-800 mt-3 px-2 py-1 rounded-lg w-20">
                  <Text className="text-white text-xs font-myMedium mr-1">
                    INR
                  </Text>
                  <Ionicons name="chevron-down" size={12} color="white" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity className="absolute left-[42%] z-10 w-10 h-10 bg-zinc-800 rounded-full items-center justify-center border border-zinc-700">
                <MaterialCommunityIcons
                  name="swap-horizontal"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              <View className="flex-1 items-end">
                <Text className="text-zinc-500 text-xs font-myMedium mb-2">
                  You Get
                </Text>
                <Text className="text-white text-2xl font-myBold">$120.37</Text>
                <TouchableOpacity className="flex-row items-center bg-zinc-800 mt-3 px-2 py-1 rounded-lg w-20 justify-end">
                  <Text className="text-white text-xs font-myMedium mr-1">
                    USD
                  </Text>
                  <Ionicons name="chevron-down" size={12} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Recent Transactions */}
          <View className="mt-8 mb-20">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-myBold">
                Recent Transactions
              </Text>
              <TouchableOpacity>
                <Text className="text-lime-400 font-myBold">View All</Text>
              </TouchableOpacity>
            </View>

            {[
              {
                name: "Sent to Alex M.",
                time: "Today, 09:30 AM",
                amount: "-$120.00",
                icon: "arrow-up",
                color: "#EF4444",
                bg: "#451A1A",
              },
              {
                name: "Received from Priya S.",
                time: "Yesterday, 07:45 PM",
                amount: "+₹8,450.00",
                icon: "arrow-down",
                color: "#10B981",
                bg: "#1A452F",
              },
              {
                name: "Converted INR to USD",
                time: "Yesterday, 06:20 PM",
                amount: "-₹5,000.00",
                icon: "swap-horizontal",
                color: "#8B5CF6",
                bg: "#2E1A45",
              },
            ].map((tx, i) => (
              <View
                key={i}
                className="flex-row items-center bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50 mb-3"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: tx.bg }}
                >
                  <MaterialCommunityIcons
                    name={tx.icon as any}
                    size={20}
                    color={tx.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-mySemiBold">{tx.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-1">{tx.time}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white font-myBold">{tx.amount}</Text>
                  <View className="bg-purple-500/20 px-2 py-1 rounded-md mt-1">
                    <Text className="text-purple-400 text-[10px] font-myBold">
                      Completed
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <FloatingNav />
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
              <Text className="text-white text-3xl font-myBold">Ryan Dev</Text>
              <Text className="text-zinc-500 text-lg font-myMedium">@ryan_nexio</Text>
            </View>

            {/* QR Code Container */}
            <View className="bg-white p-6 rounded-[32px] mb-10 shadow-2xl shadow-lime-400/20">
              <View className="p-4 border-2 border-zinc-100 rounded-2xl">
                <MaterialCommunityIcons name="qrcode" size={200} color="black" />
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

            <Text className="text-white text-2xl font-myBold mb-6">Send to</Text>

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
                  <Text className="text-white font-myBold text-lg">{user.name}</Text>
                  <Text className="text-zinc-500 text-sm font-myMedium">{user.username}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#71717A" />
              </TouchableOpacity>
            ))}

            <View className="h-10" />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
