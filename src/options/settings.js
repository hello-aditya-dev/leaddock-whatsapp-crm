/**
 * options/settings.js — LeadDock options page.
 *
 * Manages quick replies, statuses, tags, CSV import/export, JSON backup/
 * restore, demo data, and reset. Uses the shared storage + CRM modules.
 */
import * as replies from "../content/replies/manager.js";
import * as statuses from "../content/crm/statuses.js";
import * as tags from "../content/crm/tags.js";
import * as data from "../content/crm/data.js";
import * as demo from "../content/crm/demo.js";
import * as storage from "../content/storage/storage.js";
import * as contacts from "../content/crm/contacts.js";
import * as followups from "../content/crm/followups.js";
import * as activity from "../content/crm/activity.js";
import brand from "../config/brand.js";

const $ = (id) => document.getElementById(id);

function init() {
  $("wfLogo").textContent = brand.shortName || "LD";
  $("wfName").textContent = brand.name || "LeadDock";
  $("wfTag").textContent = "Settings";
  $("aboutName").textContent = brand.name || "LeadDock";
  $("aboutVersion").textContent = "v" + (brand.version || "1.0.0");
  $("aboutNotice").textContent = brand.independenceNotice;
  $("aboutSupport").textContent = brand.supportEmail || "support";
  $("aboutSupport").href = "mailto:" + (brand.supportEmail || "witejackel@gmail.com");
  $("aboutWebsite").href = brand.website || "#";
  $("aboutPrivacy").href = brand.privacyUrl || "#";
  $("footNotice").textContent = brand.independenceNotice;

  wireReplies();
  wireStatuses();
  wireTags();
  wireData();
  wireDiagnostics();
}

// ---------- Diagnostics ----------
function wireDiagnostics() {
  renderDiagnostics();
  $("copyDiagnostics").addEventListener("click", async () => {
    const snapshot = await buildDiagnosticsText();
    try {
      await navigator.clipboard.writeText(snapshot);
      alert("Diagnostics copied to clipboard.\nPaste into your support email to " + (brand.supportEmail || "witejackel@gmail.com"));
    } catch (err) {
      // Fallback: open a textarea the user can copy from.
      const ta = document.createElement("textarea");
      ta.value = snapshot;
      ta.style.cssText = "position:fixed;width:600px;height:300px;top:10%;left:50%;transform:translateX(-50%);z-index:9999";
      document.body.appendChild(ta);
      ta.select();
      alert("Clipboard unavailable. Copy the text from the textarea below.");
    }
  });
}

async function buildDiagnosticsText() {
  const db = await storage.load();
  const lines = [];
  lines.push("LeadDock Diagnostics");
  lines.push("====================");
  lines.push("LeadDock version: " + (brand.version || "1.0.0"));
  lines.push("Backend: " + storage.backendKind());
  lines.push("Total contacts: " + Object.keys(db.contacts || {}).length);
  lines.push("Total notes: " + Object.keys(db.notes || {}).length);
  lines.push("Total replies: " + Object.keys(db.replies || {}).length);
  lines.push("Total tags: " + Object.keys(db.tags || {}).length);
  lines.push("Total statuses: " + Object.keys(db.statuses || {}).length);
  lines.push("Total follow-ups: " + Object.keys(db.followUps || {}).length);
  lines.push("Total activity events: " + Object.keys(db.activity || {}).length);
  const demoLoaded = db.meta && db.meta.demoLoaded ? true : false;
  const onboarded = db.meta && db.meta.onboardingDone ? true : false;
  lines.push("Demo data loaded: " + (demoLoaded ? "yes" : "no"));
  lines.push("Onboarding done: " + (onboarded ? "yes" : "no"));
  lines.push("Schema migrations applied: " + JSON.stringify((db.meta && db.meta.schemaMigrations) || []));
  lines.push("");
  lines.push("Note: WhatsApp-Web adapter diagnostics (selector/observer health) are");
  lines.push("available in the panel's Diagnostics modal inside WhatsApp Web.");
  lines.push("");
  lines.push("Support: " + (brand.supportEmail || "witejackel@gmail.com"));
  return lines.join("\n");
}

