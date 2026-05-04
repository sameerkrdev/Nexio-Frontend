import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { FloatingNav } from "../components/FloatingNav";

export default function Activity() {
  const transactions = [
    { name: "Sent to Alex M.", time: "Today, 09:30 AM", amount: "-$120.00", icon: "arrow-up", color: "#EF4444", bg: "#451A1A" },
    { name: "Received from Priya S.", time: "Yesterday, 07:45 PM", amount: "+₹8,450.00", icon: "arrow-down", color: "#10B981", bg: "#1A452F" },
    { name: "Converted INR to USD", time: "Yesterday, 06:20 PM", amount: "-₹5,000.00", icon: "swap-horizontal", color: "#8B5CF6", bg: "#2E1A45" },
    { name: "Added money to INR", time: "12 May 2025, 11:10 AM", amount: "+₹20,000.00", icon: "plus", color: "#10B981", bg: "#1A452F" },
    { name: "Netflix Subscription", time: "10 May 2025, 08:00 PM", amount: "-₹799.00", icon: "minus", color: "#EF4444", bg: "#451A1A" },
    { name: "Amazon Purchase", time: "08 May 2025, 02:30 PM", amount: "-₹1,250.00", icon: "cart", color: "#EF4444", bg: "#451A1A" },
  ];

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <Text className="text-white text-3xl font-myBold">Activity</Text>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800">
            <Ionicons name="filter-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="px-6 mt-4">
          <View className="mb-32">
            <Text className="text-zinc-500 font-myMedium mb-4 uppercase text-xs tracking-widest">Recent Transactions</Text>
            {transactions.map((tx, i) => (
              <View
                key={i}
                className="flex-row items-center bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800/50 mb-4"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: tx.bg }}
                >
                  <MaterialCommunityIcons
                    name={tx.icon as any}
                    size={22}
                    color={tx.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-mySemiBold text-base">{tx.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-1">{tx.time}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white font-myBold text-base">{tx.amount}</Text>
                  <View className="bg-lime-400/10 px-2 py-1 rounded-md mt-1">
                    <Text className="text-lime-400 text-[10px] font-myBold uppercase">Success</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <FloatingNav />
      </SafeAreaView>
    </View>
  );
}
