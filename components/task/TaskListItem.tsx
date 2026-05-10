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
import { router } from "expo-router";
import Toast from "react-native-toast-message";

type TaskItemProps = {
  task: TTaskDetails;
  onQuickEdit: () => any;
  onEdit: () => any;

  isLast?: boolean;
};

const TaskListItem = ({
  task,
  onQuickEdit,
  onEdit,
  isLast = false,
}: TaskItemProps) => {
  const logger = React.useMemo(() => new Logger("TaskListItem"), []);

  const { resolvedTheme } = useTheme();
  const { activeTask, startTimer, stopTimer } = useTimer();

  // ------------------------- Elapsed Time (calculation) -------------------------
  // const [now, setNow] = React.useState(() => Date.now());
  // let elapsedSeconds = startTime ? Math.floor((now - startTime) / 1000) : 0;
  // elapsedSeconds = elapsedSeconds < 0 ? 0 : elapsedSeconds;

  const [isEditing, setIsEditing] = React.useState(false);

  // const panResponderRef = React.useRef(
  //   PanResponder.create({
  //     onMoveShouldSetPanResponder: (_, gestureState) => {
  //       return Math.abs(gestureState.dy) > 5;
  //     },
  //     onPanResponderMove: (_, gestureState) => {
  //       if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
  //     },
  //     onPanResponderRelease: (_, gestureState) => {
  //       if (gestureState.dy > 120) {
  //         // close sheet
  //         Animated.timing(translateY, {
  //           toValue: screenHeight,
  //           duration: 200,
  //           useNativeDriver: true,
  //         });
  //       } else {
  //         // snap back
  //         Animated.spring(translateY, {
  //           toValue: 0,
  //           useNativeDriver: true,
  //         });
  //       }
  //     },
  //   }),
  // ).current;

  // const [completed, setCompleted] = React.useState(task.completed);
  // const [isQuickEditOpen, setIsQuickEditOpen] = React.useState(false);

  const markTaskCompletedMutation = useMarkTaskCompleted();

  // logger.log({ task });
  // logger.log({
  //   height: Math.floor((task.elapsed_seconds / task.estimated_seconds) * 100),
  // });

  return (
    <>
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/task/[id]",
            params: {
              id: task.id,
            },
          })
        }
        onLongPress={() => {
          // setIsEditing(true);
          onEdit();
        }}
        className={`flex-row items-start ${!isLast && "min-h-[50]"}`}
      >
        {/* Left Side (line + circle) */}
        <View className="relative w-[40] items-center mt-[4]">
          {/* Top Line */}
          <View className="absolute z-0 top-0 w-[2] h-full bg-neutral-200 dark:bg-neutral-600" />

          {/* Elapsed Progress Line */}
          <View
            style={{
              height: `${Math.floor((task.elapsed_seconds / task.estimated_seconds) * 100)}%`,
            }}
            className={`absolute z-10 top-0 w-[2] bg-primary-500`}
          />

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
        <View
          className={`flex-1 flex-row items-start justify-between px-4 ${!isLast && "pb-[20]"}`}
        >
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

          {/* Task name and computation details */}
          <View className="flex-1">
            <Text
              className={`text-neutral-700 dark:text-neutral-200 ${task.completed === 1 && "line-through"}`}
            >
              {task.name}
            </Text>
            <Text className="text-xs">
              Children Estimation:{" "}
              <Text className="font-bold">
                {task.children_estimated_minutes}m
              </Text>
            </Text>
            <Text className="text-xs">
              Direct Children:{" "}
              <Text className="font-bold">
                {task.completed_direct_children_count ?? 0}/
                {task.direct_children_count}
              </Text>
            </Text>
            <Text className="text-xs">
              Total Descendants:{" "}
              <Text className="font-bold">
                {task.completed_descendant_count ?? 0}/
                {task.total_descendant_count}
              </Text>
            </Text>
          </View>

          <Pressable onPress={() => onQuickEdit()}>
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

        {/* Active Task Estimate Progress Line */}
      </Pressable>
    </>
  );
};

export default TaskListItem;
