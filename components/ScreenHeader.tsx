import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "tailwindcss/colors";

type ScreenHeaderProps = {
  title: string;
};

const ScreenHeader = ({ title }: ScreenHeaderProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <View className="mt-8 bg-neutral-50 dark:bg-neutral-800 px-6 py-3 flex-row gap-6 items-center justify-start">
      <Ionicons
        onPress={() => {
          router.back();
        }}
        name="arrow-back"
        size={24}
        color={
          resolvedTheme === "light" ? colors.neutral[800] : colors.neutral[50]
        }
      />
      <Text className="text-xl text-neutral-800 dark:text-neutral-50">
        {title}
      </Text>
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({});
