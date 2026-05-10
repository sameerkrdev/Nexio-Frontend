import { API_BASE_URL } from "../config/api.config";
import {
  getStoredTokens,
  storeTokens,
  clearTokens,
  getDeviceId,
} from "./storage";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode?: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<TokenPair> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<TokenPair> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = (async () => {
      try {
        const tokens = await getStoredTokens();
        if (!tokens?.refreshToken) {
          throw new Error("No refresh token available");
        }

        const deviceId = await getDeviceId();

        console.log("[API] Refreshing access token...");

        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: tokens.refreshToken,
            deviceId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Token refresh failed");
        }

        const newTokens: TokenPair = data.data;
        await storeTokens(newTokens);

        console.log("[API] Token refreshed successfully");

        return newTokens;
      } catch (error) {
        console.error("[API] Token refresh failed:", error);
        // Clear tokens and force re-login
        await clearTokens();
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] Requesting: ${options.method} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      // Handle 401 Unauthorized - token expired
      if (
        response.status === 401 &&
        retryCount === 0 &&
        endpoint !== "/auth/refresh"
      ) {
        console.log("[API] 401 Unauthorized - attempting token refresh");

        try {
          // Refresh the token
          await this.refreshAccessToken();

          // Retry the original request with new token
          const tokens = await getStoredTokens();
          if (tokens?.accessToken) {
            const newHeaders: Record<string, string> = {
              ...(options.headers as Record<string, string>),
            };

            // Update Authorization header with new token
            newHeaders["Authorization"] = `Bearer ${tokens.accessToken}`;

            return this.request<T>(
              endpoint,
              { ...options, headers: newHeaders },
              retryCount + 1,
            );
          }
        } catch (refreshError) {
          console.error("[API] Token refresh failed, user needs to re-login");
          throw {
            success: false,
            message: "Session expired. Please login again.",
            statusCode: 401,
          } as ApiError;
        }
      }

      if (!response.ok) {
        throw {
          success: false,
          message: data.message || "An error occurred",
          statusCode: response.status,
        } as ApiError;
      }

      return data;
    } catch (error) {
      if ((error as ApiError).success === false) {
        throw error;
      }

      throw {
        success: false,
        message: "Network error. Please check your connection.",
      } as ApiError;
    }
  }

  async get<T>(
    endpoint: string,
    authenticated = false,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};

    if (authenticated) {
      const tokens = await getStoredTokens();
      if (tokens?.accessToken) {
        headers["Authorization"] = `Bearer ${tokens.accessToken}`;
      }
    }

    return this.request<T>(endpoint, {
      method: "GET",
      headers,
    });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    authenticated = false,
    additionalHeaders?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = additionalHeaders
      ? { ...additionalHeaders }
      : {};

    if (authenticated) {
      const tokens = await getStoredTokens();
      if (tokens?.accessToken) {
        headers["Authorization"] = `Bearer ${tokens.accessToken}`;
      }
    }

    return this.request<T>(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }
  async patch<T>(
    endpoint: string,
    body?: any,
    authenticated = false,
    additionalHeaders?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = additionalHeaders
      ? { ...additionalHeaders }
      : {};

    if (authenticated) {
      const tokens = await getStoredTokens();
      if (tokens?.accessToken) {
        headers["Authorization"] = `Bearer ${tokens.accessToken}`;
      }
    }

    return this.request<T>(endpoint, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
  }

  async delete<T>(
    endpoint: string,
    authenticated = false,
    additionalHeaders?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = additionalHeaders
      ? { ...additionalHeaders }
      : {};

    if (authenticated) {
      const tokens = await getStoredTokens();
      if (tokens?.accessToken) {
        headers["Authorization"] = `Bearer ${tokens.accessToken}`;
      }
    }

    return this.request<T>(endpoint, {
      method: "DELETE",
      headers,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
