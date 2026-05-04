import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInUp, FadeIn, ZoomIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export default function SuccessCardScreen() {
  const { name, username } = useLocalSearchParams<{
    name: string;
    username: string;
  }>();

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 px-6 pt-12 items-center justify-center">
        {/* Title & Subtitle */}
        <View className="absolute top-32 items-center">
          <Animated.Text
            entering={FadeInUp.delay(1200).springify()}
            className="text-white text-4xl font-myBold text-center mb-3"
          >
            Account Created
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(1300).springify()}
            className="text-zinc-400 text-base font-myMedium text-center max-w-[250px]"
          >
            Your Nexio account has been successfully generated.
          </Animated.Text>
        </View>

        {/* Glow effect behind card */}
        <Animated.View
          entering={FadeIn.delay(800).duration(1000)}
          className="absolute w-64 h-64 bg-[#f8c345]/20 rounded-full top-1/2 -translate-y-1/2"
        />

        {/* The Card */}
        <Animated.View
          entering={ZoomIn.springify().damping(14).stiffness(100)}
          className="w-full aspect-[1.2]"
        >
          <ImageBackground
            source={require("../assets/card.png")}
            className="w-full h-full rounded-[32px] overflow-hidden justify-between border border-zinc-800"
            imageStyle={{ borderRadius: 32 }}
            resizeMode="stretch"
          >
            {/* Top Right Name */}
            <View className="absolute top-7 right-7 left-7">
              <Animated.Text
                entering={FadeInUp.delay(600).springify()}
                className="text-white text-3xl font-black tracking-tighter italic text-right uppercase"
              >
                {name || "NEXIO USER"}
              </Animated.Text>
            </View>

            {/* Bottom Left Details */}
            <View className="absolute bottom-6 left-7">
              <Animated.Text
                entering={FadeInUp.delay(800).springify()}
                className="text-white text-lg font-myRegular mb-1 uppercase"
              >
                {name || "User Name"}
              </Animated.Text>
              <Animated.Text
                entering={FadeInUp.delay(900).springify()}
                className="text-zinc-400 text-lg font-myMedium"
              >
                @{username || "username"}
              </Animated.Text>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* Action Button */}
        <Animated.View
          entering={FadeInUp.delay(1800).springify()}
          className="absolute bottom-12 w-full px-6 mb-8"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-full bg-[white] py-5 rounded-3xl flex-row items-center justify-center"
            onPress={() => router.replace("/home")}
          >
            <Text className="text-black text-xl font-myBold mr-2">
              Enter Dashboard
            </Text>
            <Ionicons name="arrow-forward" size={24} color="black" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
