import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

interface FloatingNavProps {
  onProfilePress?: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ onProfilePress }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => pathname === route;

  return (
    <View className="absolute bottom-12 left-6 right-6">
      <View className="flex-row items-center bg-[#121212] px-4 py-2 rounded-full border border-zinc-800/50">
        {/* Left Items */}
        <View className="flex-1 flex-row justify-around">
          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push("/home")}
          >
            <Ionicons name="home" size={22} color={isActive("/home") ? "white" : "#71717A"} />
            <Text className={`text-[10px] font-myMedium mt-1 ${isActive("/home") ? "text-white" : "text-zinc-500"}`}>
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push("/send-choice")}
          >
            <Ionicons name="paper-plane-outline" size={22} color={isActive("/send-choice") ? "white" : "#71717A"} />
            <Text className={`text-[10px] font-myMedium mt-1 ${isActive("/send-choice") ? "text-white" : "text-zinc-500"}`}>
              Send
            </Text>
          </TouchableOpacity>
        </View>

        {/* Floating Action Button (Centered) */}
        <View className="w-20 items-center">
          <TouchableOpacity
            className="bg-white w-14 h-14 rounded-full items-center justify-center"
            onPress={onProfilePress}
          >
            <Ionicons name="qr-code-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Right Items */}
        <View className="flex-1 flex-row justify-around">
          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push("/activity")}
          >
            <Ionicons name="time-outline" size={22} color={isActive("/activity") ? "white" : "#71717A"} />
            <Text className={`text-[10px] font-myMedium mt-1 ${isActive("/activity") ? "text-white" : "text-zinc-500"}`}>
              Activity
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-outline" size={22} color={isActive("/profile") ? "white" : "#71717A"} />
            <Text className={`text-[10px] font-myMedium mt-1 ${isActive("/profile") ? "text-white" : "text-zinc-500"}`}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
