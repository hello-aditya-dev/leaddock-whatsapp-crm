/**
 * ui/command-palette.js — Ctrl/Cmd+K command palette.
 *
 * Searchable, keyboard-navigable, categorized. Opens into a host on <body>.
 */
import { makeEl } from "../utils/sanitize.js";
import * as modal from "./modal.js";

let commands = [];
let active = null;

/**
 * Register a command.
 * @param {{id:string,label:string,category?:string,hint?:string,run:()=>void,keywords?:string}} cmd
 */
export function register(cmd) {
  if (!cmd || !cmd.id || typeof cmd.run !== "function") return;
  // Replace if same id.
  commands = commands.filter((c) => c.id !== cmd.id);
  commands.push(cmd);
}

export function unregister(id) {
  commands = commands.filter((c) => c.id !== id);
}

export function clear() {
  commands = [];
}

/** Open the palette. */
export function openPalette() {
  if (active) {
    closePalette();
    return;
  }
  const input = makeEl("input", {
    class: "wf-cp__input",
    type: "text",
    placeholder: "Search commands… (type to filter, ↑↓ to move, Enter to run, Esc to close)",
    autocomplete: "off",
    "aria-label": "Search commands",
  });

  const list = makeEl("div", { class: "wf-cp__list", role: "listbox", "aria-label": "Commands" });

  const wrap = makeEl("div", { class: "wf-cp" });
  wrap.appendChild(input);
  wrap.appendChild(list);

  let selected = 0;
  let filtered = filter(commands, "");

  function render() {
    list.innerHTML = "";
    filtered = filter(commands, input.value);
    if (filtered.length === 0) {
      list.appendChild(
        makeEl("div", { class: "wf-cp__empty", text: "No commands match your search." })
      );
      return;
    }
    filtered.slice(0, 12).forEach((cmd, i) => {
      const item = makeEl("button", {
        type: "button",
        class: "wf-cp__item" + (i === selected ? " wf-cp__item--active" : ""),
        role: "option",
        "aria-selected": i === selected ? "true" : "false",
      });
      const label = makeEl("span", { class: "wf-cp__label", text: cmd.label });
      item.appendChild(label);
      if (cmd.category) {
        item.appendChild(makeEl("span", { class: "wf-cp__cat", text: cmd.category }));
      }
      item.addEventListener("mouseenter", () => {
        selected = i;
        updateActive();
      });
      item.addEventListener("click", () => {
        runFiltered(i);
      });
      list.appendChild(item);
    });
  }

  function updateActive() {
    const items = list.querySelectorAll(".wf-cp__item");
    items.forEach((el, i) => {
      const on = i === selected;
      el.classList.toggle("wf-cp__item--active", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function runFiltered(i) {
    const cmd = filtered[i];
    if (!cmd) return;
    closePalette();
    try {
      cmd.run();
    } catch (err) {
      console.warn("[waflow:palette] command threw", err);
    }
  }

  input.addEventListener("input", () => {
    selected = 0;
    render();
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
      runFiltered(selected);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    }
  });

  active = modal.open({
    title: "Command Palette",
    content: wrap,
    size: "md",
    closeOnEscape: true,
    onClose: () => {
      active = null;
    },
  });
  // Remove default modal header styling clutter — palette has its own input.
  // We still keep the title for aria.
  render();
  setTimeout(() => input.focus(), 50);
}

export function closePalette() {
  if (active) {
    modal.close(active.id);
    active = null;
  }
}

function filter(list, q) {
  const query = String(q || "").trim().toLowerCase();
  if (!query) return list.slice();
  return list
    .filter((c) => {
      const hay = [c.label, c.category, c.keywords].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(query);
    })
    .slice(0, 30);
}

/** Wire Ctrl/Cmd+K globally (on the document). Returns an unbind function. */
export function bindGlobalShortcut() {
  function handler(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      e.stopPropagation();
      openPalette();
    }
  }
  document.addEventListener("keydown", handler, true);
  return () => document.removeEventListener("keydown", handler, true);
}

export default { register, unregister, clear, openPalette, closePalette, bindGlobalShortcut };
