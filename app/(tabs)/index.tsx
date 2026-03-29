import appColors from "@/colors";
import { QueryState } from "@/components/QueryState";
import { Skeleton } from "@/components/Skeleton";
import { useProjectDetails, useProjects } from "@/hooks/projects";
import { useTheme } from "@/providers/ThemeProvider";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "tailwindcss/colors";

export default function ProjectsScreen() {
  const { resolvedTheme } = useTheme();
  const [currentProjectId, setCurrentProjectId] = useState<string>();

  const projectsQuery = useProjects();
  const projectDetailsQuery = useProjectDetails(currentProjectId);

  /* sets currentProjectId as the first project */
  useEffect(() => {
    if (projectsQuery.data)
      if (projectsQuery.data.length > 0)
        setCurrentProjectId(projectsQuery.data[0].id);
  }, [projectsQuery.data]);

  return (
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
            // color={
            //   resolvedTheme === "light"
            //     ? colors.neutral[600]
            //     : colors.neutral[500]
            // }
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
          <View className="h-[250] w-full align-top p-6 bg-neutral-50 dark:bg-neutral-800">
            <Text className="text-4xl text-neutral-800 dark:text-neutral-300">
              {data?.name}
            </Text>
            {data?.description && (
              <Text className=" text-neutral-600 mt-2 dark:text-neutral-300">
                {data?.description}
              </Text>
            )}

            <Text className="text-xl mt-4 flex-row text-neutral-800 dark:text-neutral-300">
              <Text>Tasks: </Text>
              <Text>{data?.task_count}</Text>
            </Text>

            <View className="mt-4 gap-2">
              <View className="flex-row gap-4">
                <Ionicons
                  name="timer-outline"
                  size={24}
                  color={
                    resolvedTheme === "light"
                      ? colors.neutral[800]
                      : colors.neutral[300]
                  }
                />
                <Text className="text-xl text-neutral-800 dark:text-neutral-300">
                  Time spent:{" "}
                </Text>
              </View>
              {/* <Text>{data?.total_elapsed_minutes}m</Text> */}
              <Text className="font-mono text-neutral-800 dark:text-neutral-300">
                0m (
                <Text className="text-neutral-600 dark:text-neutral-500">
                  0s
                </Text>
                )
              </Text>
            </View>
          </View>
        )}
      </QueryState>

      {/* <View className="bg-red-500 h-[300] mt-4 w-11/12"></View> */}
      <FlatList
        className="w-full"
        data={[
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
          "lorem ipsum",
        ]}
        renderItem={({ item }) => (
          <View className="px-4 my-3 flex border border-red-500">
            <Text>{item}</Text>
          </View>
        )}
      />

      {/* TODO: change to add task in the current project */}
      {/* Add project (floating) */}
      <TouchableOpacity
        className="absolute right-5 bottom-7 p-4 bg-primary-500 rounded-full"
        onPress={() => {
          router.push("/add-project");
        }}
      >
        <Entypo
          name="add-to-list"
          size={24}
          className="text-neutral-50" /* color={theme.light} */
          color={
            resolvedTheme === "light" ? colors.neutral[900] : colors.neutral[50]
          }
        />
      </TouchableOpacity>

      {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
      {/* <EditScreenInfo path="app/(tabs)/index.tsx" /> */}
    </View>
  );
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
