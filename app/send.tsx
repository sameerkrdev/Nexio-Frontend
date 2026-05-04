import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

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

  const [amount, setAmount] = useState("0");
  const router = useRouter();

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
            <Text className="text-white text-xl font-mySemiBold">Transfer</Text>
            <View className="w-12" />
          </View>

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
                "text-6xl font-myBold mr-2 " +
                (amount === "0" ? "text-zinc-800" : "text-lime-400")
              }
            >
              $
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
        </View>

        <View className="pb-8">
          <View className="flex-row flex-wrap justify-between px-8 gap-y-2 mb-8">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
              (num) => (
                <KeypadButton key={num} val={num} onPress={handleKeyPress} />
              ),
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
              className={
                "w-full py-5 rounded-3xl flex-row items-center justify-center " +
                (amount !== "0"
                  ? "bg-[#A3E635]"
                  : "bg-zinc-900 border border-zinc-800")
              }
              onPress={() => {
                if (amount !== "0") router.back();
              }}
            >
              <Text
                className={
                  "text-xl font-myBold " +
                  (amount !== "0" ? "text-black" : "text-zinc-500")
                }
              >
                Send ${amount}
              </Text>
              {amount !== "0" ? (
                <View className="ml-2">
                  <Ionicons name="arrow-forward" size={20} color="black" />
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
