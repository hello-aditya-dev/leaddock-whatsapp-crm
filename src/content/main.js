/**
 * content/main.js — WaFlow content script entry point.
 *
 * Runs on https://web.whatsapp.com/*. Responsibilities:
 *  1. Initialize storage + ensure migrations ran.
 *  2. Mount the CRM panel (shadow root, isolated styles).
 *  3. Mount the ⚡ Replies launcher near the composer.
 *  4. Bind the Ctrl/Cmd+K command palette + register commands.
 *  5. Observe WhatsApp chat switches and update the panel.
 *  6. Watch the composer for slash shortcuts and offer expansion.
 *  7. Expose a tiny message bridge for the popup/options pages.
 *
 * The CRM layer never imports WhatsApp selectors directly — it goes through
 * the WhatsApp adapter.
 */
import * as storage from "./storage/storage.js";
import * as adapter from "./whatsapp/adapter.js";
import * as panel from "./ui/panel.js";
import * as replyPicker from "./ui/reply-picker.js";
import * as palette from "./ui/command-palette.js";
import * as toast from "./ui/toast.js";
import * as replies from "./replies/manager.js";
import * as contacts from "./crm/contacts.js";
import * as notes from "./crm/notes.js";
import * as tags from "./crm/tags.js";
import * as statuses from "./crm/statuses.js";
import * as followups from "./crm/followups.js";
import * as data from "./crm/data.js";
import * as demo from "./crm/demo.js";
import { detectTrailingShortcut } from "./replies/parser.js";
import { debounce } from "./utils/debounce.js";

(async function init() {
  // Wait until chrome.storage is available + DB migrated.
  await storage.load();

  // Mount the CRM panel (it owns its shadow root + style injection).
  panel.mount();

  // Bind global keyboard shortcut.
  palette.bindGlobalShortcut();
  registerCommands();

  // Mount the reply launcher (retry until composer exists).
  const mountLauncher = debounce(() => { replyPicker.mount().catch(() => {}); }, 400);
  mountLauncher();

  // Observe WhatsApp chat changes.
  let lastContextKey = null;
  const onChatChange = debounce(async () => {
    mountLauncher();
    const ctx = adapter.getCurrentContact();
    const key = ctx ? ctx.key : null;
    if (key === lastContextKey) return;
    lastContextKey = key;
    await panel.setCurrentContact(ctx);
    if (ctx && !ctx.isGroup) {
      // Resolve-or-create quietly so the contact exists in the CRM.
      try {
        await contacts.resolveOrCreate({ name: ctx.name, phone: ctx.phone });
      } catch (err) {
        // non-fatal
      }
    }
  }, 350);
  adapter.observeChatChanges(onChatChange);
  // Initial fire.
  onChatChange();

  // Composer slash-shortcut watcher.
  wireSlashShortcuts();

  // Message bridge for popup/options.
  wireMessageBridge();

  // Onboarding toast (once).
  const db = await storage.load();
  if (!db.meta.onboardingDone) {
    setTimeout(() => {
      toast.info("Turn WhatsApp Web into your lightweight sales workspace. Open a chat to begin.", { timeout: 6000 });
    }, 1500);
    await storage.update((d) => { d.meta = d.meta || {}; d.meta.onboardingDone = true; return d; });
  }

  // Load demo data automatically only if the DB is completely empty AND the
  // user hasn't dismissed demo. This makes first install feel alive.
  const contactCount = Object.keys(db.contacts).length;
  if (contactCount === 0 && db.meta.demoLoaded !== false) {
    // Auto-seed demo ONLY when empty and not explicitly declined.
    try {
      await demo.loadDemo();
      setTimeout(() => toast.success("Demo data loaded — explore the panel. Use Options → Reset Demo Data to clear.", { timeout: 5000 }), 800);
    } catch (err) {
      console.warn("[waflow] demo load failed", err);
    }
  }

  console.info(`[WaFlow] content script ready (backend: ${storage.backendKind()})`);
})();

