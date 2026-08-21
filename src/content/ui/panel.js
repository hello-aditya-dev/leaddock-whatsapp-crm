/**
 * ui/panel.js — the CRM side panel injected beside WhatsApp Web's open chat.
 *
 * Mounts inside a Shadow DOM so WhatsApp's global styles never leak in (and
 * LeadDock's styles never leak out). Collapsible; remembers collapsed state.
 * Subscribes to storage changes and re-renders efficiently.
 *
 * The panel never reaches into WhatsApp DOM directly — it uses the adapter.
 */
import { makeEl, escapeHtml } from "../utils/sanitize.js";
import * as storage from "../storage/storage.js";
import * as contacts from "../crm/contacts.js";
import * as notes from "../crm/notes.js";
import * as tags from "../crm/tags.js";
import * as statuses from "../crm/statuses.js";
import * as followups from "../crm/followups.js";
import * as fields from "../crm/fields.js";
import * as replies from "../replies/manager.js";
import * as adapter from "../whatsapp/adapter.js";
import * as activity from "../crm/activity.js";
import { formatDate, formatDateTime, toDateInputValue, fromDateInputValue, dueState, relativeLabel } from "../utils/dates.js";
import * as toast from "./toast.js";
import * as modal from "./modal.js";
import { StatusBadge, TagPill, Button, Field, EmptyState, SectionHeading, Icon } from "./components.js";
import brand from "../../config/brand.js";
// Full design-system CSS, inlined as a string at build time by esbuild's
// "text" loader (see scripts/build.js). Falls back to a fetch of the
// web_accessible_resource when running unbundled.
import panelCssText from "./styles.css";

let root = null;       // host element appended to body
let shadow = null;     // shadow root
let state = {
  currentContact: null,  // resolved CRM contact
  waContext: null,        // raw detected WhatsApp context
  collapsed: false,
  privacy: false,
  unsub: null,
};

/** Mount the panel host. Returns the host element. */
export function mount() {
  if (root && document.body.contains(root)) return root;
  root = document.createElement("div");
  root.id = "leaddock-root";
  root.className = "wf-root";
  shadow = root.attachShadow ? root.attachShadow({ mode: "open" }) : root;
  document.body.appendChild(root);
  // Inject styles into the shadow root.
  injectStyles();
  state.unsub = storage.subscribe(() => render());
  storage.load().then((db) => {
    state.collapsed = !!(db.settings && db.settings.collapsed);
    state.privacy = !!(db.settings && db.settings.privacyMode);
    render();
  });
  return root;
}

export function unmount() {
  if (state.unsub) state.unsub();
  state.unsub = null;
  if (root && root.parentNode) root.parentNode.removeChild(root);
  root = null;
  shadow = null;
}

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || !shadow) return;
  const styleEl = document.createElement("style");
  if (panelCssText && typeof panelCssText === "string") {
    styleEl.textContent = panelCssText;
    shadow.appendChild(styleEl);
    stylesInjected = true;
    return;
  }
  // Fallback: fetch the web_accessible_resource (unbundled dev).
  try {
    const url = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL("src/content/ui/styles.css")
      : null;
    if (url) {
      fetch(url)
        .then((r) => r.text())
        .then((txt) => {
          styleEl.textContent = txt;
          shadow.appendChild(styleEl);
          stylesInjected = true;
        })
        .catch(() => { shadow.appendChild(styleEl); stylesInjected = true; });
      return;
    }
  } catch (err) {
    // chrome.runtime unavailable (tests) — keep minimal inline CSS.
  }
  shadow.appendChild(styleEl);
  stylesInjected = true;
}

/** Update which contact the panel is showing (called when chat changes). */
export async function setCurrentContact(waContext) {
  state.waContext = waContext || null;
  if (!waContext) {
    state.currentContact = null;
    render();
    return;
  }
  try {
    const c = await contacts.resolveOrCreate({ name: waContext.name, phone: waContext.phone });
    state.currentContact = c;
  } catch (err) {
    console.warn("[leaddock:panel] resolveOrCreate failed", err);
    state.currentContact = null;
  }
  render();
}

export function getCurrentContact() {
  return state.currentContact;
}

