import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  ImageBackground,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  paymentService,
  type Currency,
  type PaymentQuote,
} from "../services/payment.service";
import { signTransactionWithPhantom } from "../lib/phantom";
import { getSession, getSharedSecret, useWallet } from "../store/walletStore";
import { setPendingPayment } from "../store/pendingPaymentStore";
import { SlideToConfirm } from "../components/SlideToConfirm";
import { balanceService } from "../services/balance.service";

const TOKEN_ICONS: Record<string, string> = {
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  LINK: "https://cryptologos.cc/logos/chainlink-link-logo.png",
};

export default function PaymentConfirm() {
  const {
    fiatAmount,
    fiatCurrency,
    currency,
    recipientUsername,
    recipientName,
    recipientAvatar,
  } = useLocalSearchParams<{
    fiatAmount: string;
    fiatCurrency: string;
    currency: string;
    recipientUsername: string;
    recipientName: string;
    recipientAvatar: string;
  }>();

  const { address } = useWallet(); // Call the hook at component level
  const [isSending, setIsSending] = useState(false);
  const [quote, setQuote] = useState<PaymentQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [requiredBalance, setRequiredBalance] = useState("0");
  const [currentBalanceStr, setCurrentBalanceStr] = useState("0");

  const baseFiat = parseFloat(fiatAmount ?? "0");
  const platformFeePercent = quote ? parseFloat(quote.platformFeePercent) : 1.5;
  const fiatFee = (baseFiat * platformFeePercent) / 100;
  const totalFiat = baseFiat + fiatFee;

  const fiatSymbol =
    fiatCurrency === "USD"
      ? "$"
      : fiatCurrency === "EUR"
        ? "€"
        : fiatCurrency === "JPY"
          ? "¥"
          : "₹";

  const toCryptoStr = (val: number): string => {
    if (!quote) return "";
    const rate = parseFloat(quote.cryptoPriceInSenderCurrency);
    return `≈ ${(val / rate).toFixed(6)} ${currency}`;
  };

  // Fetch quote from backend (includes live rate from CoinGecko)
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setIsLoadingQuote(true);
        console.log("Fetching quote for:", {
          recipientUsername,
          currency,
          fiatCurrency,
        });
        const quoteData = await paymentService.getQuote(
          recipientUsername,
          currency as Currency,
          fiatCurrency || "INR",
        );
        console.log("Quote received:", quoteData);
        setQuote(quoteData);
      } catch (error: any) {
        console.error("Quote fetch error:", error);
        console.error("Error details:", {
          message: error?.message,
          statusCode: error?.statusCode,
          details: error?.details,
        });
        Alert.alert(
          "Rate Fetch Error",
          error?.message ?? "Failed to fetch live rates. Please try again.",
        );
      } finally {
        setIsLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [currency, fiatCurrency, recipientUsername]);

  const handleConfirm = async () => {
    if (isSending) return;

    const session = getSession();
    const sharedSecret = getSharedSecret();

    if (!session || !sharedSecret || !address) {
      Alert.alert(
        "Wallet not connected",
        "Please connect your Phantom wallet from the Profile screen first.",
      );
      return;
    }

    if (!quote) {
      Alert.alert(
        "Fetching rates",
        "Please wait for live rates to load before confirming.",
      );
      return;
    }

    setIsSending(true);

    try {
      const cryptoRate = parseFloat(quote.cryptoPriceInSenderCurrency);

      // Check wallet balance
      const totalCryptoCost = totalFiat / cryptoRate;
      let currentBalance = Infinity; // default to skip check for unsupported tokens
      let balanceStr = "0";

      if (currency === "SOL") {
        balanceStr = await balanceService.getSolBalance(address);
        currentBalance = parseFloat(balanceStr);
      } else if (currency === "ETH") {
        balanceStr = await balanceService.getEthBalance(address);
        currentBalance = parseFloat(balanceStr);
      }

      if (currentBalance < totalCryptoCost) {
        setRequiredBalance(totalCryptoCost.toFixed(4));
        setCurrentBalanceStr(currentBalance.toFixed(4));
        setShowInsufficientModal(true);
        setIsSending(false);
        return;
      }

      // Step 1: Create the payment intent on backend with all required parameters
      const intent = await paymentService.createPayment({
        recipientUsername,
        senderCurrencyAmount: baseFiat.toFixed(2),
        senderCurrency: quote.senderCurrency,
        receiverCurrency: quote.receiverCurrency,
        cryptoType: currency as Currency,
        cryptoToSenderRate: cryptoRate,
        senderToReceiverRate: parseFloat(quote.senderToReceiverRate),
        platformFeePercent: quote.platformFeePercent,
      });

      // Step 2: Store paymentId so _layout.tsx can retrieve it after Phantom redirect
      setPendingPayment(intent.paymentId, recipientUsername, currency);

      // Step 3: Open Phantom for signing — app goes to background
      // _layout.tsx handles the onSignTransaction redirect → payment-success
      await signTransactionWithPhantom(
        intent.transaction,
        session,
        sharedSecret,
      );
    } catch (e: any) {
      Alert.alert(
        "Payment Error",
        e?.message ?? "Something went wrong. Please try again.",
      );
      setIsSending(false);
    }
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
          <View className="px-6 py-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isSending}
              className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={isSending ? "#3F3F46" : "white"}
              />
            </TouchableOpacity>
            <Text className="text-white text-xl font-myBold ml-5">
              Review Payment
            </Text>
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
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(recipientName ?? "")}&background=121212&color=fff`,
                }}
                className="w-20 h-20 rounded-full border border-zinc-800 mb-4"
              />
              <Text className="text-white text-2xl font-myBold">
                {recipientName}
              </Text>
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
                label={`Service fee (${platformFeePercent.toFixed(1)}%)`}
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
              {quote ? (
                <View className="mt-5 bg-zinc-800/60 rounded-2xl px-4 py-3 flex-row items-center justify-center">
                  <Ionicons
                    name="trending-up-outline"
                    size={14}
                    color="#71717A"
                  />
                  <Text className="text-zinc-500 text-xs font-myMedium ml-2">
                    Live rate: 1 {currency} = {fiatSymbol}
                    {parseFloat(
                      quote.cryptoPriceInSenderCurrency,
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    • via {quote.rateSource}
                  </Text>
                </View>
              ) : (
                <View className="mt-5 bg-zinc-800/60 rounded-2xl px-4 py-3 flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#52525B" />
                  <Text className="text-zinc-600 text-xs font-myMedium ml-2">
                    Fetching live rate from backend…
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Info note */}
            <Animated.View
              entering={FadeInUp.delay(240).springify()}
              className="flex-row items-start bg-zinc-900/40 border border-zinc-800/60 rounded-2xl px-4 py-3 mb-8"
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#71717A"
                style={{ marginTop: 1 }}
              />
              <Text className="text-zinc-600 text-xs font-myMedium ml-2 flex-1 leading-5">
                Crypto goes to NexaPay's custody wallet on Solana. The recipient's
                INR balance is credited instantly after blockchain confirmation.
              </Text>
            </Animated.View>

            {/* Confirm button */}
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              {isSending ? (
                <View className="w-full h-[72px] rounded-[36px] bg-zinc-900 border border-zinc-800 flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white text-xl font-myBold mx-3">
                    Opening Phantom
                  </Text>
                  <Image
                    source={require("../assets/phantom.png")}
                    className="w-7 h-7"
                    resizeMode="contain"
                  />
                </View>
              ) : isLoadingQuote || !quote ? (
                <View className="w-full h-[72px] rounded-[36px] bg-zinc-900 border border-zinc-800 flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#52525B" />
                  <Text className="text-zinc-600 text-lg font-myBold ml-3">
                    Loading rates…
                  </Text>
                </View>
              ) : (
                <SlideToConfirm
                  onConfirm={handleConfirm}
                  disabled={isLoadingQuote || !quote}
                  text="Slide to Confirm Payment"
                  amount={`${fiatSymbol}${totalFiat.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                  isLoading={isSending}
                />
              )}
              <Text className="text-zinc-700 text-xs font-myMedium text-center mt-4">
                {quote
                  ? "Phantom wallet will open to sign this transaction"
                  : "Fetching live rates from backend…"}
              </Text>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* Insufficient Balance Modal */}
      <Modal visible={showInsufficientModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <Animated.View
            entering={FadeInUp.springify()}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 items-center"
          >
            <View className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 items-center justify-center mb-4">
              <Ionicons name="warning-outline" size={32} color="#EF4444" />
            </View>
            <Text className="text-white text-xl font-myBold mb-2 text-center">
              Insufficient Balance
            </Text>
            <Text className="text-zinc-400 font-myMedium text-center mb-6 leading-5">
              You need {requiredBalance} {currency} to complete this payment,
              but you only have {currentBalanceStr} {currency} in your wallet.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowInsufficientModal(false)}
              className="w-full bg-white py-4 rounded-2xl items-center"
            >
              <Text className="text-black text-lg font-myBold">Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
      <Text className="text-zinc-500 font-myMedium text-sm flex-1 mr-4">
        {label}
      </Text>
      <View className="items-end">
        <Text
          className={`font-myBold text-sm ${
            highlight ? "text-white" : "text-white"
          }`}
        >
          {value}
        </Text>
        {sub ? (
          <Text className="text-zinc-600 text-xs font-myMedium mt-0.5">
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
