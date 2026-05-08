import { useQuery } from "@tanstack/react-query";
import { paymentService } from "../services/payment.service";

export const useTransactions = (
  userId: string | undefined,
  page: number = 1,
  limit: number = 5,
) => {
  return useQuery({
    queryKey: ["transactions", userId, page, limit],
    queryFn: () => paymentService.getPaymentHistory(page, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 min fresh
  });
};

export const useActivityTransactions = (
  userId: string | undefined,
  page: number = 1,
  limit: number = 20,
) => {
  return useQuery({
    queryKey: ["activity-transactions", userId, page, limit],
    queryFn: () => paymentService.getPaymentHistory(page, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 min fresh
  });
};
