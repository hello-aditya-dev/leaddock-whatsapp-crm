# Customization

WaFlow is white-label by design. A single file, `src/config/brand.js`, is the
source of truth for the product identity. Default content (statuses, tags,
replies) is sourced from `fixtures/`. This document covers every customization
surface and includes a white-label checklist.

> **Independence notice.** When rebranding, you **must not** claim affiliation
> with WhatsApp or Meta. The `independenceNotice` field in `src/config/brand.js`
> is the canonical text — keep it in place wherever it appears in the UI.

---

## 1. The brand configuration file

Path: `src/config/brand.js`

This file is loaded by the content script, popup, and options page. No other
source file hard-codes the product name, links, or colors.

### 1.1 Brand field reference

| Field                | Type     | Description                                                             | Example                                                                 |
| -------------------- | -------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `name`               | string   | Display name of the product. Shown in panel header, popup, options.     | `"WaFlow"`                                                              |
| `shortName`          | string   | Compact label used where horizontal space is limited (badges, headers). | `"WF"`                                                                  |
| `tagline`            | string   | One-line positioning statement.                                         | `"The lightweight CRM for WhatsApp Web"`                                |
| `hero`               | string   | Longer hero line for marketing surfaces (popup header, landing).        | `"Turn WhatsApp Web into a lightweight sales CRM."`                     |
| `primaryColor`       | string   | Accent / primary color used across UI chrome. Any valid CSS color.     | `"#0F766E"`                                                              |
| `primaryColorDark`   | string   | Accent color for dark surfaces.                                         | `"#14B8A6"`                                                              |
| `website`            | string   | Public marketing website URL.                                          | `"https://github.com/witejackel-eng/waflow-whatsapp-crm"`               |
| `supportEmail`       | string   | Support contact shown in options + popup.                               | `"support@example.com"`                                                  |
| `helpUrl`            | string   | Docs/help deep link.                                                    | `"https://.../docs/INSTALLATION.md"`                                    |
| `privacyUrl`         | string   | Privacy policy deep link.                                               | `"https://.../PRIVACY.md"`                                               |
| `logoPath`           | string   | Relative path (from extension root) to the logo used in chrome.         | `"assets/icons/icon-128.png"`                                            |
| `version`            | string   | Version label mirrored from `manifest.json`.                            | `"1.0.0"`                                                                |
| `independenceNotice` | string   | CRITICAL independence notice. Never remove.                            | `"WaFlow is an independent productivity extension. It is not affiliated with or endorsed by WhatsApp or Meta."` |

### 1.2 Editing brand.js

```js
// src/config/brand.js (excerpt)
const brand = {
  name: "WaFlow",
  shortName: "WF",
  tagline: "The lightweight CRM for WhatsApp Web",
  hero: "Turn WhatsApp Web into a lightweight sales CRM.",
  primaryColor: "#0F766E",
  primaryColorDark: "#14B8A6",
  website: "https://github.com/witejackel-eng/waflow-whatsapp-crm",
  supportEmail: "support@example.com",
  helpUrl: "https://github.com/witejackel-eng/waflow-whatsapp-crm/blob/main/docs/INSTALLATION.md",
  privacyUrl: "https://github.com/witejackel-eng/waflow-whatsapp-crm/blob/main/PRIVACY.md",
  logoPath: "assets/icons/icon-128.png",
  version: "1.0.0",
  independenceNotice:
    "WaFlow is an independent productivity extension. It is not affiliated with or endorsed by WhatsApp or Meta.",
};
```

After editing, reload the extension in `chrome://extensions` and reload the
WhatsApp Web tab.

## 2. Changing the primary color

Two values drive the chrome accent color:

- `primaryColor` — used on light surfaces (default UI background).
- `primaryColorDark` — used on dark surfaces.

Pick any valid CSS color: hex (`#0F766E`), `rgb(...)`, `hsl(...)`, or a CSS
named color. Keep WCAG AA contrast in mind against the surfaces the color sits
on. Recommended pairings:

| Light surface tone | `primaryColor` suggestion | Notes                                   |
| ------------------ | -------------------------- | --------------------------------------- |
| Neutral white       | `#0F766E` (deep teal)      | Default. Strong contrast on white.      |
| Soft gray           | `#1D4ED8` (royal blue)     | Reads cleanly on light gray panels.    |
| Warm cream          | `#B45309` (amber-700)      | High contrast on cream backgrounds.    |

The accent color drives status pill outlines, the command palette highlight,
the focused-input ring, and the panel header underline.

## 3. Replacing the logo

WaFlow ships with PNG icons at four sizes:

```
assets/icons/icon-16.png
assets/icons/icon-32.png
assets/icons/icon-48.png
assets/icons/icon-128.png
```

These are referenced from `manifest.json` (browser action + extension icons)
and from `brand.logoPath` (used inside the panel and options page).

To rebrand:

1. Replace the four PNGs with your branded icon at the same dimensions and
   file names. Keep PNG (Chrome does not consistently support SVG in all icon
   contexts).
2. Optionally drop a vector logo at `assets/logo.svg` and update
   `brand.logoPath` if you want a vector logo in the panel header.

> The browser toolbar always uses the PNGs from `manifest.json`'s `icons`
> and `action.default_icon` blocks — `brand.logoPath` does not override
> those. If you want the toolbar icon to change, replace the PNG files
> themselves.

## 4. Editing default statuses, tags, and replies

Defaults are sourced from `fixtures/`. On first install, the service worker
seeds the CRM with these files. They are:

