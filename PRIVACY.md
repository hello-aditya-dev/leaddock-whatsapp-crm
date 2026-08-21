# WaFlow Privacy Policy

**Version:** 1.0.0
**Effective date:** 2026-01-01

> **Independence notice.** WaFlow is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.
> "WhatsApp" and "WhatsApp Web" are used descriptively to identify the
> application the extension interoperates with.

This policy explains, in plain language, what WaFlow reads from the page, what
it stores, what it never transmits, and how you can back up or delete your data.

---

## 1. The short version

- WaFlow is a Chrome extension that adds a lightweight CRM on top of WhatsApp
  Web.
- All CRM data (contacts, notes, replies, tags, statuses, follow-ups, settings)
  is stored **locally in your browser** via `chrome.storage.local`.
- WaFlow **never transmits** CRM data anywhere. There is no backend, no remote
  analytics, and no telemetry by default.
- WaFlow reads only the WhatsApp Web DOM (the open chat header and composer) to
  detect the current contact context and insert text into the composer.
- WaFlow does **not** read message content, does **not** scrape message history,
  and does **not** auto-send messages. You always press send.

## 2. What webpage data WaFlow reads

WaFlow reads only what is strictly necessary to provide the CRM overlay on top
of WhatsApp Web:

| What                                    | Why                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| Current contact name (chat header)      | To match the open WhatsApp chat to a CRM contact record                          |
| Current contact phone (where available) | To uniquely identify a contact across sessions                                   |
| The composer element                    | To insert text from a quick reply when you choose one                            |
| The chat list state                     | To know when the active chat changes and refresh the CRM panel accordingly       |

WaFlow reads this data **in your browser** to drive the CRM UI. It is not
logged, not stored remotely, and not transmitted.

## 3. What WaFlow stores locally

CRM data you create is stored in `chrome.storage.local` on your own machine:

- `contacts` — lead records (name, phone, company, email, product, budget,
  source, status, tags, follow-up date, timestamps).
- `notes` — free-text notes you attach to contacts.
- `replies` — your reusable quick replies (name, shortcut, content, category,
  usage count).
- `tags` — your custom tags.
- `statuses` — your custom lead statuses.
- `followUps` — follow-up scheduling metadata.
- `settings` — your preferences (theme, panel collapsed state, privacy mode,
  etc.).
- `meta` — internal metadata (schema version, install date, last backup date).

Schema reference: see `fixtures/DATA_SCHEMA.json`.

## 4. What WaFlow NEVER transmits

- CRM data (contacts, notes, replies, tags, statuses, follow-ups).
- WhatsApp message content, history, or attachments.
- Your WhatsApp account credentials.
- Your contacts' phone numbers, names, or any personal data.
- Usage analytics, telemetry, or crash reports.

WaFlow does not include any third-party analytics SDK, does not phone home, and
does not call any external API in the default build.

## 5. Permissions requested and why

| Permission                          | Why it is required                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `storage`                           | To persist CRM data in `chrome.storage.local` (your contacts, notes, replies, etc.)        |
| `host_permissions: web.whatsapp.com`| To run the content script on `https://web.whatsapp.com/*` and read the DOM described above |

WaFlow does **not** request `tabs`, `cookies`, `webRequest`, `history`,
`clipboard`, `notifications`, or any other permission.

## 6. How to back up your data

WaFlow provides two export paths from the popup and options page:

- **JSON backup** — full CRM snapshot (all collections). Use this for complete
  restoration. Format is versioned; the migration layer reconciles older
  backups on restore.
- **CSV export** — flat contacts list, useful for importing into a spreadsheet
  or another CRM.

Recommended cadence: weekly JSON backup, kept somewhere safe outside the
browser profile.

## 7. How to delete your data

You have full control:

- **Reset CRM data** — Options page → **Reset all data**. Wipes all CRM records
  from `chrome.storage.local`. WhatsApp itself is not affected.
- **Reset demo data** — `npm run demo:reset` clears only the demo dataset.
- **Remove the extension** — `chrome://extensions` → remove WaFlow. This also
  removes the `chrome.storage.local` partition used by the extension, which
  deletes all CRM data.

## 8. Analytics and telemetry

None by default. WaFlow does not bundle Google Analytics, Mixpanel, Sentry, or
any other telemetry provider. If a future version adds optional opt-in
analytics, it will require explicit user consent and will be disclosed here.

## 9. Children

WaFlow is intended for business and professional use. It is not directed at
children under 16 and we do not knowingly collect any data from children.

## 10. Third-party services

WaFlow interoperates with WhatsApp Web, which is operated by Meta Platforms,
Inc. and is governed by Meta's terms and privacy policy. WaFlow does not send
data to Meta on your behalf and is not responsible for Meta's data practices.

## 11. Changes to this policy

Material changes will be reflected by updating the version number and effective
date at the top of this file, and by noting the change in `CHANGELOG.md`.
Continued use of WaFlow after a policy update constitutes acceptance of the
updated policy.

## 12. Contact

For privacy questions or data-deletion requests, see the `supportEmail` value
in `src/config/brand.js`, or open an issue at
<https://github.com/witejackel-eng/waflow-whatsapp-crm>.

For the security threat model, see `SECURITY.md`. For licensing, see
`LICENSE.md`.
