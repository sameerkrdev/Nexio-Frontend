import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useWithdrawalAccounts } from "../hooks/useWithdrawals";

export default function WithdrawScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: accounts, isLoading, error } = useWithdrawalAccounts();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  console.log("Withdrawal accounts data:", accounts);
  console.log("Withdrawal accounts loading:", isLoading);
  console.log("Withdrawal accounts error:", error);

  const currency = user?.wallet?.currency || "USD";
  const currencySymbol = currency === "USD" ? "$" : "₹";
  const balance = user?.wallet?.balance || "0.00";

  const handleContinue = () => {
    if (!selectedAccount) {
      Alert.alert("Select Account", "Please select a withdrawal account");
      return;
    }
    router.push({
      pathname: "/withdraw-amount",
      params: { accountId: selectedAccount },
    });
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
          <View className="px-6 py-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 rounded-full bg-zinc-900/60 items-center justify-center border border-zinc-800/50"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-myBold text-xl">
              Withdraw Funds
            </Text>
            <View className="w-12" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-6"
          >
            {/* Balance Card */}
            <View className="bg-[#121212] border border-zinc-800/50 rounded-[32px] p-6 mb-6">
              <Text className="text-zinc-500 font-myMedium mb-2 text-sm">
                Available Balance
              </Text>
              <Text className="text-white font-myBold text-3xl">
                {currencySymbol}
                {balance}
              </Text>
            </View>

            {/* Accounts Section */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white font-myBold text-lg">
                  Withdrawal Accounts
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/add-withdrawal-account")}
                  className="flex-row items-center bg-lime-400/10 px-3 py-2 rounded-xl border border-lime-400/20"
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color="#a3e635"
                  />
                  <Text className="text-lime-400 font-myMedium ml-2 text-sm">
                    Add New
                  </Text>
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <View className="py-10 items-center">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              ) : !accounts || accounts.length === 0 ? (
                <View className="bg-[#121212] border border-zinc-800/50 rounded-[24px] p-8 items-center">
                  <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4">
                    <Ionicons name="wallet-outline" size={32} color="#52525B" />
                  </View>
                  <Text className="text-zinc-500 font-myMedium mt-4 text-center text-base">
                    No withdrawal accounts yet
                  </Text>
                  <Text className="text-zinc-600 font-myRegular text-sm text-center mt-2 max-w-[250px]">
                    Add a bank account or payment method to withdraw funds
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/add-withdrawal-account")}
                    className="bg-white py-3 px-6 rounded-2xl mt-6"
                  >
                    <Text className="text-black font-myBold text-base">
                      Add Account
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="gap-y-3">
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      onPress={() => setSelectedAccount(account.id)}
                      className={`bg-[#121212] border rounded-[24px] p-5 flex-row items-center justify-between ${
                        selectedAccount === account.id
                          ? "border-lime-400"
                          : "border-zinc-800/50"
                      }`}
                    >
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-white font-myBold text-base">
                            {account.displayName}
                          </Text>
                          {account.isDefault && (
                            <View className="bg-lime-400/20 px-2 py-0.5 rounded-full ml-2">
                              <Text className="text-lime-400 font-myMedium text-[10px]">
                                Default
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-zinc-500 font-myMedium text-sm">
                          {account.method}
                        </Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          selectedAccount === account.id
                            ? "border-lime-400 bg-lime-400"
                            : "border-zinc-600"
                        }`}
                      >
                        {selectedAccount === account.id && (
                          <Ionicons name="checkmark" size={16} color="black" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Continue Button */}
          {accounts && accounts.length > 0 && (
            <View className="px-6 pb-6">
              <TouchableOpacity
                onPress={handleContinue}
                disabled={!selectedAccount}
                className={`w-full py-4 rounded-2xl items-center ${
                  selectedAccount
                    ? "bg-white"
                    : "bg-zinc-900/60 border border-zinc-800/50"
                }`}
              >
                <Text
                  className={`font-myBold text-lg ${selectedAccount ? "text-black" : "text-zinc-500"}`}
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