async function renderDiagnostics() {
  const grid = $("diagGrid");
  if (!grid) return;
  const db = await storage.load();
  const demoLoaded = Boolean(db.meta && db.meta.demoLoaded);
  grid.innerHTML = "";
  const rows = [
    ["LeadDock version", brand.version || "1.0.0", true],
    ["Storage backend", storage.backendKind(), true],
    ["Total contacts", String(Object.keys(db.contacts || {}).length), true],
    ["Total notes", String(Object.keys(db.notes || {}).length), true],
    ["Total replies", String(Object.keys(db.replies || {}).length), true],
    ["Total tags", String(Object.keys(db.tags || {}).length), true],
    ["Total follow-ups", String(Object.keys(db.followUps || {}).length), true],
    ["Total activity events", String(Object.keys(db.activity || {}).length), true],
    ["Demo data loaded", demoLoaded ? "yes" : "no", !demoLoaded],
  ];
  for (const [label, detail, ok] of rows) {
    const row = document.createElement("div");
    row.className = "wf-set-row";
    row.style.gridTemplateColumns = "1fr auto 1fr";
    row.innerHTML =
      `<span style="font-weight:600">${esc(label)}</span>` +
      `<span style="font-weight:800;color:${ok ? "var(--success)" : "var(--warn)"}">${ok ? "✓" : "!"}</span>` +
      `<span style="color:var(--muted);text-align:right">${esc(detail)}</span>`;
    grid.appendChild(row);
  }
  const note = document.createElement("p");
  note.className = "wf-set-help";
  note.style.marginTop = "8px";
  note.textContent = "WhatsApp-Web adapter diagnostics (selector/observer health) are available in the panel's Diagnostics modal inside WhatsApp Web.";
  grid.appendChild(note);
}

// ---------- Replies ----------
function wireReplies() {
  $("addReply").addEventListener("click", () => openReplyEditor(null));
  $("replySearch").addEventListener("input", () => renderReplies());
  renderReplies();
}

async function renderReplies() {
  const list = $("replyList");
  list.innerHTML = "";
  const q = $("replySearch").value.trim().toLowerCase();
  let all = await replies.list();
  if (q) {
    all = all.filter((r) =>
      [r.name, r.shortcut, r.content, r.category].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }
  if (all.length === 0) {
    list.innerHTML = `<div class="wf-set-preview">No replies yet. Click "+ New reply" to create one.</div>`;
    return;
  }
  all.forEach((r) => {
    const row = document.createElement("div");
    row.className = "wf-set-row";
    row.innerHTML = `
      <span class="wf-set-row__preview" style="color:${brand.primaryColor};font-weight:700">/</span>
      <div>
        <div style="font-weight:600">${esc(r.name)}</div>
        <div style="font-size:12px;color:var(--muted)">${esc(r.shortcut || "—")} · ${esc(r.category || "General")} · used ${r.usageCount || 0}×</div>
      </div>
      <div style="font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.content)}</div>
      <div></div>
      <div></div>`;
    const editBtn = document.createElement("button");
    editBtn.className = "wf-btn"; editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openReplyEditor(r));
    const delBtn = document.createElement("button");
    delBtn.className = "wf-btn"; delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      if (!confirm(`Delete reply "${r.name}"?`)) return;
      await replies.remove(r.id);
      renderReplies();
    });
    row.children[2].replaceWith(editBtn);
    row.children[3].replaceWith(delBtn);
    list.appendChild(row);
  });
}

