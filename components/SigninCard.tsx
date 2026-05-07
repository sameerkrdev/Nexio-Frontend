import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SigninCardProps {
  onSignin: (username: string, password: string) => void;
  onForgotPassword?: () => void;
  username: string;
  onUsernameChange: (username: string) => void;
  usernameError?: string;
  isLoading?: boolean;
}

export const SigninCard = ({
  onSignin,
  onForgotPassword,
  username,
  onUsernameChange,
  usernameError,
  isLoading = false,
}: SigninCardProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className="w-full">
      {/* Smart Card Form Container */}
      <ImageBackground
        source={require("../assets/card.png")}
        className="w-full aspect-[1.3] rounded-[32px] overflow-hidden justify-between shadow-2xl border border-black"
        imageStyle={{ borderRadius: 32 }}
        resizeMode="stretch"
      >
        {/* Top Right Name Overlay */}
        {/* <View className="absolute top-7 right-7">
          <Text className="text-white text-4xl font-black tracking-tighter italic">
            JOHN
          </Text>
        </View> */}

        {/* Bottom Left Inputs Stacked (Absolute & Short) */}
        <View className="absolute bottom-6 left-7 right-7 w-[55%]">
          {/* Username Input */}
          <View className="mb-1">
            <View className="flex-row items-center rounded-lg px-3 py-0.5">
              <TextInput
                placeholder="username"
                placeholderTextColor="rgba(255,255,255,0.8)"
                className="flex-1 text-white text-xl font-myRegular"
                autoCapitalize="none"
                value={username}
                onChangeText={onUsernameChange}
              />
            </View>
            {usernameError ? (
              <Text className="text-red-400 text-xs mt-1 px-3 font-myRegular">
                {usernameError}
              </Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View>
            <View className="flex-row items-center rounded-lg px-3 py-0.5">
              <TextInput
                secureTextEntry={!showPassword}
                placeholder="password"
                placeholderTextColor="rgba(255,255,255,0.8)"
                className="flex-1 text-white text-xl font-myRegular"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Primary Action Button */}
      <View className="mt-10">
        <View className="">
          <TouchableOpacity
            activeOpacity={0.8}
            className={`w-full py-4 rounded-2xl items-center shadow-lg shadow-white/10 ${
              username.trim().length >= 3 && password.length >= 6 && !isLoading
                ? "bg-white"
                : "bg-white/30"
            }`}
            onPress={() => onSignin(username.trim(), password)}
            disabled={
              username.trim().length < 3 || password.length < 6 || isLoading
            }
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#000000" />
                <Text className="text-black text-lg font-mySemiBold ml-2">
                  Logging in...
                </Text>
              </View>
            ) : (
              <Text
                className={`text-lg font-mySemiBold ${
                  username.trim().length >= 3 && password.length >= 6
                    ? "text-black"
                    : "text-white/50"
                }`}
              >
                Login
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
