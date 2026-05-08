import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface SendDrawerProps {
  visible: boolean;
  users: User[];
  onClose: () => void;
  onUserPress: (user: User) => void;
}

export const SendDrawer: React.FC<SendDrawerProps> = ({
  visible,
  users,
  onClose,
  onUserPress,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/80 justify-end" onPress={onClose}>
        <Pressable
          className="bg-[#121212] rounded-t-[40px] p-8 border-t border-zinc-800"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle Bar */}
          <View className="w-12 h-1 bg-zinc-700 rounded-full mb-8 self-center" />

          <Text className="text-white text-2xl font-myMedium mb-6">
            Send to
          </Text>

          {/* Users List */}
          {users.map((user) => (
            <TouchableOpacity
              key={user.id}
              className="flex-row items-center bg-zinc-900/60 p-4 rounded-3xl border border-zinc-800 mb-4"
              onPress={() => onUserPress(user)}
            >
              <Image
                source={{ uri: user.avatar }}
                className="w-14 h-14 rounded-full border-2 border-lime-400 mr-4"
              />
              <View className="flex-1">
                <Text className="text-white font-myMedium text-lg">
                  {user.name}
                </Text>
                <Text className="text-zinc-500 text-sm font-myMedium">
                  {user.username}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#71717A" />
            </TouchableOpacity>
          ))}

          <View className="h-10" />
        </Pressable>
      </Pressable>
    </Modal>
  );
};
