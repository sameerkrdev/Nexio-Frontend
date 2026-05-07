import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import "../global.css";
import { Stack, router, useSegments } from "expo-router";
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
import { Connection } from "@solana/web3.js";
import { getDappKeyPair, decryptPayload } from "../lib/phantom";
import { setWalletData, getSharedSecret } from "../store/walletStore";
import {
  getPendingPayment,
  clearPendingPayment,
} from "../store/pendingPaymentStore";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const SOLANA_RPC = "https://api.devnet.solana.com";

// ─── Route guard component ────────────────────────────────────────────────────
function InnerLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const isReady = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    // success-card is a transient post-signup screen — skip the guard entirely
    if (segments[0] === "success-card") return;

    const inAuthGroup =
      segments[0] === "authentication" ||
      segments[0] === "signup" ||
      segments[0] === "otp" ||
      segments[0] === "otp-login" ||
      segments[0] === undefined || // index page
      segments[0] === "(auth)";

    if (isAuthenticated && inAuthGroup) {
      router.replace("/home");
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
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
      <Stack.Screen name="send-choice" />
      <Stack.Screen name="search-user" />
      <Stack.Screen name="payment-confirm" />
      <Stack.Screen name="payment-success" />
    </Stack>
  );
}

// ─── Root layout — handles deep links from Phantom ───────────────────────────
export default function Layout() {
  const [loaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (!loaded) return;

    Linking.getInitialURL().then((url) => {
      if (url) processUrl(url);
    });

    const sub = Linking.addEventListener("url", ({ url }) => {
      processUrl(url);
    });

    return () => sub.remove();
  }, [loaded]);

  const processUrl = async (url: string) => {
    // ─── Phantom → onConnect ──────────────────────────────────────
    if (url.includes("onConnect")) {
      const { queryParams } = Linking.parse(url);

      if (!queryParams?.phantom_encryption_public_key) {
        if (queryParams?.errorCode) {
          console.log("❌ Phantom connect error:", queryParams.errorCode);
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

        setWalletData({
          address: payload.public_key,
          phantomKey,
          secret,
          session: payload.session,
        });

        setTimeout(() => {
          router.replace("/profile");
        }, 200);
      } catch (e) {
        console.error("❌ Phantom connect failed:", e);
      }
      return;
    }

    // ─── Phantom → onSignTransaction ─────────────────────────────
    if (url.includes("onSignTransaction")) {
      const { queryParams } = Linking.parse(url);

      if (queryParams?.errorCode) {
        console.log("❌ Phantom sign rejected:", queryParams.errorCode);
        router.back();
        return;
      }

      try {
        const sharedSecret = getSharedSecret();
        if (!sharedSecret)
          throw new Error("No shared secret — reconnect Phantom");

        // FIX: guard against null queryParams before destructuring
        if (!queryParams)
          throw new Error("Missing query params in onSignTransaction URL");

        const decrypted = decryptPayload(
          queryParams.data as string,
          queryParams.nonce as string,
          sharedSecret,
        );

        // Signed tx comes back in base58 — decode to bytes
        const signedTxBytes = bs58.decode(decrypted.transaction);

        // Broadcast to Solana network
        const connection = new Connection(SOLANA_RPC, "confirmed");
        const txHash = await connection.sendRawTransaction(signedTxBytes, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        console.log("✅ Transaction broadcast:", txHash);

        const { paymentId, recipientUsername, currency } = getPendingPayment();
        clearPendingPayment();

        router.replace({
          pathname: "/payment-success",
          params: {
            paymentId: paymentId ?? "",
            txHash,
            recipientUsername: recipientUsername ?? "",
            currency: currency ?? "",
          },
        });
      } catch (e) {
        console.error("❌ Broadcast failed:", e);
        router.back();
      }
      return;
    } // ← FIX: closing brace for onSignTransaction block was missing here

    // ─── QR Scan → fronteir_payment ─────────────────────────────
    if (
      url.includes("fronteir_payment") ||
      url.includes("type=fronteir_payment")
    ) {
      const { queryParams } = Linking.parse(url);

      if (queryParams && queryParams.type === "fronteir_payment") {
        router.push({
          pathname: "/send",
          params: {
            username: (queryParams.username as string) || "",
            name: (queryParams.name as string) || "",
            avatar: (queryParams.avatar as string) || "",
            walletAddress: (queryParams.walletAddress as string) || "",
          },
        });
        return;
      }
    }
  };

  if (!loaded) return null;

  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}
