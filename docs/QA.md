# LeadDock QA Plan

This is the complete quality-assurance plan for LeadDock v1.0.0. It covers:

1. The manual QA matrix against the real WhatsApp Web environment.
2. A synthetic-data stress test (large CRM datasets, export/import round trips).
3. Performance checks.
4. The complete QA gate checklist from the product spec.
5. The release checklist (a brief reference; the canonical release checklist
   lives in `docs/LAUNCH-CHECKLIST.md`).

> **Independence notice.** LeadDock is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.

---

## 1. Test environment

- Chrome stable (current major version) on macOS, Windows, and Linux — at
  least one run per OS for the release.
- A real WhatsApp account (personal or test) logged into
  `https://web.whatsapp.com`.
- Demo dataset loaded from `fixtures/` (Options → **Load demo data**) so
  screenshots and replays never expose real customer data.
- `npm test` passing locally (see `CONTRIBUTING.md` §3).

---

## 2. Manual QA matrix

For each row, switch WhatsApp Web to the listed state and verify the expected
behavior.

| #   | State                                  | Expected behavior                                                                                              | Pass / Fail |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Logged out (QR screen)                 | Panel does not render. Popup opens and shows "Log in to WhatsApp Web to begin."                              |             |
| 2   | Logged in, chat list loaded            | Panel renders beside the most recent chat (or "No chat selected" if none is open).                            |             |
| 3   | QR / loading spinner                    | Panel waits; renders once the chat list resolves. No console errors.                                          |             |
| 4   | No chat selected                       | Panel shows "No chat selected." Quick replies / statuses disabled in panel.                                    |             |
| 5   | Individual (1:1) chat — short name     | Contact name appears in panel header. Status dropdown, tags, notes, follow-up, replies all enabled.          |             |
| 6   | Group chat                              | Group name shown; no per-member CRM record auto-created. Status can still be set on the chat record.          |             |
| 7   | Long contact name                       | Name truncates with ellipsis in panel header; full name visible on hover / in the contact card.              |             |
| 8   | Emoji-heavy contact name / notes        | Emoji render correctly. No layout shift. Storage round-trip preserves emoji.                                  |             |
| 9   | Image / media message in chat           | Panel ignores media content. CRM continues to function. No media bytes are read or stored.                    |             |
| 10  | Switch between two chats                | Observer fires; panel updates within ~200 ms. Selected contact's CRM record loads.                            |             |
| 11  | WhatsApp Web reload (browser refresh)   | Extension re-initializes. CRM state preserved (read from storage).                                            |             |
| 12  | Browser restart                          | CRM state preserved on next launch. Popup and panel resume normally.                                          |             |
| 13  | Extension reload (chrome://extensions)   | WhatsApp tab needs a reload to re-inject the content script. CRM state preserved.                              |             |
| 14  | Multiple WhatsApp Web tabs (same profile) | Both tabs run content scripts; both read the same storage. No crash. Last-write-wins on concurrent edits.    |             |
| 15  | Multiple WhatsApp Web tabs (different profiles) | Each profile has its own CRM. No cross-contamination.                                                  |             |

### 2.1 Feature matrix (run once per environment above)

For each state where the panel is expected to render, verify the following
features:

| Feature                       | Steps                                                                                       | Expected                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Set status                     | Open contact, change status dropdown                                                        | Status persists; pipeline column updates              |
| Add tag                        | Open contact, add tag from the tag picker                                                    | Tag appears; persists across reloads                  |
| Add note                       | Open contact, type a note, save                                                              | Note appears newest-first; timestamp recorded         |
| Edit note                      | Click an existing note, edit text, save                                                       | Note content updates; `updatedAt` refreshes          |
| Delete note                    | Click delete on a note, confirm                                                              | Note removed from list; storage updated              |
| Set follow-up — Today          | Click follow-up preset "Today"                                                              | Follow-up date set to today; appears in dashboard      |
| Set follow-up — custom date     | Open date picker, pick a date                                                                | Custom date persisted                                  |
| Quick reply — one-click         | Click `⚡ Replies`, choose a reply                                                            | Text inserts into composer; cursor in composer        |
| Quick reply — `/shortcut`       | Type `/price` in composer                                                                     | Reply picker opens with the matching reply highlighted |
| Template variable substitution | Insert reply with `{{name}}` against a named contact                                          | `{{name}}` is replaced with the contact's name        |
| Template variable unknown       | Insert reply with `{{nme}}` (typo)                                                           | `{{nme}}` remains visible in the inserted text         |
| Command palette                 | Press `Ctrl/Cmd+K`                                                                            | Palette opens; search returns matching commands       |
| Privacy mode                    | Toggle privacy mode on                                                                       | Sensitive fields blur; toggle off restores             |
| CSV export                      | Popup → Export → CSV                                                                          | File downloads; opens cleanly in a spreadsheet         |
| CSV import (validation preview) | Options → Import → CSV → pick a demo CSV                                                     | Preview shows valid rows; warnings for unknown columns |
| JSON backup                     | Options → Backup                                                                              | File downloads; valid JSON; contains all collections   |
| JSON restore                    | Options → Restore → pick the backup                                                          | Data restores; success toast confirms                  |
| Search contacts                 | Type in the popup search box                                                                  | Matching contacts appear within ~150 ms                |
| Filter by status / tag / due    | Apply filters in the popup                                                                    | Result list narrows correctly                         |
| Pipeline view                   | Open pipeline from popup                                                                      | Kanban columns render; counts match per-status totals |
| Demo mode                       | Options → Load demo data                                                                      | Demo dataset loads; clearly marked DEMO                |
| Reset data                      | Options → Reset all CRM data                                                                  | Storage cleared; defaults re-seed                     |

---

## 3. Synthetic data stress test

These tests exercise LeadDock with large datasets to confirm it stays
responsive and that round-trips are lossless.

### 3.1 Dataset

Build a synthetic dataset (script under `scripts/` or by hand from the demo
fixtures):

- **≥ 500 contacts** — varied names, phones, companies, tags, statuses.
- **≥ 1,000 notes** — distributed across the contacts (average 2 per contact).
- **≥ 100 replies and tags combined** — at least 50 replies and 50 tags.

Load the dataset via JSON restore.

### 3.2 Stress scenarios

| # | Scenario                                                              | Expected                                                                                   |
| - | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1 | Load 500 contacts via JSON restore                                     | Restore completes < 5 s; no UI freeze; success toast confirms count                         |
| 2 | Open pipeline view                                                     | All 7 columns render; counts match; switching tabs does not re-render the whole list      |
| 3 | Search "abc" in the popup                                              | Results render < 200 ms; no console errors                                                  |
| 4 | Filter by tag "Hot"                                                    | Result count matches storage; clears cleanly on filter removal                             |
| 5 | Switch between chats 20 times                                          | Each switch renders the panel < 300 ms; observer does not accumulate                        |
| 6 | Open a contact with 50 notes                                           | Notes paginate at 50; no jank; newest first                                                 |
| 7 | Export CSV                                                             | CSV exports all 500 contacts; row count matches storage                                    |
| 8 | Export JSON backup                                                     | JSON contains all collections; file size is reasonable (< 2 MB typical)                    |
| 9 | Re-import the exported CSV into a fresh install                        | All 500 contacts restore (modulo phone-format normalization); validation preview clean    |
| 10 | Restore the JSON backup into a fresh install                          | Round trip is lossless — counts and field values match                                      |
| 11 | Restore a backup from a prior schema version (v0)                      | Migration runs; success toast confirms new version; no data loss                           |
| 12 | Restore a backup from a future schema version (v2 vs current v1)      | Restore refused with a clear error message; existing data untouched                         |

### 3.3 Round-trip correctness checks

After CSV export → CSV import round trip, verify for each contact:

- `name` matches.
- `phone` matches (after normalization, e.g., `+91…` preserved).
- `company`, `email`, `product`, `budget`, `source` match.
- `status` matches.
- `tags` set matches (order-insensitive).
- `notes` are preserved (CSV format may collapse multiple notes into a single
  cell — verify the joined text is recoverable).
- `followUpDate` matches.

After JSON backup → JSON restore round trip, verify per collection:

- Contact count matches.
- Each contact record's fields match byte-for-byte (modulo ISO-8601 timezone
  normalization).
