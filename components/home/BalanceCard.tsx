import React from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BalanceCardProps {
  currency: string;
  isBalanceVisible: boolean;
  balance?: string;
  userName?: string;
  userUsername?: string;
  onViewBalancePress: () => void;
  onAddMoneyPress?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  currency,
  isBalanceVisible,
  balance,
  userName,
  userUsername,
  onViewBalancePress,
  onAddMoneyPress,
}) => {
  return (
    <View className="mb-4">
      <ImageBackground
        source={require("../../assets/card3.png")}
        className="w-full aspect-[1.3] rounded-[32px] relative overflow-hidden p-8 justify-between"
        imageStyle={{ borderRadius: 32 }}
        resizeMode="cover"
      >
        <View className="absolute top-10 right-6 z-50 flex-row items-center gap-2">
          {/* {onAddMoneyPress ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onAddMoneyPress}
              className="bg-white/95 px-3 py-1.5 rounded-xl flex-row items-center"
            >
              <Ionicons name="add" size={14} color="#000000" />
              <Text className="text-black text-xs font-myBold ml-1">
                Add Money
              </Text>
            </TouchableOpacity>
          ) : null} */}
          <View className="bg-black/30 px-3 py-1.5 rounded-xl flex-row items-center border border-white/10">
            <Text className="text-white text-xs font-myMedium">
              {currency === "INR" && "🇮🇳 INR"}
              {currency === "USD" && "🇺🇸 USD"}
              {currency === "JPY" && "🇯🇵 JPY"}
              {currency === "EUR" && "🇪🇺 EUR"}
            </Text>
          </View>
        </View>

        {/* Bottom Left: Balance and User Identity */}
        <View className="mt-auto">
          {/* Balance */}
          <View className="mb-4">
            <Text className="text-white/40 text-[10px] font-myMedium uppercase tracking-widest mb-1">
              Current Balance
            </Text>
            {isBalanceVisible ? (
              <Text className="text-white text-3xl font-myMedium">
                {currency === "USD" ? "$" : "₹"} {balance}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={onViewBalancePress}
                className="bg-white/10 px-4 py-2 mt-1 rounded-xl border border-white/20 items-center self-start flex-row gap-2 blur-md"
              >
                <Ionicons name="eye" size={14} color="#ffffff" />
                <Text className="text-white font-myMedium text-sm">
                  View Balance
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* User Info */}
          <View>
            <Text className="text-white text-lg font-myMedium">{userName}</Text>
            <Text className="text-white/60 font-myRegular text-xs">
              {userUsername}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
