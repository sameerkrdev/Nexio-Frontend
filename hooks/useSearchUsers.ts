import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useSearchUsers = (searchQuery: string) => {
  return useQuery({
    queryKey: ["search-users", searchQuery],
    queryFn: () => userService.searchUsers(searchQuery),
    enabled: searchQuery.length > 2, // only search if query is longer than 2 chars
    staleTime: 1000 * 60 * 5, // 5 mins fresh
  });
};
