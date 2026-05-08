import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  onClose,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  // Debug: Log when visible prop changes
  useEffect(() => {
    console.log("QRScannerModal visible changed to:", visible);
  }, [visible]);

  useEffect(() => {
    const getCameraPermissions = async () => {
      console.log("Requesting camera permissions...");
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log("Camera permission status:", status);
      setHasPermission(status === "granted");
    };

    if (visible) {
      getCameraPermissions();
      setScanned(false); // Reset scanned state when modal opens
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      console.log("Scanned QR data:", data);

      // Parse the QR code data
      // Expected format: myapp://send?type=fronteir_payment&username=...&name=...&avatar=...&walletAddress=...
      const url = new URL(data);

      console.log("Parsed URL - protocol:", url.protocol);
      console.log("Parsed URL - pathname:", url.pathname);
      console.log("Parsed URL - host:", url.host);
      console.log("Parsed URL - href:", url.href);

      // Check protocol and path - pathname could be "//send" or "send" depending on parsing
      if (
        url.protocol !== "myapp:" ||
        (url.pathname !== "//send" &&
          url.pathname !== "/send" &&
          url.host !== "send")
      ) {
        Alert.alert(
          "Invalid QR Code",
          `This QR code is not a valid payment code. Protocol: ${url.protocol}, Path: ${url.pathname}, Host: ${url.host}`,
        );
        setScanned(false);
        return;
      }

      const params = url.searchParams;
      const type = params.get("type");

      console.log("QR type:", type);

      if (type !== "fronteir_payment") {
        Alert.alert(
          "Invalid QR Code",
          `This QR code is not a valid payment code. Type: ${type}`,
        );
        setScanned(false);
        return;
      }

      const username = params.get("username");
      const name = params.get("name");
      const avatar = params.get("avatar");
      const walletAddress = params.get("walletAddress");

      console.log("Extracted params:", {
        username,
        name,
        avatar,
        walletAddress,
      });

      if (!username || !name) {
        Alert.alert("Invalid QR Code", "Missing required user information.");
        setScanned(false);
        return;
      }

      // Close the scanner modal
      onClose();

      // Navigate to send screen with the scanned user info
      setTimeout(() => {
        router.push({
          pathname: "/send",
          params: {
            username,
            name,
            avatar: avatar || "",
            walletAddress: walletAddress || "",
          },
        });
      }, 300);
    } catch (error) {
      console.error("QR scan error:", error);
      Alert.alert(
        "Error",
        `Failed to read QR code: ${error}. Please try again.`,
      );
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return null;
  }

  if (hasPermission === false) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black items-center justify-center p-6">
          <View className="bg-zinc-900 rounded-[32px] p-8 items-center border border-zinc-800">
            <View className="w-16 h-16 bg-red-500/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="camera-off" size={32} color="#EF4444" />
            </View>
            <Text className="text-white text-xl font-myMedium mb-2">
              Camera Access Required
            </Text>
            <Text className="text-zinc-400 text-center text-sm font-myRegular mb-6">
              Please grant camera permission to scan QR codes
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-white py-3 px-8 rounded-2xl"
            >
              <Text className="text-black font-myMedium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Camera View - No children allowed */}
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* All UI overlays positioned absolutely outside CameraView */}
        {/* Header */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            paddingTop: 64,
            paddingHorizontal: 24,
            paddingBottom: 24,
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-xl font-myMedium">
              Scan QR Code
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-zinc-900/80 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scanning Frame */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <View className="relative">
            {/* Corner borders */}
            <View className="w-64 h-64 relative">
              {/* Top Left */}
              <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl" />
              {/* Top Right */}
              <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl" />
              {/* Bottom Left */}
              <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl" />
              {/* Bottom Right */}
              <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl" />
            </View>
          </View>
        </View>

        {/* Bottom Instructions */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: 48,
            paddingHorizontal: 24,
            paddingTop: 24,
          }}
        >
          <View className="bg-zinc-900/80 rounded-[24px] p-6 items-center border border-zinc-800/50">
            <Ionicons name="qr-code-outline" size={32} color="white" />
            <Text className="text-white text-base font-myMedium mt-3 mb-1">
              Position QR code in frame
            </Text>
            <Text className="text-zinc-400 text-sm font-myRegular text-center">
              Align the QR code within the frame to scan
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};
