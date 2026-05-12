import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

/**
 * Stub screen for the Phantom `onSignTransaction` redirect.
 *
 * Phantom redirects back to `myapp://onSignTransaction?data=…&nonce=…` after
 * the user approves a transaction in their wallet. expo-router automatically
 * routes to the path segment (`onSignTransaction`), so without this stub the
 * built-in "Unmatched Route" screen flashes for a beat before the Linking
 * listener in `_layout.tsx` finishes decrypting + broadcasting the tx and
 * `router.replace`s to /payment-success (or /external-payment-success).
 *
 * This screen renders nothing but a loading state during that hand-off.
 */
export default function OnSignTransaction() {
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <View className="w-32 h-32 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-8">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
        <Text className="text-white text-2xl font-myBold text-center mb-3">
          Broadcasting Transaction
        </Text>
        <Text className="text-zinc-500 text-base font-myMedium text-center max-w-[280px]">
          Submitting your signed transaction to the Solana network…
        </Text>
      </SafeAreaView>
    </View>
  );
}
