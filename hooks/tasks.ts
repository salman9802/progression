import { getTasksByProjectId, markTaskCompleted } from "@/db/queries/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "./projects";

// Query keys in one place — avoids typo bugs across files
export const tasksKeys = {
  byProjectId: (projectId: string) => ["tasks/project", projectId] as const,
  markTaskCompleted: ["tasks/mark-completed"] as const,

  detail: (id: string) => ["projects", id] as const,
  details: (id: string | undefined) => ["projects", id, "details"] as const,
};

export function useTasksByProjectId(projectId: string | undefined) {
  return useQuery({
    queryKey: tasksKeys.byProjectId(projectId!),
    queryFn: () => getTasksByProjectId(projectId!),
    enabled: !!projectId,
  });
}

export function useMarkTaskCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: tasksKeys.markTaskCompleted,
    mutationFn: markTaskCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [projectKeys.details()[0]],
      });
    },
  });
}
