# Changelog

All notable changes to WaFlow are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_No unreleased changes yet._

## [1.0.0] — 2026-01-01

### Added — Initial stable release

This is the first stable, commercially distributed version of WaFlow. It ships
the complete v1 feature set, the four-tier commercial license, and the full
documentation suite.

**Lead management**
- Lead status pipeline: New Lead, Contacted, Interested, Follow Up, Qualified,
  Won, Lost.
- Editable custom statuses (rename, recolor, reorder, add, delete).
- Custom tags with colors.
- Editable contact fields (name, phone, company, email, product, budget,
  source).
- Lead search by name, phone, company, notes, tags.
- Filter by status, tag, follow-up due.
- Recent activity metadata (created, updated, last-seen timestamps).

**Notes**
- Add / edit / delete notes attached to contacts.
- Timestamps on every note.
- Multiple notes per contact, displayed newest-first.

**Quick replies**
- Reply manager (name, `/shortcut`, content, category, usage count).
- Edit / delete replies.
- Reply search.
- One-click insertion into the WhatsApp composer.
- Slash-shortcut insertion (e.g. `/price`).
- Keyboard navigation in the reply picker.
- `⚡ Replies` launcher near the composer.
- User always confirms and sends manually — WaFlow never auto-sends.

**Template variables**
- `{{name}}`, `{{phone}}`, `{{company}}`, `{{product}}` substitution at
  insertion time.
- Unknown variables remain visible (not silently removed).

**Follow-ups**
- Set follow-up date with presets: Today, Tomorrow, In 3 Days, Next Week.
- Custom date picker.
- Due state calculation.
- Dashboard for today's due follow-ups.
- "Open chat" action.
- No automatic messages — follow-ups are reminders, not auto-sends.

**Dashboard / popup**
- Total leads, status counts, today's follow-ups, recent leads.
- Quick access to search and export.

**Pipeline view**
- Kanban columns derived from statuses.
- Status dropdowns as the primary mover (drag-and-drop is optional and only
  used where robust).

**Search**
- Full-text search across contacts (name, phone, company, notes, tags).
- Filter by status, tag, follow-up due.

**Data portability**
- CSV export of contacts.
- CSV import with validation preview.
- JSON backup of the full CRM dataset.
- JSON restore with schema versioning.
- Migration system in `src/content/storage/migrations.js`.
- Export contains only CRM data owned by the extension — no WhatsApp message
  history is ever exported.

**Privacy mode**
- One-click blur/hide of sensitive CRM and WhatsApp identifying details for
  screen recordings and presentations.

**Command palette**
- `Ctrl/Cmd+K` global palette.
- Commands: search contacts, add note, change status, add tag, insert quick
  reply, set follow-up, export data, open settings.

**Keyboard shortcuts**
- `Ctrl/Cmd+K` palette.
- `Enter` / `Arrow` navigation in reply picker.
- `Escape` closes overlays.
- Slash shortcuts in composer.

**Onboarding**
- First-use welcome screen.
- Demo mode with fictional sample data clearly marked as DEMO.

**White-label configuration**
- Single `src/config/brand.js` controls product name, tagline, hero, accent
  colors, website, support email, help URL, privacy URL, logo path, version
  label, and the independence notice.

**Architecture**
- Manifest V3 content script + service worker.
- WhatsApp adapter abstraction (`src/content/whatsapp/`) decoupling the CRM
  from WhatsApp DOM selectors.
- Shadow-root-isolated UI panel (`src/content/ui/`).
- MutationObserver with narrow targets and debounced updates — no whole-page
  100 ms polling.
- Graceful degradation when WhatsApp selectors change.

**Storage**
- Single versioned schema in `chrome.storage.local`:
  `version`, `contacts`, `notes`, `replies`, `tags`, `statuses`, `followUps`,
  `settings`, `meta`.

**Permissions**
- `storage` only.
- `host_permissions`: `https://web.whatsapp.com/*` only.

**Documentation**
- README, LICENSE, PRIVACY, SECURITY, CHANGELOG, CONTRIBUTING.
- `docs/` — ARCHITECTURE, INSTALLATION, CUSTOMIZATION, PUBLISHING,
  TROUBLESHOOTING, QA, SELLING, LICENSES, ROADMAP, PRODUCT-LISTING,
  LAUNCH-CHECKLIST.

**Commercial**
- Four-tier commercial license (Personal $29 / Commercial $59 / Agency $99 /
  Extended Reseller $149).
- Packaging scripts producing extension ZIP and source ZIP.

### Independence notice

WaFlow is an independent productivity extension for WhatsApp Web. It is not
affiliated with or endorsed by WhatsApp or Meta.

## [0.1.0] — 2025-11-01

### Added — Initial development scaffold

- Project bootstrap with `manifest.json`, `package.json`, brand config.
- Canonical product spec, data schema, and demo fixtures captured.
- Directory structure scaffolded under `waflow/`.
- Initial adapter and storage layer stubs.
- Worklog initialized at `/home/z/my-project/worklog.md`.

[Unreleased]: https://github.com/witejackel-eng/waflow-whatsapp-crm/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/witejackel-eng/waflow-whatsapp-crm/releases/tag/v1.0.0
[0.1.0]: https://github.com/witejackel-eng/waflow-whatsapp-crm/releases/tag/v0.1.0
