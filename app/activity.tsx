import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FloatingNav } from "../components/FloatingNav";

const TRANSACTIONS = [
  {
    name: "Steam Purchase",
    type: "Entertainment",
    date: "Today, 14:32",
    amount: "-$42.00",
    color: "#3B82F6",
    icon: "game-controller",
  },
  {
    name: "PayPal Transfer",
    type: "Income",
    date: "Yesterday",
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
  {
    name: "Starbucks",
    type: "Food & Drink",
    date: "Jun 20",
    amount: "-$5.40",
    color: "#F59E0B",
    icon: "cafe",
  },
  {
    name: "Uber Rides",
    type: "Transport",
    date: "Jun 18",
    amount: "-$24.50",
    color: "#8B5CF6",
    icon: "car",
  },
  {
    name: "Salary Deposit",
    type: "Income",
    date: "Jun 15",
    amount: "+$4,200.00",
    color: "#10B981",
    icon: "briefcase",
  },
  {
    name: "Netflix",
    type: "Subscription",
    date: "Jun 12",
    amount: "-$15.99",
    color: "#EF4444",
    icon: "tv",
  },
];

export default function ActivityScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");

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
                $1,432.80
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
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="bg-[#121212] border rounded-t-[50px] pt-8 px-8 pb-48 border-t border-zinc-800/50 min-h-screen">
              <Text className="text-white text-xl font-myMedium mb-8">
                Recent Activity
              </Text>

              <View className="gap-y-6">
                {TRANSACTIONS.map((tx, i) => (
                  <TouchableOpacity key={i} className="flex-row items-center">
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
                      className={`text-lg font-myMedium ${
                        tx.amount.startsWith("+")
                          ? "text-green-500"
                          : "text-white"
                      }`}
                    >
                      {tx.amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Floating Navigation */}
          <FloatingNav onProfilePress={() => router.push("/profile")} />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
