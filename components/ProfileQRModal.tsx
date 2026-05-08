import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WalletQRCode } from "./WalletQRCode";

interface ProfileQRModalProps {
  visible: boolean;
  onClose: () => void;
  user?: {
    name?: string;
    username?: string;
    solanaPublicKey?: string | null;
  } | null;
}

export const ProfileQRModal: React.FC<ProfileQRModalProps> = ({
  visible,
  onClose,
  user,
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
          className="bg-[#121212] rounded-t-[40px] px-6 py-10 border-t border-zinc-800"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle Bar */}
          <View className="w-12 h-1 bg-zinc-700 rounded-full mb-6 self-center" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-xl font-myMedium">
              Your QR Code
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center"
            >
              <MaterialCommunityIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* User Info Card */}
          {/* <View className="bg-zinc-900/50 rounded-[24px] p-4 mb-6 border border-zinc-800/50">
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-700 mr-3">
                <Image
                  source={{
                    uri: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg",
                  }}
                  className="w-full h-full"
                />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-myMedium">
                  {user?.name || "User"}
                </Text>
                <Text className="text-zinc-400 text-sm font-myRegular">
                  @{user?.username || "username"}
                </Text>
              </View>
            </View>
          </View> */}

          {/* QR Code Container */}
          <View className="items-center mb-6">
            <View className="bg-white p-5 rounded-[28px]">
              {user?.username ? (
                <WalletQRCode
                  name={user?.name ?? null}
                  walletAddress={user?.solanaPublicKey ?? null}
                  username={user?.username ?? null}
                  avatar={""}
                  size={220}
                />
              ) : (
                <View className="p-4">
                  <MaterialCommunityIcons
                    name="qrcode"
                    size={220}
                    color="black"
                  />
                </View>
              )}
            </View>
          </View>

          {/* Info Text */}
          <View className="bg-zinc-900/30 rounded-[20px] p-4 mb-6 border border-zinc-800/30">
            <Text className="text-zinc-400 text-center text-sm font-myMedium leading-5">
              Share this QR code to receive payments instantly
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-1 bg-zinc-800 py-4 rounded-2xl flex-row items-center justify-center"
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={18}
                color="white"
              />
              <Text className="text-white text-base font-myMedium ml-2">
                Share
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-1 bg-white py-4 rounded-2xl flex-row items-center justify-center"
            >
              <MaterialCommunityIcons name="download" size={18} color="black" />
              <Text className="text-black text-base font-myMedium ml-2">
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
