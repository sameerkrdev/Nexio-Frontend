import React, { useRef } from "react";
import { View, Text, Animated, PanResponder, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BUTTON_WIDTH = SCREEN_WIDTH - 48; // 24px padding on each side
const SLIDER_SIZE = 60;
const SLIDE_THRESHOLD = BUTTON_WIDTH - SLIDER_SIZE - 8; // 8px padding

interface SlideToConfirmProps {
  onConfirm: () => void;
  disabled?: boolean;
  text: string;
  amount?: string;
  isLoading?: boolean;
}

export const SlideToConfirm: React.FC<SlideToConfirmProps> = ({
  onConfirm,
  disabled = false,
  text,
  amount,
  isLoading = false,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !isLoading,
      onMoveShouldSetPanResponder: () => !disabled && !isLoading,
      onPanResponderMove: (_, gestureState) => {
        if (disabled || isLoading) return;

        const newX = Math.max(0, Math.min(gestureState.dx, SLIDE_THRESHOLD));
        translateX.setValue(newX);

        // Fade out text as slider moves
        const fadeOpacity = 1 - newX / SLIDE_THRESHOLD;
        opacity.setValue(fadeOpacity);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabled || isLoading) return;

        if (gestureState.dx >= SLIDE_THRESHOLD * 0.9) {
          // Success - slide completed
          Animated.timing(translateX, {
            toValue: SLIDE_THRESHOLD,
            duration: 100,
            useNativeDriver: true,
          }).start(() => {
            onConfirm();
          });
        } else {
          // Reset - slide not completed
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  return (
    <View
      className={`w-full h-[72px] rounded-[36px] overflow-hidden ${
        disabled || isLoading
          ? "bg-zinc-900 border border-zinc-800"
          : "bg-green-600 border border-green-500"
      }`}
    >
      {/* Background text */}
      <View className="absolute inset-0 items-center justify-center">
        <Animated.View style={{ opacity }}>
          <Text
            className={`text-lg font-myBold pl-10 ${
              disabled || isLoading ? "text-zinc-600" : "text-black"
            }`}
          >
            {text}
          </Text>
          {/* {amount && !disabled && !isLoading && (
            <Text className="text-sm font-myMedium text-zinc-500 mt-1">
              {amount}
            </Text>
          )} */}
        </Animated.View>
      </View>

      {/* Slider button */}
      {!disabled && !isLoading && (
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{ translateX }],
            width: SLIDER_SIZE,
            height: SLIDER_SIZE,
            margin: 6,
          }}
          className="bg-black rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="chevron-forward" size={28} color="white" />
        </Animated.View>
      )}
    </View>
  );
};
