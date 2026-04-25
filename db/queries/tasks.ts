import { getDb } from "../index";

import { TTask } from "../schema";

// ------------------------- Read -------------------------

export function getTasksByProjectId(projectId: string): TTask[] {
  return getDb().getAllSync<TTask>(
    `SELECT * FROM tasks WHERE project_id = ? ORDER BY position ASC, created_at ASC`,
    [projectId],
  );
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
