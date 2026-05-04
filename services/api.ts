import { API_BASE_URL } from "../config/api.config";
import { getStoredTokens } from "./storage";

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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
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
}

export const apiClient = new ApiClient(API_BASE_URL);
