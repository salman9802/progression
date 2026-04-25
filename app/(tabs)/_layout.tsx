import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";
import tailwindColors from "tailwindcss/colors";

import colors from "@/colors";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import { useTheme } from "@/providers/ThemeProvider";
import { AntDesign } from "@expo/vector-icons";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { resolvedTheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor:
            resolvedTheme === "dark"
              ? tailwindColors.neutral[950]
              : tailwindColors.neutral[50],
        },

        tabBarActiveTintColor: colors.primary[500],
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),

        headerStyle: {
          backgroundColor:
            resolvedTheme === "dark"
              ? tailwindColors.neutral[950]
              : tailwindColors.neutral[50],
        },
        headerTintColor:
          resolvedTheme === "dark"
            ? tailwindColors.neutral[300]
            : tailwindColors.neutral[800],

        // ensure responsive layout of input on keyboard
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Projects",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="tasks" size={24} color={color} />
          ),
          // headerRight: () => (
          //   <Link href="/modal" asChild>
          //     <Pressable>
          //       {({ pressed }) => (
          //         <FontAwesome
          //           name="info-circle"
          //           size={25}
          //           color={Colors[colorScheme ?? "light"].text}
          //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          //         />
          //       )}
          //     </Pressable>
          //   </Link>
          // ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color }) => (
            <AntDesign name="info-circle" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
