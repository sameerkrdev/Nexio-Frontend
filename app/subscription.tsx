import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../contexts/AuthContext";
import {
  subscriptionService,
  type SubscriptionStatus,
} from "../services/subscription.service";

const PERKS = [
  {
    icon: "trending-up" as const,
    title: "₹10,000 / $2,000 daily send limit",
    body: "Send up to ₹10,000 a day in India or $2,000 internationally on the premium tier.",
  },
  {
    icon: "flash" as const,
    title: "Priority processing",
    body: "Your payments and withdrawals jump the queue for faster settlement.",
  },
  {
    icon: "shield-checkmark" as const,
    title: "No service fees on top-ups",
    body: "Wallet top-ups via card and UPI are fee-free for premium members.",
  },
];

const symbolFor = (currency: string): string => {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "JPY":
      return "¥";
    default:
      return "₹";
  }
};

const formatExpiry = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  const loadStatus = async () => {
    try {
      const data = await subscriptionService.getStatus();
      setStatus(data);
    } catch (e: any) {
      console.warn("[Subscription] status fetch failed:", e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSubscribe = async () => {
    if (isInitializing) return;
    setIsInitializing(true);
    try {
      const RETURN_URL = "myapp://subscription-success";
      const { checkoutUrl, subscriptionId } =
        await subscriptionService.initCheckout({ returnUrl: RETURN_URL });

      // openAuthSessionAsync watches for the RETURN_URL — when Dodo redirects
      // to it after successful checkout, the in-app browser closes itself and
      // we get { type: 'success' } back. If the user dismisses manually we get
      // { type: 'dismiss' / 'cancel' }.
      const result = await WebBrowser.openAuthSessionAsync(
        checkoutUrl,
        RETURN_URL,
        {
          dismissButtonStyle: "close",
          toolbarColor: "#000000",
          controlsColor: "#ffffff",
        },
      );

      if (result.type !== "success" && result.type !== "dismiss") {
        // 'cancel' or anything else — user explicitly aborted; nothing to do.
        return;
      }

      // 1. Fast path: the subscription.active webhook may have fired during
      //    checkout. Refresh once and check.
      await Promise.all([loadStatus(), refreshUser()]);

      // 2. Slow path: if status is still inactive, ask the backend to verify
      //    directly with Dodo (skips the webhook entirely). Then poll a couple
      //    more times in case Dodo's state propagation is delayed.
      try {
        const verifyResult = await subscriptionService.verify(subscriptionId);
        if (verifyResult.isActive) {
          await Promise.all([loadStatus(), refreshUser()]);
        }
      } catch (verifyErr) {
        console.warn("[Subscription] verify failed:", verifyErr);
      }

      // 3. Last-resort: poll getStatus up to 4 more times (every 1.5s = 6s
      //    total) in case the webhook is just lagging. Stops as soon as the
      //    status flips to active.
      for (let attempt = 0; attempt < 4; attempt++) {
        const fresh = await subscriptionService.getStatus();
        setStatus(fresh);
        if (fresh.isActive) {
          await refreshUser();
          break;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (e: any) {
      Alert.alert(
        "Could not start checkout",
        e?.message ?? "Please try again in a moment.",
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const isPremium = status?.isActive ?? false;
  const symbol = status ? symbolFor(status.currency) : "₹";

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
          <View className="px-6 py-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-myBold ml-5">
              NexaPay Premium
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          >
            {/* Hero */}
            <Animated.View
              entering={ZoomIn.springify().damping(14).stiffness(100)}
              className="items-center mb-8"
            >
              <View
                className={
                  "w-24 h-24 rounded-full items-center justify-center mb-4 " +
                  (isPremium
                    ? "bg-[#10B981]/15 border border-[#10B981]/30"
                    : "bg-yellow-400/10 border border-yellow-400/30")
                }
              >
                <Ionicons
                  name={isPremium ? "checkmark-circle" : "diamond"}
                  size={48}
                  color={isPremium ? "#10B981" : "#FACC15"}
                />
              </View>
              <Text className="text-white text-3xl font-myBold text-center">
                {isPremium ? "You're Premium" : "Go Premium"}
              </Text>
              <Text className="text-zinc-400 text-base font-myMedium text-center mt-2 max-w-[300px]">
                {isPremium
                  ? `Active until ${formatExpiry(status?.expiresAt ?? null)}.`
                  : "Higher limits and priority processing for your daily payments."}
              </Text>
            </Animated.View>

            {/* Limit badges */}
            <Animated.View
              entering={FadeInDown.delay(120).springify()}
              className="flex-row gap-3 mb-6"
            >
              <View className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                <Text className="text-zinc-500 text-xs font-myMedium uppercase tracking-widest mb-1">
                  Daily limit
                </Text>
                <Text className="text-white text-xl font-myBold">₹10,000</Text>
                <Text className="text-zinc-500 text-xs font-myMedium mt-0.5">
                  India
                </Text>
              </View>
              <View className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                <Text className="text-zinc-500 text-xs font-myMedium uppercase tracking-widest mb-1">
                  Daily limit
                </Text>
                <Text className="text-white text-xl font-myBold">$2,000</Text>
                <Text className="text-zinc-500 text-xs font-myMedium mt-0.5">
                  International
                </Text>
              </View>
            </Animated.View>

            {/* Perks */}
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              className="bg-zinc-900/60 border border-zinc-800 rounded-[28px] p-5 mb-6 gap-4"
            >
              {PERKS.map((perk) => (
                <View key={perk.title} className="flex-row items-start">
                  <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3 border border-white/10">
                    <Ionicons name={perk.icon} size={18} color="#FACC15" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-myBold text-base">
                      {perk.title}
                    </Text>
                    <Text className="text-zinc-500 font-myMedium text-sm mt-1 leading-5">
                      {perk.body}
                    </Text>
                  </View>
                </View>
              ))}
            </Animated.View>

            {/* Pricing + CTA */}
            <Animated.View
              entering={FadeInUp.delay(280).springify()}
              className="bg-[#121212] border border-zinc-800/50 rounded-[28px] p-6"
            >
              {isLoading ? (
                <View className="py-6 items-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              ) : (
                <>
                  <Text className="text-zinc-500 text-xs font-myMedium uppercase tracking-widest mb-2">
                    Price
                  </Text>
                  <View className="flex-row items-baseline mb-1">
                    <Text className="text-white text-4xl font-myBold">
                      {symbol}
                      {status?.price ?? 199}
                    </Text>
                    <Text className="text-zinc-500 font-myMedium ml-2 text-sm">
                      / {status?.durationDays ?? 30} days
                    </Text>
                  </View>
                  <Text className="text-zinc-500 font-myRegular text-xs mb-5">
                    One-time charge. No auto-renewal.
                  </Text>

                  {isPremium ? (
                    <View className="w-full h-[60px] rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex-row items-center justify-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10B981"
                      />
                      <Text className="text-[#10B981] font-myBold ml-2 text-base">
                        Subscription Active
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleSubscribe}
                      activeOpacity={0.85}
                      disabled={isInitializing}
                      className={
                        "w-full h-[60px] rounded-2xl flex-row items-center justify-center " +
                        (isInitializing
                          ? "bg-zinc-800 border border-zinc-700"
                          : "bg-white")
                      }
                    >
                      {isInitializing ? (
                        <>
                          <ActivityIndicator size="small" color="#ffffff" />
                          <Text className="text-white font-myBold ml-2 text-base">
                            Opening Checkout…
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text className="text-black font-myBold text-base mr-2">
                            Subscribe via
                          </Text>
                          <Image
                            source={require("../assets/dodo.png")}
                            style={{ width: 18, height: 18, marginRight: 4 }}
                            resizeMode="contain"
                          />
                          <Text className="text-black font-myBold text-base">
                            Dodo Payments
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  <Text className="text-zinc-600 font-myRegular text-xs text-center mt-3">
                    Secure card / UPI checkout. NexaPay never sees your card.
                  </Text>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
