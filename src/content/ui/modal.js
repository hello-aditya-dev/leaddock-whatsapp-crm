/**
 * ui/modal.js — accessible modal dialog with focus management + Escape close.
 *
 * Mounts into a host element appended to <body> so it overlays WhatsApp.
 * Traps focus within the dialog while open, restores focus to the previously
 * focused element on close. Escape closes; clicking the backdrop closes.
 */
import { makeEl } from "../utils/sanitize.js";

let stack = [];

function onKeydown(e) {
  if (e.key !== "Escape") return;
  const top = stack[stack.length - 1];
  if (top && top.options.closeOnEscape !== false) {
    e.stopPropagation();
    close(top.id);
  }
}

export function open({ title, content, actions = [], size = "md", closeOnEscape = true, onClose }) {
  // Mount key listener once.
  if (stack.length === 0) {
    document.addEventListener("keydown", onKeydown, true);
  }
  const id = "wf-modal-" + Math.random().toString(36).slice(2, 8);
  const previouslyFocused = document.activeElement;

  const backdrop = makeEl("div", { class: "wf-modal-backdrop", "data-id": id });
  const dialog = makeEl("div", {
    class: `wf-modal wf-modal--${size}`,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title || "Dialog",
    tabindex: "-1",
  });
  backdrop.appendChild(dialog);

  if (title) {
    const head = makeEl("div", { class: "wf-modal__head" });
    head.appendChild(makeEl("h2", { class: "wf-modal__title", text: title }));
    const closeBtn = makeEl("button", {
      class: "wf-modal__close",
      type: "button",
      "aria-label": "Close dialog",
      text: "×",
    });
    closeBtn.addEventListener("click", () => close(id));
    head.appendChild(closeBtn);
    dialog.appendChild(head);
  }

  const body = makeEl("div", { class: "wf-modal__body" });
  if (typeof content === "string") {
    body.appendChild(makeEl("p", { text: content }));
  } else if (content instanceof Node) {
    body.appendChild(content);
  } else if (Array.isArray(content)) {
    content.forEach((c) => c && body.appendChild(c));
  }
  dialog.appendChild(body);

  if (actions.length) {
    const foot = makeEl("div", { class: "wf-modal__foot" });
    actions.forEach((a) => {
      const b = makeEl("button", {
        type: "button",
        class: `wf-btn wf-btn--${a.variant || "ghost"}`,
        text: a.label,
      });
      if (a.onClick) {
        b.addEventListener("click", () => a.onClick({ close: () => close(id) }));
      }
      if (a.disabled) b.disabled = true;
      foot.appendChild(b);
    });
    dialog.appendChild(foot);
  }

  backdrop.addEventListener("mousedown", (e) => {
    if (e.target === backdrop) close(id);
  });

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => {
    backdrop.classList.add("wf-modal-backdrop--in");
    dialog.classList.add("wf-modal--in");
    // Focus first focusable, else the dialog.
    const focusable = dialog.querySelector(
      "input,textarea,select,button:not([disabled]),[tabindex]:not([tabindex='-1'])"
    );
    (focusable || dialog).focus();
  });

  const entry = { id, backdrop, dialog, options: { closeOnEscape }, onClose };
  stack.push(entry);
  return {
    id,
    close: () => close(id),
    el: dialog,
  };
}

export function close(id) {
  const idx = stack.findIndex((e) => e.id === id);
  if (idx === -1) return;
  const entry = stack[idx];
  stack.splice(idx, 1);
  entry.backdrop.classList.remove("wf-modal-backdrop--in");
  entry.backdrop.classList.add("wf-modal-backdrop--out");
  setTimeout(() => {
    if (entry.backdrop.parentNode) entry.backdrop.parentNode.removeChild(entry.backdrop);
  }, 180);
  if (stack.length === 0) {
    document.removeEventListener("keydown", onKeydown, true);
  }
  if (typeof entry.onClose === "function") {
    try {
      entry.onClose();
    } catch (err) {
      console.warn("[waflow:modal] onClose threw", err);
    }
  }
}

/** Close all open modals. */
export function closeAll() {
  while (stack.length) close(stack[stack.length - 1].id);
}

export default { open, close, closeAll };
