import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Payment } from "../../services/payment.service";

interface TransactionUI {
  name: string;
  /** null when the counterparty is an external bank recipient (no NexaPay handle). */
  username: string | null;
  type: string;
  date: string;
  amount: string;
  color: string;
  icon: string;
  isSender: boolean;
  amountColor: string;
  cryptoIcon: string;
  avatarUrl: string;
  isExternal?: boolean;
}

interface TransactionsSectionProps {
  transactions: Payment[];
  isLoading: boolean;
  mapPaymentToUI: (payment: Payment, index: number) => TransactionUI;
  onSeeAllPress: () => void;
  onTransactionPress?: (payment: Payment) => void;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  isLoading,
  mapPaymentToUI,
  onSeeAllPress,
  onTransactionPress,
}) => {
  return (
    <View className="bg-[#121212] border rounded-t-[50px] pt-5 px-8 pb-40 border-t border-zinc-800/50">
      {/* Handle Bar (Pill) */}
      <View className="w-12 h-1 bg-zinc-800 rounded-full mb-5 self-center" />

      <View className="flex-row items-center justify-between mb-8">
        <Text className="text-white text-xl font-myMedium">
          Latest Transactions
        </Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text className="text-zinc-500 font-myMedium">See all</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      {isLoading ? (
        <View className="py-10 items-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : !transactions || transactions.length === 0 ? (
        <View className="py-10 items-center">
          <Ionicons name="receipt-outline" size={48} color="#52525B" />
          <Text className="text-zinc-500 font-myMedium mt-4">
            No transactions yet
          </Text>
        </View>
      ) : (
        <View className="gap-y-6">
          {transactions.map((payment, index) => {
            const uiTx = mapPaymentToUI(payment, index);
            return (
              <TouchableOpacity
                key={payment.id}
                className="flex-row items-center"
                activeOpacity={0.7}
                onPress={() => onTransactionPress?.(payment)}
              >
                <View className="w-14 h-14 rounded-full items-center justify-center mr-4 overflow-hidden bg-zinc-900 border border-zinc-800">
                  {uiTx.isExternal ? (
                    <Ionicons name="business" size={24} color="white" />
                  ) : (
                    <Image
                      source={{ uri: uiTx.avatarUrl }}
                      className="w-full h-full"
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-myMedium">
                    {uiTx.name}
                  </Text>
                  {uiTx.username ? (
                    <Text className="text-zinc-400 text-sm font-myRegular">
                      {uiTx.username}
                    </Text>
                  ) : null}
                  <Text className="text-zinc-500 text-xs font-myRegular mt-0.5">
                    {uiTx.type} • {uiTx.date}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`text-lg font-myMedium ${uiTx.amountColor}`}>
                    {uiTx.amount}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-zinc-500 text-xs font-myRegular mr-2">
                      From
                    </Text>
                    <Image
                      source={{ uri: uiTx.cryptoIcon }}
                      className="w-4 h-4 rounded-full"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};
