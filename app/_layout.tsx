import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

// import { useColorScheme } from "@/components/useColorScheme";
import ScreenHeader from "@/components/ScreenHeader";
import { toastConfig } from "@/config/toast";
import { TimerProvider } from "@/contexts/timer";
import { getDb, initDb } from "@/db";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
// import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import HeaderRight from "@/components/header/HeaderRight";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [isDbReady, setIsDbReady] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // initialize sqlite
  useEffect(() => {
    initDb()
      .then(() => setIsDbReady(true))
      .catch((e) => {
        console.error("DB initialization failed");
        console.error(e);
      });

    const db = getDb();
    const userVersion = db.getFirstSync<{ user_version: number }>(
      "PRAGMA user_version;",
    );
    console.log("DB version: ", userVersion);
  }, []);

  if (!isDbReady) return <Text>Initializing DB</Text>;

  if (!loaded) {
    return null;
  }

  {
    /* // <BottomSheetModalProvider> */
  }
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <TimerProvider>
            <RootLayoutNav />
          </TimerProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
  {
    /* </bottomsheetmodalprovider> */
  }
  {
    /* </GestureHandlerRootView> */
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30, // data is "fresh" for 30s, won't refetch unnecessarily
    },
  },
  queryCache: new QueryCache({
    // Default global error logging
    onError: (error) => {
      console.error("-------------------------");
      console.error("Default query error handler");
      console.error("Error:", error.message);
      console.error(error.stack);
      console.error("-------------------------");
    },
  }),
  mutationCache: new MutationCache({
    // Default global error logging
    onError: (error) => {
      console.error("-------------------------");
      console.error("Default mutation error handler");
      console.error("Error:", error.message);
      console.error(error.stack);
      console.error("-------------------------");
    },
  }),
});

function RootLayoutNav() {
  const { resolvedTheme } = useTheme();

  return (
    <ThemeProvider /* value={colorScheme === "dark" ? DarkTheme : DefaultTheme} */
    >
      <Stack
      /*  screenOptions={{
          headerStyle: {
            backgroundColor:
              resolvedTheme === "dark"
                ? colors.neutral[950]
                : colors.neutral[50],
          },
          headerTintColor:
            resolvedTheme === "dark"
              ? colors.neutral[300]
              : colors.neutral[800],
        }} */
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="add-project"
          options={{
            title: "Add Project",
            // headerTitleStyle: {
            //   fontSize: 22,
            // },
            // header: () => (
            //   <View
            //     style={{
            //       paddingTop: 50,
            //       height: 120,
            //       justifyContent: "center",
            //     }}
            //   >
            //     <Text style={{ fontSize: 22 }}>Add Project</Text>
            //   </View>
            // ),
            // header: () => (
            //   <View className="mt-8 bg-neutral-100 dark:bg-neutral-800 px-6 py-3 flex-row gap-6 items-center justify-start">
            //     <Ionicons
            //       name="arrow-back"
            //       size={24}
            //       color={
            //         resolvedTheme === "light"
            //           ? colors.neutral[800]
            //           : colors.neutral[50]
            //       }
            //     />
            //     <Text className="text-xl text-neutral-800 dark:text-neutral-50">
            //       Add Project
            //     </Text>
            //   </View>
            // ),
            header: () => <ScreenHeader title="Add Project" />,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="add-task"
          options={{
            title: "Add Task",
            header: () => <ScreenHeader title="Add Task" />,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="task/[id]"
          options={{
            title: "Task",

            headerRight: () => <HeaderRight />,
          }}
        />
      </Stack>
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}
