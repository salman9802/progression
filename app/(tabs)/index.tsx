import * as Crypto from "expo-crypto";

import appColors from "@/colors";
import { QueryState } from "@/components/QueryState";
import { Skeleton } from "@/components/Skeleton";
import TaskFilter, { TaskTab } from "@/components/task/TaskFilter";
import TaskItem from "@/components/task/TaskItem";
import { getDb } from "@/db";
import { projectKeys, useProjectDetails, useProjects } from "@/hooks/projects";
import { tasksKeys, useTasksByProjectId } from "@/hooks/tasks";
import Logger from "@/lib/logger";
import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import colors from "tailwindcss/colors";

export default function ProjectsScreen() {
  const logger = useMemo(() => new Logger("ProjectsScreen"), []);
  const queryClient = useQueryClient();

  const [taskTab, setTaskTab] = useState<TaskTab>("pending");

  const { resolvedTheme } = useTheme();
  const [currentProjectId, setCurrentProjectId] = useState<string>();

  // projects
  const projectsQuery = useProjects();
  const projectDetailsQuery = useProjectDetails(currentProjectId);

  /* sets currentProjectId as the first project */
  useEffect(() => {
    if (projectsQuery.data)
      if (projectsQuery.data.length > 0)
        setCurrentProjectId(projectsQuery.data[0].id);
  }, [projectsQuery.data]);

  // tasks
  const [quickAddText, setQuickAddText] = useState("");

  const tasksQuery = useTasksByProjectId(currentProjectId);

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
          currentProjectId || null,
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
      [(projectKeys.details()[0], tasksKeys.byProjectId()[0])].map((key) => {
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

  // logger.log(projectsQuery.data);
  // logger.log(projectDetailsQuery.data);

  if (true) {
    return (
      <View style={{ flex: 1 }} className="bg-neutral-100 dark:bg-neutral-900">
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskItem task={item} />}
          contentContainerStyle={{
            paddingBottom: 100, // 👈 space for input
          }}
          ListHeaderComponent={
            <>
              <View className="flex-1 items-center justify-start px-4 py-8 bg-neutral-100 dark:bg-neutral-900">
                <View className="mb-2 flex-row px-6 items-center justify-around w-full">
                  {/* Horizontal project list */}
                  <QueryState
                    query={projectsQuery}
                    loadingFallback={
                      <Skeleton className="my-4 h-[24] w-full mx-3 rounded-md" />
                    }
                    emptyFallback={
                      <Text className="text-neutral-600 items-center self-start dark:text-neutral-500">
                        No projects. Press + to add one
                      </Text>
                    }
                  >
                    {(data) => (
                      <FlatList
                        className="flex-grow-0 flex-shrink-0 pb-4"
                        contentContainerStyle={{
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        data={data}
                        renderItem={({ item }) => (
                          <Pressable
                            onPress={() => setCurrentProjectId(item.id)}
                            className={`px-2 mx-2 ${currentProjectId && currentProjectId === item.id ? "border-b-2 border-primary-500" : ""}`}
                          >
                            <Text
                              className={`${currentProjectId && currentProjectId === item.id ? "font-semibold text-primary-500" : "text-neutral-600 dark:text-neutral-500"}`}
                            >
                              {item.name}
                            </Text>
                          </Pressable>
                        )}
                        horizontal={true}
                      />
                    )}
                  </QueryState>

                  {/* Add Project */}
                  <TouchableOpacity
                    className="mr-4 pb-4"
                    onPress={() => {
                      router.push("/add-project");
                    }}
                  >
                    <Ionicons
                      name="add"
                      size={24}
                      color={appColors.primary[500]}
                    />
                  </TouchableOpacity>
                </View>

                {/* Project overview card */}
                <QueryState
                  query={projectDetailsQuery}
                  loadingFallback={<Skeleton className="h-[250] my-4 w-full" />}
                  emptyFallback={
                    <View className="h-[250] my-4 w-full rounded-md justify-center items-center bg-neutral-50 dark:bg-neutral-800">
                      <Text className="text-xl text-neutral-600 dark:text-neutral-500">
                        No data
                      </Text>
                    </View>
                  }
                >
                  {(data) => (
                    <View className="min-h-[250] w-full align-top p-6 bg-neutral-50 dark:bg-neutral-800">
                      {/* Project name */}
                      <Text className="text-3xl font-semibold text-neutral-800 dark:text-neutral-300">
                        {data?.name}
                      </Text>
                      {data?.description && (
                        <Text className=" text-neutral-600 mt-2 dark:text-neutral-300">
                          {data?.description}
                        </Text>
                      )}

                      {/* Task completion progress bar */}
                      <View
                        className={`my-2 w-full h-2 rounded-full overflow-hidden ${resolvedTheme === "light" ? "bg-neutral-200" : "bg-neutral-600"}`}
                      >
                        <View
                          className={`h-full rounded-[inherit] ${data ? data.color : "bg-blue-500"}`}
                          style={{
                            width: data
                              ? `${Math.floor((data?.completed_task_count / data?.task_count) * 100)}%`
                              : "0%",
                          }}
                        />
                      </View>

                      <View className="flex-row gap-2">
                        {/* Tasks Completed */}
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

                        {/* Total Tasks */}
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
                      </View>

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
                    </View>
                  )}
                </QueryState>

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
            </>
          }
          ListFooterComponent={
            taskTab === "completed" ? null : (
              <>
                {/* Quick add task */}
                <View className="-mt-2 px-3 flex-row items-center gap-4">
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
                </View>
              </>
            )
          }
        />
      </View>
    );
  }

  // return (
  //   <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  //     <KeyboardAvoidingView
  //       behavior={Platform.OS === "ios" ? "padding" : "height"}
  //       keyboardVerticalOffset={80}
  //       style={{ flex: 1 }}
  //     >
  //       <ScrollView
  //         contentContainerStyle={{ flexGrow: 1 }}
  //         keyboardShouldPersistTaps="handled"
  //       >
  //         <View className="flex-1 items-center justify-start px-4 py-8 bg-neutral-100 dark:bg-neutral-900">
  //           <View className="mb-2 flex-row px-6 items-center justify-around w-full">
  //             {/* Horizontal project list */}
  //             <QueryState
  //               query={projectsQuery}
  //               loadingFallback={
  //                 <Skeleton className="my-4 h-[24] w-full mx-3 rounded-md" />
  //               }
  //               emptyFallback={
  //                 <Text className="text-neutral-600 items-center self-start dark:text-neutral-500">
  //                   No projects. Press + to add one
  //                 </Text>
  //               }
  //             >
  //               {(data) => (
  //                 <FlatList
  //                   className="flex-grow-0 flex-shrink-0 pb-4"
  //                   contentContainerStyle={{
  //                     alignItems: "center",
  //                     justifyContent: "center",
  //                   }}
  //                   data={data}
  //                   renderItem={({ item }) => (
  //                     <Pressable
  //                       onPress={() => setCurrentProjectId(item.id)}
  //                       className={`px-2 mx-2 ${currentProjectId && currentProjectId === item.id ? "border-b-2 border-primary-500" : ""}`}
  //                     >
  //                       <Text
  //                         className={`${currentProjectId && currentProjectId === item.id ? "font-semibold text-primary-500" : "text-neutral-600 dark:text-neutral-500"}`}
  //                       >
  //                         {item.name}
  //                       </Text>
  //                     </Pressable>
  //                   )}
  //                   horizontal={true}
  //                 />
  //               )}
  //             </QueryState>
  //             <TouchableOpacity
  //               className="mr-4 pb-4"
  //               onPress={() => {
  //                 router.push("/add-project");
  //               }}
  //             >
  //               <Ionicons
  //                 name="add"
  //                 size={24}
  //                 color={appColors.primary[500]}
  //                 // color={
  //                 //   resolvedTheme === "light"
  //                 //     ? colors.neutral[600]
  //                 //     : colors.neutral[500]
  //                 // }
  //               />
  //             </TouchableOpacity>
  //           </View>

  //           {/* Project overview card */}
  //           <QueryState
  //             query={projectDetailsQuery}
  //             loadingFallback={<Skeleton className="h-[250] my-4 w-full" />}
  //             emptyFallback={
  //               <View className="h-[250] my-4 w-full rounded-md justify-center items-center bg-neutral-50 dark:bg-neutral-800">
  //                 <Text className="text-xl text-neutral-600 dark:text-neutral-500">
  //                   No data
  //                 </Text>
  //               </View>
  //             }
  //           >
  //             {(data) => (
  //               <View className="min-h-[250] w-full align-top p-6 bg-neutral-50 dark:bg-neutral-800">
  //                 {/* Project name */}
  //                 <Text className="text-3xl font-semibold text-neutral-800 dark:text-neutral-300">
  //                   {data?.name}
  //                 </Text>
  //                 {data?.description && (
  //                   <Text className=" text-neutral-600 mt-2 dark:text-neutral-300">
  //                     {data?.description}
  //                   </Text>
  //                 )}

  //                 {/* Task completion progress bar */}
  //                 <View
  //                   className={`my-2 w-full h-2 rounded-full overflow-hidden ${resolvedTheme === "light" ? "bg-neutral-200" : "bg-neutral-600"}`}
  //                 >
  //                   <View
  //                     className={`h-full rounded-[inherit] ${data ? data.color : "bg-blue-500"}`}
  //                     style={{
  //                       // width: `${Math.min(Math.max(data?.completed_task_count || 0, 0), 100)}%`,
  //                       width: data
  //                         ? `${Math.floor((data?.completed_task_count / data?.task_count) * 100)}%`
  //                         : "0%",
  //                     }}
  //                   />
  //                 </View>

  //                 <View className="flex-row gap-2">
  //                   {/* Tasks Completed */}
  //                   <View className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md">
  //                     <View className="flex-row gap-2">
  //                       <Ionicons
  //                         name="timer-outline"
  //                         size={20}
  //                         color={
  //                           resolvedTheme === "light"
  //                             ? colors.neutral[500]
  //                             : colors.neutral[400]
  //                         }
  //                       />
  //                       <Text className="text-sm text-neutral-500 dark:text-neutral-400">
  //                         Tasks Completed
  //                       </Text>
  //                     </View>
  //                     <Text className="font-mono text-neutral-800 dark:text-neutral-200">
  //                       {data?.completed_task_count}
  //                     </Text>
  //                   </View>

  //                   {/* Total Tasks */}
  //                   <View className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md">
  //                     <View className="flex-row gap-2">
  //                       <Ionicons
  //                         name="timer-outline"
  //                         size={20}
  //                         color={
  //                           resolvedTheme === "light"
  //                             ? colors.neutral[500]
  //                             : colors.neutral[400]
  //                         }
  //                       />
  //                       <Text className="text-sm text-neutral-500 dark:text-neutral-400">
  //                         Total Tasks
  //                       </Text>
  //                     </View>
  //                     <Text className="font-mono text-neutral-800 dark:text-neutral-200">
  //                       {data?.task_count}
  //                     </Text>
  //                   </View>
  //                 </View>

  //                 <View className="flex-row gap-2">
  //                   {/* Time Spent */}
  //                   <View className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md">
  //                     <View className="flex-row gap-2">
  //                       <Ionicons
  //                         name="timer-outline"
  //                         size={20}
  //                         color={
  //                           resolvedTheme === "light"
  //                             ? colors.neutral[500]
  //                             : colors.neutral[400]
  //                         }
  //                       />
  //                       <Text className="text-sm text-neutral-500 dark:text-neutral-400">
  //                         Time Spent
  //                       </Text>
  //                     </View>
  //                     <Text className="font-mono text-neutral-800 dark:text-neutral-200">
  //                       {data?.total_elapsed_minutes}m (
  //                       {data?.total_elapsed_minutes}
  //                       s)
  //                     </Text>
  //                   </View>

  //                   {/* Time Estimated */}
  //                   <View className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md">
  //                     <View className="flex-row gap-2">
  //                       <Ionicons
  //                         name="timer-outline"
  //                         size={20}
  //                         color={
  //                           resolvedTheme === "light"
  //                             ? colors.neutral[500]
  //                             : colors.neutral[400]
  //                         }
  //                       />
  //                       <Text className="text-sm text-neutral-500 dark:text-neutral-400">
  //                         Time Estimated
  //                       </Text>
  //                     </View>
  //                     <Text className="font-mono text-neutral-800 dark:text-neutral-200">
  //                       {data?.total_estimated_minutes}m (
  //                       {data?.total_estimated_seconds}s)
  //                     </Text>
  //                   </View>
  //                 </View>
  //               </View>
  //             )}
  //           </QueryState>

  //           {/* Project Tasks */}
  //           <View className="mt-4 p-4 w-full gap-2 bg-neutral-50 dark:bg-neutral-800">
  //             <Text className="text-2xl font-semibold text-neutral-800 dark:text-neutral-300">
  //               Tasks
  //             </Text>

  //             <TaskFilter onChange={(tab) => setTaskTab(tab)} />

  //             <QueryState query={tasksQuery}>
  //               {(tasks) =>
  //                 taskTab === "pending" ? (
  //                   <TaskList tasks={tasks.filter((t) => !t.completed)} />
  //                 ) : (
  //                   <TaskList tasks={tasks.filter((t) => t.completed)} />
  //                 )
  //               }
  //             </QueryState>

  //             {/* Quick add task */}
  //             <View className="-mt-2 px-4 flex-row items-center gap-4">
  //               <Checkbox
  //                 className="size-5 rounded-full"
  //                 color={"#3b82f6"}
  //                 style={{
  //                   width: 18,
  //                   height: 18,
  //                   borderRadius: 9999,
  //                 }}
  //                 disabled={true}
  //               />
  //               <TextInput
  //                 className="px-2 h-[32] text-sm flex-1"
  //                 placeholder="Quick Add Task"
  //                 style={{
  //                   margin: 0,
  //                   padding: 0,
  //                   textAlignVertical: "center",
  //                 }}
  //                 value={quickAddText}
  //                 onChangeText={setQuickAddText}
  //                 returnKeyType="done"
  //                 onSubmitEditing={() => {
  //                   if (!quickAddText.trim()) return;

  //                   quickAddTask(quickAddText);
  //                   setQuickAddText("");
  //                 }}
  //               />
  //             </View>
  //           </View>

  //           {/* <FlatList
  //       className="w-full"
  //       data={[
  //         "lorem ipsum",
  //         "lorem ipsum",
  //         "lorem ipsum",
  //         "lorem ipsum",
  //         "lorem ipsum",
  //         "lorem ipsum",
  //         "lorem ipsum",
  //         "lorem ipsum",
  //       ]}
  //       renderItem={({ item }) => (
  //         <View className="px-4 my-3 flex border border-red-500">
  //           <Text>{item}</Text>
  //         </View>
  //       )}
  //     /> */}

  //           {/* TODO: change to add task in the current project */}
  //           {/* Add project (floating) */}
  //           <QueryState
  //             query={projectDetailsQuery}
  //             loadingFallback={<Skeleton className="h-[250] my-4 w-full" />}
  //             emptyFallback={
  //               <View className="h-[250] my-4 w-full rounded-md justify-center items-center bg-neutral-50 dark:bg-neutral-800">
  //                 <Text className="text-xl text-neutral-600 dark:text-neutral-500">
  //                   No data
  //                 </Text>
  //               </View>
  //             }
  //           >
  //             {(data) => (
  //               <TouchableOpacity
  //                 className={`absolute right-5 bottom-7 p-4 rounded-full ${data ? data.color : "bg-primary-500"}`}
  //                 onPress={() => {
  //                   router.push({
  //                     pathname: "/add-task",
  //                     params: { project: JSON.stringify(data) },
  //                   });
  //                 }}
  //               >
  //                 <Entypo
  //                   name="add-to-list"
  //                   size={24}
  //                   className="text-neutral-50" /* color={theme.light} */
  //                   color={
  //                     resolvedTheme === "light"
  //                       ? colors.neutral[900]
  //                       : colors.neutral[50]
  //                   }
  //                 />
  //               </TouchableOpacity>
  //             )}
  //           </QueryState>

  //           {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
  //           {/* <EditScreenInfo path="app/(tabs)/index.tsx" /> */}
  //         </View>
  //       </ScrollView>
  //     </KeyboardAvoidingView>
  //   </TouchableWithoutFeedback>
  // );
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
