import * as Application from "expo-application";
import { StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  return (
    <View className="flex-1 items-center justify-center py-6 px-3">
      <Text className="text-4xl font-bold text-neutral-800 mb-4">
        About Screen
      </Text>
      <View className="text-neutral-800 flex-1 flex flex-col gap-2 self-start">
        <Text>
          Developed by Salman (<Text className="italic">prototype</Text>)
        </Text>
        <Text>
          <Text className="font-bold text-primary-500">Version & Build:</Text>{" "}
          {Application.nativeApplicationVersion} (
          {Application.nativeBuildVersion})
        </Text>
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
