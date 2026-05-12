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
import { NotificationProvider } from "../contexts/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const SOLANA_RPC = "https://api.devnet.solana.com";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // data stays fresh for 2 mins
      gcTime: 1000 * 60 * 10, // cache kept for 10 mins
      retry: 2, // retry failed requests twice
      refetchOnWindowFocus: false, // don't refetch on app focus
    },
  },
});

function InnerLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const isReady = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    // success-card is a transient post-signup screen — skip the guard entirely
    if (segments[0] === "success-card") return;

    // payment-success is a transient post-payment screen — skip the guard
    if (segments[0] === "payment-success") return;
    if (segments[0] === "external-payment-success") return;

    // profile screen is accessible to authenticated users (for Phantom wallet connection)
    if (segments[0] === "profile") return;

    // OTP screens handle their own post-auth navigation (signup → success-card,
    // login → home). Skipping the guard here prevents the race where auth flips
    // to true while still on /otp, causing the layout to redirect to /home
    // before the screen's own router.replace to /success-card runs.
    if (segments[0] === "otp" || segments[0] === "otp-login") return;

    // Phantom callback stubs — these are entered for ~milliseconds while the
    // Linking listener decrypts the payload and router.replace's to the real
    // destination (/profile or /payment-success). Skip the guard so we don't
    // bounce out of them before that completes.
    if (segments[0] === "onConnect" || segments[0] === "onSignTransaction") {
      return;
    }

    // Dodo return_url stub for the subscription flow — see app/subscription-success.tsx
    if (segments[0] === "subscription-success") return;

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
      <Stack.Screen name="add-money" />
      <Stack.Screen name="search-user" />
      <Stack.Screen name="payment-confirm" />
      <Stack.Screen name="payment-success" />
      <Stack.Screen name="send-external-recipient" />
      <Stack.Screen name="send-external" />
      <Stack.Screen name="external-payment-confirm" />
      <Stack.Screen name="external-payment-success" />
      <Stack.Screen name="activity" />
      <Stack.Screen name="transaction-detail" />
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="withdraw-amount" />
      <Stack.Screen name="withdraw-confirm" />
      <Stack.Screen name="withdraw-success" />
      <Stack.Screen name="add-withdrawal-account" />
      <Stack.Screen name="add-account-form" />
      <Stack.Screen name="withdrawal-history" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="notification-settings" />
      <Stack.Screen name="onConnect" />
      <Stack.Screen name="onSignTransaction" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="subscription-success" />
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
    console.log("🔵 RAW INCOMING DEEP LINK:", url);
    const parsed = Linking.parse(url);
    const queryParams = parsed.queryParams || {};

    let allParams = { ...queryParams };
    let combinedString = url;

    // In Expo Dev Client, the actual redirect URL might be embedded in `queryParams.url`
    if (typeof queryParams.url === "string") {
      const innerParsed = Linking.parse(queryParams.url);
      allParams = { ...allParams, ...(innerParsed.queryParams || {}) };
      combinedString += " " + queryParams.url;
    }

    console.log("🔵 PARSED COMBINED PARAMS:", JSON.stringify(allParams));

    const isConnect =
      combinedString.includes("onConnect") ||
      !!allParams.phantom_encryption_public_key;

    const isSignTransaction =
      combinedString.includes("onSignTransaction") ||
      (!!allParams.data &&
        !!allParams.nonce &&
        !allParams.phantom_encryption_public_key);

    // ─── Phantom → onConnect ──────────────────────────────────────
    if (isConnect) {
      console.log("📦 RAW QUERY PARAMS:", JSON.stringify(allParams));

      if (!allParams.phantom_encryption_public_key) {
        if (allParams.errorCode) {
          console.log("❌ Phantom connect error:", allParams.errorCode);
        }
        return;
      }

      try {
        const keyPair = await getDappKeyPair();

        const phantomKey = bs58.decode(
          allParams.phantom_encryption_public_key as string,
        );
        const secret = nacl.box.before(phantomKey, keyPair.secretKey);

        const payload = decryptPayload(
          allParams.data as string,
          allParams.nonce as string,
          secret,
        );

        setWalletData({
          address: payload.public_key,
          phantomKey,
          secret,
          session: payload.session,
        });

        console.log("✅ Wallet data set");
        router.replace("/profile");
      } catch (e) {
        console.error("❌ Phantom connect failed:", e);
      }
      return;
    }

    // ─── Phantom → onSignTransaction ─────────────────────────────
    if (isSignTransaction) {
      console.log("🔵 onSignTransaction matched");

      if (allParams.errorCode) {
        console.log("❌ Phantom sign rejected:", allParams.errorCode);
        router.back();
        return;
      }

      try {
        const sharedSecret = getSharedSecret();
        if (!sharedSecret)
          throw new Error("No shared secret — reconnect Phantom");

        if (!allParams.data || !allParams.nonce)
          throw new Error("Missing data or nonce in onSignTransaction URL");

        console.log("🔵 Decrypting payload...");
        const decrypted = decryptPayload(
          allParams.data as string,
          allParams.nonce as string,
          sharedSecret,
        );
        console.log("✅ Payload decrypted");

        // Signed tx comes back in base58 — decode to bytes
        const signedTxBytes = bs58.decode(decrypted.transaction);
        console.log("🔵 Broadcasting transaction...");

        // Broadcast to Solana network
        const connection = new Connection(SOLANA_RPC, "confirmed");
        const txHash = await connection.sendRawTransaction(signedTxBytes, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        console.log("✅ Transaction broadcast:", txHash);

        const {
          paymentId,
          recipientUsername,
          currency,
          type,
          recipientDisplayName,
        } = getPendingPayment();
        console.log("🔵 Pending payment data:", {
          paymentId,
          recipientUsername,
          currency,
          type,
        });
        clearPendingPayment();

        if (type === "external") {
          console.log("🔵 Navigating to external-payment-success...");
          router.replace({
            pathname: "/external-payment-success",
            params: {
              paymentId: paymentId ?? "",
              txHash,
              recipientDisplayPhone: recipientDisplayName ?? recipientUsername ?? "",
              currency: currency ?? "",
            },
          });
        } else {
          console.log("🔵 Navigating to payment-success...");
          router.replace({
            pathname: "/payment-success",
            params: {
              paymentId: paymentId ?? "",
              txHash,
              recipientUsername: recipientUsername ?? "",
              currency: currency ?? "",
            },
          });
        }
        console.log("✅ Navigation complete");
      } catch (e) {
        console.error("❌ Broadcast failed:", e);
        router.back();
      }
      return;
    }

    // ─── QR Scan → fronteir_payment ─────────────────────────────
    if (
      combinedString.includes("fronteir_payment") ||
      combinedString.includes("type=fronteir_payment")
    ) {
      if (allParams && allParams.type === "fronteir_payment") {
        router.push({
          pathname: "/send",
          params: {
            username: (allParams.username as string) || "",
            name: (allParams.name as string) || "",
            avatar: (allParams.avatar as string) || "",
            walletAddress: (allParams.walletAddress as string) || "",
          },
        });
        return;
      }
    }

    // ─── Unmatched URL ───────────────────────────────────────────
    console.log("⚠️ Unmatched deep link URL:", url);
  };

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <InnerLayout />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
