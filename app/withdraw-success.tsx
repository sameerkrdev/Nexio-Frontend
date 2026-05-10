import React from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { useWithdrawalById } from "../hooks/useWithdrawals";

export default function WithdrawSuccessScreen() {
  const { withdrawalId } = useLocalSearchParams<{ withdrawalId: string }>();
  const { data: withdrawal } = useWithdrawalById(withdrawalId || "");

  const goHome = () => router.replace("/home");

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
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 items-center justify-center px-6 pt-16 pb-14 min-h-[500px]">
              {/* Success Icon */}
              <Animated.View
                entering={ZoomIn.springify().damping(13).stiffness(120)}
                className="mb-8"
              >
                <View className="w-32 h-32 rounded-full bg-lime-400/10 border border-lime-400/20 items-center justify-center">
                  <Ionicons name="checkmark-circle" size={72} color="#a3e635" />
                </View>
              </Animated.View>

              {/* Title */}
              <Animated.Text
                entering={FadeInUp.delay(180).springify()}
                className="text-white font-myBold text-center mb-3 text-3xl"
              >
                Withdrawal Initiated! 🎉
              </Animated.Text>

              {/* Subtitle */}
              <Animated.Text
                entering={FadeInUp.delay(260).springify()}
                className="text-zinc-400 font-myMedium text-center max-w-[300px] mb-10 leading-6 text-base"
              >
                Your withdrawal request has been submitted successfully. Funds
                will arrive in your account soon.
              </Animated.Text>

              {/* Withdrawal Details */}
              {withdrawal && (
                <Animated.View
                  entering={FadeInUp.delay(340).springify()}
                  className="w-full bg-[#121212] border border-zinc-800/50 rounded-[32px] p-6 mb-8"
                >
                  <DetailRow
                    label="Amount"
                    value={`${withdrawal.currency === "USD" ? "$" : "₹"}${withdrawal.amount}`}
                  />
                  <DetailRow
                    label="Fee"
                    value={`${withdrawal.currency === "USD" ? "$" : "₹"}${withdrawal.feeAmount}`}
                  />
                  <DetailRow
                    label="Net Amount"
                    value={`${withdrawal.currency === "USD" ? "$" : "₹"}${withdrawal.netAmount}`}
                    highlight
                  />
                  <DetailRow label="Method" value={withdrawal.method} />
                  <DetailRow
                    label="Status"
                    value={
                      withdrawal.status.charAt(0).toUpperCase() +
                      withdrawal.status.slice(1)
                    }
                  />
                  <DetailRow
                    label="Estimated Arrival"
                    value={withdrawal.estimatedArrival}
                  />
                </Animated.View>
              )}

              {/* Actions */}
              <Animated.View
                entering={FadeInDown.delay(420).springify()}
                className="w-full gap-3"
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={goHome}
                  className="w-full bg-white py-4 rounded-2xl flex-row items-center justify-center"
                >
                  <Text className="text-black font-myBold mr-2 text-xl">
                    Back to Home
                  </Text>
                  <Ionicons name="home-outline" size={20} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  className="w-full bg-[#121212] border border-zinc-800/50 py-3.5 rounded-2xl flex-row items-center justify-center"
                  onPress={() => router.push("/withdrawal-history")}
                >
                  <Ionicons name="time-outline" size={16} color="#a3e635" />
                  <Text className="text-zinc-400 font-myMedium ml-2 text-sm">
                    View Withdrawal History
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-zinc-800/50 last:border-0">
      <Text className="text-zinc-500 font-myMedium text-sm">{label}</Text>
      <Text
        className={`font-myBold text-sm ${highlight ? "text-white" : "text-white"}`}
      >
        {value}
      </Text>
    </View>
  );
}
