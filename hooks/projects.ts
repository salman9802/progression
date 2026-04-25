import {
  createProject,
  CreateProjectInput,
  deleteProject,
  getProjectById,
  getProjectDetails,
  getProjects,
  updateProject,
} from "@/db/queries/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys in one place — avoids typo bugs across files
export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
  details: (id?: string | undefined) => ["projects-details", id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: getProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProjectById(id),
  });
}

export function useProjectDetails(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.details(id),
    queryFn: () => getProjectDetails(id),
    enabled: !!id, // don't run if id is empty/undefined
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      Promise.resolve(createProject(input)),
    onSuccess: () => {
      // Invalidate the projects list so it refetches
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof updateProject>[1];
    }) => Promise.resolve(updateProject(id, input)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Promise.resolve(deleteProject(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
