/**
 * tests/stress.test.js — synthetic dataset performance + round trips.
 * Verifies the storage layer handles 500 contacts / 1000 notes / 100 replies+tags
 * and that export/import + backup/restore round trips preserve data.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as storage from "../src/content/storage/storage.js";
import * as contacts from "../src/content/crm/contacts.js";
import * as data from "../src/content/crm/data.js";
import { uid } from "../src/content/utils/ids.js";

async function seedBig() {
  await storage.reset();
  const db = await storage.load();
  for (let i = 0; i < 500; i++) {
    const id = uid("ct");
    db.contacts[id] = {
      id,
      name: `Lead ${i}`,
      phone: `+1${String(i).padStart(10, "0")}`,
      company: i % 2 === 0 ? `Co ${i}` : "",
      email: "",
      product: "",
      budget: "",
      source: i % 3 === 0 ? "Website" : "Referral",
      statusId: ["new_lead", "contacted", "interested", "won"][i % 4],
      tagIds: i % 2 === 0 ? ["tag_hot"] : ["tag_website"],
      followUpDate: i % 5 === 0 ? new Date(Date.now() + 86400000).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSeenAt: null,
    };
  }
  for (let i = 0; i < 1000; i++) {
    const nid = uid("nt");
    const cids = Object.keys(db.contacts);
    const cid = cids[i % cids.length];
    db.notes[nid] = {
      id: nid, contactId: cid, text: `Note ${i}`,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
  }
  for (let i = 0; i < 50; i++) {
    const tid = uid("tag");
    db.tags[tid] = { id: tid, name: `Custom${i}`, color: "#6B7280" };
  }
  for (let i = 0; i < 50; i++) {
    const rid = uid("rp");
    db.replies[rid] = {
      id: rid, name: `Reply ${i}`, shortcut: `/r${i}`, content: "Hi {{name}}",
      category: "General", usageCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
  }
  await storage.save(db);
}

test("synthetic: 500 contacts + 1000 notes load within budget", async () => {
  const t0 = Date.now();
  await seedBig();
  const t1 = Date.now();
  const db = await storage.load();
  assert.equal(Object.keys(db.contacts).length, 500);
  assert.equal(Object.keys(db.notes).length, 1000);
  assert.ok(t1 - t0 < 8000, `seed completed in ${t1 - t0}ms`);
});

test("synthetic: search is responsive across large dataset", async () => {
  await seedBig();
  const t0 = Date.now();
  const results = await contacts.search("Lead 4");
  const t1 = Date.now();
  assert.ok(results.length >= 1);
  assert.ok(t1 - t0 < 1500, `search in ${t1 - t0}ms`);
});

test("synthetic: CSV export→import round trip preserves count", async () => {
  await seedBig();
  const csv = await data.exportContactsCsv();
  await storage.reset();
  const preview = await data.previewImportCsv(csv);
  assert.equal(preview.summary.valid, 500);
  await data.commitImport(preview.rows);
  const db = await storage.load();
  assert.equal(Object.keys(db.contacts).length, 500);
});

test("synthetic: backup→restore round trip preserves count", async () => {
  await seedBig();
  const backup = await data.exportBackup();
  await storage.reset();
  await data.restoreBackup(backup);
  const db = await storage.load();
  assert.equal(Object.keys(db.contacts).length, 500);
  assert.equal(Object.keys(db.notes).length, 1000);
});
