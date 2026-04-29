import React from "react";
import { Pressable, Text, View } from "react-native";

// import CheckBox from "@react-native-community/checkbox";
import { useTimer } from "@/contexts/timer";
import { TTaskDetails } from "@/db/schema";
import { useMarkTaskCompleted } from "@/hooks/tasks";
import Logger from "@/lib/logger";
import { useTheme } from "@/providers/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import Toast from "react-native-toast-message";

type TaskItemProps = {
  task: TTaskDetails;
  onEdit: () => any;
};

const TaskListItem = ({ task, onEdit }: TaskItemProps) => {
  const logger = React.useMemo(() => new Logger("TaskItem"), []);

  const { resolvedTheme } = useTheme();
  const { activeTask, startTimer, stopTimer } = useTimer();

  // const [completed, setCompleted] = React.useState(task.completed);
  // const [isQuickEditOpen, setIsQuickEditOpen] = React.useState(false);

  const markTaskCompletedMutation = useMarkTaskCompleted();

  return (
    <View className="flex-row items-start min-h-[50]">
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
      <View className="flex-1 flex-row items-start justify-between pb-[20] px-4">
        <View className="pe-2">
          {activeTask && activeTask.id === task.id ? (
            <Pressable
              onPress={() => {
                stopTimer();
              }}
            >
              <Feather
                name="pause"
                size={18}
                color={resolvedTheme === "light" ? "#262626" : "#f5f5f5"}
              />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                startTimer(task);
              }}
            >
              <Feather
                name="play"
                size={18}
                color={resolvedTheme === "light" ? "#262626" : "#f5f5f5"}
              />
            </Pressable>
          )}
        </View>

        <Text
          className={`flex-1 text-neutral-700 dark:text-neutral-200 ${task.completed === 1 && "line-through"}`}
        >
          {task.name}
        </Text>

        <Pressable onPress={() => onEdit()}>
          <Text
            className={`font-mono text-sm text-neutral-600 dark:text-neutral-400 ${task.completed === 1 && "line-through"}`}
          >
            {task.elapsed_minutes}m
            <Text className="text-xs">({task.elapsed_seconds}s)</Text>
            {" / "}
            {task.estimated_minutes}m
            <Text className="text-xs">({task.estimated_seconds}s)</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TaskListItem;