function openReplyEditor(r) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px";
  const modal = document.createElement("div");
  modal.style.cssText = "background:#fff;border-radius:14px;padding:20px;width:100%;max-width:520px;box-shadow:0 20px 60px rgba(0,0,0,0.3)";
  modal.innerHTML = `
    <h3 style="margin:0 0 12px">${r ? "Edit reply" : "New reply"}</h3>
    <label style="display:block;margin-bottom:8px;font-size:12px;font-weight:600">Name</label>
    <input id="rName" type="text" value="${esc(r ? r.name : "")}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:8px;font:inherit" />
    <label style="display:block;margin:12px 0 8px;font-size:12px;font-weight:600">Shortcut (e.g. /price)</label>
    <input id="rShortcut" type="text" value="${esc(r ? r.shortcut : "")}" placeholder="/price" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:8px;font:inherit" />
    <label style="display:block;margin:12px 0 8px;font-size:12px;font-weight:600">Category</label>
    <input id="rCategory" type="text" value="${esc(r ? r.category : "General")}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:8px;font:inherit" />
    <label style="display:block;margin:12px 0 8px;font-size:12px;font-weight:600">Content — supports {{name}} {{phone}} {{company}} {{product}}</label>
    <textarea id="rContent" rows="5" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:8px;font:inherit;resize:vertical">${esc(r ? r.content : "")}</textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button id="rCancel" class="wf-btn">Cancel</button>
      <button id="rSave" class="wf-btn wf-btn--primary">Save</button>
    </div>`;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  modal.querySelector("#rCancel").addEventListener("click", () => document.body.removeChild(overlay));
  modal.querySelector("#rSave").addEventListener("click", async () => {
    const name = modal.querySelector("#rName").value.trim();
    const content = modal.querySelector("#rContent").value;
    if (!name || !content.trim()) { alert("Name and content are required."); return; }
    const patch = {
      name,
      shortcut: modal.querySelector("#rShortcut").value.trim(),
      category: modal.querySelector("#rCategory").value.trim() || "General",
      content,
    };
    try {
      if (r) await replies.update(r.id, patch);
      else await replies.create(patch);
      document.body.removeChild(overlay);
      renderReplies();
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  });
  modal.querySelector("#rName").focus();
}

// ---------- Statuses ----------
function wireStatuses() {
  $("addStatus").addEventListener("click", async () => {
    await statuses.create({ name: "New Status", color: "#6B7280", order: 99 });
    renderStatuses();
  });
  renderStatuses();
}

async function renderStatuses() {
  const list = $("statusList");
  list.innerHTML = "";
  const all = await statuses.list();
  all.forEach((s) => {
    const row = document.createElement("div");
    row.className = "wf-set-row";
    row.innerHTML = `
      <input type="color" value="${esc(s.color)}" data-id="${esc(s.id)}" data-field="color" />
      <input type="text" value="${esc(s.name)}" data-id="${esc(s.id)}" data-field="name" />
      <span class="wf-set-row__preview">order ${s.order}</span>
      <button class="wf-btn">Save</button>
      <button class="wf-btn">Delete</button>`;
    const [colorInp, nameInp, , saveBtn, delBtn] = row.children;
    saveBtn.addEventListener("click", async () => {
      await statuses.update(s.id, { name: nameInp.value.trim() || s.name, color: colorInp.value });
      renderStatuses();
    });
    delBtn.addEventListener("click", async () => {
      if (!confirm(`Delete status "${s.name}"? Contacts keep the id until reassigned.`)) return;
      await statuses.remove(s.id);
      renderStatuses();
    });
    list.appendChild(row);
  });
}

// ---------- Tags ----------
function wireTags() {
  $("addTag").addEventListener("click", async () => {
    await tags.create({ name: "New Tag", color: "#6B7280" });
    renderTags();
  });
  renderTags();
}

async function renderTags() {
  const list = $("tagList");
  list.innerHTML = "";
  const all = await tags.list();
  all.forEach((t) => {
    const row = document.createElement("div");
    row.className = "wf-set-row";
    row.innerHTML = `
      <input type="color" value="${esc(t.color)}" />
      <input type="text" value="${esc(t.name)}" />
      <span></span>
      <button class="wf-btn">Save</button>
      <button class="wf-btn">Delete</button>`;
    const [colorInp, nameInp, , saveBtn, delBtn] = row.children;
    saveBtn.addEventListener("click", async () => {
      await tags.update(t.id, { name: nameInp.value.trim() || t.name, color: colorInp.value });
      renderTags();
    });
    delBtn.addEventListener("click", async () => {
      if (!confirm(`Delete tag "${t.name}"? It will be removed from all contacts.`)) return;
      await tags.remove(t.id);
      renderTags();
    });
    list.appendChild(row);
  });
}

