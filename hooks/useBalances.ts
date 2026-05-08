import { useQuery } from "@tanstack/react-query";
import { balanceService } from "../services/balance.service";

export const useSolBalance = (address: string | null) => {
  return useQuery({
    queryKey: ["sol-balance", address],
    queryFn: () => balanceService.getSolBalance(address!),
    enabled: !!address,
    staleTime: 1000 * 60 * 2, // 2 mins fresh
    refetchInterval: 1000 * 30, // auto refetch every 30s
  });
};

export const useEthBalance = (address: string | null) => {
  return useQuery({
    queryKey: ["eth-balance", address],
    queryFn: () => balanceService.getEthBalance(address!),
    enabled: !!address,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 30,
  });
};
