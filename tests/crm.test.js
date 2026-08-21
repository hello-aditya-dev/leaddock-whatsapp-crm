/**
 * tests/crm.test.js — contacts, notes, tags, statuses, follow-ups, search.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as storage from "../src/content/storage/storage.js";
import * as contacts from "../src/content/crm/contacts.js";
import * as notes from "../src/content/crm/notes.js";
import * as tags from "../src/content/crm/tags.js";
import * as statuses from "../src/content/crm/statuses.js";
import * as followups from "../src/content/crm/followups.js";
import { dueState, addDays } from "../src/content/utils/dates.js";

async function fresh() {
  await storage.reset();
  return storage.load();
}

test("contacts.create + get", async () => {
  await fresh();
  const c = await contacts.create({ name: "Rahul", phone: "+910000000001", statusId: "new_lead" });
  assert.ok(c.id);
  const got = await contacts.get(c.id);
  assert.equal(got.name, "Rahul");
});

test("contacts.resolveOrCreate dedups by phone", async () => {
  await fresh();
  const a = await contacts.resolveOrCreate({ name: "Rahul", phone: "+910000000001" });
  const b = await contacts.resolveOrCreate({ name: "Rahul S", phone: "+910000000001" });
  assert.equal(a.id, b.id, "same contact reused");
  assert.equal(b.name, "Rahul S", "name updated");
});

test("contacts.toggleTag adds then removes", async () => {
  await fresh();
  const c = await contacts.create({ name: "X", phone: "+1", tagIds: [] });
  const added = await contacts.toggleTag(c.id, "tag_hot");
  assert.equal(added, true);
  let got = await contacts.get(c.id);
  assert.deepEqual(got.tagIds, ["tag_hot"]);
  const removed = await contacts.toggleTag(c.id, "tag_hot");
  assert.equal(removed, false);
  got = await contacts.get(c.id);
  assert.deepEqual(got.tagIds, []);
});

test("contacts.setStatus persists", async () => {
  await fresh();
  const c = await contacts.create({ name: "X", phone: "+1" });
  await contacts.setStatus(c.id, "won");
  const got = await contacts.get(c.id);
  assert.equal(got.statusId, "won");
});

test("contacts.search finds by name, phone, company, notes, tags", async () => {
  await fresh();
  const c = await contacts.create({ name: "Priya Patel", phone: "+912", company: "Patel Interiors", statusId: "interested", tagIds: ["tag_instagram"] });
  await notes.create(c.id, "Requested catalogue and installation details.");
  assert.ok((await contacts.search("priya")).length >= 1);
  assert.ok((await contacts.search("+912")).length >= 1);
  assert.ok((await contacts.search("interiors")).length >= 1);
  assert.ok((await contacts.search("catalogue")).length >= 1);
  assert.ok((await contacts.search("instagram")).length >= 1, "search matches tags");
  assert.equal((await contacts.search("nonexistent")).length, 0);
});

test("contacts.search filters by status and due", async () => {
  await fresh();
  await contacts.create({ name: "A", phone: "+1", statusId: "won" });
  const b = await contacts.create({ name: "B", phone: "+2", statusId: "follow_up", followUpDate: addDays(null, 0) });
  assert.equal((await contacts.search("", { statusId: "won" })).length, 1);
  const due = await contacts.search("", { due: true });
  assert.ok(due.some((c) => c.id === b.id));
});

test("notes.create + listForContact newest-first", async () => {
  await fresh();
  const c = await contacts.create({ name: "N", phone: "+1" });
  await notes.create(c.id, "first");
  await new Promise((r) => setTimeout(r, 5));
  await notes.create(c.id, "second");
  const list = await notes.listForContact(c.id);
  assert.equal(list.length, 2);
  assert.equal(list[0].text, "second", "newest first");
});

test("notes.update + remove", async () => {
  await fresh();
  const c = await contacts.create({ name: "N", phone: "+1" });
  const n = await notes.create(c.id, "hello");
  await notes.update(n.id, "hello edited");
  const got = await notes.listForContact(c.id);
  assert.equal(got[0].text, "hello edited");
  await notes.remove(n.id);
  assert.equal((await notes.listForContact(c.id)).length, 0);
});

test("notes.create rejects empty text", async () => {
  await fresh();
  const c = await contacts.create({ name: "N", phone: "+1" });
  await assert.rejects(() => notes.create(c.id, "   "));
});

test("tags.ensureByName is idempotent (case-insensitive)", async () => {
  await fresh();
  const a = await tags.ensureByName("VIP", "#fff");
  const b = await tags.ensureByName("vip");
  assert.equal(a.id, b.id);
});

test("tags.remove detaches from contacts", async () => {
  await fresh();
  const c = await contacts.create({ name: "X", phone: "+1", tagIds: ["tag_hot"] });
  await tags.remove("tag_hot");
  const got = await contacts.get(c.id);
  assert.deepEqual(got.tagIds, []);
});

test("statuses.list returns ordered", async () => {
  await fresh();
  const list = await statuses.list();
  assert.equal(list[0].id, "new_lead");
  assert.equal(list[list.length - 1].id, "lost");
});

test("followups.setForContact mirrors onto contact + dueFollowUps", async () => {
  await fresh();
  const c = await contacts.create({ name: "F", phone: "+1" });
  await followups.setForContact(c.id, addDays(null, 0));
  const got = await contacts.get(c.id);
  assert.ok(got.followUpDate);
  const due = await followups.dueFollowUps();
  assert.ok(due.some((f) => f.contactId === c.id));
});

test("followups.markDone clears contact followUpDate", async () => {
  await fresh();
  const c = await contacts.create({ name: "F", phone: "+1" });
  await followups.setForContact(c.id, addDays(null, 0));
  const list = await followups.listForContact(c.id);
  await followups.markDone(list[0].id);
  const got = await contacts.get(c.id);
  assert.equal(got.followUpDate, null);
});

test("dueState classifies correctly", () => {
  assert.equal(dueState(addDays(null, -1)), "overdue");
  assert.equal(dueState(addDays(null, 0)), "due-today");
  assert.equal(dueState(addDays(null, 3)), "upcoming");
  assert.equal(dueState(null), "none");
});
