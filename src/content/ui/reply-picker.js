/**
 * ui/reply-picker.js — the ⚡ Replies launcher near the composer.
 *
 * Renders a small floating button anchored to the composer footer. Clicking
 * opens a searchable reply picker. Selecting a reply INSERTS its rendered
 * content into the composer (replacing a matched slash shortcut if present).
 * It NEVER sends the message.
 */
import { makeEl } from "../utils/sanitize.js";
import * as replies from "../replies/manager.js";
import { render } from "../replies/renderer.js";
import { matchShortcut } from "../replies/parser.js";
import * as adapter from "../whatsapp/adapter.js";
import * as toast from "./toast.js";
import * as modal from "./modal.js";

let launcherEl = null;
let lastInsert = null;

/** Mount the launcher near the composer. Safe to call repeatedly. */
export async function mount() {
  const footer = adapter.getComposer()?.closest("footer") || adapter.getComposer()?.parentElement;
  if (!footer) return false;
  if (launcherEl && footer.contains(launcherEl)) return true;
  // Remove a previous launcher if orphaned.
  unmount();
  launcherEl = makeEl("button", {
    type: "button",
    class: "wf-reply-launcher",
    title: "Quick Replies (⚡)",
    "aria-label": "Open quick replies",
    text: "⚡ Replies",
  });
  launcherEl.addEventListener("click", openPicker);
  // Insert before the composer input within the footer if possible.
  try {
    footer.insertBefore(launcherEl, footer.firstChild);
  } catch (err) {
    footer.appendChild(launcherEl);
  }
  return true;
}

export function unmount() {
  if (launcherEl && launcherEl.parentNode) {
    launcherEl.parentNode.removeChild(launcherEl);
  }
  launcherEl = null;
}

/** Open the reply picker modal. */
export async function openPicker() {
  const all = await replies.list();
  const contact = adapter.getCurrentContact();
  let resolvedContact = null;
  if (contact) {
    const { resolveOrCreate } = await import("../crm/contacts.js");
    try {
      resolvedContact = await resolveOrCreate({ name: contact.name, phone: contact.phone });
    } catch (err) {
      resolvedContact = null;
    }
  }

  const input = makeEl("input", {
    class: "wf-cp__input",
    type: "text",
    placeholder: "Search replies… (↑↓ to move, Enter to insert, Esc to close)",
    autocomplete: "off",
    "aria-label": "Search quick replies",
  });
  const list = makeEl("div", { class: "wf-rp__list", role: "listbox", "aria-label": "Quick replies" });

  let selected = 0;
  let filtered = all.slice();

  function renderList() {
    list.innerHTML = "";
    if (filtered.length === 0) {
      list.appendChild(makeEl("div", { class: "wf-cp__empty", text: "No replies yet. Add some in Settings." }));
      return;
    }
    filtered.slice(0, 30).forEach((r, i) => {
      const item = makeEl("button", {
        type: "button",
        class: "wf-rp__item" + (i === selected ? " wf-rp__item--active" : ""),
        role: "option",
        "aria-selected": i === selected ? "true" : "false",
      });
      const top = makeEl("div", { class: "wf-rp__top" });
      top.appendChild(makeEl("span", { class: "wf-rp__name", text: r.name }));
      if (r.shortcut) top.appendChild(makeEl("code", { class: "wf-rp__shortcut", text: r.shortcut }));
      item.appendChild(top);
      const preview = render(r.content, resolvedContact || {});
      item.appendChild(makeEl("div", { class: "wf-rp__preview", text: preview }));
      if (r.category) item.appendChild(makeEl("span", { class: "wf-cp__cat", text: r.category }));
      item.addEventListener("mouseenter", () => {
        selected = i;
        updateActive();
      });
      item.addEventListener("click", () => insertAt(i));
      list.appendChild(item);
    });
  }

  function updateActive() {
    list.querySelectorAll(".wf-rp__item").forEach((el, i) => {
      const on = i === selected;
      el.classList.toggle("wf-rp__item--active", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function insertAt(i) {
    const r = filtered[i];
    if (!r) return;
    insertReply(r, resolvedContact);
    modal.close(m.id);
  }

  input.addEventListener("input", () => {
    selected = 0;
    const q = input.value.trim().toLowerCase();
    filtered = !q
      ? all.slice()
      : all.filter((r) =>
          [r.name, r.shortcut, r.content, r.category].filter(Boolean).join(" ").toLowerCase().includes(q)
        );
    renderList();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selected = Math.min(selected + 1, Math.max(0, filtered.length - 1));
      updateActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selected = Math.max(selected - 1, 0);
      updateActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      insertAt(selected);
    } else if (e.key === "Escape") {
      e.preventDefault();
      modal.close(m.id);
    }
  });

  const m = modal.open({
    title: "Quick Replies",
    content: [input, list],
    size: "md",
    closeOnEscape: true,
  });
  renderList();
  setTimeout(() => input.focus(), 50);
}

/**
 * Insert a reply into the composer. If the composer currently ends with a
 * matching slash shortcut, that shortcut text is replaced; otherwise the text
 * is appended at the caret. Increments usageCount. Never sends.
 */
export async function insertReply(reply, contact) {
  const text = render(reply.content, contact || {});
  const current = adapter.readComposerText() || "";
  const matched = matchShortcut(current, [reply]);
  let ok = false;
  if (matched) {
    // Replace the trailing shortcut token.
    const prefix = matched.match.prefix;
    ok = adapter.insertMessage(text, {
      replaceRange: { start: prefix.length, end: current.length },
    });
  } else {
    ok = adapter.insertMessage(text, { append: !current });
  }
  if (ok) {
    lastInsert = { replyId: reply.id, at: Date.now() };
    try {
      await replies.incrementUsage(reply.id);
    } catch (err) {}
    toast.success(`Inserted "${reply.name}" — review and press send when ready.`);
  } else {
    toast.error("Couldn't find the WhatsApp composer. Open a chat first.");
  }
  return ok;
}

export function getLastInsert() {
  return lastInsert;
}

export default { mount, unmount, openPicker, insertReply, getLastInsert };
