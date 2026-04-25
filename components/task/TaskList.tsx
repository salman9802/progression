import { TTask } from "@/db/schema";
import React from "react";
import { Text, View } from "react-native";
import TaskItem from "./TaskItem";

// const dummyTasks = ["lorem", "ipsum", "dot", "eliot"];
// const dummyTasks = [];

type TaskListProps = {
  tasks: TTask[];
};

const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <View className="my-2">
      {tasks.length === 0 ? (
        <Text className="italic text-neutral-600 text-center dark:text-neutral-300">
          No Tasks
        </Text>
      ) : (
        <Text className="gap-4">
          {tasks.map((task, i) => (
            <TaskItem key={i} task={task} />
          ))}
        </Text>
      )}
    </View>
  );
};

export default TaskList;
