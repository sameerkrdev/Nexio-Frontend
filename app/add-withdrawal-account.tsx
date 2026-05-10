import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAvailableMethods } from "../hooks/useWithdrawals";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function AddWithdrawalAccountScreen() {
  const router = useRouter();
  const { data: methodsData, isLoading } = useAvailableMethods();

  const availableMethods = methodsData?.availableMethods || [];

  const formatMethodLabel = (method: string) => {
    return method
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toUpperCase())
      .join(" ");
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "UPI":
        return "flash";
      case "BANK_TRANSFER":
        return "business";
      case "IMPS":
        return "rocket";
      case "NEFT":
        return "time";
      case "ACH":
        return "card";
      case "WIRE":
        return "globe";
      case "ZELLE":
        return "send";
      default:
        return "wallet";
    }
  };

  const getMethodLogo = (method: string) => {
    switch (method) {
      case "UPI":
        return require("../assets/upi.png");
      case "IMPS":
        return require("../assets/imps.svg.png");
      default:
        return null;
    }
  };

  const handleMethodSelect = (method: string) => {
    router.push({
      pathname: "/add-account-form",
      params: { method },
    });
  };

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
          <View className="px-6 py-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 rounded-full bg-zinc-900/60 items-center justify-center border border-zinc-800/50"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-6"
          >
            {/* Title */}
            <View className="mb-6">
              <Text className="text-white font-myBold text-2xl mb-2">
                Choose Payment Method
              </Text>
              <Text className="text-zinc-500 font-myMedium text-base">
                Select how you'd like to receive your funds
              </Text>
            </View>

            {isLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            ) : (
              <View className="gap-y-3 mb-8">
                {availableMethods.map((method, index) => {
                  const logo = getMethodLogo(method.method);
                  return (
                    <Animated.View
                      key={method.method}
                      entering={FadeInDown.delay(index * 80).springify()}
                    >
                      <TouchableOpacity
                        onPress={() => handleMethodSelect(method.method)}
                        className="bg-white/5 border border-white/10 rounded-[20px] p-5 active:bg-white/10"
                      >
                        <View className="flex-row items-center">
                          {/* Icon/Logo Box */}
                          {logo ? (
                            <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center mr-4 p-1">
                              <View className="w-full h-full rounded-xl bg-white items-center justify-center">
                                <Image
                                  source={logo}
                                  className="w-10 h-10"
                                  resizeMode="contain"
                                />
                              </View>
                            </View>
                          ) : (
                            <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center mr-4 p-1">
                              <View className="w-full h-full rounded-xl bg-white items-center justify-center">
                                <Ionicons
                                  name={getMethodIcon(method.method) as any}
                                  size={28}
                                  color="black"
                                />
                              </View>
                            </View>
                          )}

                          {/* Method Details */}
                          <View className="flex-1">
                            <Text className="text-white font-myBold text-lg mb-1">
                              {formatMethodLabel(method.label)}
                            </Text>
                            <View className="flex-row items-center gap-x-3">
                              <View className="flex-row items-center">
                                <Ionicons
                                  name="time-outline"
                                  size={14}
                                  color="#A1A1AA"
                                />
                                <Text className="text-zinc-400 font-myMedium text-xs ml-1">
                                  {method.estimatedTime}
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <Ionicons
                                  name="cash-outline"
                                  size={14}
                                  color="#A1A1AA"
                                />
                                <Text className="text-zinc-400 font-myMedium text-xs ml-1">
                                  {method.fee}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Arrow */}
                          <Ionicons
                            name="chevron-forward"
                            size={22}
                            color="#A1A1AA"
                          />
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
