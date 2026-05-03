import {
  getTaskDetailsByTaskId,
  getTasksByProjectId,
  getTasksByTaskId,
  markTaskCompleted,
  startTimer,
  stopTimer,
  updateTask
} from "@/db/queries/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "./projects";

// Query keys in one place — avoids typo bugs across files
export const tasksKeys = {
  byProjectId: (projectId?: string) => ["tasks/project", projectId] as const,
  markTaskCompleted: ["tasks/mark-completed"] as const,
  updateTask: ["tasks/update"] as const,
  startTimer: ["tasks/start-timer"] as const,
  stopTimer: ["tasks/stop-timer"] as const,

  detail: (id: string) => ["projects", id] as const,
  details: (id: string | undefined) => ["projects", id, "details"] as const,

  byTaskId: (taskId?: string) => ["tasks/task", taskId] as const,
  taskDetails: (id?: string | undefined) => ["tasks/task/details", id] as const,
};

export function useTaskDetailsQuery(id: string | undefined) {
  return useQuery({
    queryKey: tasksKeys.taskDetails(id),
    queryFn: () => getTaskDetailsByTaskId(id),
    enabled: !!id, // don't run if id is empty/undefined
  });
}

export function useTasksByProjectId(projectId: string | undefined) {
  return useQuery({
    queryKey: tasksKeys.byProjectId(projectId!),
    queryFn: () => getTasksByProjectId(projectId!),
    enabled: !!projectId,
  });
}

export function useTasksByTaskId(taskId: string | undefined) {
  return useQuery({
    queryKey: tasksKeys.byTaskId(taskId!),
    queryFn: () => getTasksByTaskId(taskId!),
    enabled: !!taskId,
  });
}

export function useMarkTaskCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: tasksKeys.markTaskCompleted,
    mutationFn: markTaskCompleted,
    onSuccess: () => {
      [projectKeys.details()[0], tasksKeys.byProjectId()[0]].map((key) => {
        queryClient.invalidateQueries({
          queryKey: [key],
        });
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: tasksKeys.updateTask,
    mutationFn: updateTask,
    onSuccess: () => {
      [projectKeys.details()[0], tasksKeys.byProjectId()[0]].map((key) => {
        queryClient.invalidateQueries({
          queryKey: [key],
        });
      });
    },
  });
}

export function useStartTimer() {
  return useMutation({
    mutationKey: tasksKeys.startTimer,
    mutationFn: startTimer,
  });
}

export function useStopTimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: tasksKeys.stopTimer,
    mutationFn: stopTimer,
    onSuccess: () => {
      [projectKeys.details()[0], tasksKeys.byProjectId()[0]].map((key) => {
        queryClient.invalidateQueries({
          queryKey: [key],
        });
      });
    },
  });
}
