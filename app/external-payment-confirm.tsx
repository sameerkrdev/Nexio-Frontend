import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  paymentService,
  type Currency,
  type ExternalPaymentMethod,
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

const SENDER_SYMBOL: Record<string, string> = {
  USD: "$",
  EUR: "€",
  JPY: "¥",
  GBP: "£",
  INR: "₹",
};

export default function ExternalPaymentConfirm() {
  const {
    fiatAmount,
    senderCurrency,
    receiverCurrency,
    receiverCurrencySymbol,
    currency,
    receiverPhone,
    receiverDisplayPhone,
    method,
    methodLabel,
    methodEta,
    paymentDetails,
  } = useLocalSearchParams<{
    fiatAmount: string;
    senderCurrency: string;
    receiverCurrency: string;
    receiverCurrencySymbol: string;
    currency: string;
    receiverPhone: string;
    receiverDisplayPhone: string;
    method: string;
    methodLabel: string;
    methodEta: string;
    paymentDetails: string;
  }>();

  const { address } = useWallet();
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

  const senderSymbol = SENDER_SYMBOL[senderCurrency ?? "INR"] ?? "₹";
  const receiverSymbol = receiverCurrencySymbol ?? "₹";

  const senderToReceiverRate = quote
    ? parseFloat(quote.senderToReceiverRate)
    : 1;
  const receiverAmount = baseFiat * senderToReceiverRate;

  const toCryptoStr = (val: number): string => {
    if (!quote) return "";
    const rate = parseFloat(quote.cryptoPriceInSenderCurrency);
    return `≈ ${(val / rate).toFixed(6)} ${currency}`;
  };

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setIsLoadingQuote(true);
        const quoteData = await paymentService.getExternalQuote(
          receiverPhone,
          currency as Currency,
          senderCurrency || "INR",
        );
        setQuote(quoteData);
      } catch (error: any) {
        console.error("External quote fetch error:", error);
        Alert.alert(
          "Rate Fetch Error",
          error?.message ?? "Failed to fetch live rates. Please try again.",
        );
      } finally {
        setIsLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [currency, senderCurrency, receiverPhone]);

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

      // Wallet balance check
      const totalCryptoCost = totalFiat / cryptoRate;
      let currentBalance = Infinity;
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

      let parsedDetails: Record<string, string> = {};
      try {
        parsedDetails = JSON.parse(paymentDetails || "{}");
      } catch {
        parsedDetails = {};
      }

      const intent = await paymentService.createExternalPayment({
        receiverPhone,
        receiverPaymentMethod: method as ExternalPaymentMethod,
        receiverPaymentDetails: parsedDetails,
        senderCurrencyAmount: baseFiat.toFixed(2),
        senderCurrency: quote.senderCurrency,
        receiverCurrency: quote.receiverCurrency,
        cryptoType: currency as Currency,
        cryptoToSenderRate: cryptoRate,
        senderToReceiverRate: parseFloat(quote.senderToReceiverRate),
        platformFeePercent: quote.platformFeePercent,
      });

      setPendingPayment(
        intent.paymentId,
        receiverPhone,
        currency,
        "external",
        receiverDisplayPhone,
      );

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
              Review Bank Transfer
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
              <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-4">
                <Ionicons name="business" size={36} color="black" />
              </View>
              <Text className="text-white text-2xl font-myBold">
                {receiverDisplayPhone}
              </Text>
              <Text className="text-zinc-500 font-myMedium mt-1 text-base">
                {methodLabel} • {receiverCurrency}
              </Text>
              <View className="mt-3 bg-zinc-800/60 px-3 py-1 rounded-full">
                <Text className="text-zinc-400 text-xs font-myMedium">
                  {methodEta}
                </Text>
              </View>
            </Animated.View>

            {/* Fee breakdown card */}
            <Animated.View
              entering={FadeInUp.delay(160).springify()}
              className="bg-zinc-900/60 border border-zinc-800 rounded-[32px] p-6 mb-6"
            >
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
                value={`${senderSymbol}${baseFiat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                sub={toCryptoStr(baseFiat)}
              />
              <FeeRow
                label={`Service fee (${platformFeePercent.toFixed(1)}%)`}
                value={`${senderSymbol}${fiatFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                sub={toCryptoStr(fiatFee)}
              />

              <View className="h-px bg-zinc-800 my-3" />

              <FeeRow
                label="Total deducted from wallet"
                value={`${senderSymbol}${totalFiat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                sub={toCryptoStr(totalFiat)}
                highlight
              />
              <FeeRow
                label="Recipient receives"
                value={`${receiverSymbol}${receiverAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                sub={`Deposited via ${methodLabel}`}
              />

              {quote ? (
                <View className="mt-5 bg-zinc-800/60 rounded-2xl px-4 py-3 flex-row items-center justify-center">
                  <Ionicons
                    name="trending-up-outline"
                    size={14}
                    color="#71717A"
                  />
                  <Text className="text-zinc-500 text-xs font-myMedium ml-2">
                    Live rate: 1 {currency} = {senderSymbol}
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
                Your crypto goes to NexaPay's Solana wallet. Once confirmed
                on-chain, we initiate a {methodLabel} payout to the recipient.
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
                  text="Slide to Confirm Transfer"
                  amount={`${senderSymbol}${totalFiat.toLocaleString("en-US", {
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
              You need {requiredBalance} {currency} to complete this transfer,
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
