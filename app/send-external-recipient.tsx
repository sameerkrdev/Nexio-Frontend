import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import {
  PAYMENT_RAILS,
  SUPPORTED_COUNTRY_LIST,
  getRail,
  buildE164,
  type SupportedCountryCode,
  type MethodSpec,
  type MethodFieldSpec,
} from "../config/paymentRails";

const FLAG: Record<SupportedCountryCode, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  EU: "🇪🇺",
  JP: "🇯🇵",
  SG: "🇸🇬",
  AU: "🇦🇺",
  CA: "🇨🇦",
};

const transformValue = (value: string, transform?: "upper" | "lower") => {
  if (transform === "upper") return value.toUpperCase();
  if (transform === "lower") return value.toLowerCase();
  return value;
};

export default function SendExternalRecipientScreen() {
  const router = useRouter();

  const [countryCode, setCountryCode] = useState<SupportedCountryCode>("IN");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [method, setMethod] = useState<MethodSpec>(() => PAYMENT_RAILS.IN.methods[0]);
  const [fields, setFields] = useState<Record<string, string>>({});

  const rail = useMemo(() => getRail(countryCode), [countryCode]);

  const handleCountrySelect = (code: SupportedCountryCode) => {
    setCountryCode(code);
    const nextRail = getRail(code);
    setMethod(nextRail.methods[0]);
    setFields({});
    setShowCountryPicker(false);
  };

  const handleMethodSelect = (m: MethodSpec) => {
    setMethod(m);
    setFields({});
  };

  const handleFieldChange = (field: MethodFieldSpec, raw: string) => {
    setFields((prev) => ({
      ...prev,
      [field.key]: transformValue(raw, field.transform),
    }));
  };

  const phoneDigits = phoneLocal.replace(/\D/g, "");
  const phoneValid = rail.localNumberLengths.includes(phoneDigits.length);

  const filledFieldsValid = method.fields.every((f) => {
    const v = (fields[f.key] ?? "").trim();
    if (!v) return false;
    if (f.pattern && !f.pattern.regex.test(v)) return false;
    return true;
  });

  const canProceed = phoneValid && filledFieldsValid;

  const handleNext = () => {
    if (!phoneValid) {
      Alert.alert(
        "Invalid Phone Number",
        `Enter a valid ${rail.country} mobile number.`
      );
      return;
    }

    for (const f of method.fields) {
      const v = (fields[f.key] ?? "").trim();
      if (!v) {
        Alert.alert("Missing field", `Please fill ${f.label}.`);
        return;
      }
      if (f.pattern && !f.pattern.regex.test(v)) {
        Alert.alert(`Invalid ${f.label}`, f.pattern.message);
        return;
      }
    }

    const e164 = buildE164(rail, phoneDigits);
    const trimmedFields: Record<string, string> = {};
    method.fields.forEach((f) => {
      trimmedFields[f.key] = (fields[f.key] ?? "").trim();
    });

    router.push({
      pathname: "/send-external",
      params: {
        receiverPhone: e164,
        receiverDisplayPhone: `${rail.dialCode} ${phoneDigits}`,
        countryCode: rail.code,
        receiverCurrency: rail.currency,
        receiverCurrencySymbol: rail.currencySymbol,
        method: method.method,
        methodLabel: method.label,
        methodEta: method.eta,
        paymentDetails: JSON.stringify(trimmedFields),
      },
    });
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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-12 h-12 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-myBold ml-5">
                Send to Bank
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Country selector */}
              <Animated.View entering={FadeInDown.springify()}>
                <Text className="text-zinc-500 font-myBold text-xs uppercase tracking-[0.2em] mb-3">
                  Recipient Country
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCountryPicker(true)}
                  activeOpacity={0.7}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-4 flex-row items-center"
                >
                  <Text className="text-3xl mr-3">{FLAG[rail.code]}</Text>
                  <View className="flex-1">
                    <Text className="text-white font-myBold text-base">
                      {rail.country}
                    </Text>
                    <Text className="text-zinc-500 font-myMedium text-xs mt-0.5">
                      Pays in {rail.currency} • {rail.dialCode}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#71717A" />
                </TouchableOpacity>
              </Animated.View>

              {/* Phone input */}
              <Animated.View
                entering={FadeInDown.delay(80).springify()}
                className="mt-6"
              >
                <Text className="text-zinc-500 font-myBold text-xs uppercase tracking-[0.2em] mb-3">
                  Recipient Phone
                </Text>
                <View className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-4 flex-row items-center">
                  <Text className="text-white font-myBold text-base mr-3">
                    {rail.dialCode}
                  </Text>
                  <View className="w-px h-6 bg-zinc-800 mr-3" />
                  <TextInput
                    value={phoneLocal}
                    onChangeText={setPhoneLocal}
                    placeholder={rail.example}
                    placeholderTextColor="#3F3F46"
                    keyboardType="phone-pad"
                    className="flex-1 text-white font-myMedium text-base"
                  />
                  {phoneValid && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                  )}
                </View>
                <Text className="text-zinc-600 font-myMedium text-xs mt-2">
                  Used to identify the recipient region. The recipient will be
                  notified via SMS.
                </Text>
              </Animated.View>

              {/* Method selector */}
              <Animated.View
                entering={FadeInDown.delay(160).springify()}
                className="mt-6"
              >
                <Text className="text-zinc-500 font-myBold text-xs uppercase tracking-[0.2em] mb-3">
                  Payment Method
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {rail.methods.map((m) => {
                    const active = m.method === method.method;
                    return (
                      <TouchableOpacity
                        key={m.method}
                        onPress={() => handleMethodSelect(m)}
                        activeOpacity={0.7}
                        className={
                          "px-4 py-2.5 rounded-full border " +
                          (active
                            ? "bg-white border-white"
                            : "bg-zinc-900/60 border-zinc-800")
                        }
                      >
                        <Text
                          className={
                            "font-myBold text-sm " +
                            (active ? "text-black" : "text-white")
                          }
                        >
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text className="text-zinc-600 font-myMedium text-xs mt-2">
                  {method.eta}
                </Text>
              </Animated.View>

              {/* Method-specific fields */}
              <Animated.View
                entering={FadeInUp.delay(220).springify()}
                key={method.method}
                className="mt-6"
              >
                <Text className="text-zinc-500 font-myBold text-xs uppercase tracking-[0.2em] mb-3">
                  Recipient Details
                </Text>
                <View className="gap-y-3">
                  {method.fields.map((field) => (
                    <View key={field.key}>
                      <Text className="text-zinc-400 font-myMedium text-sm mb-2">
                        {field.label}
                      </Text>
                      <View className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-4 py-3.5">
                        <TextInput
                          value={fields[field.key] ?? ""}
                          onChangeText={(v) => handleFieldChange(field, v)}
                          placeholder={field.placeholder}
                          placeholderTextColor="#3F3F46"
                          className="text-white font-myMedium text-base"
                          keyboardType={field.keyboardType ?? "default"}
                          autoCapitalize={field.autoCapitalize ?? "none"}
                          maxLength={field.maxLength}
                        />
                      </View>
                      {field.helper ? (
                        <Text className="text-zinc-600 font-myRegular text-xs mt-1.5">
                          {field.helper}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </Animated.View>

              {/* Info card */}
              <Animated.View
                entering={FadeInUp.delay(300).springify()}
                className="mt-6 flex-row items-start bg-zinc-900/40 border border-zinc-800/60 rounded-2xl px-4 py-3"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#71717A"
                  style={{ marginTop: 1 }}
                />
                <Text className="text-zinc-600 text-xs font-myMedium ml-2 flex-1 leading-5">
                  Mock provider. Bank details are encrypted and only used to
                  simulate a payout in this demo.
                </Text>
              </Animated.View>
            </ScrollView>

            {/* Continue button */}
            <View className="px-6 pb-6">
              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.85}
                disabled={!canProceed}
                className={
                  "w-full py-4 rounded-2xl flex-row items-center justify-center " +
                  (canProceed
                    ? "bg-white"
                    : "bg-zinc-900 border border-zinc-800")
                }
              >
                <Text
                  className={
                    "text-lg font-myBold " +
                    (canProceed ? "text-black" : "text-zinc-600")
                  }
                >
                  Continue
                </Text>
                {canProceed && (
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="black"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

      {/* Country picker modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <Animated.View
            entering={FadeInUp.springify()}
            className="bg-zinc-900 border-t border-zinc-800 rounded-t-[32px] pt-6 pb-10 px-6"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-xl font-myBold">
                Select Country
              </Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {SUPPORTED_COUNTRY_LIST.map((code) => {
                const r = PAYMENT_RAILS[code];
                const active = code === countryCode;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => handleCountrySelect(code)}
                    activeOpacity={0.7}
                    className={
                      "flex-row items-center py-3.5 px-4 rounded-2xl mb-1 " +
                      (active ? "bg-zinc-800" : "")
                    }
                  >
                    <Text className="text-3xl mr-4">{FLAG[code]}</Text>
                    <View className="flex-1">
                      <Text className="text-white font-myBold text-base">
                        {r.country}
                      </Text>
                      <Text className="text-zinc-500 font-myMedium text-xs mt-0.5">
                        {r.currency} • {r.dialCode}
                      </Text>
                    </View>
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#A3E635"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
