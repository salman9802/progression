import { TTaskDetails } from "@/db/schema";
import React from "react";
import { Text, View } from "react-native";
import TaskListItem from "./TaskListItem";

// const dummyTasks = ["lorem", "ipsum", "dot", "eliot"];
// const dummyTasks = [];

type TaskListProps = {
  tasks: TTaskDetails[];
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
            <TaskListItem key={i} task={task} onEdit={() => {}} />
          ))}
        </Text>
      )}
    </View>
  );
};

export default TaskList;
