import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-black py10">
      <StatusBar style="light" />

      {/* Top Left Icon */}
      <View className="px-6 pt-4">
        <Image
          source={require("../assets/icon.png")}
          className="w-16 h-16"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 items-center justify-center">
        {/* Main Hero Image with fading effect */}
        <View className="w-full h-[75%] relative items-center justify-center overflow-hidden border border-transparent">
          <Image
            source={require("../assets/get-started.png")}
            className="w-full h-full scale-[1.4] translate-y-[18%]"
            resizeMode="contain"
          />
          {/* Fading effect at the bottom of the image - positioned to fade the bottom 30% */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)", "#000000"]}
            className="absolute bottom-0 left-0 right-0 h-20"
          />
        </View>

        {/* Textual Data */}
        <View className="px-8 items-center">
          {/* <Text className="text-white text-4xl font-bold text-center leading-tight">
            Finance Made{"\n"}Fast & Simple
          </Text> */}
          <Text className="text-gray-300 font-myMedium text-center mt-4 text-lg leading-6 px-4">
            NexaPay is your all-in-one money app to send, manage and move money
            globally with ease.
          </Text>
        </View>

        {/* Pagination Dots */}
        <View className="flex-row mt-7 gap-3">
          <View className="w-2.5 h-2.5 rounded-full bg-white" />
          <View className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <View className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
        </View>
      </View>

      {/* Get Started Button */}
      <View className="px-6 pb-12">
        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-white w-full py-5 rounded-2xl items-center shadow-lg shadow-white/10"
          onPress={() => router.push("/authentication")}
        >
          <Text className="text-black text-xl font-mySemiBold">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
