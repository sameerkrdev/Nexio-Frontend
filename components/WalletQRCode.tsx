import React from "react";
import { View, Text, Image } from "react-native";
import QRCode from "react-native-qrcode-svg";

type Props = {
  username: string | null;
  name: string | null;
  avatar: string | null;
  walletAddress?: string | null;
  size?: number | null;
};

export const WalletQRCode = ({
  username,
  name,
  avatar,
  walletAddress,
  size = 200,
}: Props) => {
  // Use a deep link URL instead of raw JSON so it actually opens the app when scanned
  // The user's layout listener expects query params
  const qrData = `myapp://send?type=fronteir_payment&username=${encodeURIComponent(username)}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}&walletAddress=${encodeURIComponent(walletAddress || "")}`;

  return (
    <View className="items-center">
      {/* QR Container */}
      <View
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 24,
          position: "relative",
        }}
      >
        <QRCode
          value={qrData}
          size={size ?? 200}
          color="#000000"
          backgroundColor="white"
          ecl="H" // ← HIGH correction needed for logo overlay
        />

        {/* Logo in center */}
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{ translateX: -24 }, { translateY: -24 }],
            backgroundColor: "white",
            borderRadius: 12,
            padding: 4,
          }}
        >
          <Image
            source={require("../assets/icon.png")} // ← using icon.png as logo.png is missing
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
            }}
          />
        </View>
      </View>
    </View>
  );
};
