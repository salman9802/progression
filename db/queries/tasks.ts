import { getDb } from "../index";

import { TTask, TTaskDetails } from "../schema";

// ------------------------- Read -------------------------

// NOTE: Improve this query computing subtree
//NOTE: Improve this query by computing separate estimations for itself and children (show in UI as well)
export function getTasksByProjectId(projectId: string): TTaskDetails[] {
  // const row = getDb().getAllSync<TTaskDetails>(
  //   `SELECT * FROM tasks WHERE project_id = ? AND parent_id IS NULL ORDER BY position ASC, created_at ASC`,
  //   [projectId],
  // );
  const rows = getDb().getAllSync<TTaskDetails>(
    `
    SELECT
      t.*,
      (SELECT COUNT(*) FROM tasks child WHERE child.parent_id = t.id) AS direct_children_count,
      (SELECT COUNT(*)
        FROM tasks child
        WHERE child.parent_id = t.id
        AND child.completed = 1) AS completed_direct_children_count,
      (WITH RECURSIVE descendants AS (
        SELECT id FROM tasks WHERE parent_id = t.id
        UNION ALL
        SELECT child.id FROM tasks child
        INNER JOIN descendants d ON child.parent_id = d.id
        )
        SELECT COUNT(*) FROM descendants) AS total_descendant_count,
        (WITH RECURSIVE descendants AS (
          SELECT id, completed FROM tasks WHERE parent_id = t.id
          UNION ALL
          SELECT child.id, child.completed FROM tasks child
          INNER JOIN descendants d ON child.parent_id = d.id
        )
        SELECT COUNT(*) FROM descendants WHERE completed = 1) AS completed_descendant_count,
        (WITH RECURSIVE descendants AS (
          SELECT id, estimated_seconds FROM tasks WHERE parent_id = t.id
          UNION ALL
          SELECT child.id, child.estimated_seconds FROM tasks child
          INNER JOIN descendants d ON child.parent_id = d.id
        )
        SELECT COALESCE(SUM(estimated_seconds), 0) FROM descendants) AS children_estimated_seconds,
        (WITH RECURSIVE descendants AS (
          SELECT id, elapsed_seconds FROM tasks WHERE parent_id = t.id
          UNION ALL
          SELECT child.id, child.elapsed_seconds FROM tasks child
          INNER JOIN descendants d ON child.parent_id = d.id
        )
        SELECT COALESCE(SUM(elapsed_seconds), 0) FROM descendants) AS children_elapsed_seconds
      FROM tasks t
      WHERE t.project_id = ?
      ORDER BY t.position ASC, t.created_at ASC
    `,
    [projectId],
  );
  return rows.map((r) => ({
    ...r,
    estimated_minutes: Math.floor(r.estimated_seconds / 60),
    elapsed_minutes: r.elapsed_seconds ? Math.floor(r.elapsed_seconds / 60) : 0,
    children_estimated_minutes: r.children_estimated_seconds
      ? Math.floor(r.children_estimated_seconds / 60)
      : 0,
    children_elapsed_minutes: r.children_elapsed_seconds
      ? Math.floor(r.children_elapsed_seconds / 60)
      : 0,
    total_elapsed_seconds:
      r.children_elapsed_seconds != null && r.elapsed_seconds != null
        ? r.children_elapsed_seconds + r.elapsed_seconds
        : 0,
    total_estimated_seconds:
      r.children_estimated_seconds != null && r.estimated_seconds != null
        ? r.children_estimated_seconds + r.estimated_seconds
        : 0,
  }));
}

export async function getTaskDetailsByTaskId(
  id: string | undefined,
): Promise<TTaskDetails | null> {
  if (id == undefined) return null;
  const row = getDb().getFirstSync<TTaskDetails>(
    `WITH RECURSIVE subtree AS (
      SELECT id, parent_id, estimated_seconds, elapsed_seconds, completed
      FROM tasks WHERE id = ?
      UNION ALL
      SELECT child.id, child.parent_id, child.estimated_seconds, child.elapsed_seconds, child.completed
      FROM tasks child
      INNER JOIN subtree parent ON child.parent_id = parent.id
    )
    SELECT
      t.*,
      (SELECT COUNT(*)
        FROM subtree WHERE id != ?)                                     AS subtask_count,
      (SELECT SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END)
        FROM subtree WHERE id != ?)                                     AS completed_subtask_count,
      (SELECT COALESCE(SUM(estimated_seconds), 0) FROM subtree)        AS total_estimated_seconds,
      (SELECT COALESCE(SUM(elapsed_seconds), 0) FROM subtree)          AS total_elapsed_seconds
    FROM tasks t
    WHERE t.id = ?`,
    [id, id, id, id],
  );

  if (!row) return null;

  return {
    ...row,
    estimated_minutes: Math.floor(row.estimated_seconds / 60),
    elapsed_minutes: Math.floor(row.elapsed_seconds / 60),
  };
}

