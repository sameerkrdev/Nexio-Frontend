import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HomeHeaderProps {
  userName?: string;
  userUsername?: string;
  onProfilePress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  userUsername,
  onProfilePress,
}) => {
  return (
    <View className="flex-row items-center justify-between mb-8">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onProfilePress}
          activeOpacity={0.7}
          className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 mr-4"
        >
          <Image
            source={{
              uri: `https://robohash.org/${userUsername}?set=set4&size=200x200`,
            }}
            className="w-full h-full"
          />
        </TouchableOpacity>
        <View>
          <Text className="text-zinc-500 text-[10px] font-myMedium">Hey,</Text>
          <Text className="text-white text-lg font-myMedium">{userName}</Text>
        </View>
      </View>

      <TouchableOpacity className="w-12 h-12 items-center justify-center">
        <Ionicons name="search" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};
