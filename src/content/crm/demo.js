/**
 * crm/demo.js — load/reset the DEMO dataset (fictional contacts).
 *
 * Demo records are clearly flagged via a `meta.demoLoaded` flag and the
 * presence of demo-prefixed contact IDs. No real personal data is used.
 */
import * as storage from "../storage/storage.js";
import { createEmptyDb, DEFAULT_STATUSES, DEFAULT_TAGS, DEFAULT_REPLIES } from "../storage/schema.js";
import { nowIso, addDays } from "../utils/dates.js";
import { uid } from "../utils/ids.js";

// Canonical demo contacts (from fixtures/demo-contacts.csv). Fictional.
const DEMO_CONTACTS = [
  { name: "Rahul Sharma", phone: "+910000000001", company: "ABC Electricals", email: "rahul@example.test", product: "Electrical Mats", budget: "75000", source: "Website", status: "follow_up", tags: ["tag_hot", "tag_wholesale"], note: "Needs quotation by tomorrow.", followDays: 0 },
  { name: "Priya Patel", phone: "+910000000002", company: "Patel Interiors", email: "priya@example.test", product: "Industrial Flooring", budget: "120000", source: "Instagram", status: "interested", tags: ["tag_high_value", "tag_instagram"], note: "Requested catalogue and installation details.", followDays: 1 },
  { name: "Aman Gupta", phone: "+910000000003", company: "Gupta Traders", email: "aman@example.test", product: "PVC Flooring", budget: "45000", source: "Referral", status: "new_lead", tags: ["tag_referral"], note: "Initial enquiry; qualify requirements.", followDays: 3 },
  { name: "Neha Singh", phone: "+910000000004", company: "NS Infrastructure", email: "neha@example.test", product: "Safety Products", budget: "98000", source: "Website", status: "qualified", tags: ["tag_high_value", "tag_urgent"], note: "Budget confirmed; waiting for final specification.", followDays: 0 },
  { name: "Arjun Mehta", phone: "+910000000005", company: "Mehta Industrial", email: "arjun@example.test", product: "Electrical Insulating Mats", budget: "150000", source: "WhatsApp", status: "won", tags: ["tag_wholesale"], note: "Order confirmed. Archive after handoff.", followDays: null },
];

/** Load demo data into a fresh DB (replaces existing data). */
export async function loadDemo() {
  const now = nowIso();
  const db = createEmptyDb({ now });
  db.meta.demoLoaded = true;
  db.meta.onboardingDone = true;

  for (const d of DEMO_CONTACTS) {
    const id = uid("demo_ct");
    const followUpDate = d.followDays === null || d.followDays === undefined ? null : addDays(now, d.followDays);
    db.contacts[id] = {
      id,
      phone: d.phone,
      name: d.name,
      company: d.company,
      email: d.email,
      product: d.product,
      budget: d.budget,
      source: d.source,
      statusId: d.status,
      tagIds: d.tags,
      followUpDate,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    };
    if (d.note) {
      const nId = uid("demo_nt");
      db.notes[nId] = { id: nId, contactId: id, text: d.note, createdAt: now, updatedAt: now };
    }
    if (followUpDate) {
      const fId = uid("demo_fu");
      db.followUps[fId] = { id: fId, contactId: id, date: followUpDate, note: "", done: false };
    }
  }
  return storage.replace(db);
}

/** Check whether demo data is currently loaded. */
export async function isDemoLoaded() {
  const db = await storage.load();
  return !!(db.meta && db.meta.demoLoaded);
}

export default { loadDemo, isDemoLoaded };