//NOTE: Improve this query by computing separate estimations for itself and children (show in UI as well)
export function getTasksByTaskId(taskId: string): TTaskDetails[] {
  // const rows = getDb().getAllSync<TTaskDetails>(
  //   `SELECT * FROM tasks WHERE parent_id = ? ORDER BY position ASC, created_at ASC`,
  //   [taskId],
  // );
  const rows = getDb().getAllSync<TTaskDetails>(
    `
    SELECT
      t.*,
      (SELECT COUNT(*) FROM tasks child WHERE child.parent_id = t.id) AS direct_children_count,
      (SELECT COUNT(*)
        FROM tasks child
        WHERE child.parent_id = t.id
        AND child.completed = 1) AS completed_direct_children_count,
      (WITH RECURSIVE descendants AS (
        SELECT id FROM tasks WHERE parent_id = t.id
        UNION ALL
        SELECT child.id FROM tasks child
        INNER JOIN descendants d ON child.parent_id = d.id
        )
        SELECT COUNT(*) FROM descendants) AS total_descendant_count,
        (WITH RECURSIVE descendants AS (
          SELECT id, completed FROM tasks WHERE parent_id = t.id
          UNION ALL
          SELECT child.id, child.completed FROM tasks child
          INNER JOIN descendants d ON child.parent_id = d.id
        )
        SELECT COUNT(*) FROM descendants WHERE completed = 1) AS completed_descendant_count,
        (WITH RECURSIVE descendants AS (
          SELECT id, estimated_seconds FROM tasks WHERE parent_id = t.id
          UNION ALL
          SELECT child.id, child.estimated_seconds FROM tasks child
          INNER JOIN descendants d ON child.parent_id = d.id
        )
        SELECT COALESCE(SUM(estimated_seconds), 0) FROM descendants) AS children_estimated_seconds,
        (WITH RECURSIVE descendants AS (
          SELECT id, elapsed_seconds FROM tasks WHERE parent_id = t.id
          UNION ALL
          SELECT child.id, child.elapsed_seconds FROM tasks child
          INNER JOIN descendants d ON child.parent_id = d.id
        )
        SELECT COALESCE(SUM(elapsed_seconds), 0) FROM descendants) AS children_elapsed_seconds
      FROM tasks t
      WHERE t.parent_id = ?
      ORDER BY t.position ASC, t.created_at ASC
    `,
    [taskId],
  );
  return rows.map((r) => ({
    ...r,
    estimated_minutes: r.estimated_seconds
      ? Math.floor(r.estimated_seconds / 60)
      : 0,
    elapsed_minutes: r.elapsed_seconds
      ? r.elapsed_seconds
        ? Math.floor(r.elapsed_seconds / 60)
        : 0
      : 0,
    children_estimated_minutes: r.children_estimated_seconds
      ? Math.floor(r.children_estimated_seconds / 60)
      : 0,
    children_elapsed_minutes: r.children_elapsed_seconds
      ? Math.floor(r.children_elapsed_seconds / 60)
      : 0,
    total_elapsed_seconds:
      r.children_elapsed_seconds != null && r.elapsed_seconds != null
        ? r.children_elapsed_seconds + r.elapsed_seconds
        : 0,
    total_estimated_seconds:
      r.children_estimated_seconds != null && r.estimated_seconds != null
        ? r.children_estimated_seconds + r.estimated_seconds
        : 0,
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

export async function updateTask({
  id,
  payload,
}: {
  id: string;
  payload: Partial<TTask>;
}) {
  const values = Object.entries(payload);
  if (values.length === 0) return;

  const updateStmt = values
    .map(
      (value) =>
        `${value[0]} = ${value[1] === null ? "NULL" : `'${value[1]}'`}`,
    )
    .join(",");
  // const data = values.map((value) => value[1]);

  getDb().execSync(`UPDATE tasks SET ${updateStmt} WHERE id = '${id}'`);
}

export async function startTimer(id: string) {
  getDb().execSync(
    `UPDATE tasks SET timer_started_at = '${Date.now()}' WHERE id = '${id}'`,
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