export async function toggleCollapsed() {
  state.collapsed = !state.collapsed;
  await storage.update((db) => {
    db.settings = db.settings || {};
    db.settings.collapsed = state.collapsed;
    return db;
  });
  render();
}

export async function togglePrivacy() {
  state.privacy = !state.privacy;
  await storage.update((db) => {
    db.settings = db.settings || {};
    db.settings.privacyMode = state.privacy;
    return db;
  });
  render();
}

/** Full render. Cheap because we rebuild only the panel subtree. */
export function render() {
  if (!shadow) return;
  const host = shadow;
  // Keep only the <style> we injected first.
  const styleEl = host.querySelector("style");
  // Remove everything except style.
  Array.from(host.childNodes).forEach((n) => {
    if (n !== styleEl) host.removeChild(n);
  });

  const panel = buildPanel();
  host.appendChild(panel);
}

function buildPanel() {
  const b = brand || {};
  const wrap = makeEl("div", {
    class: "wf-panel" + (state.collapsed ? " wf-panel--collapsed" : "") + (state.privacy ? " wf-panel--privacy" : ""),
    "data-privacy": state.privacy ? "on" : "off",
  });

  // Header
  const head = makeEl("header", { class: "wf-panel__head" });
  const titleWrap = makeEl("div", { class: "wf-panel__title-wrap" });
  const logo = makeEl("div", { class: "wf-panel__logo", text: b.shortName || "LD", title: b.name || "LeadDock" });
  titleWrap.appendChild(logo);
  const titleText = makeEl("div", { class: "wf-panel__title" });
  titleText.appendChild(makeEl("div", { class: "wf-panel__name", text: b.name || "LeadDock" }));
  titleText.appendChild(makeEl("div", { class: "wf-panel__sub", text: b.tagline || "CRM" }));
  titleWrap.appendChild(titleText);
  head.appendChild(titleWrap);

  const headActions = makeEl("div", { class: "wf-panel__head-actions" });
  const privacyBtn = makeEl("button", {
    type: "button",
    class: "wf-icon-btn" + (state.privacy ? " wf-icon-btn--active" : ""),
    title: state.privacy ? "Privacy mode ON" : "Privacy mode",
    "aria-label": "Toggle privacy mode",
    "aria-pressed": state.privacy ? "true" : "false",
    text: state.privacy ? "👁" : "👁‍🗨",
  });
  privacyBtn.addEventListener("click", togglePrivacy);
  headActions.appendChild(privacyBtn);

  const collapseBtn = makeEl("button", {
    type: "button",
    class: "wf-icon-btn",
    title: state.collapsed ? "Expand panel" : "Collapse panel",
    "aria-label": "Collapse panel",
    text: state.collapsed ? "«" : "»",
  });
  collapseBtn.addEventListener("click", toggleCollapsed);
  headActions.appendChild(collapseBtn);
  head.appendChild(headActions);
  wrap.appendChild(head);

  if (state.collapsed) {
    const expand = makeEl("button", {
      class: "wf-panel__expand",
      type: "button",
      title: "Open LeadDock panel",
      text: b.shortName || "LD",
    });
    expand.addEventListener("click", toggleCollapsed);
    wrap.appendChild(expand);
    return wrap;
  }

  // Body
  const body = makeEl("div", { class: "wf-panel__body" });

  if (!state.waContext) {
    body.appendChild(
      EmptyState(
        "No chat open",
        "Open a WhatsApp chat to see the CRM panel for that contact.",
        {
          action: makeEl("p", { class: "wf-muted", text: "Tip: press Ctrl/Cmd+K for the command palette." }),
        }
      )
    );
    wrap.appendChild(body);
    return wrap;
  }

  if (state.waContext.isGroup) {
    body.appendChild(
      EmptyState(
        "Group chat",
        "LeadDock focuses on individual leads. Group chats are shown for reference only."
      )
    );
    wrap.appendChild(body);
    return wrap;
  }

  const c = state.currentContact;
  if (!c) {
    body.appendChild(EmptyState("Loading contact…", "Resolving the current chat."));
    wrap.appendChild(body);
    return wrap;
  }

  // Contact header card
  body.appendChild(buildContactCard(c));

  // Status
  body.appendChild(buildStatusSection(c));

  // Tags
  body.appendChild(buildTagsSection(c));

  // Follow-up
  body.appendChild(buildFollowUpSection(c));

  // Notes
  body.appendChild(buildNotesSection(c));

  // Activity timeline (newest-first)
  body.appendChild(buildActivitySection(c));

  // Diagnostics quick-link (opens full diagnostics modal)
  body.appendChild(buildDiagnosticsLink());

  // Footer: brand + independence notice
  const foot = makeEl("footer", { class: "wf-panel__foot" });
  foot.appendChild(
    makeEl("p", {
      class: "wf-muted wf-foot-notice",
      text: b.independenceNotice || "Independent of WhatsApp/Meta.",
    })
  );
  wrap.appendChild(foot);

  return wrap;
}

