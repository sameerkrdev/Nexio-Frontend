import React from "react";
import { View, Text, TouchableOpacity, Image, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { FloatingNav } from "../components/FloatingNav";

export default function SendChoiceScreen() {
  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={require("../assets/bg6.png")}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0.2 }}
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 px-6">
          {/* Header */}
        <View className="items-center mt-6 mb-8">
          <Text className="text-white text-2xl font-myMedium">Send Money</Text>
        </View>

        <Text className="text-zinc-500 text-base font-myRegular text-center mb-10 px-4 leading-6">
          Choose how you would like to transfer your funds today.
        </Text>

        <View className="gap-y-4">
          {/* Option: Send to User */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/search-user")}
            className="bg-[#121212] p-5 rounded-[32px] border border-zinc-800/50 flex-row items-center"
          >
            <View className="w-14 h-14 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/5">
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-myMedium mb-1">
                Send to User
              </Text>
              <Text className="text-zinc-400 text-sm font-myRegular leading-5 pr-4">
                Instant transfer using their Nexio username securely.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#71717A" />
          </TouchableOpacity>

          {/* Option: Send to Bank */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => console.log("Bank transfer not implemented")}
            className="bg-[#121212] p-5 rounded-[32px] border border-zinc-800/50 flex-row items-center opacity-60"
            disabled
          >
            <View className="w-14 h-14 bg-white/5 rounded-2xl items-center justify-center mr-5 border border-white/5">
              <Ionicons name="business" size={24} color="white" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-white text-lg font-myMedium mr-2">
                  Send to Bank
                </Text>
                <View className="bg-zinc-800 px-2 py-0.5 rounded-md">
                  <Text className="text-zinc-400 text-[10px] font-myMedium uppercase">
                    Soon
                  </Text>
                </View>
              </View>
              <Text className="text-zinc-400 text-sm font-myRegular leading-5 pr-4">
                Transfer directly to any local or global bank account.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#71717A" />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View className="mt-auto mb-6 bg-transparent flex-row items-center justify-center">
          <Ionicons name="shield-checkmark-outline" size={16} color="#71717A" />
          <Text className="text-zinc-500 text-xs font-myRegular ml-2">
            All transactions are securely encrypted.
          </Text>
        </View>
        <FloatingNav onProfilePress={() => router.push("/profile")} />
      </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
