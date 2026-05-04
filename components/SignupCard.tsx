import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../services/auth.service";

interface SignupCardProps {
  onSignup: (name: string, username: string, password: string) => void;
}

export const SignupCard = ({ onSignup }: SignupCardProps) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );

  // Debounced username validation
  useEffect(() => {
    if (username.length < 3) {
      setUsernameError("");
      setUsernameAvailable(null);
      return;
    }

    // Validate format first
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError("Only letters, numbers, and underscores allowed");
      setUsernameAvailable(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const result = await authService.checkUsername(username);
        if (result.available) {
          setUsernameError("");
          setUsernameAvailable(true);
        } else {
          setUsernameError("Username is already taken");
          setUsernameAvailable(false);
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameError("Could not verify username");
        setUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  return (
    <View className="w-full">
      <ImageBackground
        source={require("../assets/card.png")}
        className="w-full aspect-[1.1] rounded-[32px] overflow-hidden justify-between shadow-2xl border border-black"
        imageStyle={{ borderRadius: 32 }}
        resizeMode="stretch"
      >
        <View className="absolute top-7 left-7 right-7">
          <Text className="text-white text-4xl font-black tracking-tighter italic text-right">
            {name && name.toUpperCase()}
          </Text>
        </View>

        <View className="absolute bottom-6 left-7 right-7 w-[55%]">
          {/* Name Input */}
          <View className="mb-1 w-[70%]">
            <View className="flex-row items-center rounded-lg px-3 py-0.5">
              <TextInput
                placeholder="name"
                placeholderTextColor="rgba(255,255,255,0.6)"
                className="flex-1 text-white text-lg font-myRegular"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View className="mb-1">
            <View className="flex-row items-center rounded-lg px-3 py-0.5">
              <TextInput
                placeholder="username"
                placeholderTextColor="rgba(255,255,255,0.6)"
                className="flex-1 text-white text-lg font-myRegular"
                autoCapitalize="none"
                value={username}
                onChangeText={(text) => {
                  setUsername(text.toLowerCase());
                  setUsernameError("");
                }}
              />
              {isCheckingUsername && (
                <ActivityIndicator size="small" color="white" />
              )}
              {!isCheckingUsername && usernameAvailable === true && (
                <Text className="text-green-400 text-xl">✓</Text>
              )}
              {!isCheckingUsername && usernameAvailable === false && (
                <Text className="text-red-400 text-xl">✗</Text>
              )}
            </View>
            {usernameError ? (
              <Text className="text-red-400 text-xs mt-1 px-3 font-myRegular">
                {usernameError}
              </Text>
            ) : null}
          </View>

          <View>
            <View className="flex-row items-center rounded-lg px-3 py-0.5">
              <TextInput
                secureTextEntry={!showPassword}
                placeholder="password"
                placeholderTextColor="rgba(255,255,255,0.6)"
                className="flex-1 text-white text-lg font-myRegular"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View className="mt-8">
        <TouchableOpacity
          activeOpacity={0.8}
          className={`w-full py-4 rounded-2xl items-center shadow-lg shadow-white/10 ${
            name.trim() &&
            username.trim() &&
            password.length >= 6 &&
            usernameAvailable
              ? "bg-white"
              : "bg-white/30"
          }`}
          onPress={() => onSignup(name, username, password)}
          disabled={
            !name.trim() ||
            !username.trim() ||
            password.length < 6 ||
            !usernameAvailable
          }
        >
          <Text
            className={`text-xl font-mySemiBold ${
              name.trim() &&
              username.trim() &&
              password.length >= 6 &&
              usernameAvailable
                ? "text-black"
                : "text-white/50"
            }`}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
