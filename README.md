# LeadDock

> Turn WhatsApp Web into a lightweight sales CRM.

LeadDock is a Manifest V3 Chrome extension that adds a lightweight, local-first
sales CRM directly on top of WhatsApp Web. Track leads, attach notes, manage
follow-ups, and insert reusable replies without leaving the conversation — all
while keeping every CRM record inside your own browser.

- **Status:** v1.0.0 (initial stable release)
- **Manifest:** V3
- **Stack:** Vanilla JavaScript (ES modules), HTML, CSS
- **Storage:** `chrome.storage.local` — single versioned schema
- **Permissions:** `storage` + host `https://web.whatsapp.com/*`
- **Backend:** None. CRM data never leaves the browser by default.

> **Independence notice.** LeadDock is an independent productivity extension for
> WhatsApp Web. It is not affiliated with, made by, or endorsed by WhatsApp or
> Meta. "WhatsApp" and "WhatsApp Web" are used descriptively to identify the
> application the extension interoperates with.

---

## Table of contents

1. [What LeadDock does](#what-leaddock-does)
2. [Feature list](#feature-list)
3. [Project structure](#project-structure)
4. [Installation](#installation)
5. [Developer setup](#developer-setup)
6. [Customization overview](#customization-overview)
7. [Architecture overview](#architecture-overview)
8. [Storage model](#storage-model)
9. [Privacy summary](#privacy-summary)
10. [Troubleshooting](#troubleshooting)
11. [Commercial licensing](#commercial-licensing)
12. [Current status](#current-status)

---

## What LeadDock does

LeadDock turns WhatsApp Web into a structured sales workspace. When you open a
chat, the extension detects the contact context, opens a CRM panel beside the
conversation, and lets you:

- Assign a lead status (New Lead → Won / Lost).
- Add tags and contact notes.
- Set follow-up dates without sending any message.
- Insert reusable, templated replies into the composer using `/shortcuts`.
- See a dashboard of today's follow-ups and pipeline state.
- Search, filter, import, and export CRM data.

You always press send. LeadDock **never auto-sends** messages, **never scrapes**
message history, and **never transmits** CRM data to any server.

## Feature list

| Area                 | Capabilities                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Lead management      | Lead statuses (editable), tags, contact fields, lead search, recent activity metadata         |
| Statuses             | New Lead, Contacted, Interested, Follow Up, Qualified, Won, Lost — fully editable              |
| Notes                | Add / edit / delete, timestamps, multiple notes per contact, newest-first display            |
| Quick replies        | Reply manager, name, `/shortcut`, content, category, usage count, edit/delete, search        |
| Reply variables      | `{{name}}`, `{{phone}}`, `{{company}}`, `{{product}}` (unknown variables remain visible)     |
| Follow-ups           | Set date, presets (Today / Tomorrow / In 3 Days / Next Week), due state, dashboard, open chat |
| Dashboard / popup    | Total leads, status counts, today's follow-ups, recent leads, search & export shortcuts      |
| Pipeline             | Kanban columns based on statuses; status dropdowns (drag-and-drop optional, correctness first)|
| Search               | By name, phone, company, notes, tags; filter by status, tag, follow-up due                    |
| Data portability     | CSV import/export, JSON backup/restore, schema versioning + migrations                       |
| Privacy mode         | One-click blur/hide of sensitive CRM details for screen recordings                          |
| Command palette      | `Ctrl/Cmd+K` with search, status, notes, replies, follow-ups, export, settings               |
| Demo mode            | Fictional sample data clearly marked as DEMO                                                |
| White-label          | Single `src/config/brand.js` file controls product name, colors, links, logo                 |

## Project structure

```
leaddock/
  manifest.json
  package.json
  README.md  LICENSE.md  PRIVACY.md  SECURITY.md  CHANGELOG.md  CONTRIBUTING.md
  docs/
    ARCHITECTURE.md  INSTALLATION.md  CUSTOMIZATION.md  PUBLISHING.md
    TROUBLESHOOTING.md  QA.md  SELLING.md  LICENSES.md  ROADMAP.md
    PRODUCT-LISTING.md  LAUNCH-CHECKLIST.md
  src/
    background/service-worker.js
    content/
      main.js
      whatsapp/ (adapter.js, selectors.js, observer.js, composer.js, navigation.js, contact-detector.js)
      crm/ (contacts.js, notes.js, statuses.js, tags.js, followups.js, fields.js)
      replies/ (manager.js, parser.js, renderer.js)
      ui/ (panel.js, modal.js, toast.js, command-palette.js, reply-picker.js, components.js, styles.css)
      storage/ (storage.js, schema.js, migrations.js)
      utils/ (ids.js, dates.js, csv.js, debounce.js, sanitize.js, validators.js)
      config/brand.js
    popup/ (index.html, popup.js, popup.css)
    options/ (index.html, settings.js, settings.css)
  assets/icons/
  scripts/ (build.js, package.js, release.js)
  fixtures/ (demo-contacts.csv, demo-statuses.json, demo-tags.json, demo-replies.json, DATA_SCHEMA.json)
  tests/
```

## Installation

LeadDock is currently distributed as an unpacked extension (developer / commercial
kit) and as a packaged `.zip` ready for submission to the Chrome Web Store.

### A. Load unpacked (developer / buyer)

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome (or any Chromium browser supporting MV3).
3. Toggle **Developer mode** on (top-right).
4. Click **Load unpacked**.
5. Select the `leaddock/` directory (the one containing `manifest.json`).
6. Open `https://web.whatsapp.com`. The LeadDock CRM panel appears beside the
   open chat.

### B. Packaged extension (end users, after Web Store publication)

When published: install directly from the Chrome Web Store listing. See
`docs/PUBLISHING.md` for the publication process and `docs/INSTALLATION.md` for
step-by-step screenshots and verification steps.

> **WhatsApp tab reload.** If you installed or updated LeadDock while WhatsApp Web
> was already open, reload the `web.whatsapp.com` tab so the content script can
> initialize.

## Developer setup

Requirements:

- Node.js `>=18` (for the test suite and packaging scripts only — the extension
  itself is plain browser JavaScript and needs no build step).
- Chrome / Chromium with Manifest V3 support.

```bash
git clone https://github.com/witejackel-eng/leaddock-whatsapp-crm.git
cd leaddock-whatsapp-crm/leaddock
npm install
npm test         # runs the node:test suite under tests/
npm run lint     # eslint over src/ and tests/
npm run build    # produces a clean extension build under dist/
npm run package  # produces release/leaddock-extension-vX.Y.Z.zip + release/leaddock-source-vX.Y.Z.zip
```

Then load `leaddock/` (or `dist/`) as an unpacked extension as described above.

## Customization overview

LeadDock is white-label by design. The single source of truth for branding is:

```
src/config/brand.js
```

Common customizations:

- Rename the product (`name`, `shortName`).
- Change the accent color (`primaryColor`, `primaryColorDark`).
- Replace the logo (`assets/icons/*` and any `assets/logo.svg` you add).
- Update marketing and support links (`website`, `supportEmail`, `helpUrl`, `privacyUrl`).
- Replace default statuses, tags, and quick replies via the fixture files under
  `fixtures/` (see `demo-statuses.json`, `demo-tags.json`, `demo-replies.json`).

See `docs/CUSTOMIZATION.md` for the complete brand-field table and a white-label
checklist.

## Architecture overview

LeadDock uses a strict three-layer separation inside the content script:

1. **WhatsApp adapter** — `src/content/whatsapp/` is the **only** layer that
   knows WhatsApp Web DOM selectors. It exposes a stable interface:
   - `getCurrentChat()`
   - `getCurrentContact()`
   - `getComposer()`
   - `insertMessage(text)`
   - `openChat(contact)`
   - `observeChatChanges(callback)`

2. **CRM core** — `src/content/crm/`, `src/content/replies/`, and
   `src/content/storage/` know nothing about the WhatsApp DOM. They operate on
   plain data records and the storage schema.

3. **UI layer** — `src/content/ui/` renders the CRM panel, command palette,
   toasts, and modals inside a shadow root, isolated from WhatsApp's CSS.

The adapter abstraction is what keeps the CRM functional when WhatsApp updates
its DOM — only `src/content/whatsapp/selectors.js` needs to be updated.

See `docs/ARCHITECTURE.md` for the full component map, data-flow diagram,
observer strategy, and failure-mode handling.

## Storage model

All CRM data lives in `chrome.storage.local` under a single versioned schema:

```json
{
  "version": 1,
  "contacts": {},
  "notes": {},
  "replies": {},
  "tags": {},
  "statuses": {},
  "followUps": {},
  "settings": {},
  "meta": {}
}
```

- `version` enables forward-compatible migrations (`src/storage/migrations.js`).
- Each top-level key is a keyed collection (`{ id: record }`).
- No CRM record is ever written anywhere except `chrome.storage.local`.

Backups: use the in-extension **Export** button (JSON) or **CSV export**
(contacts). Restore via **Import** — the migration layer will reconcile older
schemas automatically.

## Privacy summary

- **What is read:** WhatsApp Web DOM only — the current contact name/phone from
  the open chat header, and the composer element when inserting text.
- **What is stored:** CRM records you create (contacts, notes, replies, tags,
  statuses, follow-ups, settings) — all local.
- **What is never transmitted:** CRM data, contacts, notes, messages. Nothing
  leaves the browser. No backend, no remote analytics, no telemetry by default.
- **What is never accessed:** message history, incoming/outgoing message
  content, your WhatsApp account credentials.

See `PRIVACY.md` for the full disclosure, and `SECURITY.md` for the threat
model.

## Troubleshooting

Quick pointers — full guide in `docs/TROUBLESHOOTING.md`:

- **Panel not showing?** Reload the WhatsApp Web tab; re-enable the extension;
  verify `host_permissions` matches `https://web.whatsapp.com/*`.
- **WhatsApp UI changed?** Open `src/content/whatsapp/selectors.js`, enable
  diagnostics mode from the options page, and review the selector fallbacks.
- **Backup/restore failed?** Likely a schema version mismatch — let
  `src/storage/migrations.js` reconcile, or reset data and re-import.
- **CSV import errors?** Validate header columns and UTF-8 encoding against the
  importer preview.

## Commercial licensing

LeadDock is sold as a commercial developer kit under four tiers. See `LICENSE.md`
for the full starting template and `docs/LICENSES.md` for a plain-language
summary.

| Tier                | Price | Best for                                  | Key rights                                                                 |
| ------------------- | ----- | ----------------------------------------- | -------------------------------------------------------------------------- |
| Personal            | $29   | Solo users                                | Personal use, one seat, no resale, no source redistribution                |
| Commercial          | $59   | One organization                           | Commercial use, one branded end product, source modifiable, no kit resale |
| Agency               | $99   | Agencies delivering client work           | Up to 5 branded end products to clients; client receives binary, not source|
| Extended Reseller   | $149  | Resellers & white-label SaaS businesses   | Full white-label + resell rights; unlimited end products                   |

> The license file is a starting template. Review it with a lawyer before any
> commercial distribution.

## Current status

LeadDock **v1.0.0** is the initial stable release. It ships the full v1 feature
set described above, the four-tier commercial license, and the complete
documentation set. The product is independent and not affiliated with WhatsApp
or Meta — that notice appears in the README, the privacy policy, the storefront
copy, and in-product surfaces where appropriate.

For the roadmap of V2 ideas (exploration, not commitment), see `docs/ROADMAP.md`.
