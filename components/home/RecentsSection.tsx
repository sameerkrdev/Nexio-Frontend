import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface RecentsSectionProps {
  users: User[];
  onUserPress: (user: User) => void;
}

export const RecentsSection: React.FC<RecentsSectionProps> = ({
  users,
  onUserPress,
}) => {
  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-lg font-myMedium pl-2">Recents</Text>
      </View>

      <View className="relative">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 4,
            gap: 16,
          }}
          className="flex-row"
        >
          {users.map((user, i) => {
            return (
              <TouchableOpacity
                key={i}
                className="items-center"
                onPress={() => onUserPress(user)}
              >
                <View className="w-[60px] h-[60px] rounded-full mb-2 items-center justify-center overflow-hidden bg-zinc-900 border border-zinc-800">
                  <Image
                    source={{ uri: user.avatar }}
                    className="w-full h-full"
                  />
                </View>
                <Text className="text-white text-xs font-myMedium">
                  {user.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Left fade effect */}
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 20,
            pointerEvents: "none",
          }}
        />

        {/* Right fade effect */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 20,
            pointerEvents: "none",
          }}
        />
      </View>
    </View>
  );
};
