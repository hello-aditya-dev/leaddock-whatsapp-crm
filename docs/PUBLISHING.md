# Publishing to the Chrome Web Store

This document walks through packaging LeadDock, submitting it to the Chrome Web
Store, and the privacy / permissions disclosures required for review. It
includes a ready-to-paste store description.

> **Independence notice.** LeadDock is an independent productivity extension
> for WhatsApp Web. It is **not** affiliated with or endorsed by WhatsApp or
> Meta. Every store-listing field must preserve this — the single-purpose
> statement, the description, and any visible copy must not imply WhatsApp or
> Meta affiliation.

---

## 1. Before you start

You need:

- A Google account.
- A one-time **$5** Chrome Web Store developer registration fee (payable once
  per developer account, not per extension).
- The LeadDock build artifacts:
  - `release/leaddock-extension-vX.Y.Z.zip` (from `npm run package`).
- At least one screenshot at 1280×800 (or 640×400). Up to 5 screenshots.
- A small promotional tile (440×280) — optional but recommended.
- The store-listing copy (see §5 below).

## 2. Packaging the extension

Use the packaging script to produce a clean ZIP that excludes dev-only files:

```bash
npm install
npm run build      # produces dist/
npm run package    # produces release/leaddock-extension-vX.Y.Z.zip + release/leaddock-source-vX.Y.Z.zip
```

What the packaging script excludes:

- `node_modules/`
- `tests/`
- `.git/`
- `fixtures/` (these are seed defaults; end users do not need them at runtime)
- Any `release/` and `dist/` artifacts
- Editor / OS files (`.DS_Store`, `.idea/`, `.vscode/`, `*.log`)

Validate the ZIP before submitting:

```bash
unzip -l release/leaddock-extension-v1.0.0.zip | head -40
```

It should contain `manifest.json` at the root, with `src/`, `assets/`, and
nothing else from the dev toolchain.

## 3. Chrome Web Store developer account

1. Go to <https://chrome.google.com/webstore/devconsole/>.
2. Sign in with your Google account.
3. Pay the $5 one-time developer registration fee.
4. Accept the developer agreement.

## 4. Create the listing

1. In the developer dashboard, click **Add new item**.
2. Upload `release/leaddock-extension-v1.0.0.zip`.
3. Fill in the listing fields (see §5 for copy).

### 4.1 Listing fields

| Field                | Value                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Name                 | LeadDock — WhatsApp Web CRM (or your branded name)                                       |
| Summary (short desc) | Turn WhatsApp Web into a lightweight sales CRM. Local-first, no backend.                          |
| Category             | Productivity                                                                                      |
| Language             | English (or your target language)                                                                  |
| Visibility           | Public (or "Unlisted" if distributing to a closed audience)                                       |
| Single purpose       | Add a lightweight CRM layer to WhatsApp Web so users can track leads, notes, follow-ups, and reusable replies. |

### 4.2 Screenshots

- Minimum: 1 screenshot.
- Maximum: 5 screenshots.
- Size: 1280×800 (preferred) or 640×400.
- Show: CRM panel docked beside a WhatsApp Web chat, command palette, popup
  dashboard, pipeline view, quick-reply launcher. Use the demo dataset for
  these captures so no real customer data appears.

### 4.3 Promotional tiles (optional but recommended)

- Small promo tile: 440×280.
- Marquee promo tile: 1400×560 (only shown if your extension is featured).

## 5. Store description (ready to paste)

```
LeadDock — Turn WhatsApp Web into a lightweight sales CRM.

LeadDock adds the missing sales layer to WhatsApp Web. Track leads with clear
statuses, attach notes, manage follow-ups, and insert reusable replies —
without leaving the conversation.

CORE FEATURES

• Lead statuses — New Lead, Contacted, Interested, Follow Up, Qualified, Won,
  Lost. Fully editable.
• Tags & notes — attach context to every contact.
• Quick replies — save reusable messages, insert them in one click.
• Slash shortcuts — type /price, /hi, /followup in the composer.
• Template variables — {{name}}, {{phone}}, {{company}}, {{product}}.
• Follow-ups — set due dates with presets; never auto-sent.
• Pipeline view — Kanban columns derived from your statuses.
• Search & filter — by name, phone, company, notes, tags, status.
• CSV import / export — bring in or take out your contact list.
• JSON backup / restore — full CRM snapshot, schema-versioned.
• Command palette — Ctrl/Cmd+K to jump to any action.
• Privacy mode — blur sensitive details for screen recordings.
• Demo mode — explore with clearly-marked fictional sample data.

LOCAL-FIRST BY DESIGN

Your CRM data lives in chrome.storage.local on your own machine. There is no
backend. No analytics. No telemetry. Nothing leaves your browser.

YOU ALWAYS SEND

LeadDock inserts text into the composer. It never auto-sends. There is no bulk
messaging, no campaign automation, no message-history scraping.

PERMISSIONS

We request only:
• storage — to save your CRM records locally.
• host_permissions: https://web.whatsapp.com/* — to overlay the CRM panel
  on WhatsApp Web.

INDEPENDENCE

LeadDock is an independent productivity extension. It is not affiliated with or
endorsed by WhatsApp or Meta. "WhatsApp" and "WhatsApp Web" are used
descriptively to identify the application the extension interoperates with.
```

