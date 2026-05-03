import Screen from "@/components/common/Screen";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const TaskScreen = () => {
  const { id: taskId } = useLocalSearchParams();

  return (
    <Screen>
      <View className="flex-1 items-center justify-center py-6 px-3 w-full bg-neutral-100 dark:bg-neutral-900">
        <Text>TaskScreen</Text>
        <Text>Task id: {taskId}</Text>
      </View>
    </Screen>
  );
};

export default TaskScreen;
