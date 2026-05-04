import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, User } from "../services/auth.service";
import { isAuthenticated, clearTokens } from "../services/storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, otp: string) => Promise<void>;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  signup: (
    username: string,
    name: string,
    phoneNumber: string,
    otp: string,
    password?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await isAuthenticated();

      if (isAuth) {
        await fetchUser();
      }

      setAuthenticated(isAuth);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      setAuthenticated(true);
    } catch (error) {
      console.error("Error fetching user:", error);
      // If token is invalid, clear it
      await clearTokens();
      setUser(null);
      setAuthenticated(false);
    }
  };

  const login = async (identifier: string, otp: string) => {
    try {
      await authService.verifyLoginOtp(identifier, otp);
      await fetchUser();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginWithPassword = async (username: string, password: string) => {
    try {
      await authService.loginWithPassword(username, password);
      await fetchUser();
    } catch (error) {
      console.error("Password login error:", error);
      throw error;
    }
  };

  const signup = async (
    username: string,
    name: string,
    phoneNumber: string,
    otp: string,
    password?: string,
  ) => {
    try {
      await authService.verifySignupOtp(
        username,
        name,
        phoneNumber,
        otp,
        password,
      );
      await fetchUser();
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: authenticated,
        login,
        loginWithPassword,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
