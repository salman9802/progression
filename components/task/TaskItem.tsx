import React from "react";
import { Text, View } from "react-native";

// import CheckBox from "@react-native-community/checkbox";
import { TTask } from "@/db/schema";
import { useMarkTaskCompleted } from "@/hooks/tasks";
import Logger from "@/lib/logger";
import Checkbox from "expo-checkbox";
import Toast from "react-native-toast-message";

type TaskItemProps = {
  task: TTask;
};

const TaskItem = ({ task }: TaskItemProps) => {
  const logger = React.useMemo(() => new Logger("TaskItem"), []);

  // const [completed, setCompleted] = React.useState(task.completed);

  const markTaskCompletedMutation = useMarkTaskCompleted();

  return (
    <View className="flex-row items-start min-h-[80]">
      {/* Left Side (line + circle) */}
      <View className="relative w-[40] items-center mt-[4]">
        {/* Top Line */}
        <View className="absolute z-0 top-0 w-[2] h-full bg-neutral-200 dark:bg-neutral-600" />

        {/* Circle */}
        {/* <View className="size-[16] rounded-md bg-primary-500" /> */}
        <View className="absolute size-5 bg-white dark:bg-neutral-900 p-[2] rounded-full z-10" />

        <Checkbox
          className="size-5 rounded-full"
          style={{
            width: 18,
            height: 18,
            borderRadius: 9999,
            backgroundColor: "#fff",
            position: "relative",
            zIndex: 10,
            // padding: 8,
          }}
          color={"#3b82f6"}
          value={task.completed === 1}
          // onValueChange={(value) => {
          //   setCompleted(value ? 1 : 0);
          // }}
          onValueChange={(value) => {
            markTaskCompletedMutation.mutate(
              {
                id: task.id,
                completed: value ? 1 : 0,
              },
              {
                onSuccess: () => {
                  Toast.show({
                    type: "success",
                    text1: "Task updated",
                  });
                },
                onError: (error) => {
                  Toast.show({
                    type: "error",
                    text1: "Failed to update task",
                    text2: JSON.stringify(error.stack),
                  });
                  logger.log({
                    name: error.name,
                    message: error.message,
                    cause: error.cause,
                    stack: error.stack,
                  });
                },
              },
            );
          }}
        />
      </View>

      {/* Right Side */}
      <View className="flex-1 pb-[20]">
        <Text
          className={`text-neutral-700 dark:text-neutral-200 ${task.completed === 1 && "line-through"}`}
        >
          {task.name}
        </Text>
      </View>
    </View>
  );
};

export default TaskItem;
