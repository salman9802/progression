import { SQLiteDatabase } from "expo-sqlite";

type TMigration = {
  version: number;
  up: (db: SQLiteDatabase) => void;
};

export const migrations: TMigration[] = [
  {
    version: 1,
    up: (db) => {
      db.execSync(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                color TEXT NOT NULL,
                position INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY NOT NULL,

                project_id TEXT NOT NULL REFERENCES projects(id) ON UPDATE CASCADE ON DELETE CASCADE,
                parent_id TEXT REFERENCES tasks(id) ON UPDATE CASCADE ON DELETE CASCADE,
                
                name TEXT NOT NULL,
                description TEXT,
                estimated_seconds INTEGER,
                elapsed_seconds INTEGER NOT NULL DEFAULT 0,
                timer_started_at INTEGER DEFAULT NULL,
                position INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
            CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_id);
            `);
    },
  },
];
