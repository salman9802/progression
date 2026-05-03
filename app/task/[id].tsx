import * as Crypto from "expo-crypto";

import Screen from "@/components/common/Screen";
import CTextInput from "@/components/CTextInput";
import { QueryState } from "@/components/QueryState";
import { Skeleton } from "@/components/Skeleton";
import { QuickAddTaskRef } from "@/components/task/QuickAddTask";
import TaskEstimateOptions from "@/components/task/TaskEstimateOptions";
import TaskFilter, { TaskTab } from "@/components/task/TaskFilter";
import TaskListItem from "@/components/task/TaskListItem";
import { getDb } from "@/db";
import { TTaskDetails } from "@/db/schema";
import {
  tasksKeys,
  useTaskDetailsQuery,
  useTasksByTaskId,
  useUpdateTask,
} from "@/hooks/tasks";
import Logger from "@/lib/logger";
import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import colors from "tailwindcss/colors";

const TaskScreen = () => {
  const { resolvedTheme } = useTheme();
  const logger = useMemo(() => new Logger("TaskScreen"), []);

  const { id: taskId } = useLocalSearchParams();

  if (Array.isArray(taskId))
    return (
      <Text>Error: `taskId` is an array form url params in TaskScreen</Text>
    );

  // TODO
  const taskDetailsQuery = useTaskDetailsQuery(taskId);
  logger.log({
    taskDetailsQuery,
  });

  const queryClient = useQueryClient();
  const [taskTab, setTaskTab] = useState<TaskTab>("pending");
  // ------------------------- Quick Edit Task -------------------------
  const [quickAddText, setQuickAddText] = useState("");
  // const [quickAddOpen, setQuickAddOpen] = useState(false);
  const quickAddRef = useRef<QuickAddTaskRef>(null);
  const [quickEditingTask, setQuickEditingTask] =
    useState<Partial<TTaskDetails> | null>(null);

  const tasksQuery = useTasksByTaskId(taskId);

  const tasks = useMemo(() => {
    if (tasksQuery.data === undefined) return [];
    if (taskTab === "pending")
      return tasksQuery.data.filter((t) => !t.completed);
    else if (taskTab === "completed")
      return tasksQuery.data.filter((t) => t.completed);
    else return [];
  }, [taskTab, tasksQuery.data]);

  const quickAddTask = (task: string) => {
    const db = getDb();

    try {
      const now = Date.now();
      db.runSync(
        "INSERT INTO tasks (id, project_id, parent_id, name, description, estimated_seconds, elapsed_seconds, timer_started_at, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          Crypto.randomUUID(),
          taskDetailsQuery.data ? taskDetailsQuery.data.project_id : null,
          null,
          task,
          "",
          0,
          0,
          null,
          0,
          now,
          now,
        ],
      );
      Toast.show({
        type: "success",
        text1: "Task added",
      });
      // router.push("/");
      [(tasksKeys.taskDetails()[0], tasksKeys.byProjectId()[0])].map((key) => {
        queryClient.invalidateQueries({
          queryKey: [key],
        });
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to add task",
        text2: JSON.stringify(error),
      });
      console.error("Failed to add task");
      console.error(error);
    }
  };

  const updateTaskMutation = useUpdateTask();
  const handleTaskQuickEditEstimate = () => {
    if (quickEditingTask == null) return;

    updateTaskMutation.mutate(
      {
        id: quickEditingTask.id!,
        payload: {
          estimated_seconds: quickEditingTask.estimated_seconds,
          // estimated_minutes: editingTask.estimated_seconds
          //   ? Math.floor(editingTask.estimated_seconds / 60)
          //   : 0,
        },
      },
      {
        onSuccess: () => {
          setQuickEditingTask(null);
          Toast.show({
            type: "success",
            text1: "Estimate updated",
          });
        },
        onError: (error: any) => {
          console.error(error);
        },
      },
    );
  };

  // ------------------------- Edit Task -------------------------
  const [editingTask, setEditingTask] = useState<Partial<TTaskDetails> | null>(
    null,
  );
  const screenHeight = Dimensions.get("window").height;
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  useEffect(() => {
    if (editingTask !== null) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [editingTask]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm<TTaskDetails>({
    // defaultValues: task,
  });
  useEffect(() => {
    if (editingTask) reset(editingTask);
  }, [editingTask]);

  const editTask: SubmitHandler<TTaskDetails> = (editingTask) => {
    if (editingTask == undefined) return;

    const db = getDb();

    try {
      // remove computed values
      // delete editingTask.estimated_minutes;
      // editingTask.elapsed_minutes = undefined;
      const { estimated_minutes, elapsed_minutes, ...editingPayload } =
        editingTask;

      console.log("editingPayload", editingPayload);

      const now = Date.now();
      updateTaskMutation.mutate(
        {
          id: editingTask.id!,
          payload: {
            ...editingPayload,
            updated_at: now,

            // ...editingTask,
            // estimated_minutes: undefined,
            // elapsed_minutes: undefined,
            // estimated_seconds: editingTask.estimated_seconds,
            // estimated_minutes: editingTask.estimated_seconds
            //   ? Math.floor(editingTask.estimated_seconds / 60)
            //   : 0,
          },
        },
        {
          onSuccess: () => {
            setEditingTask(null);
            Toast.show({
              type: "success",
              text1: "Task Updated",
            });
          },
          onError: (error: any) => {
            console.error(error);
          },
        },
      );
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to edit task",
        text2: JSON.stringify(error),
      });
      console.error("Failed to edit task");
      console.error(error);
    }
  };

  // ------------------------- Estimate Progress bar -------------------------
  const hasExceededEstimate = taskDetailsQuery.data
    ? taskDetailsQuery.data.total_estimated_seconds <
      taskDetailsQuery.data.total_elapsed_seconds
    : false;
  let estimateMultiple = 1,
    i = 2;
  if (taskDetailsQuery.data) {
    while (
      taskDetailsQuery.data.total_estimated_seconds * i <
      taskDetailsQuery.data.total_elapsed_seconds
    ) {
      estimateMultiple = i;
    }
  }
  const estimateProgressPercentage =
    taskDetailsQuery.data && tasksQuery.data && tasksQuery.data.length !== 0
      ? (taskDetailsQuery.data.total_elapsed_seconds /
          taskDetailsQuery.data.total_estimated_seconds) *
        100
      : 0;
  const EstimateProgressBar = () => {
    return (
      <View
        className={`my-2 grow h-2 rounded-full overflow-hidden ${resolvedTheme === "light" ? "bg-neutral-200" : "bg-neutral-600"}`}
      >
        <View
          className={`h-full rounded-[inherit] ${hasExceededEstimate ? "bg-red-500" : estimateProgressPercentage < 75 ? "bg-green-500" : "bg-orange-500"}`}
          style={{
            width: `${estimateProgressPercentage}%`,
          }}
        />
      </View>
    );
  };

  const EstimateProgressLabel = () => {
    if (hasExceededEstimate)
      return (
        <Text className="px-4 py-2 rounded-md text-red-500 bg-red-500/10">
          Estimate Exceeded (
          {
            <Text className="font-mono text-sm">
              {Math.round(estimateProgressPercentage)}%
            </Text>
          }
          )
        </Text>
      );
    else {
      if (estimateProgressPercentage < 75) {
        return (
          <Text className="px-4 py-2 rounded-md text-green-500 bg-green-500/10">
            Within Estimate (
            {
              <Text className="font-mono text-sm">
                {Math.round(estimateProgressPercentage)}%
              </Text>
            }
            )
          </Text>
        );
      } else {
        return (
          <Text className="px-4 py-2 rounded-md text-orange-500 bg-orange-500/10">
            Within Estimate (
            {
              <Text className="font-mono text-sm">
                {Math.round(estimateProgressPercentage)}%
              </Text>
            }
            )
          </Text>
        );
      }
    }
  };

  return (
    <Screen>
      <View className="bg-neutral-100 dark:bg-neutral-900">
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskListItem
              task={item}
              onQuickEdit={() => setQuickEditingTask(item)}
              onEdit={() => setEditingTask(item)}
            />
          )}
          contentContainerStyle={{
            paddingBottom: 18, // space for input
          }}
          ListHeaderComponent={
            <>
              <View className="items-center justify-start px-4 py-8 bg-neutral-100 dark:bg-neutral-900">
                {/* Project overview card */}
                <QueryState
                  query={taskDetailsQuery}
                  loadingFallback={<Skeleton className="h-[250] my-4 w-full" />}
                  emptyFallback={
                    <View className="h-[150] my-4 w-full rounded-md justify-center items-center bg-neutral-50 dark:bg-neutral-800">
                      <Text className="text-xl text-neutral-600 dark:text-neutral-500">
                        No data
                      </Text>
                    </View>
                  }
                >
                  {(data) => (
                    <View className="min-h-[150] w-full align-top p-6 bg-neutral-50 dark:bg-neutral-800">
                      {/* Project name */}
                      <Text className="text-3xl font-semibold text-neutral-800 dark:text-neutral-300">
                        {data?.name}
                      </Text>
                      {data?.description && (
                        <Text className=" text-neutral-600 mt-2 dark:text-neutral-300">
                          {data?.description}
                        </Text>
                      )}

                      {/* Task completion */}
                      <View className="gap-2">
                        {/* Task completion progress bar */}
                        <View
                          className={`my-2 w-full h-2 rounded-full overflow-hidden ${resolvedTheme === "light" ? "bg-neutral-200" : "bg-neutral-600"}`}
                        >
                          <View
                            className={`h-full rounded-[inherit] bg-blue-500`}
                            style={{
                              width: data
                                ? `${Math.floor((data?.completed_subtask_count / data?.subtask_count) * 100)}%`
                                : "0%",
                            }}
                          />
                        </View>

                        <Text className="font-mono flex-row gap-2 text-sm ml-auto text-neutral-600 dark:text-neutral-200">
                          <Text className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
                            {data?.completed_subtask_count}
                          </Text>
                          <Text>/{data?.subtask_count}</Text>
                        </Text>
                      </View>

                      {/* Estimate progress bar */}
                      <View className="bg-neutral-100 dark:bg-neutral-700 gap-3 p-4 rounded-md">
                        <Text className="text-neutral-700 dark:text-neutral-200 text-lg">
                          Estimate
                        </Text>
                        <View className="flex-row gap-4">
                          {/* Progress bar */}
                          {/* <View
                          className={`my-2 grow h-2 rounded-full overflow-hidden ${resolvedTheme === "light" ? "bg-neutral-200" : "bg-neutral-600"}`}
                        >
                          <View
                            className={`h-full rounded-[inherit] ${data ? data.color : "bg-blue-500"}`}
                            style={{
                              width: data
                                ? `${estimateProgressPercentage}%`
                                : "0%",
                            }}
                          />
                        </View> */}
                          <EstimateProgressBar />
                          {/* Estimate upper limit */}
                          <Text className="font-mono text-neutral-700 dark:text-neutral-200">
                            {estimateMultiple}x
                          </Text>
                        </View>
                        {/* <Text>{estimateProgressLabel}</Text> */}
                        <EstimateProgressLabel />
                      </View>

                      {/* Tasks Completed & Total Tasks */}
                      {/* <View className="flex-row gap-2">
                      <View className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md">
                        <View className="flex-row gap-2">
                          <Ionicons
                            name="timer-outline"
                            size={20}
                            color={
                              resolvedTheme === "light"
                                ? colors.neutral[500]
                                : colors.neutral[400]
                            }
                          />
                          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                            Tasks Completed
                          </Text>
                        </View>
                        <Text className="font-mono text-neutral-800 dark:text-neutral-200">
                          {data?.completed_task_count}
                        </Text>
                      </View>

                      <View className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md">
                        <View className="flex-row gap-2">
                          <Ionicons
                            name="timer-outline"
                            size={20}
                            color={
                              resolvedTheme === "light"
                                ? colors.neutral[500]
                                : colors.neutral[400]
                            }
                          />
                          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                            Total Tasks
                          </Text>
                        </View>
                        <Text className="font-mono text-neutral-800 dark:text-neutral-200">
                          {data?.task_count}
                        </Text>
                      </View>
                    </View> */}

                      <View className="flex-row gap-2">
                        {/* Time Spent */}
                        <View className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md">
                          <View className="flex-row gap-2">
                            <Ionicons
                              name="timer-outline"
                              size={20}
                              color={
                                resolvedTheme === "light"
                                  ? colors.neutral[500]
                                  : colors.neutral[400]
                              }
                            />
                            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                              Time Spent
                            </Text>
                          </View>
                          <Text className="font-mono text-neutral-800 dark:text-neutral-200">
                            {data?.total_elapsed_minutes}m (
                            {data?.total_elapsed_minutes}
                            s)
                          </Text>
                        </View>

                        {/* Time Estimated */}
                        <View className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md">
                          <View className="flex-row gap-2">
                            <Ionicons
                              name="timer-outline"
                              size={20}
                              color={
                                resolvedTheme === "light"
                                  ? colors.neutral[500]
                                  : colors.neutral[400]
                              }
                            />
                            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                              Time Estimated
                            </Text>
                          </View>
                          <Text className="font-mono text-neutral-800 dark:text-neutral-200">
                            {data?.total_estimated_minutes}m (
                            {data?.total_estimated_seconds}s)
                          </Text>
                        </View>
                      </View>

                      <View className="mt-4 p-4 w-full gap-2 bg-neutral-50 dark:bg-neutral-800">
                        <Text className="text-2xl font-semibold text-neutral-800 dark:text-neutral-300">
                          Tasks
                        </Text>

                        <TaskFilter onChange={(tab) => setTaskTab(tab)} />

                        {/* Quick add task */}
                        {/* <View className="-mt-2 px-4 flex-row items-center gap-4">
                    <Checkbox
                      className="size-5 rounded-full"
                      color={"#3b82f6"}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9999,
                      }}
                      disabled={true}
                    />
                    <TextInput
                      className="px-2 h-[32] text-sm flex-1"
                      placeholder="Quick Add Task"
                      style={{
                        margin: 0,
                        padding: 0,
                        textAlignVertical: "center",
                      }}
                      value={quickAddText}
                      onChangeText={setQuickAddText}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        if (!quickAddText.trim()) return;

                        quickAddTask(quickAddText);
                        setQuickAddText("");
                      }}
                    />
                  </View> */}

                        {/* <TaskList tasks={tasks} /> */}
                      </View>
                    </View>
                  )}
                </QueryState>
              </View>
            </>
          }
          // ListFooterComponent={
          //   taskTab === "completed" ? null : (
          //     <KeyboardAvoidingView
          //       behavior={Platform.OS === "ios" ? "padding" : "height"}
          //       keyboardVerticalOffset={80}
          //       //       style={{ flex: 1 }}
          //     >
          //       {/* Quick add task */}
          //       <View className="-mt-2 px-3 flex-row items-center gap-4">
          //         <Checkbox
          //           className="size-5 rounded-full"
          //           color={"#3b82f6"}
          //           style={{
          //             width: 18,
          //             height: 18,
          //             borderRadius: 9999,
          //           }}
          //           disabled={true}
          //         />
          //         <TextInput
          //           className="px-2 h-[32] text-sm flex-1"
          //           placeholder="Quick Add Task"
          //           style={{
          //             margin: 0,
          //             padding: 0,
          //             textAlignVertical: "center",
          //           }}
          //           value={quickAddText}
          //           onChangeText={setQuickAddText}
          //           returnKeyType="done"
          //           onSubmitEditing={() => {
          //             if (!quickAddText.trim()) return;

          //             quickAddTask(quickAddText);
          //             setQuickAddText("");
          //           }}
          //         />
          //       </View>
          //     </KeyboardAvoidingView>
          //   )
          // }
          keyboardShouldPersistTaps="handled"
        />

        {/* Quick Edit Estimate Time */}
        <Modal
          visible={quickEditingTask !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setQuickEditingTask(null)}
        >
          <Pressable
            className="flex-1 bg-black/40 justify-center items-center"
            onPress={() => setQuickEditingTask(null)} // Close modal on overlay tap
          >
            <Pressable
              className="w-[90%] bg-white dark:bg-neutral-800 rounded-xl p-4"
              onPress={(e) => e.stopPropagation()} // prevent modal closure on taps other than overlay
            >
              <Text className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
                Edit Estimate
              </Text>

              <View className="relative min-h-[50]">
                <TextInput
                  className="absolute inset-0 border border-neutral-400 px-4 flex-1 rounded-md font-mono text-neutral-800 dark:text-neutral-300"
                  placeholder="Esimate"
                  value={quickEditingTask?.estimated_minutes?.toString()}
                  onChangeText={(text) => {
                    const minutes = parseInt(text, 10);
                    const seconds = isNaN(minutes) ? 0 : minutes * 60;
                    setQuickEditingTask((prev) => ({
                      ...prev,
                      estimated_seconds: seconds,
                      estimated_minutes: Math.floor(seconds / 60),
                    }));
                  }}
                />
                <Text className="absolute right-4 bottom-1 text-neutral-400 font-medium">
                  mins
                </Text>
              </View>

              <TaskEstimateOptions
                estimatedSeconds={quickEditingTask?.estimated_seconds}
                onEstimateChange={(estimatedSeconds) => {
                  setQuickEditingTask((prevTask) => ({
                    ...prevTask,
                    estimated_seconds: estimatedSeconds,
                    estimated_minutes: Math.floor(estimatedSeconds / 60),
                  }));
                }}
              />

              <View className="flex-row mt-3 gap-2">
                <Pressable
                  className="px-4 py-2 rounded-md  bg-neutral-100 dark:bg-neutral-700"
                  onPress={() => setQuickEditingTask(null)}
                >
                  <Text className="text-neutral-800 dark:text-neutral-300">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  className="px-4 py-2 rounded-md  bg-primary-500 dark:bg-primary-500"
                  onPress={() => handleTaskQuickEditEstimate()}
                >
                  <Text className="text-white">Save</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* ------------------------- Editing Modal -------------------------*/}
        <Modal
          visible={editingTask !== null}
          transparent
          animationType="none"
          onRequestClose={() => setQuickEditingTask(null)}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={{
                paddingHorizontal: 8,
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              {/* Sheet */}
              <Animated.View
                style={{
                  transform: [{ translateY }],
                  // height: 400,
                  // height: "fit-content",
                  height: "50%",
                  backgroundColor: "white",
                  padding: 16,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
                className="relative z-20"
              >
                {/* <View
                {...panResponderRef.panHandlers}
                className="items-center py-2"
              >
                <View className="w-10 h-1.5 rounded-full bg-neutral-400" />
              </View> */}
                <ScrollView
                  contentContainerStyle={{ padding: 16 }}
                  contentContainerClassName="items-center gap-6 justify-start px-4 py-8 bg-neutral-100 dark:bg-neutral-900"
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="interactive"
                  showsVerticalScrollIndicator={false}
                >
                  <Text className="font-bold text-primary-500 text-xl">
                    Edit Task
                  </Text>
                  {/* Name */}
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <CTextInput
                        // className="w-full px-6 py-3 rounded-md bg-neutral-50 dark:bg-neutral-800"
                        placeholder="Name"
                        autoFocus={false}
                        value={field.value}
                        onChangeText={field.onChange}
                        onFocus={() => console.log("FOCUS")}
                        onBlur={() => console.log("BLUR")}
                      />
                    )}
                  />
                  {errors.name && (
                    <Text className="text-sm text-red-500 self-start">
                      {errors.name.message}
                    </Text>
                  )}

                  {/* Description */}
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <CTextInput
                        // className="w-full px-6 py-3 rounded-md bg-neutral-50 dark:bg-neutral-800"
                        className="h-[100]"
                        multiline
                        // numberOfLines={4}
                        style={{ textAlignVertical: "top" }}
                        placeholder="Description"
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
                      />
                    )}
                  />
                  {errors.description && (
                    <Text className="text-sm text-red-500 self-start">
                      {errors.description.message}
                    </Text>
                  )}

                  {/* Estimation (mins) */}
                  <Controller
                    control={control}
                    name="estimated_seconds"
                    // rules={{onChange: (e) => {
                    // }}}
                    render={({ field }) => (
                      <CTextInput
                        // className="w-full px-6 py-3 rounded-md bg-neutral-50 dark:bg-neutral-800"
                        className="font-mono"
                        inputMode="numeric"
                        style={{ textAlignVertical: "top" }}
                        placeholder="Estimation (mins)"
                        value={
                          field.value != undefined
                            ? Math.floor(field.value / 60).toString()
                            : ""
                        }
                        onChangeText={(text) => {
                          const minutes = parseInt(text, 10);
                          const seconds = isNaN(minutes) ? 0 : minutes * 60;
                          field.onChange(seconds);
                        }}
                      />
                    )}
                  />
                  {errors.estimated_seconds && (
                    <Text className="text-sm text-red-500 self-start">
                      {errors.estimated_seconds.message}
                    </Text>
                  )}

                  <View className="rounded-md">
                    <TaskEstimateOptions
                      estimatedSeconds={watch("estimated_seconds")}
                      onEstimateChange={(estimatedSeconds) => {
                        setValue("estimated_seconds", estimatedSeconds);
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmit(editTask)}
                    className={`mt-8 px-6 py-3 rounded-md self-end bg-primary-500`}
                  >
                    <Text className="text-neutral-50">Edit task</Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>

              {/* 👇 BACKDROP (tap outside to close) */}
              <View className="absolute inset-0">
                <Pressable
                  // className="backdrop-blur-2xl"
                  // className="absolute inset-0 z-10"
                  // className="absolute inset-0"
                  style={{ flex: 1 }}
                  onPress={() => setEditingTask(null)}
                >
                  <BlurView
                    intensity={50}
                    tint="dark" // "light" | "dark" | "default"
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
                  />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Screen>
  );
};

export default TaskScreen;