| Fixture                  | Seeds which collection | Example shape                                            |
| ------------------------ | ---------------------- | ------------------------------------------------------- |
| `fixtures/demo-statuses.json` | `statuses`             | `[{ id, name, color, order }]`                          |
| `fixtures/demo-tags.json`     | `tags`                 | `[{ id, name, color }]`                                  |
| `fixtures/demo-replies.json`  | `replies`               | `[{ name, shortcut, category, content }]`               |
| `fixtures/demo-contacts.csv`  | demo-mode contacts     | CSV with header row matching `DATA_SCHEMA.json`         |

### 4.1 Statuses

The default statuses ship as a 7-step pipeline (New Lead, Contacted,
Interested, Follow Up, Qualified, Won, Lost). To customize, edit
`fixtures/demo-statuses.json`:

```json
[
  { "id": "new_lead", "name": "New Lead", "color": "#3B82F6", "order": 1 },
  { "id": "qualified", "name": "Qualified", "color": "#10B981", "order": 2 },
  { "id": "won", "name": "Won", "color": "#22C55E", "order": 3 },
  { "id": "lost", "name": "Lost", "color": "#6B7280", "order": 4 }
]
```

- `id` is stable and should not change after first install.
- `order` is the column order in the pipeline view.
- `color` is a CSS color used in the pipeline and status pills.

### 4.2 Tags

`fixtures/demo-tags.json`:

```json
[
  { "id": "tag_hot", "name": "Hot", "color": "#EF4444" },
  { "id": "tag_high_value", "name": "High Value", "color": "#8B5CF6" }
]
```

### 4.3 Replies

`fixtures/demo-replies.json`:

```json
[
  {
    "name": "Greeting",
    "shortcut": "/hi",
    "category": "General",
    "content": "Hi {{name}}, thanks for reaching out. How can we help you today?"
  }
]
```

Supported template variables:

- `{{name}}`
- `{{phone}}`
- `{{company}}`
- `{{product}}`

Unknown variables remain visible (they are not silently removed), so you can
spot a typo like `{{nme}}` immediately.

### 4.4 When defaults apply

The fixture seeding runs **once**, on first install. Existing installs are
not overwritten by changes to the fixture files — to re-seed an existing
install, reset CRM data from the options page (which clears CRM records) and
the next install / re-enable picks up the new defaults.

## 5. Changing support and marketing links

All external links live in `src/config/brand.js`:

- `website` — public marketing site.
- `supportEmail` — shown in the options page and any error toast that needs a
  contact.
- `helpUrl` — the "Help" deep link in the options page and command palette.
- `privacyUrl` — the "Privacy" deep link in the options page and popup.

Replace all four with your own destinations before publishing under your brand.
Verify each link resolves to a publicly accessible page.

## 6. Building your own themed version

Once you have edited `brand.js` and replaced the icons:

```bash
npm install
npm run build      # produces a clean build under dist/
npm run package    # produces release/waflow-extension-vX.Y.Z.zip + release/waflow-source-vX.Y.Z.zip
```

Load `dist/` as an unpacked extension to sanity-check the build before zipping
for store submission.

## 7. White-label checklist

Use this checklist before shipping a rebranded End Product. Each item links to
the relevant section.

- [ ] **Brand identity** — edited `src/config/brand.js`:
  - [ ] `name`, `shortName`, `tagline`, `hero` reflect the new brand.
  - [ ] `primaryColor` and `primaryColorDark` match the brand palette.
  - [ ] `website`, `supportEmail`, `helpUrl`, `privacyUrl` point to your own
    destinations.
  - [ ] `logoPath` points to your logo asset.
  - [ ] `version` mirrors the version in `manifest.json`.
  - [ ] `independenceNotice` is unchanged and still present in the UI.
- [ ] **Icons** — replaced `assets/icons/icon-{16,32,48,128}.png` with branded
  versions at the same dimensions.
- [ ] **Manifest** — updated `manifest.json`:
  - [ ] `name` matches the brand.
  - [ ] `short_name` matches `brand.shortName` where reasonable.
  - [ ] `description` is on-brand and accurate.
  - [ ] `version` matches `brand.version`.
- [ ] **Defaults** — edited `fixtures/demo-statuses.json`,
  `fixtures/demo-tags.json`, `fixtures/demo-replies.json` to match the
  target industry / language.
- [ ] **Docs** — updated `README.md`, `PRIVACY.md`, `docs/PRODUCT-LISTING.md`
  with the brand name and contact details. The independence notice remains in
  place in every doc.
- [ ] **Privacy & license** — confirmed the privacy policy reflects what the
  End Product collects (which should be nothing beyond the defaults), and
  that the license tier you purchased permits the planned distribution.
- [ ] **Build** — ran `npm run build` and `npm run package`; loaded `dist/`
  unpacked and verified the brand shows correctly.
- [ ] **Pre-publish sweep** — searched the codebase for any remaining
  `WaFlow` / `witejackel-eng` references that should have been replaced.
  Links to the upstream repo in `LICENSE.md` may remain; the independence
  notice must remain.
- [ ] **Compliance** — confirmed no claims of WhatsApp or Meta affiliation, no
  auto-send / bulk-send features, no new permissions beyond `storage` and
  `host_permissions: https://web.whatsapp.com/*`.

## 8. Common pitfalls

- **Renaming `id` fields in fixtures after install.** The CRM uses `id` to
  link contacts to statuses / tags. If you change an `id` after install,
  existing contacts lose their references. Change `name` and `color` freely,
  but treat `id` as immutable post-seed.
- **Using SVG for toolbar icons.** Chrome does not reliably render SVG in all
  icon contexts. Stick to PNG at the four documented sizes.
- **Forgetting the WhatsApp tab reload.** After changing `brand.js` and
  reloading the extension, reload the WhatsApp Web tab to see the changes.
- **Removing the independence notice.** It must remain in `brand.js` and in
  the public-facing docs. Removing it is a license violation and a Chrome Web
  Store policy risk.
