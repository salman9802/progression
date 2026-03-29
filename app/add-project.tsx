import CTextInput from "@/components/CTextInput";
import { getDb } from "@/db";
import { TProject } from "@/db/schema";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// const COLORS = [
//   "bg-red-500",
//   "bg-orange-500",
//   "bg-amber-500",
//   "bg-yellow-500",
//   "bg-lime-500",
//   "bg-green-500",
//   "bg-emerald-500",
//   "bg-teal-500",
//   "bg-cyan-500",
//   "bg-sky-500",
//   "bg-blue-500",
//   "bg-indigo-500",
//   "bg-violet-500",
//   "bg-purple-500",
//   "bg-fuchsia-500",
//   "bg-pink-500",
//   "bg-rose-500",
// ];

const PROJECT_COLORS = {
  red: [
    "bg-red-50",
    "bg-red-100",
    "bg-red-200",
    "bg-red-300",
    "bg-red-400",
    "bg-red-500",
    "bg-red-600",
    "bg-red-700",
    "bg-red-800",
    "bg-red-900",
    "bg-red-950",
  ],
  green: [
    "bg-green-50",
    "bg-green-100",
    "bg-green-200",
    "bg-green-300",
    "bg-green-400",
    "bg-green-500",
    "bg-green-600",
    "bg-green-700",
    "bg-green-800",
    "bg-green-900",
    "bg-green-950",
  ],
  blue: [
    "bg-blue-50",
    "bg-blue-100",
    "bg-blue-200",
    "bg-blue-300",
    "bg-blue-400",
    "bg-blue-500",
    "bg-blue-600",
    "bg-blue-700",
    "bg-blue-800",
    "bg-blue-900",
    "bg-blue-950",
  ],
  orange: [
    "bg-orange-50",
    "bg-orange-100",
    "bg-orange-200",
    "bg-orange-300",
    "bg-orange-400",
    "bg-orange-500",
    "bg-orange-600",
    "bg-orange-700",
    "bg-orange-800",
    "bg-orange-900",
    "bg-orange-950",
  ],
  purple: [
    "bg-purple-50",
    "bg-purple-100",
    "bg-purple-200",
    "bg-purple-300",
    "bg-purple-400",
    "bg-purple-500",
    "bg-purple-600",
    "bg-purple-700",
    "bg-purple-800",
    "bg-purple-900",
    "bg-purple-950",
  ],
  slate: [
    "bg-slate-50",
    "bg-slate-100",
    "bg-slate-200",
    "bg-slate-300",
    "bg-slate-400",
    "bg-slate-500",
    "bg-slate-600",
    "bg-slate-700",
    "bg-slate-800",
    "bg-slate-900",
    "bg-slate-950",
  ],
  stone: [
    "bg-stone-50",
    "bg-stone-100",
    "bg-stone-200",
    "bg-stone-300",
    "bg-stone-400",
    "bg-stone-500",
    "bg-stone-600",
    "bg-stone-700",
    "bg-stone-800",
    "bg-stone-900",
    "bg-stone-950",
  ],
};

const defaultProject: TProject = {
  id: "",
  name: "",
  description: "",
  color: "bg-primary-500",
  position: 0,
  created_at: 0,
  updated_at: 0,
};

const AddProjectScreen = () => {
  const [selected, setSelected] = useState<string>("bg-primary-500");
  const [showColorModal, setShowColorModal] = useState(false);
  // const [project, setProject] = useState<TProject>(defaultProject);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TProject>();
  const addProject: SubmitHandler<TProject> = (project) => {
    const db = getDb();

    try {
      const now = Date.now();
      db.runSync(
        "INSERT INTO projects (id, name, description, color, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          Crypto.randomUUID(),
          project.name,
          project.description,
          project.color,
          0,
          now,
          now,
        ]
      );
      // console.log("Project added");
      Toast.show({
        type: "success",
        text1: "Project added",
      });
      router.push("/");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to add project",
      });
      console.error("Failed to add project");
      console.error(error);
    }

    reset(defaultProject);
  };

  /* sync selected color with project */
  useEffect(() => {
    setValue("color", selected);
  }, [selected]);

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

      {/* Select color */}
      <Pressable
        onPress={() => setShowColorModal(true)}
        className="flex-row items-center gap-4 w-full px-6 py-3 rounded-md bg-neutral-50 dark:bg-neutral-800"
      >
        <View className={`size-10 rounded-full ${selected}`} />
        <Text className="dark:text-neutral-100">Select Color</Text>
      </Pressable>

      {/* Select color modal */}
      <Modal
        visible={showColorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorModal(false)}
      >
        {/* Dark overlay */}
        <View
          // onPress={() => setShowColorModal(false)}
          className="bg-black/50 flex-1 justify-center items-center px-6"
        >
          {/* Close when tapping outside */}
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowColorModal(false)}
          />

          {/* Modal Container */}
          <View className="bg-neutral-50 dark:bg-neutral-800 p-6 h-[300]">
            <ScrollView showsVerticalScrollIndicator={true}>
              <View className="flex-row h-full flex-wrap gap-3">
                {Object.entries(PROJECT_COLORS).map(([k, v], i) => (
                  <View key={i} className="flex-col gap-4">
                    <Text className="capitalize text-neutral-600 dark:text-neutral-100">
                      {k}
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                      {v.map((color) => (
                        <Pressable
                          key={color}
                          onPress={() => {
                            setSelected(color);
                            setShowColorModal(false);
                          }}
                          className={`w-10 h-10 border-2 rounded-full ${color} ${
                            selected === color
                              ? "border-black"
                              : "border-transparent"
                          }`}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={handleSubmit(addProject)}
        className="mt-8 px-6 py-3 bg-primary-500 rounded-md self-end"
      >
        <Text className="text-neutral-50">Add project</Text>
      </TouchableOpacity>
      {/* <Button title="Add Project" onPress={handleSubmit(addProject)} /> */}

      {/* <StatusBar style="light" /> */}
    </View>
  );
};

export default AddProjectScreen;

const styles = StyleSheet.create({});
