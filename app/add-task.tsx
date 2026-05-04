import * as Crypto from "expo-crypto";

import CTextInput from "@/components/CTextInput";
import QuickEstimateOptions from "@/components/task/TaskEstimateOptions";
import { getDb } from "@/db";
import { TProjectDetails, TTask, TTaskDetails } from "@/db/schema";
import { tasksKeys } from "@/hooks/tasks";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

const AddTaskScreen = () => {
  const queryClient = useQueryClient();

  const { project, task } = useLocalSearchParams();
  const parsedProject: TProjectDetails | null = project
    ? JSON.parse(project as string)
    : null;
  const parsedTask: TTaskDetails | null = task
    ? JSON.parse(task as string)
    : null;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm<TTask>();

  const addTask: SubmitHandler<TTask> = (task) => {
    const db = getDb();

    try {
      if (parsedProject !== null) {
        // create root task (for a project)

        const now = Date.now();
        db.runSync(
          "INSERT INTO tasks (id, project_id, parent_id, name, description, estimated_seconds, elapsed_seconds, timer_started_at, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            Crypto.randomUUID(),
            parsedProject?.id || null,
            null,
            task.name,
            task.description,
            task.estimated_seconds,
            0,
            null,
            0,
            now,
            now,
          ],
        );
        // console.log("Project added");
        queryClient.invalidateQueries({
          queryKey: tasksKeys.byProjectId(parsedProject?.id),
        });
        Toast.show({
          type: "success",
          text1: "Task added",
        });
        router.push("/");
      } else if (parsedTask !== null) {
        // create sub task

        const now = Date.now();
        db.runSync(
          "INSERT INTO tasks (id, project_id, parent_id, name, description, estimated_seconds, elapsed_seconds, timer_started_at, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            Crypto.randomUUID(),
            parsedTask?.project_id || null,
            parsedTask?.id || null,
            task.name,
            task.description,
            task.estimated_seconds,
            0,
            null,
            0,
            now,
            now,
          ],
        );
        // console.log("Project added");
        queryClient.invalidateQueries({
          queryKey: tasksKeys.byTaskId(parsedTask?.id),
        });
        Toast.show({
          type: "success",
          text1: "Task added",
        });
        // NOTE: add proper redirection after creating subtask later
        router.push("/");
      }
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
    <View className="flex-1 items-center gap-6 justify-start px-4 py-8 bg-neutral-100 dark:bg-neutral-900">
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

      {/* <View className="flex-row items-center justify-between w-full ">
        <TouchableOpacity
          onPress={() => {
            const estimatedSeconds = getValues("estimated_seconds");
            if (estimatedSeconds == undefined)
              setValue("estimated_seconds", -600);
            else
              setValue(
                "estimated_seconds",
                getValues("estimated_seconds") - 600
              );
          }}
        >
          <Text className="text-red-500 font-medium font-mono">-10 mins</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const estimatedSeconds = getValues("estimated_seconds");
            if (estimatedSeconds == undefined)
              setValue("estimated_seconds", -300);
            else
              setValue(
                "estimated_seconds",
                getValues("estimated_seconds") - 300
              );
          }}
        >
          <Text className="text-red-500 font-medium font-mono">-5 mins</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const estimatedSeconds = getValues("estimated_seconds");
            if (estimatedSeconds == undefined)
              setValue("estimated_seconds", 300);
            else
              setValue(
                "estimated_seconds",
                getValues("estimated_seconds") + 300
              );
          }}
        >
          <Text className="text-primary-500 font-medium font-mono">
            +5 mins
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const estimatedSeconds = getValues("estimated_seconds");
            if (estimatedSeconds == undefined)
              setValue("estimated_seconds", 600);
            else
              setValue(
                "estimated_seconds",
                getValues("estimated_seconds") + 600
              );
          }}
        >
          <Text className="text-primary-500 font-medium font-mono">
            +10 mins
          </Text>
        </TouchableOpacity>
      </View> */}

      <View className="rounded-md">
        <QuickEstimateOptions
          estimatedSeconds={watch("estimated_seconds")}
          onEstimateChange={(estimatedSeconds) => {
            setValue("estimated_seconds", estimatedSeconds);
          }}
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit(addTask)}
        className={`mt-8 px-6 py-3 rounded-md self-end ${parsedProject ? parsedProject.color : "bg-primary-500"}`}
      >
        <Text className="text-neutral-50">Add task</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddTaskScreen;

const styles = StyleSheet.create({});
