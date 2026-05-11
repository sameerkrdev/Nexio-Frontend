import { Alert, Linking } from "react-native";

// App runs against Solana devnet (see services/balance.service.ts and app/_layout.tsx).
// When moving to mainnet, drop the `?cluster=...` query so the explorer loads
// the default mainnet view.
const SOLANA_CLUSTER = "devnet";

export const buildSolanaExplorerUrl = (txHash: string): string =>
  `https://explorer.solana.com/tx/${txHash}?cluster=${SOLANA_CLUSTER}`;

export const openSolanaExplorer = async (
  txHash: string | null | undefined,
): Promise<void> => {
  if (!txHash || txHash === "undefined") {
    Alert.alert(
      "No transaction yet",
      "This payment hasn't been confirmed on-chain.",
    );
    return;
  }

  const url = buildSolanaExplorerUrl(txHash);
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Cannot open link", url);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Could not open explorer",
      "Please try again or copy the transaction hash manually.",
    );
  }
};
