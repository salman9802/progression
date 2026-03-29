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
import { getDb, initDb } from "@/db";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Text } from "react-native";
import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
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
      "PRAGMA user_version;"
    );
    console.log("DB version: ", userVersion);
  }, []);

  if (!isDbReady) return <Text>Initializing DB</Text>;

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30, // data is "fresh" for 30s, won't refetch unnecessarily
    },
  },
});

function RootLayoutNav() {
  const { resolvedTheme } = useTheme();

  return (
    <ThemeProvider /* value={colorScheme === "dark" ? DarkTheme : DefaultTheme} */
    >
      <QueryClientProvider client={queryClient}>
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
        </Stack>
        <Toast config={toastConfig} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
