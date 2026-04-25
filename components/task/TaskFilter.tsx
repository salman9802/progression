import React from "react";
import { Text, View } from "react-native";

export type TaskTab = "pending" | "completed";
type TaskFilterProps = {
  onChange: (filter: TaskTab) => any;
};

const TaskFilter = ({ onChange }: TaskFilterProps) => {
  const [tab, setTab] = React.useState<TaskTab>("pending");

  //   Effect to sync parent
  React.useEffect(() => {
    onChange(tab);
  }, [tab]);

  return (
    <View className="flex-row gap-4">
      <Text
        onPress={() => setTab("pending")}
        className={`text-neutral-800 dark:text-neutral-300 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-700 ${tab === "pending" && "font-semibold bg-primary-500/30 dark:bg-primary-500/30  text-primary-500 dark:text-primary-500"}`}
      >
        Pending
      </Text>
      <Text
        onPress={() => setTab("completed")}
        className={`px-3 py-1.5 rounded-md  ${tab === "completed" ? "font-semibold bg-green-500/30 dark:bg-green-500/30 text-green-500 dark:text-green-500" : "text-neutral-800 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700"}`}
      >
        Completed
      </Text>
    </View>
  );
};

export default TaskFilter;
