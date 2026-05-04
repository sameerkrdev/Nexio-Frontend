import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import "../global.css";
import { Stack, router } from "expo-router";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { getDappKeyPair, decryptPayload } from "../lib/phantom";
import { setWalletData } from "../store/walletStore";
import { AuthProvider } from "../contexts/AuthContext";

export default function Layout() {
  const [loaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const isReady = useRef(false);

  useEffect(() => {
    if (!loaded) return;
    isReady.current = true;

    Linking.getInitialURL().then((url) => {
      console.log("🧊 Cold-start URL:", url);
      if (url) processUrl(url);
    });

    const sub = Linking.addEventListener("url", ({ url }) => {
      console.log("🔥 Incoming URL:", url);
      processUrl(url);
    });

    return () => sub.remove();
  }, [loaded]); // ← depend on loaded so router is ready

  const processUrl = async (url: string) => {
    if (!url.includes("onConnect")) return;

    console.log("📥 Processing:", url);

    const { queryParams } = Linking.parse(url);

    if (!queryParams?.phantom_encryption_public_key) {
      if (queryParams?.errorCode) {
        console.log(
          "❌ Phantom error:",
          queryParams.errorCode,
          queryParams.errorMessage,
        );
      }
      return;
    }

    try {
      const keyPair = await getDappKeyPair();
      const phantomKey = bs58.decode(
        queryParams.phantom_encryption_public_key as string,
      );
      const secret = nacl.box.before(phantomKey, keyPair.secretKey);
      const payload = decryptPayload(
        queryParams.data as string,
        queryParams.nonce as string,
        secret,
      );

      console.log("✅ Payload:", payload);

      setWalletData({
        address: payload.public_key,
        phantomKey,
        secret,
        session: payload.session,
      });

      console.log("✅ Wallet set, navigating...");

      // Give router a tick to be fully ready
      setTimeout(() => {
        router.replace("/profile");
      }, 200);
    } catch (e) {
      console.error("❌ Phantom connect failed:", e);
    }
  };

  if (!loaded) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="authentication" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="otp-login" />
        <Stack.Screen name="success-card" />
        <Stack.Screen name="home" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="send" />
      </Stack>
    </AuthProvider>
  );
}
