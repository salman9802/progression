import { getDb } from "../index";
import { TProject, TProjectDetails } from "../schema";

// ─── READ ────────────────────────────────────────────────

export function getProjects(): TProject[] {
  return getDb().getAllSync<TProject>(
    `SELECT * FROM projects ORDER BY position ASC, created_at ASC`,
  );
}

export function getProjectById(id: string): TProject | null {
  return (
    getDb().getFirstSync<TProject>(`SELECT * FROM projects WHERE id = ?`, [
      id,
    ]) ?? null
  );
}

export async function getProjectDetails(
  id: string | undefined,
): Promise<TProjectDetails | null> {
  if (id == undefined) return null;
  const row = getDb().getFirstSync<
    Omit<TProjectDetails, "total_estimated_minutes" | "total_elapsed_minutes">
  >(
    `SELECT
      p.*,
      COUNT(t.id)                             AS task_count,
      SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) AS completed_task_count,
      COALESCE(SUM(t.estimated_seconds), 0)   AS total_estimated_seconds,
      COALESCE(SUM(t.elapsed_seconds), 0)     AS total_elapsed_seconds
    FROM projects p
    LEFT JOIN (
      WITH RECURSIVE all_tasks AS (
        SELECT id, project_id, estimated_seconds, elapsed_seconds, completed
        FROM tasks WHERE project_id = ?
        UNION ALL
        SELECT child.id, child.project_id, child.estimated_seconds, child.elapsed_seconds, child.completed
        FROM tasks child
        INNER JOIN all_tasks a ON child.parent_id = a.id
      )
      SELECT * FROM all_tasks
    ) t ON t.project_id = p.id
    WHERE p.id = ?
    GROUP BY p.id`,
    [id, id],
  );

  if (!row) return null;

  return {
    ...row,
    total_estimated_minutes: Math.floor(row.total_estimated_seconds / 60),
    total_elapsed_minutes: Math.floor(row.total_elapsed_seconds / 60),
  };
}

// ─── CREATE ──────────────────────────────────────────────

export type CreateProjectInput = {
  name: string;
  description?: string;
  color?: string;
};

export function createProject(input: CreateProjectInput): TProject {
  const id = crypto.randomUUID();
  const now = Date.now();

  // Put new projects at the end of the list
  const last = getDb().getFirstSync<{ max_position: number | null }>(
    `SELECT MAX(position) as max_position FROM projects`,
  );
  const position = (last?.max_position ?? -1) + 1;

  getDb().runSync(
    `INSERT INTO projects (id, name, description, color, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.description ?? null,
      input.color ?? null,
      position,
      now,
      now,
    ],
  );

  return getProjectById(id)!;
}

// ─── UPDATE ──────────────────────────────────────────────

type UpdateProjectInput = Partial<
  Pick<TProject, "name" | "description" | "color" | "position">
>;

export function updateProject(id: string, input: UpdateProjectInput): TProject {
  const fields = Object.keys(input) as (keyof UpdateProjectInput)[];

  if (fields.length === 0) return getProjectById(id)!;

  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => input[f] ?? null);

  getDb().runSync(
    `UPDATE projects SET ${setClauses}, updated_at = ? WHERE id = ?`,
    [...values, Date.now(), id],
  );

  return getProjectById(id)!;
}

// ─── DELETE ──────────────────────────────────────────────

export function deleteProject(id: string): void {
  // Tasks are deleted automatically via ON DELETE CASCADE
  getDb().runSync(`DELETE FROM projects WHERE id = ?`, [id]);
}
