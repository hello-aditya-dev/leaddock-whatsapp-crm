/**
 * tests/storage.test.js — storage CRUD + subscribe + reset.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as storage from "../src/content/storage/storage.js";
import { createEmptyDb, SCHEMA_VERSION } from "../src/content/storage/schema.js";

async function fresh() {
  await storage.reset();
  return storage.load();
}

test("load() returns a migrated db with version", async () => {
  const db = await fresh();
  assert.equal(db.version, SCHEMA_VERSION);
  assert.ok(db.contacts);
  assert.ok(db.statuses);
  assert.ok(db.meta);
});

test("save() persists and notifies subscribers", async () => {
  await fresh();
  let notified = 0;
  const unsub = storage.subscribe(() => { notified++; });
  await new Promise((r) => setTimeout(r, 10));
  const before = notified;
  const db = await storage.load();
  db.contacts["x"] = { id: "x", name: "Test", phone: "" };
  await storage.save(db);
  assert.ok(notified > before, "subscriber was notified");
  unsub();
});

test("update() applies a mutator and saves", async () => {
  await fresh();
  await storage.update((db) => {
    db.contacts["c1"] = { id: "c1", name: "Alice", phone: "+1" };
    return db;
  });
  const db = await storage.load();
  assert.equal(db.contacts["c1"].name, "Alice");
});

test("reset() restores seeded defaults", async () => {
  await fresh();
  await storage.update((db) => { db.contacts["z"] = { id: "z" }; return db; });
  await storage.reset();
  const db = await storage.load();
  assert.equal(Object.keys(db.contacts).length, 0);
  assert.ok(Object.keys(db.statuses).length >= 7, "default statuses restored");
  assert.ok(Object.keys(db.tags).length >= 7, "default tags restored");
  assert.ok(Object.keys(db.replies).length >= 6, "default replies restored");
});

test("migrate() seeds an empty/null db into v1", async () => {
  const { migrate } = await import("../src/content/storage/migrations.js");
  const m = migrate(null);
  assert.equal(m.version, SCHEMA_VERSION);
  assert.ok(m.statuses["new_lead"]);
  assert.ok(m.meta.schemaMigrations.includes("seed-defaults-v1"));
});

test("createEmptyDb() seeds canonical statuses/tags/replies", () => {
  const db = createEmptyDb();
  const statusNames = Object.values(db.statuses).map((s) => s.name);
  assert.ok(statusNames.includes("New Lead"));
  assert.ok(statusNames.includes("Won"));
  assert.ok(statusNames.includes("Lost"));
  assert.ok(Object.values(db.tags).some((t) => t.name === "Hot"));
  assert.ok(Object.values(db.replies).some((r) => r.shortcut === "/price"));
});
