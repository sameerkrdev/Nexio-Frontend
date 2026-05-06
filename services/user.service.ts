import { apiClient } from "./api";
import { User } from "./auth.service";

class UserService {
  /**
   * Update the user's solana wallet public key
   */
  async patchMyWallet(solanaPublicKey: string): Promise<User> {
    const response = await apiClient.patch<User>(
      "/users/me/wallet",
      {
        solanaPublicKey,
      },
      true, // authenticated
    );
    return response.data!;
  }

  /**
   * Search for users by username or name
   */
  async searchUsers(query: string): Promise<User[]> {
    const response = await apiClient.get<User[]>(
      `/users/search?q=${encodeURIComponent(query)}`,
      true // authenticated
    );
    return response.data || [];
  }
}

export const userService = new UserService();