function buildContactCard(c) {
  const card = makeEl("section", { class: "wf-contact-card" });
  const name = makeEl("div", { class: "wf-contact-card__name", text: mask(c.name || "Unnamed contact") });
  card.appendChild(name);
  if (c.phone) card.appendChild(makeEl("div", { class: "wf-contact-card__meta", text: "☎ " + mask(c.phone) }));
  if (c.company) card.appendChild(makeEl("div", { class: "wf-contact-card__meta", text: "🏢 " + mask(c.company) }));
  if (c.email) card.appendChild(makeEl("div", { class: "wf-contact-card__meta", text: "✉ " + mask(c.email) }));
  const editBtn = Button("Edit fields", { variant: "ghost", onClick: () => openEditFields(c) });
  card.appendChild(editBtn);
  return card;
}

function buildStatusSection(c) {
  const sec = makeEl("section", { class: "wf-section" });
  sec.appendChild(SectionHeading("Status", {
    action: Button("Manage", { variant: "link", onClick: openStatusManager }),
  }));
  const select = makeEl("select", { class: "wf-select", "aria-label": "Lead status" });
  storage.load().then((db) => {
    const all = Object.values(db.statuses).sort((a, b) => (a.order || 99) - (b.order || 99));
    all.forEach((s) => {
      const opt = makeEl("option", { value: s.id, text: s.name });
      if (s.id === c.statusId) opt.setAttribute("selected", "selected");
      select.appendChild(opt);
    });
  });
  select.addEventListener("change", async () => {
    try {
      await contacts.setStatus(c.id, select.value);
      toast.success("Status updated");
    } catch (err) {
      toast.error("Couldn't update status");
    }
  });
  sec.appendChild(select);
  return sec;
}

function buildTagsSection(c) {
  const sec = makeEl("section", { class: "wf-section" });
  sec.appendChild(SectionHeading("Tags", { action: Button("Manage", { variant: "link", onClick: openTagManager }) }));
  const pills = makeEl("div", { class: "wf-tags" });
  storage.load().then((db) => {
    (c.tagIds || []).forEach((tid) => {
      const t = db.tags[tid];
      if (!t) return;
      pills.appendChild(TagPill(t, { onRemove: async () => {
        try {
          await contacts.toggleTag(c.id, tid);
          toast.success(`Removed tag "${t.name}"`);
        } catch (e) { toast.error("Couldn't remove tag"); }
      }}));
    });
  });
  const addBtn = Button("+ Add tag", { variant: "ghost", onClick: () => openAddTag(c) });
  pills.appendChild(addBtn);
  sec.appendChild(pills);
  return sec;
}

function buildFollowUpSection(c) {
  const sec = makeEl("section", { class: "wf-section" });
  sec.appendChild(SectionHeading("Follow-up"));
  const st = dueState(c.followUpDate);
  const statusLine = makeEl("div", { class: "wf-followup-status wf-followup-status--" + st });
  statusLine.appendChild(makeEl("span", { class: "wf-dot wf-dot--" + st }));
  statusLine.appendChild(makeEl("span", { text: c.followUpDate ? relativeLabel(c.followUpDate) + " · " + formatDate(c.followUpDate) : "No follow-up set" }));
  sec.appendChild(statusLine);

  const presetsRow = makeEl("div", { class: "wf-row wf-row--wrap" });
  followups.PRESETS.forEach((p) => {
    presetsRow.appendChild(Button(p.label, { variant: "ghost", onClick: async () => {
      try {
        await followups.applyPreset(c.id, p.id);
        toast.success("Follow-up set: " + p.label);
      } catch (e) { toast.error("Couldn't set follow-up"); }
    }}));
  });
  sec.appendChild(presetsRow);

  const dateInput = makeEl("input", { type: "date", class: "wf-input", value: toDateInputValue(c.followUpDate) });
  dateInput.addEventListener("change", async () => {
    try {
      const iso = fromDateInputValue(dateInput.value);
      await followups.setForContact(c.id, iso);
      toast.success(iso ? "Follow-up date saved" : "Follow-up cleared");
    } catch (e) { toast.error("Couldn't save follow-up"); }
  });
  sec.appendChild(Field("Custom date", dateInput));

  const clearBtn = Button("Clear", { variant: "link", onClick: async () => {
    try { await followups.setForContact(c.id, null); toast.success("Follow-up cleared"); } catch (e) {}
  }});
  sec.appendChild(clearBtn);
  return sec;
}

