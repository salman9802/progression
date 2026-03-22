import { StyleSheet, View } from "react-native";

export default function TasksScreen() {
  return (
    <View className="flex-1 items-center justify-start px-3 py-6 bg-neutral-100 dark:bg-neutral-900">
      <View className="h-[300] w-11/12 align-top  bg-neutral-50 dark:bg-neutral-800"></View>
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
