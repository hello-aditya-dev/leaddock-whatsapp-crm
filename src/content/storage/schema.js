/**
 * schema.js — versioned storage schema + default seed data.
 *
 * The extension persists a single object in chrome.storage.local under STORAGE_KEY.
 * Shape:
 * {
 *   version: 1,
 *   contacts: { [id]: Contact },
 *   notes:    { [id]: Note },
 *   replies:  { [id]: Reply },
 *   tags:     { [id]: Tag },
 *   statuses: { [id]: Status },
 *   followUps:{ [id]: FollowUp },
 *   settings: { ... },
 *   meta:     { createdAt, lastSeenAt, onboardingDone, demoLoaded, schemaMigrations: [] }
 * }
 */

export const STORAGE_KEY = "waflow.db.v1";
export const SCHEMA_VERSION = 1;

/** Default statuses (canonical from fixtures/demo-statuses.json). */
export const DEFAULT_STATUSES = [
  { id: "new_lead", name: "New Lead", color: "#3B82F6", order: 1 },
  { id: "contacted", name: "Contacted", color: "#06B6D4", order: 2 },
  { id: "interested", name: "Interested", color: "#8B5CF6", order: 3 },
  { id: "follow_up", name: "Follow Up", color: "#F59E0B", order: 4 },
  { id: "qualified", name: "Qualified", color: "#10B981", order: 5 },
  { id: "won", name: "Won", color: "#22C55E", order: 6 },
  { id: "lost", name: "Lost", color: "#6B7280", order: 7 },
];

/** Default tags (canonical from fixtures/demo-tags.json). */
export const DEFAULT_TAGS = [
  { id: "tag_hot", name: "Hot", color: "#EF4444" },
  { id: "tag_high_value", name: "High Value", color: "#8B5CF6" },
  { id: "tag_website", name: "Website", color: "#3B82F6" },
  { id: "tag_instagram", name: "Instagram", color: "#EC4899" },
  { id: "tag_referral", name: "Referral", color: "#10B981" },
  { id: "tag_wholesale", name: "Wholesale", color: "#F59E0B" },
  { id: "tag_urgent", name: "Urgent", color: "#F97316" },
];

/** Default quick replies (canonical from fixtures/demo-replies.json). */
export const DEFAULT_REPLIES = [
  { name: "Greeting", shortcut: "/hi", category: "General", content: "Hi {{name}}, thanks for reaching out. How can we help you today?" },
  { name: "Pricing", shortcut: "/price", category: "Sales", content: "Hi {{name}}, happy to help with pricing. Could you share the quantity and requirements you need?" },
  { name: "Follow Up", shortcut: "/followup", category: "Sales", content: "Hi {{name}}, just following up on our previous conversation. Please let me know if you'd like me to send the details." },
  { name: "Catalogue", shortcut: "/catalogue", category: "Sales", content: "Hi {{name}}, I can send you the relevant catalogue and product details. Please confirm which product you're interested in." },
  { name: "Thank You", shortcut: "/thanks", category: "General", content: "Thank you, {{name}}. We appreciate your enquiry and will get back to you shortly." },
  { name: "Meeting", shortcut: "/meeting", category: "Sales", content: "Hi {{name}}, would you like to schedule a quick call to discuss your requirements?" },
];

/** Default settings. */
export const DEFAULT_SETTINGS = {
  privacyMode: false,
  collapsed: false,
  panelWidth: 360,
  theme: "light", // "light" | "dark"
  commandPaletteEnabled: true,
  lastUsedReplyId: null,
  onboardingAcknowledged: false,
};

/**
 * Build a fresh empty database object with seeded defaults.
 * @param {{now?:string}} [opts]
 * @returns {object}
 */
export function createEmptyDb(opts = {}) {
  const now = opts.now || new Date().toISOString();
  const contacts = {};
  const notes = {};
  const replies = {};
  const tags = {};
  const statuses = {};
  const followUps = {};

  for (const s of DEFAULT_STATUSES) {
    statuses[s.id] = { ...s };
  }
  for (const t of DEFAULT_TAGS) {
    tags[t.id] = { ...t };
  }
  for (let i = 0; i < DEFAULT_REPLIES.length; i++) {
    const r = DEFAULT_REPLIES[i];
    const id = `rp_seed_${i + 1}`;
    replies[id] = {
      id,
      name: r.name,
      shortcut: r.shortcut,
      content: r.content,
      category: r.category,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    version: SCHEMA_VERSION,
    contacts,
    notes,
    replies,
    tags,
    statuses,
    followUps,
    settings: { ...DEFAULT_SETTINGS },
    meta: {
      createdAt: now,
      lastSeenAt: now,
      onboardingDone: false,
      demoLoaded: false,
      schemaMigrations: [],
    },
  };
}

export default {
  STORAGE_KEY,
  SCHEMA_VERSION,
  DEFAULT_STATUSES,
  DEFAULT_TAGS,
  DEFAULT_REPLIES,
  DEFAULT_SETTINGS,
  createEmptyDb,
};
