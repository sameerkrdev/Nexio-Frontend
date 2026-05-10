import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
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
  FadeIn,
} from "react-native-reanimated";
import { paymentService, type Payment } from "../services/payment.service";

type ScreenStatus = "loading" | "success" | "failed" | "pending";

export default function PaymentSuccess() {
  const { paymentId, txHash, recipientUsername, currency } =
    useLocalSearchParams<{
      paymentId: string;
      txHash: string;
      recipientUsername: string;
      currency: string;
    }>();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [status, setStatus] = useState<ScreenStatus>("loading");
  const [pollCount, setPollCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Elapsed seconds counter for UX feedback
  useEffect(() => {
    if (status !== "loading") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Poll backend every 2s until webhook has confirmed the payment
  useEffect(() => {
    if (!paymentId) {
      setStatus("failed");
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const p = await paymentService.getPayment(paymentId);
        if (cancelled) return;
        setPayment(p);

        if (p.status === "completed") {
          setStatus("success");
        } else if (p.status === "failed" || p.status === "cancelled") {
          setStatus("failed");
        } else {
          // Still pending — keep polling up to ~40 seconds
          if (pollCount < 20) {
            setTimeout(() => {
              if (!cancelled) setPollCount((c) => c + 1);
            }, 2000);
          } else {
            // Transaction broadcast but webhook hasn't fired yet
            setStatus("pending");
          }
        }
      } catch {
        if (!cancelled) setStatus("failed");
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [paymentId, pollCount]);

  const goHome = () => router.replace("/home");

  // Loading State
  if (status === "loading") {
    return (
      <View className="flex-1 bg-black">
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.springify().damping(13).stiffness(120)}
            className="mb-8"
          >
            <View className="w-32 h-32 rounded-full bg-white/5 border border-white/10 items-center justify-center">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(180).springify()}
            className="text-white text-2xl font-myBold text-center mb-3"
          >
            Confirming Payment
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(260).springify()}
            className="text-zinc-500 text-base font-myMedium text-center max-w-[280px]"
          >
            Please wait while we confirm your transaction ({elapsed}s)
          </Animated.Text>
        </SafeAreaView>
      </View>
    );
  }

  // Success State - Minimalistic Green Screen
  if (status === "success" && payment) {
    return (
      <View className="flex-1 bg-black">
        <StatusBar style="light" />
        <ImageBackground
          source={require("../assets/bg6.png")}
          className="absolute inset-0"
          resizeMode="cover"
          imageStyle={{ opacity: 0.25 }}
        />

        {/* Subtle green tint overlay on success */}
        <Animated.View
          entering={FadeInDown.duration(800)}
          className="absolute inset-0 bg-[#10B981]/10"
        />

        <SafeAreaView className="flex-1 px-6 pt-20 items-center">
          {/* Success Icon at Top */}
          <Animated.View
            entering={ZoomIn.delay(100).springify().damping(14).stiffness(100)}
            className="mb-8"
          >
            <View className="w-32 h-32 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 items-center justify-center">
              <View className="w-24 h-24 rounded-full bg-[#10B981]/20 items-center justify-center">
                <View className="w-16 h-16 rounded-full bg-[#10B981] items-center justify-center shadow-lg shadow-[#10B981]">
                  <Ionicons name="checkmark" size={36} color="white" />
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            entering={FadeInUp.delay(300).springify()}
            className="text-white text-3xl font-myBold text-center mb-3"
          >
            Payment Successful
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(400).springify()}
            className="text-zinc-400 text-base font-myMedium text-center max-w-[300px] mb-10 leading-6"
          >
            Your payment to @{recipientUsername} has been completed and their
            wallet is credited.
          </Animated.Text>

          {/* Payment Details Card */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            className="w-full bg-[#064E3B]/40 border border-[#10B981]/20 rounded-[32px] p-6 mb-8"
          >
            <DetailRow
              label="Recipient"
              value={`@${payment.recipientUsername}`}
            />
            <DetailRow
              label="Fiat Amount"
              value={`${payment.senderCurrencyAmount} ${payment.senderCurrency}`}
            />
            <View className="h-px bg-zinc-800/50 my-2" />
            <DetailRow
              label="Crypto Sent"
              value={`${parseFloat(payment.totalCryptoAmount).toFixed(6)} ${payment.cryptoType}`}
              highlight={true}
            />
            {payment.txHash && (
              <DetailRow
                label="Transaction"
                value={`${payment.txHash.slice(0, 8)}...${payment.txHash.slice(-6)}`}
              />
            )}
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInUp.delay(700).springify()}
            className="w-full gap-y-4 mt-auto mb-8"
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={goHome}
              className="w-full h-[64px] rounded-[32px] bg-white flex-row items-center justify-center"
            >
              <Text className="text-black text-lg font-myBold mr-2">
                Back to Dashboard
              </Text>
              <Ionicons name="arrow-forward" size={20} color="black" />
            </TouchableOpacity>

            {txHash && (
              <TouchableOpacity
                activeOpacity={0.7}
                className="w-full h-[64px] rounded-[32px] bg-zinc-900/80 border border-zinc-800 flex-row items-center justify-center"
              >
                <Ionicons name="open-outline" size={18} color="#71717A" />
                <Text className="text-zinc-400 text-sm font-myMedium ml-2">
                  View on Solana Explorer
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // Pending State
  if (status === "pending") {
    return (
      <View className="flex-1 bg-black">
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.springify().damping(13).stiffness(120)}
            className="mb-8"
          >
            <View className="w-32 h-32 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 items-center justify-center">
              <Ionicons name="time-outline" size={64} color="#EAB308" />
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(180).springify()}
            className="text-white text-2xl font-myBold text-center mb-3"
          >
            Payment Processing
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(260).springify()}
            className="text-zinc-500 text-base font-myMedium text-center max-w-[300px] mb-10"
          >
            Your payment is being processed. This may take a moment — your funds
            are safe.
          </Animated.Text>

          {payment && (
            <Animated.View
              entering={FadeInUp.delay(340).springify()}
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 mb-8"
            >
              <DetailRow
                label="Amount"
                value={`${payment.senderCurrencyAmount} ${payment.senderCurrency}`}
              />
              <DetailRow
                label="Recipient"
                value={`@${payment.recipientUsername}`}
              />
              <DetailRow label="Status" value="Processing" />
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInDown.delay(420).springify()}
            className="w-full"
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={goHome}
              className="w-full bg-white py-5 rounded-2xl flex-row items-center justify-center"
            >
              <Text className="text-black text-xl font-myBold mr-2">
                Back to Dashboard
              </Text>
              <Ionicons name="home" size={22} color="black" />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // Failed State
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={ZoomIn.springify().damping(13).stiffness(120)}
          className="mb-8"
        >
          <View className="w-32 h-32 rounded-full bg-red-500/10 border-2 border-red-500/30 items-center justify-center">
            <Ionicons name="close-circle" size={64} color="#EF4444" />
          </View>
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(180).springify()}
          className="text-white text-2xl font-myBold text-center mb-3"
        >
          Payment Failed
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(260).springify()}
          className="text-zinc-500 text-base font-myMedium text-center max-w-[300px] mb-10"
        >
          Payment could not be completed. Please try again or contact support if
          the issue persists.
        </Animated.Text>

        {payment && (
          <Animated.View
            entering={FadeInUp.delay(340).springify()}
            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 mb-8"
          >
            <DetailRow
              label="Amount"
              value={`${payment.senderCurrencyAmount} ${payment.senderCurrency}`}
            />
            <DetailRow
              label="Recipient"
              value={`@${payment.recipientUsername}`}
            />
            <DetailRow label="Status" value="Failed" />
            {payment.failureReason && (
              <DetailRow label="Reason" value={payment.failureReason} />
            )}
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.delay(420).springify()}
          className="w-full gap-y-3"
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goHome}
            className="w-full bg-white py-5 rounded-2xl flex-row items-center justify-center"
          >
            <Text className="text-black text-xl font-myBold mr-2">
              Back to Dashboard
            </Text>
            <Ionicons name="home" size={22} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl flex-row items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="refresh" size={20} color="#A1A1AA" />
            <Text className="text-zinc-400 text-base font-myMedium ml-2">
              Try Again
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  highlight,
  success,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-white/5 last:border-0">
      <Text className="text-zinc-100 font-myMedium text-sm">{label}</Text>
      <Text
        className={`font-myBold text-sm ${
          highlight ? "text-[#10B981]" : "text-white"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
