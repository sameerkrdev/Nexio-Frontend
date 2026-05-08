import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useWallet } from "../store/walletStore";
import { userService } from "../services/user.service";
import { NoWalletSection } from "../components/home/NoWalletSection";

interface SearchUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

// Generate consistent color based on username using hash
const getAvatarColorFromName = (name: string) => {
  const colors = [
    "#3F3F46", // cool gray
    "#52525B", // zinc gray
    "#374151", // slate gray
    "#1F2937", // dark slate
    "#334155", // blue gray
    "#27272A", // neutral dark
    "#404040", // charcoal
    "#3B3B3F", // steel gray
    "#2D3748", // dark blue gray
    "#2C2C2E", // graphite
    "#3A3A3C", // medium gray
    "#2E2E30", // dark neutral
  ];

  // Simple hash function to convert name to a number
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get consistent index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Get initial from username
const getInitial = (username: string) => {
  return username.charAt(0).toUpperCase();
};

// Default avatars to use if user doesn't have one
const DEFAULT_AVATARS = [
  "https://robohash.org/alex_m?set=set4&size=200x200",
  "https://robohash.org/priya23?set=set4&size=200x200",
  "https://robohash.org/sarah_t?set=set4&size=200x200",
  "https://robohash.org/mike_r?set=set4&size=200x200",
  "https://robohash.org/david_k?set=set4&size=200x200",
  "https://robohash.org/emma_l?set=set4&size=200x200",
];

// Mock data for initial view or results
const MOCK_RESULTS: SearchUser[] = [
  {
    id: "1",
    name: "Alex M.",
    username: "alex_m",
    avatar: "https://robohash.org/alex_m?set=set4&size=200x200",
  },
  {
    id: "2",
    name: "Priya S.",
    username: "priya23",
    avatar: "https://robohash.org/priya23?set=set4&size=200x200",
  },
  {
    id: "3",
    name: "Sarah T.",
    username: "sarah_t",
    avatar: "https://robohash.org/sarah_t?set=set4&size=200x200",
  },
  {
    id: "4",
    name: "Mike R.",
    username: "mike_r",
    avatar: "https://robohash.org/mike_r?set=set4&size=200x200",
  },
  {
    id: "5",
    name: "David K.",
    username: "david_k",
    avatar: "https://robohash.org/david_k?set=set4&size=200x200",
  },
  {
    id: "6",
    name: "Emma L.",
    username: "emma_l",
    avatar: "https://robohash.org/emma_l?set=set4&size=200x200",
  },
  {
    id: "7",
    name: "James W.",
    username: "james_w",
    avatar: "https://robohash.org/james_w?set=set4&size=200x200",
  },
  {
    id: "8",
    name: "Lisa M.",
    username: "lisa_m",
    avatar: "https://robohash.org/lisa_m?set=set4&size=200x200",
  },
  {
    id: "9",
    name: "Ryan P.",
    username: "ryan_p",
    avatar: "https://robohash.org/ryan_p?set=set4&size=200x200",
  },
  {
    id: "10",
    name: "Nina C.",
    username: "nina_c",
    avatar: "https://robohash.org/nina_c?set=set4&size=200x200",
  },
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
    <View className="flex-1 bg-black">
      <ImageBackground
        source={require("../assets/bg3.png")}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: 0.2 }}
      >
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
            <Text className="text-white text-xl font-myBold ml-6">
              Find User
            </Text>
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
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row items-center bg-zinc-900/90 p-4 rounded-3xl border border-zinc-800 mb-4"
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
                    <View className="w-14 h-14 rounded-full items-center justify-center mr-4 overflow-hidden bg-zinc-900 border border-zinc-800">
                      <Image
                        source={{ uri: item.avatar }}
                        className="w-full h-full"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-myBold text-lg">
                        {item.name}
                      </Text>
                      <Text className="text-zinc-500 text-sm font-myMedium">
                        @{item.username}
                      </Text>
                    </View>
                    <View className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center">
                      <Ionicons name="send-outline" size={18} color="white" />
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                !isLoading && search.length > 0 ? (
                  <View className="items-center mt-20">
                    <View className="w-20 h-20 bg-zinc-900 rounded-full items-center justify-center mb-4">
                      <Ionicons
                        name="person-remove"
                        size={32}
                        color="#3F3F46"
                      />
                    </View>
                    <Text className="text-white text-lg font-myBold">
                      No User Found
                    </Text>
                    <Text className="text-zinc-500 text-center mt-2 font-myMedium">
                      We couldn't find anyone with the username "{search}"
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>

          {isWalletModalVisible && (
            <View className="absolute inset-0 bg-black/80 items-center justify-center px-8 z-[100]">
              <View className="w-full">
                <NoWalletSection
                  className="py-8"
                  onConnectPress={() => {
                    setIsWalletModalVisible(false);
                    router.push("/profile");
                  }}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsWalletModalVisible(false)}
                  className="mt-4 py-2 self-center"
                >
                  <Text className="text-zinc-300 font-myMedium">
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
