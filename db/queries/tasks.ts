import { getDb } from "../index";

import { TTask, TTaskDetails } from "../schema";

// ------------------------- Read -------------------------

export function getTasksByProjectId(projectId: string): TTaskDetails[] {
  const row = getDb().getAllSync<TTask>(
    `SELECT * FROM tasks WHERE project_id = ? ORDER BY position ASC, created_at ASC`,
    [projectId],
  );
  return row.map((r) => ({
    ...r,
    estimated_minutes: Math.floor(r.estimated_seconds / 60),
    elapsed_minutes: r.elapsed_seconds ? Math.floor(r.elapsed_seconds / 60) : 0,
  }));
}

// ------------------------- Update -------------------------

export async function markTaskCompleted({
  id,
  completed,
}: {
  id: string | undefined;
  completed: 0 | 1;
}) {
  if (id === undefined)
    throw new Error(
      "Error: undefined `id` passed to `markTaskCompleted` mutation fn",
    );

  getDb().execSync(
    `UPDATE tasks SET completed = ${completed} WHERE id = '${id}'`,
  );
}

export async function startTimer(id: string) {
  getDb().execSync(
    `UPDATE tasks SET timer_started_at = CURRENT_UNIX_TIMESTAMP WHERE id = '${id}'`,
  );
}

export async function stopTimer({
  id,
  elapsed,
}: {
  id: string;
  elapsed: number;
}) {
  const elapsedSeconds = Math.floor(elapsed / 1000);

  getDb().execSync(
    `UPDATE tasks SET elapsed_seconds = elapsed_seconds + ${elapsedSeconds}, timer_started_at = NULL WHERE id = '${id}'`,
  );
}
