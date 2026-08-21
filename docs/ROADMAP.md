# WaFlow Roadmap

This document describes what is shipped (V1) and what is being explored for V2.
V2 items are **exploration, not commitment** — they may or may not ship, in
this order, or at all.

> **Independence notice.** WaFlow is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.

---

## V1 — Current shipped scope

WaFlow **v1.0.0** is the initial stable release. It ships the complete feature
set described in `README.md` and `CHANGELOG.md`:

- Lead statuses (New Lead, Contacted, Interested, Follow Up, Qualified, Won,
  Lost — editable).
- Tags, contact notes, editable contact fields.
- Quick replies with `/shortcuts`.
- Template variables (`{{name}}`, `{{phone}}`, `{{company}}, {{product}}`).
- Follow-ups with presets and custom dates (no auto-send).
- Dashboard popup.
- Pipeline (Kanban) view.
- Search and filters.
- CSV import/export.
- JSON backup/restore with schema versioning + migrations.
- Privacy mode.
- Command palette (`Ctrl/Cmd+K`).
- Demo mode with fictional data.
- White-label config in `src/config/brand.js`.
- Local-first via `chrome.storage.local`.
- Manifest V3, vanilla JS, no backend.

V1 is the supported version. Bug fixes for V1 will continue to ship as 1.0.x
patch releases. The next minor (1.1.x) track may add small, low-risk
conveniences as identified by user feedback — those will be added to this
document when scoped.

---

## V2 — Exploration (not committed)

These ideas are under exploration. None of them is promised. If and when they
ship, they will be moved out of this section and into `CHANGELOG.md`.

### 1. Richer analytics

- Per-status conversion rates.
- Average time-in-status.
- Follow-up adherence (delivered vs. due).
- Lead source attribution.
- Optional exportable dashboard snapshots.

V1's dashboard shows counts. V2 could show trends over time. The challenge is
doing this without a backend — analytics over `chrome.storage.local` data
need a reasonable time window and may require retention settings.

### 2. Richer custom fields

- User-defined fields beyond `name / phone / company / email / product /
  budget / source` (e.g., text, number, date, single-select, multi-select).
- Field-level display in the panel (which fields show up first).
- Field-level search and filter.

V1 ships a fixed set of contact fields. V2 could make them fully
user-defined, with the schema migration system carrying the change.

### 3. Optional end-to-end-encrypted cloud sync

- User-controlled sync between browsers (e.g., work and home computer).
- End-to-end encryption with a user-held passphrase; server stores only
  ciphertext.
- Opt-in only; default remains local-first.

This is the most-requested V2 idea and the most delicate. The default build
must remain local-first; cloud sync, if added, will be opt-in and will be
gated behind a separate privacy disclosure. The hosting model (self-host vs.
managed) is undecided.

### 4. Team features

- Shared contact database across multiple seats.
- Per-seat assignment of leads.
- Lightweight activity feed (who edited which contact).
- Optional role-based visibility (e.g., "can see notes" vs. "can edit
  notes").

Team features require a backend by definition, which conflicts with V1's
local-first posture. Any V2 team feature would be optional and additive, not
a replacement for local-first mode.

### 5. Optional integrations

- Export to a real CRM (HubSpot, Pipedrive, Bitrix24, custom) via their
  public APIs.
- Calendar integration for follow-ups (Google Calendar, CalDAV).
- Webhook integration for external automation (e.g., notify Slack when a
  lead moves to "Qualified").

All integrations would be opt-in, would require additional permissions, and
would be governed by a separate privacy disclosure for the data sent to the
integrated service.

### 6. API for custom adapters

- A public adapter contract so third-party developers can build adapters for
  other chat products (e.g., Telegram Web, Signal Desktop) without forking
  WaFlow's CRM core.
- Documentation, type definitions, and a reference implementation.

V1's adapter is internal to `src/content/whatsapp/`. V2 could formalize the
contract and expose it as a documented public API.

### 7. Other ideas (lower priority)

- Dark theme parity with WhatsApp Web dark mode.
- Right-to-left layout for Arabic / Hebrew users.
- Localization (UI translation; currently English-only).
- Import from a competing lightweight CRM.
- Per-contact file attachments (stored locally).
- Backup reminders (in-extension, no notifications).

None of these is committed. They are listed so users and contributors know
what is on the table.

---

## What V2 will not include

To set expectations clearly, the following are **not** on the roadmap:

- Auto-send, bulk-send, scheduled-send, drip campaigns.
- Message-history scraping or message-content reading.
- Telemetry or analytics about the user (without explicit opt-in).
- Any feature that claims WhatsApp / Meta affiliation or certification.
- Features that would require `tabs`, `cookies`, `webRequest`,
  `clipboardRead`, or similar broad permissions.

If a V2 idea cannot be implemented without crossing these lines, it will
not ship.

---

## How to influence the roadmap

- Open a GitHub issue at
  <https://github.com/witejackel-eng/waflow-whatsapp-crm/issues> with the
  `roadmap` label.
- Describe the use case, not just the feature request. A clear use case helps
  us evaluate whether the feature fits the local-first, no-auto-send
  constraints.
- Upvotes (GitHub reactions) help us prioritize among candidate ideas.

We do not commit to timelines. We do commit to keeping WaFlow independent,
local-first by default, and respectful of the user's data.
