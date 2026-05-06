import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { paymentService, type Currency } from "../services/payment.service";
import { signTransactionWithPhantom } from "../lib/phantom";
import { getSession, getSharedSecret } from "../store/walletStore";
import { setPendingPayment } from "../store/pendingPaymentStore";

// 0.5% service fee — mirrors SERVICE_FEE_PERCENT on the backend
const SERVICE_FEE_PERCENT = 0.005;

const TOKEN_ICONS: Record<string, string> = {
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  LINK: "https://cryptologos.cc/logos/chainlink-link-logo.png",
};

const COINGECKO_IDS: Record<string, string> = {
  SOL: "solana",
  USDC: "usd-coin",
  USDT: "tether",
  LINK: "chainlink",
};

export default function PaymentConfirm() {
  const { fiatAmount, fiatCurrency, currency, recipientUsername, recipientName, recipientAvatar } =
    useLocalSearchParams<{
      fiatAmount: string;
      fiatCurrency: string;
      currency: string;
      recipientUsername: string;
      recipientName: string;
      recipientAvatar: string;
    }>();

  const [isSending, setIsSending] = useState(false);
  const [fiatRate, setFiatRate] = useState<number | null>(null);

  const baseFiat = parseFloat(fiatAmount ?? "0");
  const fiatFee = baseFiat * SERVICE_FEE_PERCENT;
  const totalFiat = baseFiat + fiatFee;

  const fiatSymbol = fiatCurrency === "USD" ? "$" : fiatCurrency === "EUR" ? "€" : fiatCurrency === "JPY" ? "¥" : "₹";

  const toCryptoStr = (val: number): string => {
    if (!fiatRate) return "";
    return `≈ ${(val / fiatRate).toFixed(6)} ${currency}`;
  };

  // Fetch live rate from CoinGecko
  useEffect(() => {
    const coinId = COINGECKO_IDS[currency ?? "SOL"];
    const targetCurrency = (fiatCurrency || "inr").toLowerCase();
    if (!coinId) return;

    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${targetCurrency}`
    )
      .then((r) => r.json())
      .then((data) => {
        const rate = data?.[coinId]?.[targetCurrency];
        if (rate) setFiatRate(rate);
      })
      .catch(() => {
        // silently fail
      });
  }, [currency, fiatCurrency]);

  const handleConfirm = async () => {
    if (isSending) return;

    const session = getSession();
    const sharedSecret = getSharedSecret();

    if (!session || !sharedSecret) {
      Alert.alert(
        "Wallet not connected",
        "Please connect your Phantom wallet from the Profile screen first."
      );
      return;
    }

    if (!fiatRate) {
      Alert.alert("Fetching rates", "Please wait for live rates to load before confirming.");
      return;
    }

    setIsSending(true);
    try {
      const cryptoAmount = (baseFiat / fiatRate).toFixed(6);

      // Step 1: Create the payment intent on backend
      const intent = await paymentService.createPayment(
        recipientUsername,
        cryptoAmount,
        currency as Currency
      );

      // Step 2: Store paymentId so _layout.tsx can retrieve it after Phantom redirect
      setPendingPayment(intent.paymentId, recipientUsername, currency);

      // Step 3: Open Phantom for signing — app goes to background
      // _layout.tsx handles the onSignTransaction redirect → payment-success
      await signTransactionWithPhantom(intent.transaction, session, sharedSecret);
    } catch (e: any) {
      Alert.alert("Payment Error", e?.message ?? "Something went wrong. Please try again.");
      setIsSending(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isSending}
            className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
          >
            <Ionicons name="arrow-back" size={24} color={isSending ? "#3F3F46" : "white"} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-myBold ml-5">Review Payment</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        >
          {/* Recipient card */}
          <Animated.View
            entering={FadeInUp.delay(80).springify()}
            className="bg-zinc-900/60 border border-zinc-800 rounded-[32px] p-6 mb-5 items-center"
          >
            <Image
              source={{
                uri:
                  recipientAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(recipientName ?? "")}&background=A3E635&color=000`,
              }}
              className="w-20 h-20 rounded-full border-2 border-lime-400 mb-4"
            />
            <Text className="text-white text-2xl font-myBold">{recipientName}</Text>
            <Text className="text-zinc-500 font-myMedium mt-1 text-base">
              @{recipientUsername}
            </Text>
          </Animated.View>

          {/* Fee breakdown card */}
          <Animated.View
            entering={FadeInUp.delay(160).springify()}
            className="bg-zinc-900/60 border border-zinc-800 rounded-[32px] p-6 mb-6"
          >
            {/* Token header */}
            <View className="flex-row items-center mb-5">
              <Image
                source={{ uri: TOKEN_ICONS[currency ?? "SOL"] }}
                className="w-7 h-7 rounded-full mr-3"
              />
              <Text className="text-white font-myBold text-lg">
                {currency} Payment
              </Text>
            </View>

            <FeeRow
              label="You're sending"
              value={`${fiatSymbol}${baseFiat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub={toCryptoStr(baseFiat)}
            />
            <FeeRow
              label="Service fee (0.5%)"
              value={`${fiatSymbol}${fiatFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub={toCryptoStr(fiatFee)}
            />

            <View className="h-px bg-zinc-800 my-3" />

            <FeeRow
              label="Total deducted from wallet"
              value={`${fiatSymbol}${totalFiat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub={toCryptoStr(totalFiat)}
              highlight
            />
            <FeeRow
              label="Recipient receives"
              value={`${fiatSymbol}${baseFiat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub={`Credited to their ${fiatCurrency} wallet`}
            />

            {/* Live rate badge */}
            {fiatRate ? (
              <View className="mt-5 bg-zinc-800/60 rounded-2xl px-4 py-3 flex-row items-center justify-center">
                <Ionicons name="trending-up-outline" size={14} color="#71717A" />
                <Text className="text-zinc-500 text-xs font-myMedium ml-2">
                  Live rate: 1 {currency} = {fiatSymbol}{fiatRate.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </Text>
              </View>
            ) : (
              <View className="mt-5 bg-zinc-800/60 rounded-2xl px-4 py-3 flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#52525B" />
                <Text className="text-zinc-600 text-xs font-myMedium ml-2">
                  Fetching live rate…
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Info note */}
          <Animated.View
            entering={FadeInUp.delay(240).springify()}
            className="flex-row items-start bg-zinc-900/40 border border-zinc-800/60 rounded-2xl px-4 py-3 mb-8"
          >
            <Ionicons name="information-circle-outline" size={16} color="#71717A" style={{ marginTop: 1 }} />
            <Text className="text-zinc-600 text-xs font-myMedium ml-2 flex-1 leading-5">
              Crypto goes to Nexio's custody wallet on Solana. The recipient's INR balance
              is credited instantly after blockchain confirmation.
            </Text>
          </Animated.View>

          {/* Confirm button */}
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isSending}
              onPress={handleConfirm}
              className={`w-full py-[22px] rounded-3xl flex-row items-center justify-center ${
                isSending
                  ? "bg-zinc-900 border border-zinc-800"
                  : "bg-lime-400"
              }`}
            >
              {isSending ? (
                <>
                  <ActivityIndicator size="small" color="#A3E635" />
                  <Text className="text-lime-400 text-lg font-myBold ml-3">
                    Opening Phantom…
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-black text-xl font-myBold mr-2">
                    Confirm & Pay {fiatSymbol}{totalFiat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="black" />
                </>
              )}
            </TouchableOpacity>
            <Text className="text-zinc-700 text-xs font-myMedium text-center mt-4">
              Phantom wallet will open to sign this transaction
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FeeRow({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-start py-[10px]">
      <Text className="text-zinc-500 font-myMedium text-sm flex-1 mr-4">{label}</Text>
      <View className="items-end">
        <Text
          className={`font-myBold text-sm ${
            highlight ? "text-lime-400" : "text-white"
          }`}
        >
          {value}
        </Text>
        {sub ? (
          <Text className="text-zinc-600 text-xs font-myMedium mt-0.5">{sub}</Text>
        ) : null}
      </View>
    </View>
  );
}