function buildNotesSection(c) {
  const sec = makeEl("section", { class: "wf-section" });
  sec.appendChild(SectionHeading("Notes"));
  const ta = makeEl("textarea", { class: "wf-textarea", placeholder: "Add a note about this contact…", rows: 2 });
  sec.appendChild(ta);
  const addRow = makeEl("div", { class: "wf-row" });
  addRow.appendChild(Button("Add note", { variant: "primary", onClick: async () => {
    const text = ta.value.trim();
    if (!text) { toast.warn("Note is empty"); return; }
    try {
      await notes.create(c.id, text);
      ta.value = "";
      toast.success("Note added");
    } catch (e) { toast.error("Couldn't add note"); }
  }}));
  sec.appendChild(addRow);

  const list = makeEl("div", { class: "wf-notes" });
  notes.listForContact(c.id).then((items) => {
    if (items.length === 0) {
      list.appendChild(makeEl("p", { class: "wf-muted", text: "No notes yet." }));
      return;
    }
    items.forEach((n) => {
      const item = makeEl("div", { class: "wf-note" });
      item.appendChild(makeEl("div", { class: "wf-note__meta", text: formatDateTime(n.createdAt) }));
      const body = makeEl("div", { class: "wf-note__text", text: mask(n.text) });
      item.appendChild(body);
      const actions = makeEl("div", { class: "wf-note__actions" });
      actions.appendChild(Button("Edit", { variant: "link", onClick: () => openEditNote(n) }));
      actions.appendChild(Button("Delete", { variant: "link", onClick: async () => {
        try { await notes.remove(n.id); toast.success("Note deleted"); } catch (e) {}
      }}));
      item.appendChild(actions);
      list.appendChild(item);
    });
  });
  sec.appendChild(list);
  return sec;
}

// ----- sub-dialogs -----

function openEditFields(c) {
  const wrap = makeEl("div", { class: "wf-form" });
  const inputs = {};
  storage.load().then(async (db) => {
    const fieldDefs = await fields.list();
    fieldDefs.forEach((f) => {
      if (f.show === false) return;
      const inp = makeEl("input", { type: f.type || "text", class: "wf-input", value: c[f.key] || "" });
      inputs[f.key] = inp;
      wrap.appendChild(Field(f.label, inp));
    });
  });
  modal.open({
    title: "Edit contact fields",
    content: wrap,
    actions: [
      { label: "Cancel", variant: "ghost" },
      { label: "Save", variant: "primary", onClick: async ({ close }) => {
        const patch = {};
        for (const k of Object.keys(inputs)) patch[k] = inputs[k].value.trim();
        try {
          await contacts.update(c.id, patch);
          toast.success("Contact updated");
          close();
        } catch (e) { toast.error("Update failed"); }
      }},
    ],
  });
}