// ---------- Data ----------
function wireData() {
  $("exportCsv").addEventListener("click", async () => {
    const csv = await data.exportContactsCsv();
    download("leaddock-contacts.csv", csv, "text/csv");
  });
  $("downloadTemplate").addEventListener("click", () => {
    download("leaddock-template.csv", data.csvTemplateString(), "text/csv");
  });
  $("importCsvInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    const preview = await data.previewImportCsv(text);
    const box = $("importPreview");
    if (preview.summary.totalRows === 0) {
      box.innerHTML = `<div class="wf-set-preview__err">CSV is empty or has no header row.</div>`;
      return;
    }
    let html = `<div class="wf-set-preview__ok">Found ${preview.summary.totalRows} rows · ${preview.summary.valid} valid · ${preview.summary.errors} errors</div>`;
    if (preview.errors.length) {
      html += `<ul style="margin:6px 0 0;padding-left:18px;color:var(--danger)">`;
      preview.errors.slice(0, 20).forEach((er) => { html += `<li>Row ${er.row}: ${esc(er.message)}</li>`; });
      html += `</ul>`;
    }
    html += `<div style="margin-top:8px"><button id="commitImport" class="wf-btn wf-btn--primary">Import ${preview.summary.valid} contacts (replace existing)</button></div>`;
    box.innerHTML = html;
    $("commitImport").addEventListener("click", async () => {
      try {
        const n = await data.commitImport(preview.rows);
        box.innerHTML = `<div class="wf-set-preview__ok">Imported ${n} contacts.</div>`;
      } catch (err) {
        box.innerHTML = `<div class="wf-set-preview__err">Import failed: ${esc(err.message)}</div>`;
      }
    });
  });

  $("exportBackup").addEventListener("click", async () => {
    const backup = await data.exportBackup();
    download("leaddock-backup.json", JSON.stringify(backup, null, 2), "application/json");
  });
  $("restoreInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    const box = $("restorePreview");
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (err) {
      box.innerHTML = `<div class="wf-set-preview__err">Invalid JSON: ${esc(err.message)}</div>`;
      return;
    }
    const v = data.validateBackupPayload(payload);
    if (!v.ok) {
      box.innerHTML = `<div class="wf-set-preview__err">Not a valid LeadDock backup: ${esc(v.errors.join("; "))}</div>`;
      return;
    }
    const d = v.value.data;
    const counts = {
      contacts: Object.keys(d.contacts || {}).length,
      notes: Object.keys(d.notes || {}).length,
      replies: Object.keys(d.replies || {}).length,
      tags: Object.keys(d.tags || {}).length,
      statuses: Object.keys(d.statuses || {}).length,
      followUps: Object.keys(d.followUps || {}).length,
    };
    box.innerHTML = `<div class="wf-set-preview__ok">Backup v${v.value.version} · exported ${esc(v.value.exportedAt)}</div>` +
      `<ul style="margin:6px 0;padding-left:18px">` +
      Object.entries(counts).map(([k, n]) => `<li>${k}: ${n}</li>`).join("") +
      `</ul><div style="margin-top:8px"><button id="commitRestore" class="wf-btn wf-btn--danger">Replace current data with this backup</button></div>`;
    $("commitRestore").addEventListener("click", async () => {
      try {
        await data.restoreBackup(payload);
        box.innerHTML = `<div class="wf-set-preview__ok">Restore complete.</div>`;
        renderReplies(); renderStatuses(); renderTags();
      } catch (err) {
        box.innerHTML = `<div class="wf-set-preview__err">Restore failed: ${esc(err.message)}</div>`;
      }
    });
  });

  $("loadDemo").addEventListener("click", async () => {
    if (!confirm("Load demo data? This replaces your current CRM data with fictional sample records.")) return;
    await demo.loadDemo();
    alert("Demo data loaded.");
    renderReplies(); renderStatuses(); renderTags();
  });
  $("resetAll").addEventListener("click", async () => {
    if (!confirm("Reset ALL data? This permanently deletes all contacts, notes, and settings. Export a backup first if unsure.")) return;
    await data.resetAll();
    alert("All data reset.");
    renderReplies(); renderStatuses(); renderTags();
  });
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime || "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

function esc(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

document.addEventListener("DOMContentLoaded", init);
