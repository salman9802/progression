import { useTheme } from "@/providers/ThemeProvider";
import * as Application from "expo-application";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  const { theme, updatePreference } = useTheme();

  return (
    <View className="flex-1 items-center justify-center py-6 px-3 w-full bg-neutral-100 dark:bg-neutral-900">
      {/* <Text className="text-4xl font-bold text-neutral-800 dark:text-neutral-300 mb-4"> About Screen
      </Text> */}
      <Image
        source={require("@/assets/images/icon.png")}
        // style={{
        //   width: 96,
        //   height: 96,
        //   borderRadius: 20,
        // }}
        className="rounded-lg mx-auto size-52 mb-8"
      />
      <View className=" flex-1 flex flex-col gap-2 self-start w-full">
        {/* <Text className="text-neutral-800 dark:text-neutral-300">
          <Text className="font-bold text-primary-500">Developed by:</Text>{" "}
          Salman
        </Text>
        <Text className="text-neutral-800 dark:text-neutral-300">
          <Text className="font-bold text-primary-500">Version & Build:</Text>{" "}
          {Application.nativeApplicationVersion} (
          {Application.nativeBuildVersion}) (
          <Text className="italic">prototype</Text>)
        </Text> */}

        {/* App Details */}
        <View className="flex-row items-center justify-center gap-2">
          <Text className="font-bold text-neutral-700 dark:text-neutral-300">
            Salman
          </Text>
          <Text className="font-extrabold text-primary-500">|</Text>
          <Text>
            <Text className="font-bold text-neutral-700 dark:text-neutral-300">
              {Application.nativeApplicationVersion}
            </Text>{" "}
            <Text className="italic text-neutral-600 dark:text-neutral-400">
              ({Application.nativeBuildVersion})
            </Text>
          </Text>
        </View>

        {/* Settings */}
        <View className="flex flex-col gap-6 mt-4 p-3 rounded-md bg-neutral-50 dark:bg-neutral-800 w-full">
          <Text className="text-2xl font-semibold text-neutral-800 dark:text-neutral-300">
            Settings
          </Text>
          {/* Theme */}
          {/* <Text className="text-neutral-800 dark:text-neutral-300">
            Current Theme: {theme}
          </Text> */}
          <View className="flex flex-col w-full gap-3">
            <Text className="text-xl font-medium text-neutral-700 dark:text-neutral-300">
              Theme
            </Text>
            <View className="flex flex-row gap-1.5">
              <Pressable
                className={`bg-neutral-100 dark:bg-neutral-700 rounded-md flex-1 p-4 ${theme === "light" && "border-2 border-primary-500 font-semibold"}`}
                onPress={() => updatePreference("light")}
              >
                <Text
                  className={`${theme === "light" ? "text-primary-500 dark:text-primary-500" : "text-neutral-700 dark:text-neutral-300"}`}
                >
                  Light
                </Text>
              </Pressable>
              <Pressable
                className={`bg-neutral-100 dark:bg-neutral-700 rounded-md flex-1 p-4 ${theme === "dark" && "border-2 border-primary-500 font-semibold"}`}
                onPress={() => updatePreference("dark")}
              >
                <Text
                  className={`${theme === "dark" ? "text-primary-500 dark:text-primary-500" : "text-neutral-700 dark:text-neutral-300"}`}
                >
                  Dark
                </Text>
              </Pressable>
              <Pressable
                className={`bg-neutral-100 dark:bg-neutral-700 rounded-md flex-1 p-4 ${theme === "system" && "border-2 border-primary-500 font-semibold"}`}
                onPress={() => updatePreference("system")}
              >
                <Text
                  className={`${theme === "system" ? "text-primary-500 dark:text-primary-500" : "text-neutral-700 dark:text-neutral-300"}`}
                >
                  System
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* <Text>{Uniwind.currentTheme}</Text> */}
      {/* <View className="p-4">
          <Text className="text-lg font-bold">Current theme: {theme}</Text>
          <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {hasAdaptiveThemes ? "Following system theme" : "Fixed theme"}
          </Text>
        </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
