import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

/**
 * Stub screen for the Phantom `onConnect` redirect.
 *
 * Phantom redirects back to `myapp://onConnect?phantom_encryption_public_key=…`
 * after the user approves a wallet-connect request. expo-router automatically
 * navigates to the path segment (`onConnect`), so without this stub it would
 * render the built-in "Unmatched Route" fallback for a beat before our
 * Linking listener in `_layout.tsx` finishes processing and replaces the
 * route. This screen just keeps the UI clean during that hand-off window.
 *
 * All the real work — decrypting the Phantom payload, storing wallet data,
 * navigating to /profile — happens in `_layout.tsx`'s `processUrl`.
 */
export default function OnConnect() {
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <View className="w-32 h-32 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-8">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
        <Text className="text-white text-2xl font-myBold text-center mb-3">
          Connecting Wallet
        </Text>
        <Text className="text-zinc-500 text-base font-myMedium text-center max-w-[280px]">
          Finalizing your Phantom wallet connection…
        </Text>
      </SafeAreaView>
    </View>
  );
}
