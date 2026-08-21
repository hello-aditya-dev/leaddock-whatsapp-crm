/**
 * migrations.js — schema migration runner.
 *
 * Migrations are pure functions: (db) => db. They run in order on load if the
 * stored version is older than SCHEMA_VERSION. Each migration records its name
 * in `meta.schemaMigrations` so we can audit what was applied.
 *
 * Migrations MUST be idempotent where practical and never destroy user data
 * silently. Unknown/missing collections are seeded from defaults.
 */

import { SCHEMA_VERSION, createEmptyDb } from "./schema.js";

/**
 * Ordered list of migrations indexed by the version they upgrade TO.
 * migrations[1] upgrades a v0/unknown db into v1 (seed defaults).
 * Add migrations[2], [3]... as the schema evolves.
 */
export const MIGRATIONS = [
  {
    to: 1,
    name: "seed-defaults-v1",
    run(db) {
      const base = createEmptyDb({ now: (db && db.meta && db.meta.createdAt) || undefined });
      // Merge: keep any existing user collections, ensure all top-level keys exist.
      const merged = {
        version: 1,
        contacts: Object.assign({}, base.contacts, (db && db.contacts) || {}),
        notes: Object.assign({}, base.notes, (db && db.notes) || {}),
        replies: Object.assign({}, base.replies, (db && db.replies) || {}),
        tags: Object.assign({}, base.tags, (db && db.tags) || {}),
        statuses: Object.assign({}, base.statuses, (db && db.statuses) || {}),
        followUps: Object.assign({}, base.followUps, (db && db.followUps) || {}),
        activity: Object.assign({}, base.activity, (db && db.activity) || {}),
        settings: Object.assign({}, base.settings, (db && db.settings) || {}),
        meta: Object.assign({}, base.meta, (db && db.meta) || {}),
      };
      return merged;
    },
  },
];

/**
 * Run pending migrations to bring `db` up to SCHEMA_VERSION.
 * Returns a new db object. If db is null/undefined/corrupt, a fresh empty db is used.
 * @param {object|null|undefined} db
 * @returns {object}
 */
export function migrate(db) {
  let current = db;
  if (!current || typeof current !== "object" || Array.isArray(current)) {
    // Unknown/corrupt/missing db: start from a minimal v0 shell so the seed
    // migration runs formally and records itself in the audit trail.
    current = { version: 0, meta: { schemaMigrations: [] } };
  }
  let version = Number(current.version) || 0;
  if (version >= SCHEMA_VERSION) {
    // Already current; ensure meta has the audit list.
    current.meta = current.meta || {};
    if (!Array.isArray(current.meta.schemaMigrations)) {
      current.meta.schemaMigrations = [];
    }
    current.version = SCHEMA_VERSION;
    return current;
  }

  const applied = Array.isArray(current.meta && current.meta.schemaMigrations)
    ? current.meta.schemaMigrations.slice()
    : [];

  for (const m of MIGRATIONS) {
    if (version < m.to) {
      try {
        current = m.run(current) || current;
        current.version = m.to;
        if (!applied.includes(m.name)) applied.push(m.name);
      } catch (err) {
        console.warn(`[leaddock:migrations] migration ${m.name} failed`, err);
        // On migration failure, fall back to a seeded DB preserving nothing
        // (user can restore from backup). Safer than serving a half-migrated DB.
        const fresh = createEmptyDb();
        fresh.meta.schemaMigrations = applied;
        fresh.meta.lastMigrationError = m.name;
        return fresh;
      }
    }
  }

  current.meta = current.meta || {};
  current.meta.schemaMigrations = applied;
  current.version = SCHEMA_VERSION;
  return current;
}

export default { migrate, MIGRATIONS };