- Note count matches.
- Reply usage counts match.
- Tag / status definitions match (including colors and `order`).

---

## 4. Performance checks

| Check                                       | Method                                                                | Pass criterion                                |
| ------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| No typing lag in the composer                | Type 200 characters at normal speed with the CRM panel open         | No perceptible lag; keydown→render < 16 ms     |
| No runaway observer                          | Open DevTools Performance → record 30 s idle on WhatsApp Web         | No constant MutationObserver callbacks         |
| No excessive console spam                    | Open DevTools console; switch chats 20 times                         | < 10 log lines total; no errors               |
| Reasonable memory behavior                   | DevTools Memory → take heap snapshot after cold load, then after 30 min of use | Heap growth < 30 MB after 30 min            |
| Popup open latency                           | Click toolbar icon 5 times                                            | Each open < 150 ms                             |
| Panel render after chat switch               | Switch chats 20 times; measure render via Performance trace           | p95 render < 300 ms                            |

---

## 5. Complete QA gate checklist

This is the gate every release must pass before tagging. Tick every box; if
any item fails, the release is blocked.

### 5.1 Functional

- [ ] All manual QA matrix items (§2) pass on Chrome stable (macOS, Windows,
  Linux).
- [ ] All feature matrix items (§2.1) pass.
- [ ] All synthetic stress scenarios (§3) pass.
- [ ] CSV export → import round trip is lossless.
- [ ] JSON backup → restore round trip is lossless.
- [ ] Migration from a v0 backup succeeds; no data loss.
- [ ] Future-version restore is refused cleanly.
- [ ] Demo mode loads and is clearly marked.
- [ ] Reset data wipes CRM records; defaults re-seed.

### 5.2 Architecture

