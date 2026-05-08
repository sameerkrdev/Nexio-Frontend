import { useInfiniteQuery } from "@tanstack/react-query";
import { paymentService } from "../services/payment.service";

export const useInfiniteTransactions = (
  userId: string | undefined,
  limit: number = 20,
) => {
  return useInfiniteQuery({
    queryKey: ["infinite-transactions", userId, limit],
    queryFn: ({ pageParam = 1 }) =>
      paymentService.getPaymentHistory(pageParam, limit),
    getNextPageParam: (lastPage: any, allPages) => {
      // Handle different response structures
      const totalPages = lastPage?.totalPages || 1;
      const currentPage = allPages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 min fresh
    initialPageParam: 1,
  });
};