function registerCommands() {
  palette.clear();
  palette.register({ id: "search-contacts", label: "Search contacts", category: "CRM", keywords: "find filter leads", run: () => openSearch() });
  palette.register({ id: "add-note", label: "Add note to current contact", category: "Notes", run: () => openAddNoteCurrent() });
  palette.register({ id: "change-status", label: "Change status of current contact", category: "CRM", run: () => openStatusCurrent() });
  palette.register({ id: "add-tag", label: "Add tag to current contact", category: "CRM", run: () => panel.getCurrentContact() && toast.info("Use the Tags → + Add tag button in the panel.") });
  palette.register({ id: "insert-reply", label: "Insert quick reply", category: "Replies", run: () => replyPicker.openPicker() });
  palette.register({ id: "set-followup", label: "Set follow-up for current contact", category: "Follow-ups", run: () => openFollowUpCurrent() });
  palette.register({ id: "export-csv", label: "Export contacts as CSV", category: "Data", run: () => downloadCsv() });
  palette.register({ id: "backup", label: "Download JSON backup", category: "Data", run: () => downloadBackup() });
  palette.register({ id: "open-settings", label: "Open settings", category: "System", run: () => chrome.runtime.openOptionsPage ? chrome.runtime.openOptionsPage() : toast.info("Open the extension options page.") });
  palette.register({ id: "toggle-privacy", label: "Toggle privacy mode", category: "System", run: () => panel.togglePrivacy() });
  palette.register({ id: "toggle-collapse", label: "Collapse/expand panel", category: "System", run: () => panel.toggleCollapsed() });
}

function wireSlashShortcuts() {
  const handler = debounce(async () => {
    const text = adapter.readComposerText();
    if (!text) return;
    const detected = detectTrailingShortcut(text);
    if (!detected) return;
    const all = await replies.list();
    const target = detected.shortcut.toLowerCase();
    const match = all.find((r) => r.shortcut && r.shortcut.toLowerCase() === target);
    if (!match) return;
    // Offer to expand via a toast action. NEVER auto-insert/expand.
    toast.info(`Reply "${match.name}" matched (${match.shortcut}).`, {
      timeout: 5000,
      action: {
        label: "Insert",
        onClick: async () => {
          const ctx = adapter.getCurrentContact();
          let contact = null;
          if (ctx) {
            try { contact = await contacts.resolveOrCreate({ name: ctx.name, phone: ctx.phone }); } catch (e) {}
          }
          replyPicker.insertReply(match, contact);
        },
      },
    });
  }, 600);
  // Listen on the document for input events in the composer. Debounced + cheap.
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!t || !t.closest) return;
    // Only react when the input came from the composer.
    const composer = adapter.getComposer();
    if (!composer || (t !== composer && !composer.contains(t))) return;
    handler();
  }, true);
}

function wireMessageBridge() {
  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.onMessage) return;
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || !msg.type) return;
    (async () => {
      try {
        switch (msg.type) {
          case "waflow:ping":
            sendResponse({ ok: true, ready: adapter.isReady(), diag: adapter.diagnostics() });
            return;
          case "waflow:dashboard":
            sendResponse(await buildDashboard());
            return;
          case "waflow:open-chat": {
            const ok = adapter.openChat(msg.contact || {});
            sendResponse({ ok });
            return;
          }
          case "waflow:load-demo":
            await demo.loadDemo();
            sendResponse({ ok: true });
            return;
          case "waflow:reset-all":
            await data.resetAll();
            sendResponse({ ok: true });
            return;
          case "waflow:export-csv":
            sendResponse({ ok: true, csv: await data.exportContactsCsv() });
            return;
          case "waflow:export-backup":
            sendResponse({ ok: true, backup: await data.exportBackup() });
            return;
          default:
            sendResponse({ ok: false, error: "unknown message" });
        }
      } catch (err) {
        sendResponse({ ok: false, error: String(err && err.message || err) });
      }
    })();
    return true; // async
  });
}

async function buildDashboard() {
  const db = await storage.load();
  const total = Object.keys(db.contacts).length;
  const statusCounts = {};
  for (const s of Object.values(db.statuses)) statusCounts[s.id] = { name: s.name, color: s.color, count: 0 };
  for (const c of Object.values(db.contacts)) {
    const k = c.statusId || "new_lead";
    if (statusCounts[k]) statusCounts[k].count++;
  }
  const due = await followups.dueFollowUps();
  const recent = Object.values(db.contacts)
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 6);
  return { total, statusCounts, due, recent };
}

// ---- command actions ----

