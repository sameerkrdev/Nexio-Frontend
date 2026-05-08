import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SigninCard } from "../components/SigninCard";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/auth.service";

export default function Authentication() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loginError, setLoginError] = useState("");
  const { loginWithPassword } = useAuth();

  const handlePasswordLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setUsernameError("");
    setLoginError("");
    try {
      await loginWithPassword(username, password);
      router.replace("/home");
    } catch (error: any) {
      setLoginError(error?.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    // Check if username is not empty
    if (username.trim().length === 0) {
      return;
    }

    setIsOtpLoading(true);
    setUsernameError("");

    try {
      // Check if username exists
      const result = await authService.checkUsername(username.trim());

      if (!result.exists) {
        setUsernameError("Username not found");
        setIsOtpLoading(false);
        return;
      }

      // Username exists, navigate to OTP login screen
      router.push({
        pathname: "/otp-login",
        params: { username: username.trim() },
      });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to verify username");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (usernameError) {
      setUsernameError("");
    }
    if (loginError) {
      setLoginError("");
    }
  };
  return (
    <View className="flex-1 bg-black py-7">
      <StatusBar style="light" />

      <Image
        source={require("../assets/bg3.png")}
        className="absolute w-full h-full opacity-40 scale-[1]"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1 px-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-row justify-between items-start mt-6">
            <View className="flex-1">
              <Text className="text-white text-5xl font-myBold leading-[50px]">
                Welcome{"\n"}Back!
              </Text>
              <Text className="text-zinc-400 text-base font-myMedium mt-4 max-w-[200px] leading-6">
                Log in to your Nexio account and take control of your finances.
              </Text>
            </View>

            {/* <View className="items-end">
              <Image
                source={require("../assets/icon.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View> */}
          </View>

          <View className="mt-12">
            <SigninCard
              onSignin={handlePasswordLogin}
              onForgotPassword={() => console.log("Forgot Password")}
              username={username}
              onUsernameChange={handleUsernameChange}
              usernameError={usernameError}
              isLoading={isLoading}
            />
            {loginError && (
              <View className="mt-4 items-center">
                <Text className="text-red-400 font-myMedium text-sm">
                  {loginError}
                </Text>
              </View>
            )}
          </View>

          <View className="mb-10">
            {/* Login with OTP Button */}
            <TouchableOpacity
              className={`w-full py-4 px-6 rounded-2xl flex-row items-center justify-center border border-zinc-700 mt-6 ${
                username.trim().length > 0 && !isOtpLoading
                  ? "bg-white"
                  : "bg-white/30"
              }`}
              onPress={handleOtpLogin}
              disabled={username.trim().length === 0 || isOtpLoading}
            >
              {isOtpLoading ? (
                <>
                  <ActivityIndicator size="small" color="#000000" />
                  <Text className="text-black text-lg font-mySemiBold ml-2">
                    Verifying username...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="mail"
                    size={20}
                    color={username.trim().length > 0 ? "#000000" : "#666666"}
                  />
                  <Text
                    className={`text-lg font-mySemiBold ml-2 ${
                      username.trim().length > 0
                        ? "text-black"
                        : "text-white/50"
                    }`}
                  >
                    Login with OTP
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* OR Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-zinc-600" />
              <Text className="text-zinc-400 px-4 text-xs font-bold uppercase">
                OR
              </Text>
              <View className="flex-1 h-[1px] bg-zinc-600" />
            </View>

            <TouchableOpacity
              className="w-full flex-row bg-black/90 items-center justify-center border border-zinc-700 py-5 rounded-2xl"
              onPress={() => router.push("/signup")}
            >
              <Text className="text-white text-lg font-mySemiBold">
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
