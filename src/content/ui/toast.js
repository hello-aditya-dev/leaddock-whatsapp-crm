/**
 * ui/toast.js — small actionable toasts (NOT giant alerts).
 *
 * Toasts are appended to a dedicated host element appended to <body> (outside
 * the CRM shadow root) so they overlay WhatsApp correctly with a high z-index.
 */
import { makeEl } from "../utils/sanitize.js";
import { debounce } from "../utils/debounce.js";

let host = null;
function ensureHost() {
  if (host && document.body.contains(host)) return host;
  host = document.createElement("div");
  host.className = "wf-toast-host";
  host.setAttribute("role", "status");
  host.setAttribute("aria-live", "polite");
  document.body.appendChild(host);
  return host;
}

export function toast(message, opts = {}) {
  const h = ensureHost();
  const variant = opts.variant || "info"; // info | success | error | warn
  const item = makeEl("div", { class: `wf-toast wf-toast--${variant}`, role: "alert" });
  item.appendChild(makeEl("span", { class: "wf-toast__msg", text: String(message || "") }));
  if (opts.action && opts.action.label) {
    const b = makeEl("button", { class: "wf-toast__action", type: "button", text: opts.action.label });
    b.addEventListener("click", () => {
      try {
        opts.action.onClick && opts.action.onClick();
      } finally {
        dismiss();
      }
    });
    item.appendChild(b);
  }
  const close = makeEl("button", { class: "wf-toast__close", type: "button", "aria-label": "Dismiss", text: "×" });
  close.addEventListener("click", dismiss);
  item.appendChild(close);
  h.appendChild(item);
  // animate in
  requestAnimationFrame(() => item.classList.add("wf-toast--in"));

  const timeout = opts.timeout == null ? 3800 : opts.timeout;
  let timer = null;
  function dismiss() {
    if (timer) clearTimeout(timer);
    item.classList.remove("wf-toast--in");
    item.classList.add("wf-toast--out");
    setTimeout(() => {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, 220);
  }
  if (timeout > 0) timer = setTimeout(dismiss, timeout);
  return dismiss;
}

export const success = (m, opts) => toast(m, { ...opts, variant: "success" });
export const error = (m, opts) => toast(m, { ...opts, variant: "error", timeout: opts && opts.timeout == null ? 6000 : opts && opts.timeout });
export const warn = (m, opts) => toast(m, { ...opts, variant: "warn" });
export const info = (m, opts) => toast(m, { ...opts, variant: "info" });

export default { toast, success, error, warn, info };