- [ ] No WhatsApp selectors imported into `src/content/crm/`, `src/content/ui/`,
  or `src/content/storage/`. (Grep the codebase to confirm.)
- [ ] Adapter interface has all six methods implemented.
- [ ] No `eval`, `new Function(...)`, or untrusted `innerHTML` in source.
- [ ] No new permissions beyond `storage` and `host_permissions:
  https://web.whatsapp.com/*`.

### 5.3 Performance

- [ ] Typing latency test passes.
- [ ] No runaway observer.
- [ ] Console spam check passes.
- [ ] Memory growth within budget.
- [ ] Popup and panel latency within criteria.

### 5.4 Privacy & security

- [ ] No outbound network calls in the default build (audit with DevTools
  Network tab — should be empty during normal use).
- [ ] No third-party analytics SDKs in `package.json` dependencies (dev-only
  deps for eslint/prettier are fine).
- [ ] `PRIVACY.md` accurately reflects current behavior.
- [ ] `SECURITY.md` accurately reflects current behavior.
- [ ] Independence notice present in: README, PRIVACY, SECURITY, SELLING,
  PRODUCT-LISTING, popup footer, options page footer.

### 5.5 Documentation

- [ ] README current and accurate.
- [ ] `CHANGELOG.md` has a `[X.Y.Z]` entry for the release.
- [ ] `docs/ARCHITECTURE.md` reflects current structure.
- [ ] `docs/INSTALLATION.md` reflects current install path.
- [ ] `docs/CUSTOMIZATION.md` reflects current `brand.js` fields.
- [ ] `docs/PUBLISHING.md` reflects current permissions and listing copy.
- [ ] `docs/TROUBLESHOOTING.md` reflects current diagnostics.
- [ ] `docs/QA.md` (this file) reflects current matrix.
- [ ] `docs/SELLING.md` reflects current tiers.
- [ ] `docs/LICENSES.md` reflects current `LICENSE.md` tiers.
- [ ] `docs/ROADMAP.md` reflects current V2 ideas.
- [ ] `docs/PRODUCT-LISTING.md` reflects current copy.
- [ ] `docs/LAUNCH-CHECKLIST.md` reflects current release artifacts.

### 5.6 Release artifacts

- [ ] `release/leaddock-extension-vX.Y.Z.zip` builds cleanly.
- [ ] `release/leaddock-source-vX.Y.Z.zip` builds cleanly (excludes
  `node_modules`, `.git`, `tests/`, OS files).
- [ ] ZIP loads as an unpacked extension in a clean Chrome profile.
- [ ] Version in `manifest.json` matches `brand.version` and the ZIP filename.
- [ ] Git tag `vX.Y.Z` created and pushed.
- [ ] GitHub Release created with both ZIPs attached.

### 5.7 Independence

- [ ] No claim of WhatsApp / Meta affiliation anywhere in the listing, README,
  docs, or in-product copy.
- [ ] No claim of ban-proof operation or WhatsApp policy certification.
- [ ] Independence notice present on every public-facing surface.

---

## 6. Release checklist (quick reference)

The canonical release checklist is `docs/LAUNCH-CHECKLIST.md`. The high-level
order:

1. Cut a release branch from `main`.
2. Update `CHANGELOG.md` (move `[Unreleased]` to `[X.Y.Z] — YYYY-MM-DD`).
3. Bump `version` in `manifest.json` and `brand.version`.
4. Run `npm test`, `npm run lint`, `npm run format`.
5. Run the full QA gate (§5).
6. `npm run build && npm run package`.
7. Smoke-test the unpacked ZIP in a clean Chrome profile.
8. Tag and push: `git tag vX.Y.Z && git push origin vX.Y.Z`.
9. Create the GitHub Release with both ZIPs attached.
10. If publishing to the Chrome Web Store, follow `docs/PUBLISHING.md`.

---

## 7. Regression test pack

When a bug is fixed, add a regression test under `tests/` that would have
caught it. Regression tests run as part of `npm test` and gate every future
release. Examples:

- A migration regression: snapshot a v0 backup, run migrations, assert the
  v1 shape.
- A CSV round-trip regression: serialize a known contact, parse it back,
  assert field equality.
- A search filter regression: build 50 synthetic contacts, assert the search
  predicate narrows correctly.
- A dates regression: assert "In 3 Days" across a DST boundary.

---

## 8. Known limitations (v1.0.0)

Documented limitations that are **not** bugs:

- The CRM panel does not auto-refresh when storage changes from another tab.
  Reload the tab to see the latest state.
- Pipeline drag-and-drop is optional; status changes are made via dropdown.
  This is intentional — correctness over flashy interaction.
- Group chats do not auto-create per-member CRM records. The CRM record is
  attached to the group as a whole.
- `chrome.storage.local` quota (~5–10 MB). For unusually large CRMs, archive
  old contacts via CSV export and remove them from storage.
- No outbound reminders / push notifications in v1. Follow-up reminders
  surface when the popup or WhatsApp Web tab is open.

These limitations are explored (not committed) in `docs/ROADMAP.md`.
