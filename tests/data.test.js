/**
 * tests/data.test.js — CSV import/export round trip, backup validation, reset.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as storage from "../src/content/storage/storage.js";
import * as data from "../src/content/crm/data.js";
import * as demo from "../src/content/crm/demo.js";
import * as contacts from "../src/content/crm/contacts.js";

async function fresh() {
  await storage.reset();
  return storage.load();
}

test("exportContactsCsv produces header + rows", async () => {
  await fresh();
  await contacts.create({ name: "Test User", phone: "+1", company: "Co" });
  const csv = await data.exportContactsCsv();
  assert.ok(csv.startsWith("name,phone,company"));
  assert.ok(csv.includes("Test User"));
});

test("previewImportCsv parses + validates", async () => {
  await fresh();
  const csv = "name,phone,company,status,tags\nAlice,+1,Acme,New Lead,Hot\n,,,\nBob,+2,Co,Won,\n";
  const preview = await data.previewImportCsv(csv);
  assert.equal(preview.summary.totalRows, 3);
  assert.equal(preview.summary.valid, 2); // one blank row skipped
  assert.equal(preview.rows[0].contact.name, "Alice");
  assert.equal(preview.rows[0].contact.statusId, "new_lead");
  assert.deepEqual(preview.rows[0].contact.tagIds, ["tag_hot"]);
});

test("commitImport writes contacts + notes atomically", async () => {
  await fresh();
  const csv = "name,phone,company,status,tags,notes\nAlice,+1,Acme,New Lead,Hot,Wants quote\n";
  const preview = await data.previewImportCsv(csv);
  const n = await data.commitImport(preview.rows);
  assert.equal(n, 1);
  const db = await storage.load();
  assert.equal(Object.keys(db.contacts).length, 1);
  assert.equal(Object.keys(db.notes).length, 1);
});

test("export→import round trip preserves core fields", async () => {
  await fresh();
  await contacts.create({ name: "Round Trip", phone: "+999", company: "RT", statusId: "won" });
  const csv = await data.exportContactsCsv();
  await storage.reset();
  const preview = await data.previewImportCsv(csv);
  await data.commitImport(preview.rows);
  const found = await contacts.search("Round Trip");
  assert.equal(found.length, 1);
  assert.equal(found[0].company, "RT");
});

test("validateBackup rejects non-waflow payloads", () => {
  const v = data.validateBackupPayload({ app: "other", version: 1 });
  assert.equal(v.ok, false);
  const v2 = data.validateBackupPayload({ app: "waflow", version: 1, data: {} });
  assert.equal(v2.ok, true);
});

test("validateBackup rejects bad version", () => {
  const v = data.validateBackupPayload({ app: "waflow", version: 0, data: {} });
  assert.equal(v.ok, false);
});

test("exportBackup→restoreBackup round trip", async () => {
  await fresh();
  await contacts.create({ name: "Backup Test", phone: "+1", statusId: "interested" });
  const backup = await data.exportBackup();
  assert.equal(backup.app, "waflow");
  await storage.reset();
  await data.restoreBackup(backup);
  const found = await contacts.search("Backup Test");
  assert.equal(found.length, 1);
  assert.equal(found[0].statusId, "interested");
});

test("restoreBackup rejects tampered payload", async () => {
  await fresh();
  await assert.rejects(() => data.restoreBackup({ app: "nope", version: 1 }));
});

test("resetAll clears contacts", async () => {
  await fresh();
  await contacts.create({ name: "X", phone: "+1" });
  await data.resetAll();
  const db = await storage.load();
  assert.equal(Object.keys(db.contacts).length, 0);
});

test("demo.loadDemo seeds 5 fictional contacts", async () => {
  await fresh();
  await demo.loadDemo();
  const db = await storage.load();
  assert.equal(Object.keys(db.contacts).length, 5);
  assert.ok(db.meta.demoLoaded, "demoLoaded flag set");
  const names = Object.values(db.contacts).map((c) => c.name);
  assert.ok(names.includes("Rahul Sharma"));
  assert.ok(names.includes("Arjun Mehta"));
});

test("demo contacts have follow-ups where specified", async () => {
  await fresh();
  await demo.loadDemo();
  const db = await storage.load();
  // 4 of 5 demo contacts have followUpDate (Arjun Mehta has none).
  const withFollow = Object.values(db.contacts).filter((c) => c.followUpDate);
  assert.equal(withFollow.length, 4);
});