> Use this as-is for the long description. Tailor the first line for your
> brand if you have rebranded. Do not strip the independence paragraph.

## 6. Privacy disclosure (required by Chrome Web Store)

The Chrome Web Store requires a Data Usage disclosure for each permission.
LeadDock's answers:

| Permission                          | Data collected / transmitted                       | Justification                                  |
| ----------------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `storage`                           | None transmitted; CRM records stored locally      | Required to persist CRM data                   |
| `host_permissions: web.whatsapp.com`| None transmitted; reads WhatsApp Web DOM only     | Required to render the CRM panel on WhatsApp Web |

In the privacy disclosure form, declare:

- **Personally identifiable data:** Not collected.
- **Authentication data:** Not collected.
- **Personal communications:** Not collected (we do not read message content).
- **Web history:** Not collected.
- **Website content:** Read from `web.whatsapp.com` only — current contact
  name/phone from the open chat header, and the composer element for text
  insertion. Not transmitted.
- **Data sold or transferred to third parties:** No.
- **Data used for unrelated purposes:** No.

Attach a public privacy policy URL. Use the URL of `PRIVACY.md` in your
published GitHub repo, or mirror `PRIVACY.md` on a page on your marketing
site.

## 7. Permissions justification

In the "Why does your extension need this permission?" field for each:

- **`storage`** — "Required to save CRM data (contacts, notes, replies,
  follow-ups) locally in the user's browser. No data is transmitted."
- **`host_permissions: https://web.whatsapp.com/*`** — "Required to overlay
  the CRM panel on WhatsApp Web. The extension reads only the active chat
  header (to identify the contact context) and the composer element (to
  insert text when the user chooses a quick reply). No message content is
  read, transmitted, or stored."

## 8. Single-purpose statement

Chrome Web Store requires a one-sentence single-purpose statement. Use:

> Add a lightweight CRM layer to WhatsApp Web so users can track leads,
> notes, follow-ups, and reusable replies alongside their conversations.

The single-purpose rule forbids bundling unrelated functionality. LeadDock's
v1 scope is strictly CRM-on-WhatsApp-Web, so it complies.

## 9. Compliance checklist (pre-submit)

- [ ] Version in `manifest.json` matches `brand.version` and the version on
  the release ZIP.
- [ ] `node_modules/`, `tests/`, `.git/`, `fixtures/` are not in the ZIP.
- [ ] No `eval`, `new Function`, or untrusted `innerHTML` in source (per
  `SECURITY.md`).
- [ ] No new permissions beyond `storage` and `host_permissions:
  https://web.whatsapp.com/*`.
- [ ] No claims of WhatsApp or Meta affiliation in any listing field, image,
  or copy.
- [ ] Privacy policy URL is publicly reachable and matches `PRIVACY.md`.
- [ ] Support contact email (in `brand.supportEmail`) is monitored.
- [ ] At least one screenshot at 1280×800.
- [ ] All screenshots use the demo dataset — no real customer data.
- [ ] Independence notice present in the long description.

## 10. Submit for review

1. Click **Submit for review** in the developer dashboard.
2. The Chrome Web Store review typically takes **a few days to a couple of
   weeks**, depending on queue depth and whether the extension triggers any
   permission / policy heuristics.
3. Reviewer feedback, if any, appears in the dashboard. Address it and
   resubmit.

Common review pushbacks for extensions like LeadDock:

- "Why does this extension need host_permissions on web.whatsapp.com?"
  — Use the justification in §7 verbatim. The reviewer wants to confirm the
  host access is necessary for the stated single purpose.
- "Does this extension automate messaging?" — Confirm it does not. LeadDock
  inserts text into the composer; the user always sends manually.
- "Does this extension scrape message history?" — Confirm it does not.

## 11. Post-publish updates

To push a new version:

1. Bump `version` in `manifest.json` and `brand.version`.
2. Add a `CHANGELOG.md` entry under `[Unreleased]` then move it to a new
  `[X.Y.Z]` heading at release.
3. Run `npm run build` and `npm run package`.
4. In the developer dashboard, click the existing item → **Package** →
  **Upload new package**.
5. Re-submit for review.

> The Chrome Web Store rejects version downgrades. Always bump.

## 12. What you must NOT do

- Do not claim this is an official WhatsApp product.
- Do not claim WhatsApp approval, ban-proof operation, or policy
  certification.
- Do not add bulk-send, scheduled-send, or auto-send features. The Chrome
  Web Store will reject the listing and may suspend your developer account.
- Do not request `<all_urls>` or broad permissions. Use only the host
  permission for `https://web.whatsapp.com/*`.
- Do not embed remote code or fetch scripts at runtime. MV3's CSP forbids it
  and the review will fail.
