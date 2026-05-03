import { getDb } from "@/db";
import { TTaskDetails } from "@/db/schema";
import { BlurView } from "expo-blur";
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import CTextInput from "../CTextInput";
import TaskEstimateOptions from "./TaskEstimateOptions";
import TaskListItem from "./TaskListItem";

// const dummyTasks = ["lorem", "ipsum", "dot", "eliot"];
// const dummyTasks = [];

type TaskListProps = {
  tasks: TTaskDetails[];
};

/** @deprecated */

const TaskList = ({ tasks }: TaskListProps) => {
  const [editingTask, setEditingTask] =
    React.useState<Partial<TTaskDetails> | null>(null);

  const [isEditing, setIsEditing] = React.useState(false);
  const screenHeight = Dimensions.get("window").height;
  const translateY = React.useRef(new Animated.Value(screenHeight)).current;
  React.useEffect(() => {
    if (isEditing) {
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
  }, [isEditing]);

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

  const addTask: SubmitHandler<TTaskDetails> = (task) => {
    const db = getDb();

    try {
      const now = Date.now();
      // TODO
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

  return (
    <View className="my-2">
      {tasks.length === 0 ? (
        <Text className="italic text-neutral-600 text-center dark:text-neutral-300">
          No Tasks
        </Text>
      ) : (
        <Text className="gap-4">
          {tasks.map((task, i) => (
            <TaskListItem
              key={task.id}
              task={task}
              onEdit={() => {
                setEditingTask(task);
              }}
            />
          ))}
        </Text>
      )}

      {/* ------------------------- Editing Modal -------------------------*/}
      <Modal visible={editingTask === null} transparent animationType="none">
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
                      autoFocus={true}
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
                  onPress={handleSubmit(addTask)}
                  className={`mt-8 px-6 py-3 rounded-md self-end bg-primary-500`}
                >
                  <Text className="text-neutral-50">Add task</Text>
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
                onPress={() => setIsEditing(false)}
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
  );
};

export default TaskList;
