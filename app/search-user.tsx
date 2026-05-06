import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useWallet } from "../store/walletStore";
import { userService } from "../services/user.service";

interface SearchUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

// Default avatars to use if user doesn't have one
const DEFAULT_AVATARS = [
  'https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg',
  'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg',
  'https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg'
];

// Mock data for initial view or results
const MOCK_RESULTS: SearchUser[] = [
  { id: '1', name: 'Alex M.', username: 'alex_m', avatar: 'https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg' },
  { id: '2', name: 'Priya S.', username: 'priya23', avatar: 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg' },
  { id: '3', name: 'Sarah T.', username: 'sarah_t', avatar: 'https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg' },
];

export default function SearchUserScreen() {
  const { address } = useWallet();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchUser[]>(MOCK_RESULTS);
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (text.length > 2) {
      setIsLoading(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const apiResults = await userService.searchUsers(text);
          // Map backend users to UI expected format (adding mock avatars)
          const formattedResults = apiResults.map((u, index) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            avatar: DEFAULT_AVATARS[index % DEFAULT_AVATARS.length],
          }));
          setResults(formattedResults);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } else {
      setResults(text.length === 0 ? MOCK_RESULTS : []);
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-myBold ml-6">Find User</Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2">
            <Ionicons name="search" size={20} color="#71717A" />
            <TextInput
              placeholder="Search by username..."
              placeholderTextColor="#71717A"
              className="flex-1 ml-3 text-white font-myMedium text-lg py-2"
              value={search}
              onChangeText={handleSearch}
              autoFocus
              autoCapitalize="none"
            />
            {isLoading && <ActivityIndicator size="small" color="#A3E635" />}
            {!isLoading && search.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="#71717A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        <View className="flex-1 px-6 mt-8">
          <Text className="text-zinc-500 font-myBold text-xs uppercase tracking-widest mb-4">
            {search.length > 0 ? "Search Results" : "Recent Contacts"}
          </Text>

          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800 mb-4"
                onPress={() => {
                  if (!address) {
                    setIsWalletModalVisible(true);
                  } else {
                    router.push({
                      pathname: "/send",
                      params: {
                        id: item.id,
                        name: item.name,
                        username: item.username,
                        avatar: item.avatar,
                      },
                    });
                  }
                }}
              >
                <Image
                  source={{ uri: item.avatar }}
                  className="w-14 h-14 rounded-full border-2 border-lime-400 mr-4"
                />
                <View className="flex-1">
                  <Text className="text-white font-myBold text-lg">{item.name}</Text>
                  <Text className="text-zinc-500 text-sm font-myMedium">@{item.username}</Text>
                </View>
                <View className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center">
                  <Ionicons name="send-outline" size={18} color="#A3E635" />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !isLoading && search.length > 0 ? (
                <View className="items-center mt-20">
                  <View className="w-20 h-20 bg-zinc-900 rounded-full items-center justify-center mb-4">
                    <Ionicons name="person-remove" size={32} color="#3F3F46" />
                  </View>
                  <Text className="text-white text-lg font-myBold">No User Found</Text>
                  <Text className="text-zinc-500 text-center mt-2 font-myMedium">
                    We couldn't find anyone with the username "{search}"
                  </Text>
                </View>
              ) : null
            }
          />
        </View>

        {/* Wallet Connection Modal */}
        {isWalletModalVisible && (
          <View className="absolute inset-0 bg-black/80 items-center justify-center px-8 z-[100]">
            <View className="bg-[#121212] border border-zinc-800 rounded-[40px] p-8 w-full items-center">
              <View className="w-20 h-20 bg-lime-400/10 rounded-full items-center justify-center mb-6">
                <Ionicons name="wallet-outline" size={40} color="#A3E635" />
              </View>
              
              <Text className="text-white text-2xl font-myBold text-center mb-2">
                Connect Wallet
              </Text>
              
              <Text className="text-zinc-500 text-center font-myMedium mb-8 leading-6">
                Please connect your Phantom wallet first to enable secure crypto transfers to other users.
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setIsWalletModalVisible(false);
                  router.push("/profile");
                }}
                className="bg-lime-400 w-full py-5 rounded-2xl items-center shadow-lg shadow-lime-400/20"
              >
                <Text className="text-black text-lg font-myBold">Connect Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsWalletModalVisible(false)}
                className="mt-4 py-2"
              >
                <Text className="text-zinc-500 font-myMedium">Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
