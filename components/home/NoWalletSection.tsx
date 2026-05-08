import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface NoWalletSectionProps {
  onConnectPress: () => void;
  className?: string;
}

export const NoWalletSection: React.FC<NoWalletSectionProps> = ({
  onConnectPress,
  className = "",
}) => {
  return (
    <View
      className={`bg-[#121212] px-5 py-3 rounded-[40px] border border-zinc-800/50 items-center ${className}`}
    >
      <View className="flex-row items-center justify-center gap-4 mb-2">
        <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center">
          <Ionicons name="wallet-outline" size={24} color="#71717A" />
        </View>
        <Text className="text-white text-lg font-myMedium">
          No Wallet Connected
        </Text>
      </View>
      <Text className="text-zinc-500 text-center font-myRegular text-sm mb-8 px-4 leading-5">
        Connect your Phantom wallet to manage and transfer your digital assets
        securely.
      </Text>

      <TouchableOpacity
        onPress={onConnectPress}
        className="bg-white py-3.5 rounded-2xl w-full items-center"
      >
        <Text className="text-black font-myMedium text-base">Connect Now</Text>
      </TouchableOpacity>
    </View>
  );
};
