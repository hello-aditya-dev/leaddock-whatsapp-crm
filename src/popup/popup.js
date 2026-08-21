/**
 * popup/popup.js — WaFlow dashboard popup.
 *
 * Imports the shared storage + CRM modules directly (ESM is allowed in popup
 * pages). Builds a compact dashboard: total leads, status counts, due
 * follow-ups, recent leads, and quick actions.
 */
import * as storage from "../content/storage/storage.js";
import * as followups from "../content/crm/followups.js";
import * as data from "../content/crm/data.js";
import * as demo from "../content/crm/demo.js";
import brand from "../config/brand.js";

const el = (id) => document.getElementById(id);

function render() {
  el("wfLogo").textContent = brand.shortName || "WF";
  el("wfName").textContent = brand.name || "WaFlow";
  el("wfTag").textContent = brand.tagline || "CRM for WhatsApp Web";
  el("notice").textContent = brand.independenceNotice;

  buildDashboard();
}

async function buildDashboard() {
  const db = await storage.load();
  const total = Object.keys(db.contacts).length;
  el("totalLeads").textContent = String(total);

  // Statuses
  const statusList = el("statusList");
  statusList.innerHTML = "";
  const counts = {};
  for (const s of Object.values(db.statuses)) counts[s.id] = 0;
  for (const c of Object.values(db.contacts)) {
    const k = c.statusId || "new_lead";
    counts[k] = (counts[k] || 0) + 1;
  }
  const sorted = Object.values(db.statuses).sort((a, b) => (a.order || 99) - (b.order || 99));
  for (const s of sorted) {
    const row = document.createElement("div");
    row.className = "wf-pop-status-row";
    row.innerHTML = `<span class="wf-pop-status-dot" style="background:${s.color}"></span>` +
      `<span class="wf-pop-status-name"></span><span class="wf-pop-status-count"></span>`;
    row.querySelector(".wf-pop-status-name").textContent = s.name;
    row.querySelector(".wf-pop-status-count").textContent = String(counts[s.id] || 0);
    statusList.appendChild(row);
  }

  // Due follow-ups
  const dueList = el("dueList");
  dueList.innerHTML = "";
  const due = await followups.dueFollowUps();
  el("dueCount").textContent = String(due.length);
  if (due.length === 0) {
    dueList.innerHTML = `<div class="wf-pop-empty">No follow-ups due. You're all caught up.</div>`;
  } else {
    due.slice(0, 8).forEach((f) => {
      const item = document.createElement("div");
      item.className = "wf-pop-due-item";
      const color = f.state === "overdue" ? "var(--overdue)" : "var(--due-today)";
      item.innerHTML = `<span class="wf-pop-due-dot" style="background:${color}"></span>` +
        `<span class="wf-pop-due-name"></span><span class="wf-pop-due-date"></span>`;
      item.querySelector(".wf-pop-due-name").textContent = (f.contact && f.contact.name) || "Unknown";
      const d = new Date(f.date);
      item.querySelector(".wf-pop-due-date").textContent = d.toLocaleDateString();
      item.addEventListener("click", () => openChat(f.contact));
      dueList.appendChild(item);
    });
  }

  // Recent leads
  const recentList = el("recentList");
  recentList.innerHTML = "";
  const recent = Object.values(db.contacts)
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 6);
  if (recent.length === 0) {
    recentList.innerHTML = `<div class="wf-pop-empty">No leads yet. Load demo data to explore.</div>`;
  } else {
    recent.forEach((c) => {
      const s = db.statuses[c.statusId] || Object.values(db.statuses)[0];
      const item = document.createElement("div");
      item.className = "wf-pop-recent-item";
      item.innerHTML = `<span class="wf-pop-recent-name"></span>` +
        `<span class="wf-pop-recent-status"></span>`;
      item.querySelector(".wf-pop-recent-name").textContent = c.name || c.phone || c.id;
      const badge = item.querySelector(".wf-pop-recent-status");
      badge.textContent = s ? s.name : "";
      badge.style.background = s ? s.color + "22" : "#eee";
      badge.style.color = s ? s.color : "#666";
      item.addEventListener("click", () => openChat(c));
      recentList.appendChild(item);
    });
  }
}

function openChat(contact) {
  if (!contact) return;
  // Ask the background to open WhatsApp and relay an "open chat" message.
  chrome.runtime.sendMessage({ type: "waflow:relay-to-content", payload: { type: "waflow:open-chat", contact } }, () => {
    window.close();
  });
}

el("openWa").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "waflow:open-whatsapp" }, () => window.close());
});

el("exportCsv").addEventListener("click", async () => {
  const csv = await data.exportContactsCsv();
  download("waflow-contacts.csv", csv, "text/csv");
});

el("exportBackup").addEventListener("click", async () => {
  const backup = await data.exportBackup();
  download("waflow-backup.json", JSON.stringify(backup, null, 2), "application/json");
});

el("loadDemo").addEventListener("click", async () => {
  if (!confirm("Load demo data? This replaces your current CRM data with fictional sample records.")) return;
  await demo.loadDemo();
  buildDashboard();
});

el("resetAll").addEventListener("click", async () => {
  if (!confirm("Reset ALL data? This permanently deletes all contacts, notes, and settings. Export a backup first if unsure.")) return;
  await data.resetAll();
  buildDashboard();
});

el("openOptions").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime || "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

document.addEventListener("DOMContentLoaded", render);