function openAddTag(c) {
  const wrap = makeEl("div", { class: "wf-form" });
  const input = makeEl("input", { type: "text", class: "wf-input", placeholder: "Type a tag name…", autocomplete: "off" });
  wrap.appendChild(Field("Tag name", input));
  const suggestions = makeEl("div", { class: "wf-tags" });
  storage.load().then((db) => {
    Object.values(db.tags).forEach((t) => {
      const used = (c.tagIds || []).includes(t.id);
      suggestions.appendChild(TagPill(t, {
        onRemove: async () => {
          try {
            await contacts.toggleTag(c.id, t.id);
            toast.success(used ? "Removed tag" : "Added tag");
          } catch (e) {}
        },
      }));
    });
  });
  wrap.appendChild(makeEl("div", { class: "wf-muted", text: "Existing tags (click to toggle):" }));
  wrap.appendChild(suggestions);
  modal.open({
    title: "Add tag",
    content: wrap,
    actions: [
      { label: "Cancel", variant: "ghost" },
      { label: "Create & add", variant: "primary", onClick: async ({ close }) => {
        const name = input.value.trim();
        if (!name) { toast.warn("Enter a tag name"); return; }
        try {
          const t = await tags.ensureByName(name);
          if (!(c.tagIds || []).includes(t.id)) await contacts.toggleTag(c.id, t.id);
          toast.success(`Tag "${name}" added`);
          close();
        } catch (e) { toast.error("Couldn't add tag"); }
      }},
    ],
  });
}

function openEditNote(n) {
  const ta = makeEl("textarea", { class: "wf-textarea", rows: 4, text: n.text });
  modal.open({
    title: "Edit note",
    content: Field("Note", ta),
    actions: [
      { label: "Cancel", variant: "ghost" },
      { label: "Save", variant: "primary", onClick: async ({ close }) => {
        try {
          await notes.update(n.id, ta.value);
          toast.success("Note updated");
          close();
        } catch (e) { toast.error("Update failed"); }
      }},
    ],
  });
}

function openStatusManager() {
  const wrap = makeEl("div", { class: "wf-form" });
  const list = makeEl("div", { class: "wf-list" });
  storage.load().then((db) => {
    const all = Object.values(db.statuses).sort((a, b) => (a.order || 99) - (b.order || 99));
    all.forEach((s) => {
      const row = makeEl("div", { class: "wf-list__row" });
      row.appendChild(makeEl("input", { type: "color", value: s.color, "aria-label": "Color for " + s.name, oninput: (e) => { s.color = e.target.value; } }));
      const nameInput = makeEl("input", { type: "text", class: "wf-input", value: s.name, oninput: (e) => { s.name = e.target.value; } });
      row.appendChild(nameInput);
      row.appendChild(Button("Delete", { variant: "link", onClick: async () => {
        try { await statuses.remove(s.id); toast.success("Status deleted"); } catch (e) {}
      }}));
      list.appendChild(row);
    });
  });
  wrap.appendChild(list);
  const addBtn = Button("+ Add status", { variant: "ghost", onClick: async () => {
    try { await statuses.create({ name: "New Status", color: "#6B7280", order: 99 }); } catch (e) {}
  }});
  wrap.appendChild(addBtn);
  modal.open({ title: "Manage statuses", content: wrap, actions: [{ label: "Close", variant: "ghost" }] });
}

function openTagManager() {
  const wrap = makeEl("div", { class: "wf-form" });
  const list = makeEl("div", { class: "wf-list" });
  storage.load().then((db) => {
    Object.values(db.tags).forEach((t) => {
      const row = makeEl("div", { class: "wf-list__row" });
      row.appendChild(makeEl("input", { type: "color", value: t.color, "aria-label": "Color", oninput: (e) => { t.color = e.target.value; } }));
      const nameInput = makeEl("input", { type: "text", class: "wf-input", value: t.name, oninput: (e) => { t.name = e.target.value; } });
      row.appendChild(nameInput);
      row.appendChild(Button("Save", { variant: "link", onClick: async () => {
        try { await tags.update(t.id, { name: nameInput.value.trim(), color: t.color }); toast.success("Tag updated"); } catch (e) {}
      }}));
      row.appendChild(Button("Delete", { variant: "link", onClick: async () => {
        try { await tags.remove(t.id); toast.success("Tag deleted"); } catch (e) {}
      }}));
      list.appendChild(row);
    });
  });
  wrap.appendChild(list);
  const addBtn = Button("+ Add tag", { variant: "ghost", onClick: async () => {
    try { await tags.create({ name: "New Tag", color: "#6B7280" }); } catch (e) {}
  }});
  wrap.appendChild(addBtn);
  modal.open({ title: "Manage tags", content: wrap, actions: [{ label: "Close", variant: "ghost" }] });
}

