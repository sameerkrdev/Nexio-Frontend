import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
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

  // Poll backend every 2s until Helius webhook has confirmed the payment
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-6 pt-16 pb-14 min-h-[500px]">
            {/* Status icon */}
            <Animated.View
              entering={ZoomIn.springify().damping(13).stiffness(120)}
              className="mb-8"
            >
              {status === "loading" && (
                <View className="w-32 h-32 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              )}
              {status === "success" && (
                <View className="w-32 h-32 rounded-full bg-white/5 border border-white/20 items-center justify-center">
                  <Ionicons name="checkmark-circle" size={72} color="white" />
                </View>
              )}
              {status === "pending" && (
                <View className="w-32 h-32 rounded-full bg-yellow-400/10 border-2 border-yellow-400/30 items-center justify-center">
                  <Ionicons name="time-outline" size={72} color="#FACC15" />
                </View>
              )}
              {status === "failed" && (
                <View className="w-32 h-32 rounded-full bg-red-500/10 border-2 border-red-500/30 items-center justify-center">
                  <Ionicons name="close-circle" size={72} color="#EF4444" />
                </View>
              )}
            </Animated.View>

            {/* Title */}
            <Animated.Text
              entering={FadeInUp.delay(180).springify()}
              className="text-white text-3xl font-myBold text-center mb-3"
            >
              {status === "loading" && "Confirming…"}
              {status === "success" && "Payment Sent! 🎉"}
              {status === "pending" && "Broadcast"}
              {status === "failed" && "Payment Failed"}
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
              entering={FadeInUp.delay(260).springify()}
              className="text-zinc-400 text-base font-myMedium text-center max-w-[300px] mb-10 leading-6"
            >
              {status === "loading" &&
                `Waiting for Helius to confirm on-chain… (${elapsed}s)`}
              {status === "success" &&
                `Your payment to @${recipientUsername} is confirmed. Their INR wallet has been credited.`}
              {status === "pending" &&
                "Transaction was broadcast to Solana. Helius confirmation may take a moment — your payment is safe."}
              {status === "failed" &&
                "Something went wrong during processing. No funds have been lost if the transaction failed on-chain."}
            </Animated.Text>

            {/* Payment details card */}
            {payment && (
              <Animated.View
                entering={FadeInUp.delay(340).springify()}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-[32px] p-6 mb-8"
              >
                <DetailRow
                  label="Recipient"
                  value={`@${payment.recipientUsername}`}
                />
                <DetailRow
                  label="Base amount"
                  value={`${payment.senderCurrencyAmount} ${payment.senderCurrency}`}
                />
                <DetailRow
                  label="Platform fee"
                  value={`${payment.platformFeeAmount} ${payment.senderCurrency}`}
                />
                <DetailRow
                  label="Crypto sent"
                  value={`${parseFloat(payment.totalCryptoAmount).toFixed(6)} ${payment.cryptoType}`}
                  highlight
                />
                <DetailRow
                  label="Status"
                  value={
                    payment.status.charAt(0).toUpperCase() +
                    payment.status.slice(1)
                  }
                />
                {payment.txHash && (
                  <DetailRow
                    label="Tx hash"
                    value={`${payment.txHash.slice(0, 10)}…${payment.txHash.slice(-8)}`}
                  />
                )}
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
                <Text className="text-black text-xl font-myBold mr-2">
                  Back to Dashboard
                </Text>
                <Ionicons name="home-outline" size={20} color="black" />
              </TouchableOpacity>

              {txHash && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="w-full bg-zinc-900 border border-zinc-800 py-3.5 rounded-2xl flex-row items-center justify-center"
                  onPress={() => {
                    // Could open Solana explorer — for now just shows a hint
                  }}
                >
                  <Ionicons name="open-outline" size={16} color="#71717A" />
                  <Text className="text-zinc-500 text-sm font-myMedium ml-2">
                    View on Solana Explorer
                  </Text>
                </TouchableOpacity>
              )}
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
        className={`font-myBold text-sm ${
          highlight ? "text-white" : "text-white"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
