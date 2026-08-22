# Chrome Web Store Listing Prep

Goal: a **free public listing** of the LeadDock extension for trust,
discovery and reviews. The paid commercial kit stays off-store and is sold
from the website/storefront.

---

## 1. Developer account

- [ ] Register at https://chrome.google.com/webstore/devconsole ($5 one-time)
- [ ] Set up publisher email (use `witejackel@gmail.com`)

## 2. Upload package

- [ ] Use `release/leaddock-extension-v1.0.0.zip` exactly as built by
      `npm run package` (it is the load-unpacked dist, CWS-compatible)

## 3. Store listing assets

| Asset | Spec | Status |
|---|---|---|
| Small tile icon | 128×128 PNG | ✓ `assets/icons/icon-128.png` |
| Screenshots ×5 | 1280×800 or 640×400 PNG/JPEG | capture per shot list below |
| Short name | ≤12 chars | `LeadDock` |
| Description | ≤132 chars summary + long description | below |

### Shot list (demo data only — never real customer data)

1. WhatsApp Web chat with LeadDock panel docked (hero shot)
2. ⚡ Replies picker open near the composer
3. Popup dashboard with follow-ups listed
4. Command palette open (`Ctrl/Cmd+K`)
5. Options page / white-label config

## 4. Listing copy

**Short description (≤132 chars):**

> Turn WhatsApp Web into your sales workspace. Track leads, notes, quick replies & follow-ups. Local-first CRM layer.

**Category:** Productivity → Tools
**Language:** English

## 5. Privacy tab answers (critical — get these exact)

- **Single purpose:** "LeadDock adds a lightweight CRM layer to WhatsApp Web: lead statuses, notes, tags, quick replies and follow-up tracking."
- **Host permission justification:** "The panel docks beside chats on web.whatsapp.com; it reads the current chat header to identify the contact and inserts reply text into the composer when you choose."
- **storage permission justification:** "All CRM records are saved locally in the browser via chrome.storage.local."
- **Data usage disclosures:** Does NOT collect personally identifiable info, health, financial, authentication, communications, location, web history, user activity, or website content.
- **Privacy policy URL:** https://leaddock-site.vercel.app/privacy

## 6. Compliance notes

- Independence notice must appear in the listing description AND in-product (already in Options/panel via `brand.independenceNotice`).
- No claims of WhatsApp/Meta affiliation, no "ban-proof", no automation claims.
- Distribution: public listing is fine; do not upload the source kit anywhere on-store.

## 7. Submission

- [ ] Submit for review; expect 1–7 days
- [ ] If rejected: read the cited policy, fix, resubmit (common round-1 issues are wording in privacy justifications)
- [ ] After approval: add store link to site footer + README + options page
