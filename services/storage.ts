import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const TOKEN_KEY = "auth_tokens";
const DEVICE_ID_KEY = "device_id";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Get or generate a unique device ID
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    // Fallback to a random UUID if SecureStore fails
    return Crypto.randomUUID();
  }
};

/**
 * Store authentication tokens securely
 */
export const storeTokens = async (tokens: StoredTokens): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error("Error storing tokens:", error);
    throw new Error("Failed to store authentication tokens");
  }
};

/**
 * Retrieve stored authentication tokens
 */
export const getStoredTokens = async (): Promise<StoredTokens | null> => {
  try {
    const tokensJson = await SecureStore.getItemAsync(TOKEN_KEY);

    if (!tokensJson) {
      return null;
    }

    return JSON.parse(tokensJson) as StoredTokens;
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    return null;
  }
};

/**
 * Clear all stored authentication data
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error clearing tokens:", error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const tokens = await getStoredTokens();
  return tokens !== null && !!tokens.accessToken;
};
