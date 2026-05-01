import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import tailwindColors from "tailwindcss/colors";

import colors from "@/colors";
import HeaderRight from "@/components/header/HeaderRight";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Logger from "@/lib/logger";
import { useTheme } from "@/providers/ThemeProvider";
import { AntDesign } from "@expo/vector-icons";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function TabLayout() {
  const logger = useMemo(() => new Logger("TabLayout"), []);

  const colorScheme = useColorScheme();
  const { resolvedTheme } = useTheme();

  // const { activeTask, startTimer, stopTimer } = useTimer();

  return (
    // <GestureHandlerRootView style={{ flex: 1 }}>
    // <BottomSheetModalProvider>
    <Tabs
      screenOptions={{
        // headerRight: () => {
        //   const { activeTask, startTimer, stopTimer } = useTimer();

        //   // ${activeTask && "animate-spin"}
        //   logger.log({
        //     activeTask,
        //   });

        //   return (
        //     <Pressable
        //       disabled={activeTask == null}
        //       className={`mr-4 p-3 bg-primary-500 rounded-full flex items-center justify-center disabled:opacity-50 ${activeTask && "animate-spin"}`}
        //       onPress={() => stopTimer()}
        //     >
        //       {activeTask ? (
        //         <Feather name="pause" size={18} color="white" />
        //       ) : (
        //         <Feather name="play" size={18} color="white" />
        //       )}
        //     </Pressable>
        //   );
        // },
        // headerRight: () => <HeaderTimerButton />,
        headerRight: () => <HeaderRight />,

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
    // {/* </BottomSheetModalProvider> */}
    // </GestureHandlerRootView>
  );
}
