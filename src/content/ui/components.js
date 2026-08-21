/**
 * ui/components.js — reusable, safe DOM component builders.
 *
 * Every builder uses makeEl (which never parses HTML for user data) and
 * escapes text via textContent. No raw innerHTML with user data anywhere.
 */
import { makeEl, escapeHtml } from "../utils/sanitize.js";

/** Badge for a status. */
export function StatusBadge(status) {
  if (!status) return makeEl("span", { class: "wf-badge wf-badge--muted", text: "—" });
  const el = makeEl("span", {
    class: "wf-badge",
    style: `--wf-badge-color:${status.color || "#6B7280"}`,
    text: status.name,
  });
  return el;
}

/** Pill for a tag. */
export function TagPill(tag, opts = {}) {
  if (!tag) return makeEl("span", { class: "wf-pill wf-pill--muted", text: "" });
  const el = makeEl("span", {
    class: "wf-pill",
    style: `--wf-pill-color:${tag.color || "#6B7280"}`,
  });
  el.appendChild(document.createTextNode(tag.name));
  if (opts.onRemove) {
    const x = makeEl("button", {
      class: "wf-pill__x",
      type: "button",
      "aria-label": `Remove tag ${tag.name}`,
      text: "×",
    });
    x.addEventListener("click", (e) => {
      e.stopPropagation();
      opts.onRemove();
    });
    el.appendChild(x);
  }
  return el;
}

/** Primary/secondary/ghost button. */
export function Button(label, opts = {}) {
  const b = makeEl("button", {
    type: opts.type || "button",
    class: `wf-btn wf-btn--${opts.variant || "primary"}`,
    text: label,
    title: opts.title || label,
  });
  if (opts.onClick) b.addEventListener("click", opts.onClick);
  if (opts.disabled) b.disabled = true;
  return b;
}

/** A labeled input with optional help text. */
export function Field(labelText, inputEl, opts = {}) {
  const wrap = makeEl("label", { class: "wf-field" });
  if (labelText) {
    wrap.appendChild(makeEl("span", { class: "wf-field__label", text: labelText }));
  }
  inputEl.classList.add("wf-field__input");
  if (opts.placeholder) inputEl.setAttribute("placeholder", opts.placeholder);
  wrap.appendChild(inputEl);
  if (opts.help) {
    wrap.appendChild(makeEl("span", { class: "wf-field__help", text: opts.help }));
  }
  return wrap;
}

/** Empty state placeholder. */
export function EmptyState(title, subtitle, opts = {}) {
  const wrap = makeEl("div", { class: "wf-empty" });
  wrap.appendChild(makeEl("div", { class: "wf-empty__icon", text: opts.icon || "·" }));
  wrap.appendChild(makeEl("div", { class: "wf-empty__title", text: title }));
  if (subtitle) wrap.appendChild(makeEl("div", { class: "wf-empty__sub", text: subtitle }));
  if (opts.action) wrap.appendChild(opts.action);
  return wrap;
}

/** Spinner. */
export function Spinner(opts = {}) {
  return makeEl("div", { class: "wf-spinner", "aria-label": opts.label || "Loading", role: "status" });
}

/** Section heading. */
export function SectionHeading(text, opts = {}) {
  const h = makeEl("div", { class: "wf-section-head" });
  h.appendChild(makeEl("h3", { class: "wf-section-head__title", text }));
  if (opts.action) h.appendChild(opts.action);
  return h;
}

/** Tiny inline icon (text glyph; avoids bundling icon fonts). */
export function Icon(name) {
  const glyphs = {
    chevron: "›",
    close: "×",
    search: "⌕",
    bolt: "⚡",
    note: "✎",
    tag: "▮",
    follow: "◷",
    export: "↧",
    settings: "⚙",
    palette: "⌘",
    plus: "+",
    trash: "⌫",
  };
  return makeEl("span", { class: "wf-icon", "aria-hidden": "true", text: glyphs[name] || "·" });
}

export default { StatusBadge, TagPill, Button, Field, EmptyState, Spinner, SectionHeading, Icon };