function openSearch() {
  // Dispatch a search modal.
  import("./ui/modal.js").then((modal) => {
    const input = document.createElement("input");
    input.className = "wf-cp__input";
    input.placeholder = "Search by name, phone, company, notes, tags…";
    const results = document.createElement("div");
    results.className = "wf-rp__list";
    const run = async (q) => {
      results.innerHTML = "";
      const found = await contacts.search(q, {});
      if (found.length === 0) {
        results.appendChild(makeText("No contacts match."));
        return;
      }
      found.slice(0, 20).forEach((c) => {
        const b = document.createElement("button");
        b.className = "wf-rp__item";
        b.type = "button";
        b.textContent = `${c.name || c.phone || c.id} — ${c.company || ""}`.trim();
        b.addEventListener("click", () => {
          const ok = adapter.openChat({ name: c.name, phone: c.phone });
          if (!ok) toast.warn("Couldn't find that chat in the list. Open it manually.");
          modal.closeAll();
        });
        results.appendChild(b);
      });
    };
    input.addEventListener("input", () => run(input.value));
    run("");
    modal.open({ title: "Search contacts", content: [input, results], size: "md" });
    setTimeout(() => input.focus(), 50);
  });
}

function makeText(s) {
  const d = document.createElement("div");
  d.className = "wf-cp__empty";
  d.textContent = s;
  return d;
}

function openAddNoteCurrent() {
  const c = panel.getCurrentContact();
  if (!c) { toast.warn("Open a chat first."); return; }
  import("./ui/modal.js").then((modal) => {
    const ta = document.createElement("textarea");
    ta.className = "wf-textarea";
    ta.rows = 4;
    ta.placeholder = "Add a note…";
    modal.open({
      title: "Add note",
      content: ta,
      actions: [
        { label: "Cancel", variant: "ghost" },
        { label: "Add", variant: "primary", onClick: async ({ close }) => {
          if (!ta.value.trim()) return;
          await notes.create(c.id, ta.value);
          toast.success("Note added");
          close();
        }},
      ],
    });
    setTimeout(() => ta.focus(), 50);
  });
}

function openStatusCurrent() {
  const c = panel.getCurrentContact();
  if (!c) { toast.warn("Open a chat first."); return; }
  import("./ui/modal.js").then(async (modal) => {
    const list = document.createElement("div");
    list.className = "wf-rp__list";
    const all = await statuses.list();
    all.forEach((s) => {
      const b = document.createElement("button");
      b.className = "wf-rp__item";
      b.type = "button";
      b.textContent = s.name + (s.id === c.statusId ? "  ✓" : "");
      b.addEventListener("click", async () => {
        await contacts.setStatus(c.id, s.id);
        toast.success("Status: " + s.name);
        modal.closeAll();
      });
      list.appendChild(b);
    });
    modal.open({ title: "Change status", content: list, size: "sm" });
  });
}

function openFollowUpCurrent() {
  const c = panel.getCurrentContact();
  if (!c) { toast.warn("Open a chat first."); return; }
  import("./ui/modal.js").then((modal) => {
    const wrap = document.createElement("div");
    wrap.className = "wf-form";
    const row = document.createElement("div");
    row.className = "wf-row wf-row--wrap";
    followups.PRESETS.forEach((p) => {
      const b = document.createElement("button");
      b.className = "wf-btn wf-btn--ghost";
      b.type = "button";
      b.textContent = p.label;
      b.addEventListener("click", async () => {
        await followups.applyPreset(c.id, p.id);
        toast.success("Follow-up: " + p.label);
        modal.closeAll();
      });
      row.appendChild(b);
    });
    wrap.appendChild(row);
    const di = document.createElement("input");
    di.type = "date";
    di.className = "wf-input";
    wrap.appendChild(di);
    modal.open({
      title: "Set follow-up",
      content: wrap,
      actions: [
        { label: "Cancel", variant: "ghost" },
        { label: "Save date", variant: "primary", onClick: async ({ close }) => {
          if (di.value) {
            const iso = new Date(di.value + "T00:00:00").toISOString();
            await followups.setForContact(c.id, iso);
            toast.success("Follow-up saved");
          }
          close();
        }},
        { label: "Clear", variant: "link", onClick: async () => { await followups.setForContact(c.id, null); toast.success("Follow-up cleared"); modal.closeAll(); } },
      ],
    });
  });
}

async function downloadCsv() {
  const csv = await data.exportContactsCsv();
  triggerDownload("waflow-contacts.csv", csv, "text/csv");
  toast.success("CSV exported");
}

async function downloadBackup() {
  const backup = await data.exportBackup();
  triggerDownload("waflow-backup.json", JSON.stringify(backup, null, 2), "application/json");
  toast.success("Backup downloaded");
}

function triggerDownload(filename, content, mime) {
  const blob = new Blob([content], { type: mime || "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
