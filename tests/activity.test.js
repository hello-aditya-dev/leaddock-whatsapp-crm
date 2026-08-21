/**
 * tests/activity.test.js — activity timeline CRUD + event recording.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as storage from "../src/content/storage/storage.js";
import * as activity from "../src/content/crm/activity.js";
import * as contacts from "../src/content/crm/contacts.js";
import * as notes from "../src/content/crm/notes.js";

async function fresh() {
  await storage.reset();
  return storage.load();
}

test("record + listForContact returns newest-first", async () => {
  await fresh();
  const c = await contacts.create({ name: "A", phone: "+1" });
  // contacts.create auto-records a "contact_created" event.
  await new Promise((r) => setTimeout(r, 5));
  await activity.record(c.id, "note_added", { detail: "hello" });
  const list = await activity.listForContact(c.id);
  assert.equal(list.length, 2);
  assert.equal(list[0].type, "note_added", "newest first");
  assert.equal(list[1].type, "contact_created");
});

test("labelFor maps known types", () => {
  assert.equal(activity.labelFor("status_changed"), "Status changed");
  assert.equal(activity.labelFor("note_added"), "Note added");
  assert.equal(activity.labelFor("tag_added"), "Tag added");
  assert.equal(activity.labelFor("reply_inserted"), "Quick reply inserted");
  assert.equal(activity.labelFor("unknown_type"), "unknown_type");
});

test("activity is recorded when a contact status changes", async () => {
  await fresh();
  const c = await contacts.create({ name: "S", phone: "+1", statusId: "new_lead" });
  await contacts.setStatus(c.id, "won");
  const list = await activity.listForContact(c.id);
  const statusEvent = list.find((a) => a.type === "status_changed");
  assert.ok(statusEvent, "status change recorded");
  assert.equal(statusEvent.label, "Won");
});

test("activity is recorded when a note is added", async () => {
  await fresh();
  const c = await contacts.create({ name: "N", phone: "+1" });
  await notes.create(c.id, "Important detail");
  const list = await activity.listForContact(c.id);
  assert.ok(list.some((a) => a.type === "note_added"));
});

test("activity is recorded when a tag is toggled", async () => {
  await fresh();
  const c = await contacts.create({ name: "T", phone: "+1", tagIds: [] });
  await contacts.toggleTag(c.id, "tag_hot");
  let list = await activity.listForContact(c.id);
  assert.ok(list.some((a) => a.type === "tag_added" && a.label === "Hot"));
  await contacts.toggleTag(c.id, "tag_hot");
  list = await activity.listForContact(c.id);
  assert.ok(list.some((a) => a.type === "tag_removed"));
});

test("activity is cleared when a contact is deleted", async () => {
  await fresh();
  const c = await contacts.create({ name: "D", phone: "+1" });
  await notes.create(c.id, "note");
  await contacts.remove(c.id);
  const list = await activity.listForContact(c.id);
  assert.equal(list.length, 0);
});

test("per-contact activity is capped at 100 events", async () => {
  await fresh();
  const c = await contacts.create({ name: "Cap", phone: "+1" });
  for (let i = 0; i < 110; i++) {
    await activity.record(c.id, "note_added", { detail: "n" + i });
  }
  const list = await activity.listForContact(c.id, 200);
  // contacts.create auto-records 1 "contact_created", so total would be 111
  // without the cap. The cap limits to the 100 most recent by timestamp.
  assert.ok(list.length <= 100, `capped at 100, got ${list.length}`);
  assert.ok(list.length >= 99, `should retain ~100 events, got ${list.length}`);
});

test("recent() returns cross-contact activity newest-first", async () => {
  await fresh();
  const a = await contacts.create({ name: "A1", phone: "+1" });
  const b = await contacts.create({ name: "B1", phone: "+2" });
  await new Promise((r) => setTimeout(r, 5));
  await activity.record(a.id, "note_added");
  await new Promise((r) => setTimeout(r, 5));
  await activity.record(b.id, "status_changed");
  const r = await activity.recent();
  // contacts.create auto-records "contact_created" for each, so expect 4 total.
  assert.equal(r.length, 4);
  assert.equal(r[0].type, "status_changed", "newest first (manually recorded)");
  assert.equal(r[1].type, "note_added", "second newest");
});

test("activity collection is part of backups", async () => {
  await fresh();
  const c = await contacts.create({ name: "BK", phone: "+1" });
  await notes.create(c.id, "note for backup");
  const { exportBackup, restoreBackup, validateBackupPayload } = await import("../src/content/crm/data.js");
  const backup = await exportBackup();
  assert.ok(backup.data.activity, "activity in backup");
  assert.ok(Object.keys(backup.data.activity).length > 0, "activity records present");
  // round-trip
  await storage.reset();
  await restoreBackup(backup);
  const list = await activity.listForContact(c.id);
  assert.ok(list.length > 0, "activity restored");
});
