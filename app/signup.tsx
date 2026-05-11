import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SignupCard } from "../components/SignupCard";

export default function Signup() {
  return (
    <View className="flex-1 bg-black py-7">
      <StatusBar style="light" />

      <Image
        source={require("../assets/bg3.png")}
        className="absolute w-full h-full opacity-40 scale-[1]"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1 px-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-row justify-between items-start mt-6">
            <View className="flex-1">
              <Text className="text-white text-5xl font-myBold leading-[50px]">
                Create{"\n"}Account
              </Text>
              <Text className="text-zinc-400 text-base font-myMedium mt-4 max-w-[220px] leading-6">
                Join NexaPay and start your journey to financial freedom.
              </Text>
            </View>

            {/* <View className="items-end">
              <Image
                source={require("../assets/icon.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View> */}
          </View>

          <View className="mt-8">
            <SignupCard
              onSignup={(name, username, password) =>
                router.push({
                  pathname: "/otp",
                  params: { name, username, password },
                })
              }
            />
          </View>

          <View className="mb-10 mt-6">
            {/* OR Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-zinc-600" />
              <Text className="text-zinc-400 px-4 text-xs font-bold uppercase">
                OR
              </Text>
              <View className="flex-1 h-[1px] bg-zinc-600" />
            </View>

            <TouchableOpacity
              className="w-full flex-row bg-black/90 items-center justify-center border border-zinc-700 py-5 rounded-2xl"
              onPress={() => router.back()}
            >
              <Text className="text-white text-lg font-mySemiBold">
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
