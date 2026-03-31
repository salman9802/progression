/*
 * Schema file containing types mirroring database tables
 */

export type TProject = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  position: number;
  created_at: number;
  updated_at: number;
};

export type TProjectDetails = TProject & {
  task_count: number;
  total_estimated_seconds: number;
  total_elapsed_seconds: number;
  // convenience — computed from the above
  total_estimated_minutes: number;
  total_elapsed_minutes: number;
};

export type TTask = {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  estimated_seconds: number;
  elapsed_seconds: number;
  timer_started_at: number | null;
  position: number;
  created_at: number;
  updated_at: number;
};