// Activity timeline section — newest-first list of events for this contact.
function buildActivitySection(c) {
  const sec = makeEl("section", { class: "wf-section" });
  sec.appendChild(SectionHeading("Activity"));
  const list = makeEl("div", { class: "wf-activity" });
  activity.listForContact(c.id, 20).then((items) => {
    if (items.length === 0) {
      list.appendChild(makeEl("p", { class: "wf-muted", text: "No activity yet." }));
      return;
    }
    items.forEach((a) => {
      const item = makeEl("div", { class: "wf-activity__item" });
      const label = activity.labelFor(a.type);
      const head = makeEl("div", { class: "wf-activity__head" });
      head.appendChild(makeEl("span", { class: "wf-activity__type", text: label }));
      head.appendChild(makeEl("span", { class: "wf-activity__at", text: formatDateTime(a.at) }));
      item.appendChild(head);
      if (a.label) item.appendChild(makeEl("div", { class: "wf-activity__label", text: mask(a.label) }));
      if (a.detail) item.appendChild(makeEl("div", { class: "wf-activity__detail", text: mask(a.detail) }));
      list.appendChild(item);
    });
  });
  sec.appendChild(list);
  return sec;
}

// Diagnostics quick-link button (opens a full diagnostics modal).
function buildDiagnosticsLink() {
  const sec = makeEl("section", { class: "wf-section" });
  sec.appendChild(
    Button("Diagnostics", {
      variant: "ghost",
      onClick: () => openDiagnostics(),
    })
  );
  return sec;
}

// Full diagnostics modal — surfaces adapter/storage/version/support health.
async function openDiagnostics() {
  const wrap = makeEl("div", { class: "wf-form" });
  const grid = makeEl("div", { class: "wf-diag" });
  const diag = adapter.diagnostics();
  const db = await storage.load();

  function row(label, ok, detail) {
    const r = makeEl("div", { class: "wf-diag__row" });
    r.appendChild(makeEl("span", { class: "wf-diag__label", text: label }));
    const status = makeEl("span", {
      class: "wf-diag__status " + (ok ? "wf-diag__status--ok" : "wf-diag__status--bad"),
      text: ok ? "✓" : "✗",
    });
    r.appendChild(status);
    if (detail) r.appendChild(makeEl("span", { class: "wf-diag__detail", text: detail }));
    grid.appendChild(r);
  }

  row("LeadDock version", true, brand.version);
  row("WhatsApp Web", diag.ready === "ok" || diag.ready === true, diag.ready ? "Detected" : "Not detected");
  row("Active chat", diag.chatHeader === "ok", diag.chatHeader === "ok" ? "Detected" : "No active chat");
  row("Contact", !!state.currentContact, state.currentContact ? "Detected" : "Not detected");
  row("Composer", diag.composer === "ok", diag.composer === "ok" ? "Detected" : "Not detected");
  row("CRM storage", !!db, storage.backendKind());
  row("Adapter", diag.ready ? "Ready" : "Degraded", diag.ready ? "Ready" : "Selectors missing");
  row("Total contacts", true, String(Object.keys(db.contacts || {}).length));
  row("Total notes", true, String(Object.keys(db.notes || {}).length));
  row("Total follow-ups", true, String(Object.keys(db.followUps || {}).length));

  wrap.appendChild(grid);
  const support = makeEl("div", { class: "wf-muted wf-diag__support" });
  support.appendChild(makeEl("p", { text: "Need help? Email: " }));
  const a = makeEl("a", {
    href: "mailto:" + (brand.supportEmail || "witejackel@gmail.com"),
    text: brand.supportEmail || "witejackel@gmail.com",
  });
  support.appendChild(a);
  wrap.appendChild(support);

  modal.open({
    title: "LeadDock Diagnostics",
    content: wrap,
    actions: [{ label: "Close", variant: "ghost" }],
  });
}

// privacy masking for text
function mask(text) {
  if (!state.privacy || !text) return text || "";
  // Blur-ish: replace most letters with • keeping first char + length hint.
  const s = String(text);
  if (s.length <= 2) return "•".repeat(s.length);
  return s[0] + "•".repeat(Math.max(1, s.length - 2)) + s[s.length - 1];
}

export { mask };
