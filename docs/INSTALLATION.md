# Installation

LeadDock is installed in one of two ways depending on what you received:

- **(A) Load unpacked** — for developers and commercial-kit buyers who have the
  source or an unpacked folder. This is the path used during v1.0.0.
- **(B) Packaged extension** — for end users installing from the Chrome Web
  Store once LeadDock is published (see `docs/PUBLISHING.md`).

> **Independence notice.** LeadDock is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.

---

## (A) Load unpacked (developer / buyer path)

This is the path used today, since LeadDock v1.0.0 is distributed as a commercial
developer kit.

### Step 1. Get the extension files

Either:

- **Clone the repo:**

  ```bash
  git clone https://github.com/witejackel-eng/leaddock-whatsapp-crm.git
  cd leaddock-whatsapp-crm/leaddock
  ```

- **Or unzip a delivered source/binary ZIP** (for commercial-kit buyers).
  Unpack it somewhere stable — Chrome remembers the folder path, so do not
  move or delete it after loading.

The folder you point Chrome at must contain `manifest.json` at its root.

### Step 2. Open the Chrome extensions page

In Chrome (or any Chromium browser that supports Manifest V3 — Edge, Brave,
Vivaldi, Arc), open:

```
chrome://extensions
```

### Step 3. Enable Developer mode

Toggle the **Developer mode** switch in the top-right corner of the page.

> _(Screenshot placeholder: chrome://extensions with Developer mode toggle ON,
> highlighted in the top-right.)_

### Step 4. Load unpacked

Click **Load unpacked**. In the file picker that opens, select the `leaddock/`
folder (the one containing `manifest.json`).

> _(Screenshot placeholder: file picker selecting the `leaddock/` folder.)_

### Step 5. Pin the extension (recommended)

Click the puzzle-piece icon in Chrome's toolbar, then click the pin icon next
to **LeadDock**. The LeadDock toolbar icon stays visible.

> _(Screenshot placeholder: Chrome extensions menu showing LeadDock pinned.)_

### Step 6. Open WhatsApp Web

Navigate to:

```
https://web.whatsapp.com
```

If WhatsApp Web was already open before you loaded the extension, **reload the
tab** so the content script initializes.

### Step 7. Verify install

When you open a chat in WhatsApp Web, the LeadDock CRM panel appears beside the
conversation. Click the LeadDock toolbar icon to open the dashboard popup.

---

## (B) Packaged extension (end-user path, post-publication)

Once LeadDock is published to the Chrome Web Store, end users install it
directly:

1. Open the LeadDock listing on the Chrome Web Store.
   _(Listing URL placeholder — fill in when the listing is live.)_
2. Click **Add to Chrome**.
3. Confirm the permissions prompt. Review the requested permissions:
   - `storage` — to persist CRM data locally.
   - `host_permissions: https://web.whatsapp.com/*` — to overlay the CRM on
     WhatsApp Web.
4. The extension installs and pins itself to the toolbar.
5. Open `https://web.whatsapp.com` and use LeadDock as in Step 6 / 7 above.

> End users do **not** need Developer mode. They do not need Node.js. The
> packaged extension is a self-contained install.

---

## Verifying the install

Whichever path you used, you can confirm LeadDock is loaded and active:

| Check                                        | Expected result                                              |
| -------------------------------------------- | ------------------------------------------------------------ |
| `chrome://extensions` lists LeadDock            | Card shows "LeadDock — WhatsApp Web CRM", version 1.0.0 |
| Toolbar icon visible                          | Clicking it opens the dashboard popup                       |
| Open a chat in WhatsApp Web                   | CRM panel appears beside the conversation                    |
| `Ctrl/Cmd+K` on WhatsApp Web                  | Command palette opens                                        |
| Options page opens                            | `chrome://extensions` → LeadDock → **Details** → **Extension options** |

---

## Troubleshooting installation

### LeadDock does not appear in `chrome://extensions`

- Confirm you selected the **folder that contains `manifest.json`**, not a
  parent or child folder.
- Confirm you enabled **Developer mode** before clicking **Load unpacked**.
- Check that `manifest.json` is valid JSON (no trailing commas, no comments).
  Validate by opening it in an editor with JSON linting.

### "Failed to load extension" error

- Look at the specific error message. Common causes:
  - `manifest.json` references a file that does not exist (icon path, content
    script path, popup HTML).
  - Manifest version mismatch (LeadDock requires MV3 support).
  - Invalid JSON syntax.

### LeadDock loaded but the panel does not appear on WhatsApp Web

- Reload the `https://web.whatsapp.com` tab.
- Confirm the URL is exactly `https://web.whatsapp.com/...` (not
  `web.whatsapp.com` without `https://`).
- Re-enable the extension in `chrome://extensions` (toggle off, then on).
- Check `host_permissions` — it must be `https://web.whatsapp.com/*`.

### The toolbar icon is missing

- Click the puzzle-piece icon in the toolbar.
- Find LeadDock in the list and click the pin icon.

### You updated LeadDock and WhatsApp Web looks stale

- Reload the WhatsApp Web tab. Content scripts reload on tab reload, not on
  extension update.

For deeper troubleshooting, see `docs/TROUBLESHOOTING.md`.

---

## What you should see (annotated placeholders)

The following screenshots describe what each screen should look like. Replace
these placeholders with real captures before publishing the storefront.

1. **`chrome://extensions` with LeadDock card** — shows name, version 1.0.0,
   permissions summary.
2. **WhatsApp Web with LeadDock panel docked on the right** — shows the active
   contact, status dropdown, tags, notes list, follow-up date, quick replies.
3. **Quick-reply launcher near the composer** — `⚡ Replies` button.
4. **Command palette** (`Ctrl/Cmd+K`) — overlay with a search input and command
   list.
5. **Dashboard popup** — total leads, status counts, today's follow-ups,
   recent leads.

---

## Next steps

- For customization (brand, colors, statuses, tags, replies), see
  `docs/CUSTOMIZATION.md`.
- For publishing to the Chrome Web Store, see `docs/PUBLISHING.md`.
- For architecture internals, see `docs/ARCHITECTURE.md`.
- For privacy, see `PRIVACY.md`.
