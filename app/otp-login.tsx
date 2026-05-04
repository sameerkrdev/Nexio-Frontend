import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../services/auth.service";

export default function OtpLoginScreen() {
  const params = useLocalSearchParams();
  const usernameFromParams = params.username as string | undefined;

  const [identifier, setIdentifier] = useState(usernameFromParams || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // If username is passed from authentication screen, automatically send OTP
  useEffect(() => {
    if (usernameFromParams && usernameFromParams.trim().length > 0) {
      handleSendOtp();
    }
  }, [usernameFromParams]);

  const handleSendOtp = async () => {
    if (identifier.trim().length < 3) {
      setError("Please enter a valid username or phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.sendLoginOtp(identifier.trim());
      router.push({
        pathname: "/otp",
        params: { identifier: identifier.trim(), purpose: "login" },
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <StatusBar style="light" />
      <Image
        source={require("../assets/bg3.png")}
        className="absolute w-full h-full opacity-100"
        resizeMode="cover"
      />
      <SafeAreaView className="flex-1 px-6 pt-4">
        {/* Header */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="mt-12">
          <Text className="text-white text-4xl font-myBold mb-4">
            Login with OTP
          </Text>
          <Text className="text-zinc-400 font-myMedium text-base">
            Enter your username or phone number to receive a verification code
          </Text>
        </View>

        <View className="mt-12 flex-1">
          <View className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden p-1">
            <TextInput
              className="text-white text-2xl font-myBold px-6 py-5"
              placeholder="Username or phone number"
              placeholderTextColor="#52525B"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setError("");
              }}
              autoFocus
              autoCapitalize="none"
            />
          </View>

          <View className="mt-6">
            {error ? (
              <Text className="text-red-500 font-myMedium text-sm mb-2">
                {error}
              </Text>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.8}
              className={
                "w-full py-5 rounded-3xl items-center " +
                (identifier.trim().length >= 3 && !isLoading
                  ? "bg-white"
                  : "bg-zinc-800")
              }
              onPress={handleSendOtp}
              disabled={identifier.trim().length < 3 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={identifier.trim().length >= 3 ? "#000" : "#71717A"}
                />
              ) : (
                <Text
                  className={
                    "text-xl font-myBold " +
                    (identifier.trim().length >= 3
                      ? "text-black"
                      : "text-zinc-500")
                  }
                >
                  Send OTP
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
