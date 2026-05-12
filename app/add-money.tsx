import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../contexts/AuthContext";
import { walletService } from "../services/wallet.service";

type KeypadButtonProps = {
  val: string;
  icon?: string;
  onPress: (val: string) => void;
};

const KeypadButton = ({ val, icon, onPress }: KeypadButtonProps) => (
  <TouchableOpacity
    activeOpacity={0.5}
    onPress={() => onPress(val)}
    className="w-[30%] h-[72px] items-center justify-center rounded-3xl active:bg-zinc-900"
  >
    {icon ? (
      <Ionicons name={icon as any} size={32} color="#A1A1AA" />
    ) : (
      <Text className="text-white text-3xl font-myMedium">{val}</Text>
    )}
  </TouchableOpacity>
);

export default function AddMoneyScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);

  const currency = user?.wallet?.currency || "INR";
  const symbol =
    currency === "USD"
      ? "$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : currency === "JPY"
            ? "¥"
            : "₹";

  const handleKeyPress = (val: string) => {
    if (val === "back") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
      return;
    }
    if (val === "." && amount.includes(".")) return;
    if (amount === "0" && val !== ".") {
      setAmount(val);
    } else {
      if (amount.length >= 8) return;
      setAmount((prev) => prev + val);
    }
  };

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter an amount greater than zero.");
      return;
    }
    setIsProcessing(true);
    try {
      const { checkoutUrl } = await walletService.createTopUp({
        amount: numAmount,
        currency,
      });

      // Open Dodo's hosted checkout. The user enters card / UPI details on Dodo's
      // page; on success Dodo fires a webhook to our backend which credits the
      // wallet. When the browser closes (success or dismiss) we refresh the user
      // so the new balance shows up immediately.
      await WebBrowser.openBrowserAsync(checkoutUrl, {
        dismissButtonStyle: "close",
        toolbarColor: "#000000",
        controlsColor: "#ffffff",
      });

      // Give Dodo a beat to fire the webhook before we refetch user, then refresh.
      // Webhook is the source of truth — if it fires later (network blip etc.)
      // a subsequent home refresh will pick it up.
      await new Promise((r) => setTimeout(r, 1500));
      await refreshUser();
      router.replace("/home");
    } catch (e: any) {
      const message =
        e?.message ?? "Could not start the top-up. Please try again.";
      Alert.alert("Top-up Failed", message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={require("../assets/bg3.png")}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0 }}
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 flex-col justify-between">
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
              disabled={isProcessing}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={isProcessing ? "#3F3F46" : "white"}
              />
            </TouchableOpacity>
            <Text className="text-white text-xl font-myBold ml-5">
              Add Money
            </Text>
          </View>

          {/* Amount display */}
          <View className="flex-1 justify-center items-center">
            <Text className="text-zinc-600 text-xs font-myBold uppercase tracking-[0.2em] mb-4">
              Enter Amount
            </Text>
            <View className="flex-row items-center">
              <Text
                className={
                  "text-5xl font-myBold mr-1 " +
                  (amount === "0" ? "text-zinc-800" : "text-white")
                }
              >
                {symbol}
              </Text>
              <Text
                className={
                  "text-7xl font-myBold tracking-tight " +
                  (amount === "0" ? "text-zinc-700" : "text-white")
                }
              >
                {amount}
              </Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Text className="text-zinc-600 text-xs font-myMedium mr-1.5">
                Pay securely via
              </Text>
              <Image
                source={require("../assets/dodo.png")}
                style={{ width: 12, height: 12, marginRight: 3 }}
                resizeMode="contain"
              />
              <Text className="text-zinc-400 text-xs font-myBold">
                Dodo Payments
              </Text>
            </View>
          </View>

          {/* Keypad + CTA */}
          <View className="pb-8">
            <View className="flex-row flex-wrap justify-between px-8 gap-y-2 mb-8">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
                (num) => (
                  <KeypadButton key={num} val={num} onPress={handleKeyPress} />
                ),
              )}
              <KeypadButton
                val="back"
                icon="backspace-outline"
                onPress={handleKeyPress}
              />
            </View>

            <View className="px-6">
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={amount === "0" || isProcessing}
                onPress={handleConfirm}
                className={
                  "w-full py-4 rounded-2xl flex-row items-center justify-center " +
                  (amount !== "0" && !isProcessing
                    ? "bg-white"
                    : "bg-zinc-900 border border-zinc-800")
                }
              >
                {isProcessing ? (
                  <>
                    <ActivityIndicator size="small" color="#000000" />
                    <Text className="text-black text-lg font-myMedium ml-2">
                      Opening Checkout…
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      className={
                        "text-lg font-myMedium " +
                        (amount !== "0" ? "text-black" : "text-zinc-500")
                      }
                    >
                      Continue to Payment
                    </Text>
                    {amount !== "0" && (
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="black"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </>
                )}
              </TouchableOpacity>
              <Text className="text-zinc-700 text-xs font-myMedium text-center mt-3">
                Your card / UPI details stay on Dodo. NexaPay never sees them.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
