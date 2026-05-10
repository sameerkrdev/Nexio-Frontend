import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  withdrawalService,
  type WithdrawalStatus,
} from "../services/withdrawal.service";

export const useAvailableMethods = () => {
  return useQuery({
    queryKey: ["withdrawal-methods"],
    queryFn: () => withdrawalService.getAvailableMethods(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useWithdrawalAccounts = () => {
  return useQuery({
    queryKey: ["withdrawal-accounts"],
    queryFn: () => withdrawalService.listAccounts(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAddWithdrawalAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: withdrawalService.addAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-accounts"] });
    },
  });
};

export const useSetDefaultAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) =>
      withdrawalService.setDefaultAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-accounts"] });
    },
  });
};

export const useRemoveAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) =>
      withdrawalService.removeAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-accounts"] });
    },
  });
};

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      accountId,
      amount,
      note,
    }: {
      accountId: string;
      amount: number;
      note?: string;
    }) => withdrawalService.createWithdrawal(accountId, amount, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
};

export const useWithdrawals = (
  page = 1,
  limit = 20,
  status?: WithdrawalStatus,
) => {
  return useQuery({
    queryKey: ["withdrawals", page, limit, status],
    queryFn: () => withdrawalService.listWithdrawals(page, limit, status),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useWithdrawalById = (id: string) => {
  return useQuery({
    queryKey: ["withdrawal", id],
    queryFn: () => withdrawalService.getWithdrawalById(id),
    enabled: !!id,
  });
};

export const useCancelWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawalService.cancelWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
};
