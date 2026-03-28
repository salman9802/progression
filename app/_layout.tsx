import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

// import { useColorScheme } from "@/components/useColorScheme";
import { getDb, initDb } from "@/db";
import { ThemeProvider } from "@/providers/ThemeProvider";
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

function RootLayoutNav() {
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
      </Stack>
    </ThemeProvider>
  );
}
