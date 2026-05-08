import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordModalProps {
  visible: boolean;
  passwordInput: string;
  passwordError: string;
  isVerifying: boolean;
  onPasswordChange: (text: string) => void;
  onVerify: () => void;
  onClose: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  visible,
  passwordInput,
  passwordError,
  isVerifying,
  onPasswordChange,
  onVerify,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/80 justify-center items-center p-6"
        onPress={onClose}
      >
        <Pressable
          className="bg-[#121212] px-5 py-6 rounded-[40px] border border-zinc-800/50 items-center w-full"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-center gap-4 mb-2 mt-2">
            <View className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center">
              <Ionicons name="lock-closed-outline" size={20} color="#71717A" />
            </View>
            <Text className="text-white text-lg font-myMedium">
              Enter Password
            </Text>
          </View>

          <Text className="text-zinc-500 text-center font-myRegular text-sm mb-6 px-4 leading-5">
            Please enter your account password to securely view your balance.
          </Text>

          <View className="w-full mb-0 relative justify-center px-2">
            <TextInput
              value={passwordInput}
              onChangeText={onPasswordChange}
              secureTextEntry
              placeholder="Account password"
              placeholderTextColor="#52525B"
              className="w-full bg-zinc-900/50 text-white font-myMedium text-base p-4 rounded-2xl border border-zinc-800 text-center"
              autoFocus
            />
          </View>

          {passwordError ? (
            <Text className="text-red-500 text-xs font-myMedium mb-4 self-start pl-4">
              {passwordError}
            </Text>
          ) : (
            <View className="h-4 mb-4" />
          )}

          <View className="w-full px-2">
            <TouchableOpacity
              onPress={onVerify}
              disabled={isVerifying || !passwordInput}
              className={`w-full py-3.5 rounded-2xl items-center justify-center flex-row mb-2 ${!passwordInput ? "bg-zinc-800" : "bg-white"}`}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <Text
                  className={`text-base font-myMedium ${!passwordInput ? "text-zinc-500" : "text-black"}`}
                >
                  Verify & Unlock
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
