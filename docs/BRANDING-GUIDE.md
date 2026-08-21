# LeadDock Branding Guide

LeadDock is built for white-label resale. A buyer should be able to rebrand
the entire product from a single configuration file plus a logo swap, without
hunting through the source tree.

## 1. The single source of truth: `src/config/brand.js`

Every product-identity string in the extension reads from this file. Edit it
once and the panel header, popup, options page, diagnostics, toasts, and
independence notice all update.

```js
// src/config/brand.js
export const brand = {
  name: "LeadDock",                       // display name
  shortName: "LD",                        // compact badge label
  tagline: "The lightweight CRM for WhatsApp Web",
  hero: "Turn WhatsApp Web into your sales workspace.",
  primaryColor: "#0F766E",                // accent color (CSS)
  primaryColorDark: "#14B8A6",
  website: "https://github.com/witejackel-eng/leaddock-whatsapp-crm",
  supportEmail: "witejackel@gmail.com",
  helpUrl: ".../docs/INSTALLATION.md",
  privacyUrl: ".../PRIVACY.md",
  logoPath: "assets/icons/icon-128.png",
  version: "1.0.0",
  independenceNotice: "LeadDock is an independent productivity extension. It is not affiliated with or endorsed by WhatsApp or Meta.",
};
```

## 2. Replace the logo / icons

Drop your branded PNG icons into `assets/icons/`:

- `icon-16.png`
- `icon-32.png`
- `icon-48.png`
- `icon-128.png`

Then rebuild (`node scripts/build.js`) and load unpacked.

## 3. Change the primary color

Edit `primaryColor` in `brand.js`. The panel CSS uses the `--wf-primary` token
which is derived from this value. The popup and options pages have their own
CSS variables in `src/popup/popup.css` and `src/options/settings.css` — update
the `--primary` token there too if you want the popup/options to match.

## 4. Default statuses, tags, and quick replies

These live in `src/content/storage/schema.js`:

- `DEFAULT_STATUSES` — the 7 lead stages (editable later in Options).
- `DEFAULT_TAGS` — the 7 sample tags.
- `DEFAULT_REPLIES` — the 6 sample quick replies.

Edit these arrays to ship your own defaults. Existing user databases are
preserved via the migration system — only fresh installs get the new defaults.

## 5. Support, website, and privacy links

All in `brand.js`:

- `supportEmail` — shown in popup, options, panel diagnostics, store copy.
- `website` — public marketing URL.
- `helpUrl` — deep link to installation docs.
- `privacyUrl` — deep link to your privacy policy.

## 6. White-label checklist

Before publishing under your own brand:

- [ ] Edit `src/config/brand.js` (name, shortName, tagline, colors, links, email).
- [ ] Replace `assets/icons/*` with your icons (16/32/48/128 px).
- [ ] Edit the `independenceNotice` wording if you reference your own product
      name (keep the "not affiliated with WhatsApp/Meta" substance).
- [ ] Update `manifest.json` `name`, `short_name`, and `description` to match.
- [ ] Update `package.json` `name`, `description`, `author`, `repository`.
- [ ] Regenerate icons if you changed the badge (`node scripts/gen-icons.js`).
- [ ] Rebuild (`node scripts/build.js`) and load unpacked to verify.
- [ ] Run the test suite (`npm test`) to confirm nothing regressed.
- [ ] Update `README.md`, `QUICKSTART.md`, and `docs/` if you renamed the product.
- [ ] Update `LICENSE.md` if your jurisdiction / terms differ (get legal review).

## 7. Independence notice (non-negotiable)

Whatever you rename the product to, you MUST retain a clear statement that the
extension is independent of WhatsApp/Meta and is not affiliated with or
endorsed by them. This appears in:

- The panel footer.
- The popup footer.
- The options footer.
- `PRIVACY.md`.
- `SECURITY.md`.
- The Chrome Web Store listing copy.
- `README.md`.

Removing or weakening this notice is a violation of the license and of
WhatsApp/Meta's trademarks.

## 8. Need help?

Email **witejackel@gmail.com** with a Diagnostics snapshot (Options →
Diagnostics → Copy to clipboard) if something breaks during white-labeling.
