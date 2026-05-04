//#f8c345
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { OtpInput } from "react-native-otp-entry";
import { authService } from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";

const COUNTRIES = [
  {
    code: "+1",
    flag: "🇺🇸",
    name: "United States",
    placeholder: "(000) 000-0000",
  },
  { code: "+91", flag: "🇮🇳", name: "India", placeholder: "00000 00000" },
  {
    code: "+44",
    flag: "🇬🇧",
    name: "United Kingdom",
    placeholder: "0000 000000",
  },
  { code: "+61", flag: "🇦🇺", name: "Australia", placeholder: "000 000 000" },
];

export default function OtpScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    username?: string;
    password?: string;
    identifier?: string;
    purpose?: "signup" | "login";
  }>();

  const { name, username, password, identifier, purpose = "signup" } = params;
  const { signup, login } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">(
    purpose === "login" ? "otp" : "phone",
  );
  const [phone, setPhone] = useState("");
  const [countryIdx, setCountryIdx] = useState(0);
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleSendOtp = async () => {
    // For signup, validate phone number
    if (purpose === "signup" && phone.length < 5) {
      setOtpError("Invalid phone number");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {
      if (purpose === "signup" && username) {
        const fullPhoneNumber = `${COUNTRIES[countryIdx].code}${phone}`;
        await authService.sendSignupOtp(username, fullPhoneNumber);
      } else if (purpose === "login" && identifier) {
        await authService.sendLoginOtp(identifier);
      }

      setStep("otp");
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to send OTP. Please try again.";
      setOtpError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (fullOtp: string) => {
    setIsLoading(true);
    setOtpError("");

    try {
      if (purpose === "signup" && username && name) {
        const fullPhoneNumber = `${COUNTRIES[countryIdx].code}${phone}`;
        await signup(username, name, fullPhoneNumber, fullOtp, password);

        setIsSuccess(true);
        setTimeout(() => {
          router.replace({
            pathname: "/success-card",
            params: { name, username },
          });
        }, 1500);
      } else if (purpose === "login" && identifier) {
        await login(identifier, fullOtp);

        setIsSuccess(true);
        setTimeout(() => {
          router.replace("/home");
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid OTP. Please try again.";
      setOtpError(errorMessage);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    setOtpError("");

    // Auto-fill from SMS — handles 6 digit paste on first input
    if (text.length > 1) {
      const digits = text
        .replace(/[^0-9]/g, "")
        .slice(0, 6)
        .split("");
      const newOtp = ["", "", "", "", "", ""];
      digits.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);

      // Focus last filled box
      const lastIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();

      if (digits.length === 6) verifyOtp(digits.join(""));
      return;
    }

    // Normal single digit input
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && text.length === 1) {
      verifyOtp(newOtp.join(""));
    }
  };
  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
          onPress={() => {
            if (step === "otp" && purpose === "signup") {
              setStep("phone");
            } else {
              router.back();
            }
          }}
          className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="mt-12">
          <Text className="text-white text-4xl font-myBold mb-4">
            {step === "phone"
              ? "Enter your\nphone number"
              : purpose === "login"
                ? "Verify your\naccount"
                : "Verify your\nnumber"}
          </Text>
          <Text className="text-zinc-400 font-myMedium text-base">
            {step === "phone"
              ? "We'll send you a verification code to secure your account."
              : purpose === "login"
                ? `We've sent a 6-digit code to ${identifier}`
                : `We've sent a 6-digit code to ${COUNTRIES[countryIdx].code} ${phone}`}
          </Text>
        </View>

        {step === "phone" && purpose === "signup" ? (
          <View className="mt-12 flex-1">
            <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden p-1">
              {/* Mock Country Code Selector */}
              <TouchableOpacity
                className="flex-row items-center px-4 py-5 bg-zinc-800 rounded-2xl"
                onPress={() => setIsCountryModalVisible(true)}
              >
                <Text className="mr-2 text-2xl">
                  {COUNTRIES[countryIdx].flag}
                </Text>
                <Text className="text-white font-myBold text-xl mr-2">
                  {COUNTRIES[countryIdx].code}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#A1A1AA" />
              </TouchableOpacity>

              <TextInput
                className="flex-1 text-white text-2xl font-myBold px-4"
                placeholder={COUNTRIES[countryIdx].placeholder}
                placeholderTextColor="#52525B"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setOtpError("");
                }}
                autoFocus
              />
            </View>

            <View className="mt-6">
              {otpError && step === "phone" ? (
                <Text className="text-red-500 font-myMedium text-sm mb-2">
                  {otpError}
                </Text>
              ) : null}
              <TouchableOpacity
                activeOpacity={0.8}
                className={
                  "w-full py-5 rounded-3xl items-center " +
                  (phone.length == 10 && !isLoading
                    ? "bg-white"
                    : "bg-zinc-800")
                }
                onPress={handleSendOtp}
                disabled={phone.length !== 10 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={phone.length == 10 ? "#000" : "#71717A"}
                  />
                ) : (
                  <Text
                    className={
                      "text-xl font-myBold " +
                      (phone.length == 10 ? "text-black" : "text-zinc-500")
                    }
                  >
                    Send OTP
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="mt-12 flex-1">
            <OtpInput
              numberOfDigits={6}
              autoFocus
              disabled={isLoading}
              onFilled={(code) => verifyOtp(code)}
              onTextChange={() => setOtpError("")}
              theme={{
                containerStyle: { width: "100%" },
                inputsContainerStyle: {
                  gap: 8,
                  justifyContent: "space-between",
                },
                pinCodeContainerStyle: {
                  borderWidth: 2,
                  borderColor: "#3f3f46",
                  borderRadius: 16,
                  backgroundColor: "#18181b",
                  width: 45,
                  height: 60,
                },
                focusedPinCodeContainerStyle: {
                  borderColor: "white",
                },
                filledPinCodeContainerStyle: {
                  borderColor: "#AB9FF2",
                  backgroundColor: "#AB9FF220",
                },
                pinCodeTextStyle: {
                  color: "white",
                  fontSize: 24,
                  fontFamily: "Montserrat_700Bold",
                },
              }}
            />

            {isLoading && (
              <View className="mt-6 items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-zinc-400 font-myMedium text-sm mt-2">
                  Verifying OTP...
                </Text>
              </View>
            )}

            {isSuccess && (
              <View className="mt-6 items-center">
                <View className="w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-3">
                  <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
                </View>
                <Text className="text-green-400 font-myBold text-base">
                  {purpose === "login" ? "Login successful!" : "OTP verified!"}
                </Text>
              </View>
            )}

            {otpError ? (
              <Text className="text-red-500 font-myMedium text-sm text-center mt-6">
                {otpError}
              </Text>
            ) : null}

            <TouchableOpacity
              className="mt-8 self-center bg-zinc-900 px-6 py-3 rounded-full border border-zinc-800"
              disabled={isLoading}
              onPress={handleSendOtp}
            >
              <Text className="text-zinc-400 font-myMedium text-sm">
                Didn't receive code?{" "}
                <Text className="text-[#f8c345] font-myBold">Resend</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Country Select Modal */}
      <Modal visible={isCountryModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#18181B] rounded-t-[32px] pt-6 pb-12 px-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-myBold">
                Select Country
              </Text>
              <TouchableOpacity
                onPress={() => setIsCountryModalVisible(false)}
                className="bg-zinc-800 w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView
              className="max-h-[300px]"
              showsVerticalScrollIndicator={false}
            >
              {COUNTRIES.map((country, idx) => (
                <TouchableOpacity
                  key={country.code}
                  className={`flex-row items-center py-4 border-b border-zinc-800/50 ${
                    countryIdx === idx
                      ? "bg-zinc-800/60 rounded-2xl px-4 border-0"
                      : "px-2"
                  }`}
                  onPress={() => {
                    setCountryIdx(idx);
                    setIsCountryModalVisible(false);
                  }}
                >
                  <Text className="text-3xl mr-4">{country.flag}</Text>
                  <View className="flex-1">
                    <Text className="text-white font-myBold text-lg">
                      {country.name}
                    </Text>
                    <Text className="text-zinc-500 font-myMedium">
                      {country.code}
                    </Text>
                  </View>
                  {countryIdx === idx && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#A3E635"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
