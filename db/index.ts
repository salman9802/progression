import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite";
import { migrations } from "./migrations";

let _db: SQLiteDatabase | null = null;

/* Get db (singular instance) */
export function getDb(): SQLiteDatabase {
  if (!_db)
    throw new Error(
      "DB Error: Database not initialized. Call 'initDb()' first."
    );
  return _db;
}

/* Initialize database and run pending migrations (depends on version) */
export async function initDb(): Promise<void> {
  const db = openDatabaseSync("progression.db");

  // Enable WAL mode — better performance for concurrent reads
  db.execSync("PRAGMA journal_mode = WAL;");
  // Enforce foreign keys — SQLite disables them by default
  db.execSync("PRAGMA foreign_keys = ON;");

  const currentVersion =
    db.getFirstSync<{ user_version: number }>("PRAGMA user_version;")
      ?.user_version ?? 0;

  const pending = migrations.filter((m) => m.version > currentVersion);

  if (pending.length > 0) {
    // Run all pending migrations inside a single transaction
    // If anything fails, the whole thing rolls back — DB stays consistent
    db.withTransactionSync(() => {
      for (const migration of pending) {
        console.log(`Running migration v${migration.version}`);
        migration.up(db);
      }
      const latestVersion = pending[pending.length - 1].version;
      db.execSync(`PRAGMA user_version = ${latestVersion};`);
    });
  }

  _db = db;
}
