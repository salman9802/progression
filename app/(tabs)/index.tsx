import { useTheme } from "@/providers/ThemeProvider";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "tailwindcss/colors";

export default function ProjectsScreen() {
  const { resolvedTheme } = useTheme();

  return (
    <View className="flex-1 items-center justify-start px-4 py-8 bg-neutral-100 dark:bg-neutral-900">
      {/* Horizontal project list */}
      <FlatList
        className="mb-4 flex-grow-0 flex-shrink-0 pb-4"
        // contentContainerStyle={{ alignItems: "center" }}
        data={[
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
        ]}
        renderItem={({ item }) => (
          <View className="px-4 mx-3">
            <Text>{item}</Text>
          </View>
        )}
        horizontal={true}
      />

      {/* Project overview card */}
      <View className="h-[250] w-full align-top  bg-neutral-50 dark:bg-neutral-800"></View>

      {/* <View className="bg-red-500 h-[300] mt-4 w-11/12"></View> */}
      <FlatList
        className="w-full"
        data={[
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
        ]}
        renderItem={({ item }) => (
          <View className="px-4 my-3 flex border border-red-500">
            <Text>{item}</Text>
          </View>
        )}
      />

      {/* Add project (floating) */}
      <TouchableOpacity
        className="absolute right-5 bottom-7 p-4 bg-primary-500 rounded-full"
        onPress={() => {
          router.push("/add-project");
        }}
      >
        <Entypo
          name="add-to-list"
          size={24}
          className="text-neutral-50" /* color={theme.light} */
          color={
            resolvedTheme === "light" ? colors.neutral[900] : colors.neutral[50]
          }
        />
      </TouchableOpacity>

      {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
      {/* <EditScreenInfo path="app/(tabs)/index.tsx" /> */}
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
