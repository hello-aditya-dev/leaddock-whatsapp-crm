/**
 * storage.js — versioned storage facade over chrome.storage.local.
 *
 * Provides a swappable backend so the same code runs in the extension
 * (chrome.storage) and in Node tests (in-memory map). The CRM modules and
 * UI import `storage` and call load()/save() — they never touch chrome.* directly.
 *
 * Change notification: storage emits via a tiny pub/sub so the UI can refresh
 * when data changes (including from other tabs via chrome.storage.onChanged).
 */

import { STORAGE_KEY, SCHEMA_VERSION, createEmptyDb } from "./schema.js";
import { migrate } from "./migrations.js";

/**
 * Legacy storage keys. If a user upgrades from a previous product identity
 * (the pre-rebrand "WaFlow" build), we migrate their data into the new
 * LeadDock key on first load so no CRM records are lost. We then remove the
 * legacy key to avoid double-storage.
 */
const LEGACY_KEYS = ["waflow.db.v1"];

/**
 * Backend abstraction. The real chrome.storage.local is used when available;
 * otherwise an in-memory map is used (tests + non-extension contexts).
 */
function createBackend() {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    return {
      kind: "chrome",
      async get(key) {
        return new Promise((resolve) => {
          chrome.storage.local.get(key, (res) => resolve(res || {}));
        });
      },
      async set(obj) {
        return new Promise((resolve) => {
          chrome.storage.local.set(obj, () => resolve(true));
        });
      },
      onChanged(cb) {
        if (chrome.storage.onChanged) {
          chrome.storage.onChanged.addListener((changes, area) => {
            if (area === "local" && changes[STORAGE_KEY]) {
              cb(changes[STORAGE_KEY].newValue, changes[STORAGE_KEY].oldValue);
            }
          });
        }
      },
    };
  }
  // In-memory backend (tests, options page preview).
  const mem = {};
  const listeners = [];
  return {
    kind: "memory",
    async get(key) {
      return key in mem ? { [key]: mem[key] } : {};
    },
    async set(obj) {
      for (const k of Object.keys(obj)) mem[k] = obj[k];
      for (const l of listeners) l(obj);
      return true;
    },
    onChanged(cb) {
      listeners.push(cb);
    },
  };
}

const backend = createBackend();

/** In-process pub/sub for the UI layer. */
const subscribers = new Set();
function notify(db) {
  for (const fn of subscribers) {
    try {
      fn(db);
    } catch (err) {
      console.warn("[leaddock:storage] subscriber threw", err);
    }
  }
}

let cache = null;
let loadingPromise = null;

/**
 * Load the full DB, running migrations if needed.
 * @returns {Promise<object>}
 */
export async function load() {
  if (cache) return cache;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    try {
      let res = await backend.get(STORAGE_KEY);
      let raw = res && res[STORAGE_KEY];
      // Legacy key migration: if the new key is empty but a legacy key has
      // data (from the pre-rebrand "WaFlow" build), adopt it verbatim.
      if (!raw) {
        for (const legacyKey of LEGACY_KEYS) {
          const legacy = await backend.get(legacyKey);
          if (legacy && legacy[legacyKey]) {
            raw = legacy[legacyKey];
            // Persist under the new key, then best-effort remove the legacy key.
            try {
              await backend.set({ [STORAGE_KEY]: raw });
              if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
                chrome.storage.local.remove(legacyKey);
              }
            } catch (e) {
              // non-fatal — data is already adopted under the new key.
            }
            break;
          }
        }
      }
      const db = migrate(raw || null);
      // Ensure key collections exist defensively.
      db.contacts = db.contacts || {};
      db.notes = db.notes || {};
      db.replies = db.replies || {};
      db.tags = db.tags || {};
      db.statuses = db.statuses || {};
      db.followUps = db.followUps || {};
      db.activity = db.activity || {};
      db.settings = db.settings || {};
      db.meta = db.meta || {};
      db.meta.lastSeenAt = new Date().toISOString();
      cache = db;
      // Persist migrated shape if it changed.
      if (!raw || raw.version !== SCHEMA_VERSION) {
        await backend.set({ [STORAGE_KEY]: db });
      } else {
        await backend.set({ [STORAGE_KEY]: db });
      }
      return db;
    } catch (err) {
      console.warn("[leaddock:storage] load failed, using empty db", err);
      cache = createEmptyDb();
      return cache;
    } finally {
      loadingPromise = null;
    }
  })();
  const db = await loadingPromise;
  return db;
}

/**
 * Persist the full DB and notify subscribers.
 * @param {object} db
 * @returns {Promise<object>}
 */
export async function save(db) {
  if (!db || typeof db !== "object") throw new Error("save() requires a db object");
  db.version = SCHEMA_VERSION;
  db.meta = db.meta || {};
  db.meta.lastSeenAt = new Date().toISOString();
  cache = db;
  await backend.set({ [STORAGE_KEY]: db });
  notify(db);
  return db;
}

/**
 * Update the DB via a pure-ish mutator function. Loads, applies, saves, notifies.
 * @param {(db:object)=>object} fn  must return the (mutated) db object
 * @returns {Promise<object>}
 */
export async function update(fn) {
  const db = await load();
  const next = fn(db) || db;
  return save(next);
}

/**
 * Subscribe to DB changes (local + cross-tab). Returns an unsubscribe fn.
 * @param {(db:object)=>void} cb
 * @returns {()=>void}
 */
export function subscribe(cb) {
  subscribers.add(cb);
  // Cross-tab listener (no-op in memory backend).
  backend.onChanged((_nv, _ov) => {
    // Invalidate cache so next load() reads fresh.
    cache = null;
    load().then(notify).catch(() => {});
  });
  // Immediate hydrate.
  load().then(cb).catch(() => {});
  return () => subscribers.delete(cb);
}

/** Replace the entire DB (used by restore). Skips migration (assumes validated). */
export async function replace(db) {
  db.version = SCHEMA_VERSION;
  cache = db;
  await backend.set({ [STORAGE_KEY]: db });
  notify(db);
  return db;
}

/** Reset to an empty seeded DB. */
export async function reset() {
  const fresh = createEmptyDb();
  return replace(fresh);
}

/** Expose backend kind for diagnostics. */
export function backendKind() {
  return backend.kind;
}

export default { load, save, update, subscribe, replace, reset, backendKind };
