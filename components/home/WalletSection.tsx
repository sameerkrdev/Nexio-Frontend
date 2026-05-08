import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Asset {
  name: string;
  symbol: string;
  icon: string;
}

interface WalletSectionProps {
  selectedAsset: string;
  balances: { sol: string; eth: string };
  isAssetDropdownOpen: boolean;
  assets: Asset[];
  onAssetDropdownToggle: () => void;
  onAssetSelect: (symbol: string) => void;
  onTransferPress: () => void;
}

export const WalletSection: React.FC<WalletSectionProps> = ({
  selectedAsset,
  balances,
  isAssetDropdownOpen,
  assets,
  onAssetDropdownToggle,
  onAssetSelect,
  onTransferPress,
}) => {
  return (
    <View className="mb-0 bg-[#121212]/70 p-4 rounded-[25px] border border-zinc-800/50 flex-row items-center justify-between">
      {/* Left: Asset Selector */}
      <View className="relative">
        <TouchableOpacity
          onPress={onAssetDropdownToggle}
          className="bg-zinc-900/50 px-3 py-2 rounded-2xl flex-row items-center border border-zinc-800"
        >
          <Image
            source={{
              uri: assets.find((a) => a.symbol === selectedAsset)?.icon,
            }}
            className="w-5 h-5 rounded-full"
          />
          <Ionicons
            name="chevron-down"
            size={12}
            color="#71717A"
            className="ml-1"
          />
        </TouchableOpacity>

        {isAssetDropdownOpen && (
          <View className="absolute top-12 left-0 bg-zinc-900 rounded-2xl p-2 border border-zinc-800 z-50 w-40">
            {assets.map((asset) => (
              <TouchableOpacity
                key={asset.symbol}
                onPress={() => onAssetSelect(asset.symbol)}
                className={`p-3 rounded-xl mb-1 flex-row items-center ${selectedAsset === asset.symbol ? "bg-zinc-800" : ""}`}
              >
                <Image
                  source={{ uri: asset.icon }}
                  className="w-6 h-6 rounded-full mr-3"
                />
                <Text
                  className={`text-xs font-myMedium ${selectedAsset === asset.symbol ? "text-white" : "text-zinc-500"}`}
                >
                  {asset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Middle: Balance */}
      <View className="flex-1 px-4">
        <Text className="text-white text-xl font-myMedium">
          {selectedAsset === "SOL" ? balances.sol : balances.eth}{" "}
          {selectedAsset}
        </Text>
      </View>

      {/* Right: Icon-only Transfer Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onTransferPress}
        className="bg-white w-12 h-12 rounded-2xl items-center justify-center"
      >
        <Ionicons name="arrow-up" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
};
