import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  useAddWithdrawalAccount,
  useAvailableMethods,
} from "../hooks/useWithdrawals";

export default function AddAccountFormScreen() {
  const router = useRouter();
  const { method } = useLocalSearchParams<{ method: string }>();
  const { data: methodsData } = useAvailableMethods();
  const addAccount = useAddWithdrawalAccount();

  const [nickname, setNickname] = useState("");

  // UPI fields
  const [upiId, setUpiId] = useState("");

  // Bank Transfer fields
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");

  const methodInfo = methodsData?.availableMethods.find(
    (m) => m.method === method,
  );

  const formatMethodLabel = (methodName: string) => {
    return methodName
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toUpperCase())
      .join(" ");
  };

  const getMethodIcon = (methodName: string) => {
    switch (methodName) {
      case "UPI":
        return "flash";
      case "BANK_TRANSFER":
        return "business";
      case "IMPS":
        return "rocket";
      case "NEFT":
        return "time";
      default:
        return "wallet";
    }
  };

  const getMethodLogo = (methodName: string) => {
    switch (methodName) {
      case "UPI":
        return require("../assets/upi.png");
      case "IMPS":
        return require("../assets/imps.svg.png");
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    try {
      let accountData: any = {
        method,
        nickname: nickname.trim() || undefined,
      };

      // Validate and add method-specific fields
      if (method === "UPI") {
        const trimmedUpiId = upiId.trim();
        if (!trimmedUpiId) {
          Alert.alert("Error", "Please enter your UPI ID");
          return;
        }
        if (!trimmedUpiId.match(/^[\w.-]+@[\w]+$/)) {
          Alert.alert(
            "Invalid UPI ID",
            "Please enter a valid UPI ID (e.g., user@paytm)",
          );
          return;
        }
        accountData.upiId = trimmedUpiId;
      } else if (
        method === "BANK_TRANSFER" ||
        method === "IMPS" ||
        method === "NEFT"
      ) {
        const trimmedAccountNumber = accountNumber.trim();
        const trimmedIfscCode = ifscCode.trim();
        const trimmedAccountHolderName = accountHolderName.trim();
        const trimmedBankName = bankName.trim();

        if (
          !trimmedAccountNumber ||
          !trimmedIfscCode ||
          !trimmedAccountHolderName ||
          !trimmedBankName
        ) {
          Alert.alert("Error", "Please fill all required fields");
          return;
        }
        if (!trimmedIfscCode.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) {
          Alert.alert(
            "Invalid IFSC Code",
            "Please enter a valid IFSC code (e.g., SBIN0001234)",
          );
          return;
        }
        accountData = {
          ...accountData,
          accountNumber: trimmedAccountNumber,
          ifscCode: trimmedIfscCode.toUpperCase(),
          accountHolderName: trimmedAccountHolderName,
          bankName: trimmedBankName,
        };
      }

      await addAccount.mutateAsync(accountData);
      Alert.alert("Success!", "Withdrawal account added successfully", [
        {
          text: "Done",
          onPress: () => router.replace("/withdraw"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add account");
    }
  };

  const isFormValid = () => {
    if (method === "UPI") {
      return upiId.trim().length > 0;
    }
    if (method === "BANK_TRANSFER" || method === "IMPS" || method === "NEFT") {
      return (
        accountNumber.trim().length > 0 &&
        ifscCode.trim().length > 0 &&
        accountHolderName.trim().length > 0 &&
        bankName.trim().length > 0
      );
    }
    return false;
  };

  const renderForm = () => {
    if (method === "UPI") {
      return (
        <View className="gap-y-4">
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text className="text-zinc-400 font-myMedium text-sm mb-2">
              UPI ID <Text className="text-red-400">*</Text>
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
              <TextInput
                value={upiId}
                onChangeText={setUpiId}
                placeholder="yourname@paytm"
                placeholderTextColor="#52525B"
                className="text-white font-myMedium text-base"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <Text className="text-zinc-600 font-myRegular text-xs mt-1.5">
              Example: 9876543210@paytm, user@ybl
            </Text>
          </Animated.View>
        </View>
      );
    }

    if (method === "BANK_TRANSFER" || method === "IMPS" || method === "NEFT") {
      return (
        <View className="gap-y-4">
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text className="text-zinc-400 font-myMedium text-sm mb-2">
              Account Holder Name <Text className="text-red-400">*</Text>
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
              <TextInput
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                placeholder="John Doe"
                placeholderTextColor="#52525B"
                className="text-white font-myMedium text-base"
                autoCapitalize="words"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <Text className="text-zinc-400 font-myMedium text-sm mb-2">
              Account Number <Text className="text-red-400">*</Text>
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
              <TextInput
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="1234567890"
                placeholderTextColor="#52525B"
                className="text-white font-myMedium text-base"
                keyboardType="number-pad"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text className="text-zinc-400 font-myMedium text-sm mb-2">
              IFSC Code <Text className="text-red-400">*</Text>
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
              <TextInput
                value={ifscCode}
                onChangeText={setIfscCode}
                placeholder="SBIN0001234"
                placeholderTextColor="#52525B"
                className="text-white font-myMedium text-base"
                autoCapitalize="characters"
                maxLength={11}
              />
            </View>
            <Text className="text-zinc-600 font-myRegular text-xs mt-1.5">
              11-character bank code (e.g., HDFC0001234)
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <Text className="text-zinc-400 font-myMedium text-sm mb-2">
              Bank Name <Text className="text-red-400">*</Text>
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
              <TextInput
                value={bankName}
                onChangeText={setBankName}
                placeholder="State Bank of India"
                placeholderTextColor="#52525B"
                className="text-white font-myMedium text-base"
                autoCapitalize="words"
              />
            </View>
          </Animated.View>
        </View>
      );
    }

    return null;
  };

  if (!methodInfo) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

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
          <View className="px-6 py-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 rounded-full bg-zinc-900/60 items-center justify-center border border-zinc-800/50"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-6"
          >
            {/* Method Info Card */}
            <Animated.View
              entering={FadeInDown.springify()}
              className="bg-white/5 border border-white/10 rounded-[20px] p-5 mb-6"
            >
              <View className="flex-row items-center">
                {getMethodLogo(method) ? (
                  <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center mr-4 p-1">
                    <View className="w-full h-full rounded-xl bg-white items-center justify-center">
                      <Image
                        source={getMethodLogo(method)!}
                        className="w-10 h-10"
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                ) : (
                  <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center mr-4 p-1">
                    <View className="w-full h-full rounded-xl bg-white items-center justify-center">
                      <Ionicons
                        name={getMethodIcon(method) as any}
                        size={28}
                        color="black"
                      />
                    </View>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-white font-myBold text-lg">
                    {formatMethodLabel(methodInfo.label)}
                  </Text>
                  <Text className="text-zinc-400 font-myMedium text-xs mt-0.5">
                    {methodInfo.estimatedTime} • {methodInfo.fee}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Nickname Field */}
            <Animated.View
              entering={FadeInDown.delay(50).springify()}
              className="mb-5"
            >
              <Text className="text-zinc-400 font-myMedium text-sm mb-2">
                Account Nickname (Optional)
              </Text>
              <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
                <TextInput
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="My Primary Account"
                  placeholderTextColor="#52525B"
                  className="text-white font-myMedium text-base"
                />
              </View>
            </Animated.View>

            {/* Method-specific Form */}
            {renderForm()}

            <View className="h-32" />
          </ScrollView>

          {/* Submit Button */}
          <View className="px-6 pb-6">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={addAccount.isPending || !isFormValid()}
              className={`w-full py-4 rounded-2xl items-center ${
                addAccount.isPending || !isFormValid()
                  ? "bg-zinc-800/50 border border-zinc-700/50"
                  : "bg-white"
              }`}
            >
              {addAccount.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  className={`font-myBold text-lg ${
                    !isFormValid() ? "text-zinc-600" : "text-black"
                  }`}
                >
                  Add Account
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
