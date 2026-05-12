import { apiClient, ApiResponse } from "./api";
import {
  storeTokens,
  clearTokens,
  getDeviceId,
  getStoredTokens,
} from "./storage";

export interface CheckUsernameResponse {
  available: boolean;
  exists: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string; // This is the userId
  username: string;
  name: string;
  phoneNumber: string;
  email: string | null;
  solanaPublicKey: string | null;
  subscriptionExpiresAt: string | null;
  isPremium: boolean;
  createdAt: string;
  wallet: {
    balance: string;
    currency: string;
  } | null;
}

export interface SendOtpRequest {
  phoneNumber?: string;
  purpose: "signup" | "login";
  username?: string;
  identifier?: string;
}

export interface VerifyOtpRequest {
  otp: string;
  purpose: "signup" | "login";
  phoneNumber?: string;
  username?: string;
  name?: string;
  identifier?: string;
}

class AuthService {
  /**
   * Check if a username is available
   */
  async checkUsername(username: string): Promise<CheckUsernameResponse> {
    const response = await apiClient.post<CheckUsernameResponse>(
      "/auth/check-username",
      {
        username,
      },
    );
    return response.data!;
  }

  /**
   * Send OTP for signup
   */
  async sendSignupOtp(username: string, phoneNumber: string): Promise<void> {
    await apiClient.post("/auth/send-otp", {
      phoneNumber,
      purpose: "signup",
      username,
    });
  }

  /**
   * Send OTP for login
   */
  async sendLoginOtp(identifier: string): Promise<void> {
    await apiClient.post("/auth/send-otp", {
      purpose: "login",
      identifier,
    });
  }

  /**
   * Verify OTP for signup and create account
   */
  async verifySignupOtp(
    username: string,
    name: string,
    phoneNumber: string,
    otp: string,
    password?: string,
  ): Promise<TokenPair> {
    const deviceId = await getDeviceId();

    const response = await apiClient.post<TokenPair>(
      "/auth/verify-otp",
      {
        otp,
        purpose: "signup",
        phoneNumber,
        username,
        name,
        password,
      },
      false,
      { "x-device-id": deviceId },
    );

    const tokens = response.data!;
    await storeTokens(tokens);
    return tokens;
  }

  /**
   * Login with username and password
   */
  async loginWithPassword(
    username: string,
    password: string,
  ): Promise<TokenPair> {
    const deviceId = await getDeviceId();

    const response = await apiClient.post<TokenPair>(
      "/auth/login",
      {
        username,
        password,
      },
      false,
      { "x-device-id": deviceId },
    );

    const tokens = response.data!;
    await storeTokens(tokens);
    return tokens;
  }

  /**
   * Verify OTP for login
   */
  async verifyLoginOtp(identifier: string, otp: string): Promise<TokenPair> {
    const deviceId = await getDeviceId();

    const response = await apiClient.post<TokenPair>(
      "/auth/verify-otp",
      {
        otp,
        purpose: "login",
        identifier,
      },
      false,
      { "x-device-id": deviceId },
    );

    const tokens = response.data!;
    await storeTokens(tokens);
    return tokens;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<TokenPair> {
    const tokens = await getStoredTokens();
    if (!tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const deviceId = await getDeviceId();

    const response = await apiClient.post<TokenPair>("/auth/refresh", {
      refreshToken: tokens.refreshToken,
      deviceId,
    });

    const newTokens = response.data!;
    await storeTokens(newTokens);
    return newTokens;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const tokens = await getStoredTokens();

    if (tokens?.refreshToken) {
      try {
        await apiClient.post("/auth/logout", {
          refreshToken: tokens.refreshToken,
        });
      } catch (error) {
        console.error("Logout API call failed:", error);
        // Continue with local cleanup even if API call fails
      }
    }

    await clearTokens();
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me", true);
    return response.data!;
  }
}

export const authService = new AuthService();
