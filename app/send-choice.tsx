import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FloatingNav } from "../components/FloatingNav";

export default function SendChoiceScreen() {
  const router = useRouter();

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
          {/* Header */}
          <View className="px-6 pt-6 pb-8 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-12 h-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 mr-4"
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <View>
                <Text className="text-white text-3xl font-myMedium">
                  Send Money
                </Text>
              </View>
            </View>
            <TouchableOpacity className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center">
              <Ionicons name="help-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="bg-[#121212] border rounded-t-[50px] pt-10 px-8 pb-32 border-t border-zinc-800/50 flex-1">
              <Text className="text-white text-xl font-myMedium mb-8">
                Transfer Methods
              </Text>

              <View className="gap-y-6">
                {/* Option: Send to User */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/search-user")}
                  className="flex-row items-center"
                >
                  <View className="w-16 h-16 rounded-3xl bg-white items-center justify-center mr-5 shadow-lg shadow-white/10">
                    <Ionicons name="person" size={28} color="black" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-myMedium">
                      Send to User
                    </Text>
                    <Text className="text-zinc-500 text-sm font-myRegular mt-1">
                      Instant transfer using Nexio username
                    </Text>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-zinc-900/50 items-center justify-center border border-zinc-800">
                    <Ionicons name="chevron-forward" size={18} color="white" />
                  </View>
                </TouchableOpacity>

                {/* Divider */}
                <View className="h-[1px] bg-zinc-800/50 w-full ml-20" />

                {/* Option: Send to Bank */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {}}
                  className="flex-row items-center opacity-50"
                  disabled
                >
                  <View className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 items-center justify-center mr-5">
                    <Ionicons name="business" size={28} color="#52525B" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-zinc-400 text-lg font-myMedium">
                        Send to Bank
                      </Text>
                      <View className="bg-zinc-800/80 px-2 py-0.5 rounded-md ml-2 border border-zinc-700/50">
                        <Text className="text-zinc-500 text-[10px] font-myMedium uppercase tracking-widest">
                          Soon
                        </Text>
                      </View>
                    </View>
                    <Text className="text-zinc-600 text-sm font-myRegular mt-1">
                      Direct deposit to bank accounts
                    </Text>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-transparent items-center justify-center">
                    <Ionicons name="lock-closed" size={16} color="#3F3F46" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <FloatingNav />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
