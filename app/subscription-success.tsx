import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

/**
 * Stub screen for the Dodo `return_url` (myapp://subscription-success).
 *
 * In the happy path the WebBrowser.openAuthSessionAsync session intercepts
 * the redirect itself and closes the in-app browser without ever rendering
 * a screen. This file exists as a safety net: if the redirect somehow lands
 * here as a regular deep-link (e.g. user backgrounded the browser and the OS
 * cold-routed the URL to the app), we just bounce back to /subscription,
 * which re-fetches status and shows the Premium badge.
 */
export default function SubscriptionSuccessScreen() {
  useEffect(() => {
    const t = setTimeout(() => router.replace("/subscription"), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <View className="w-32 h-32 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 items-center justify-center mb-8">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
        <Text className="text-white text-2xl font-myBold text-center mb-3">
          Activating Premium
        </Text>
        <Text className="text-zinc-500 text-base font-myMedium text-center max-w-[280px]">
          Confirming your subscription with Dodo Payments…
        </Text>
      </SafeAreaView>
    </View>
  );
}
