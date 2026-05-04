import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

export const FloatingNav = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <View className="absolute bottom-14 left-0 right-0 items-center">
      <View className="flex-row items-center bg-zinc-900 px-6 py-3 rounded-full border border-zinc-800 shadow-2xl">
        {/* Home */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (!isActive("/home")) router.replace("/home");
          }}
          className="p-3"
        >
          <Ionicons
            name={isActive("/home") ? "home" : "home-outline"}
            size={24}
            color={isActive("/home") ? "#A3E635" : "#71717A"}
          />
        </TouchableOpacity>

        {/* Activity */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (!isActive("/activity")) router.replace("/activity");
          }}
          className="p-3"
        >
          <MaterialCommunityIcons
            name={isActive("/activity") ? "clock" : "clock-outline"}
            size={24}
            color={isActive("/activity") ? "#A3E635" : "#71717A"}
          />
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (!isActive("/profile")) router.replace("/profile");
          }}
          className="p-3"
        >
          <Ionicons
            name={isActive("/profile") ? "person" : "person-outline"}
            size={24}
            color={isActive("/profile") ? "#A3E635" : "#71717A"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
