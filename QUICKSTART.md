# LeadDock Quickstart

Get LeadDock running in under two minutes.

## 1. Install the extension

### Option A — Load unpacked (developer)

1. Download `leaddock-extension-v1.0.0.zip` from the release page.
2. Unzip it anywhere on your machine.
3. Open `chrome://extensions` in Chrome (or any Chromium browser).
4. Toggle **Developer mode** on (top-right).
5. Click **Load unpacked** and select the unzipped folder.
6. The LeadDock icon appears in your toolbar.

### Option B — Chrome Web Store (end user)

When published, install directly from the Chrome Web Store. (Listing is
prepared but publishing is a manual step outside this kit.)

## 2. Open WhatsApp Web

1. Go to https://web.whatsapp.com and sign in by scanning the QR code.
2. Open any individual chat.
3. The LeadDock CRM panel appears on the right side of WhatsApp Web.

If the panel doesn't appear:
- Reload the WhatsApp Web tab.
- Confirm the extension is enabled in `chrome://extensions`.
- Click the LeadDock toolbar icon → the panel re-mounts.

## 3. Explore with demo data

On first install, LeadDock loads **fictional demo data** (Rahul Sharma, Priya
Patel, Aman Gupta, Neha Singh, Arjun Mehta) so the dashboard, pipeline, and
panel feel alive immediately.

To reset demo data:
- Click the LeadDock toolbar icon → **Reset all data** (or open
  `chrome://extensions` → LeadDock → Details → Extension options → Data →
  Reset all data).

## 4. Core workflow

1. **Open a chat** — LeadDock detects the contact and shows the CRM panel.
2. **Set a status** — New Lead → Contacted → Interested → Follow Up →
   Qualified → Won (or Lost).
3. **Add tags** — Hot, High Value, Website, Instagram, Referral, Wholesale,
   Urgent (or create your own).
4. **Add notes** — Context stays attached to the customer, newest-first.
5. **Set a follow-up** — Today / Tomorrow / In 3 Days / Next Week / Custom.
6. **Insert a quick reply** — Click ⚡ Replies near the composer, or type a
   slash shortcut like `/price`. The reply text is INSERTED into the composer;
   **you always press send yourself**. LeadDock never auto-sends.

## 5. Keyboard shortcuts

| Shortcut       | Action                |
| -------------- | --------------------- |
| `Ctrl/Cmd + K` | Open command palette  |
| `↑` / `↓`      | Navigate palette      |
| `Enter`        | Run selected command  |
| `Esc`          | Close any overlay     |
| `/word`        | Slash shortcut in composer |

## 6. Back up your data

- **CSV export**: Options → Data → Export contacts CSV.
- **JSON backup**: Options → Data → Download backup (full CRM, schema-versioned).
- **Restore**: Options → Data → Restore from backup (validates + previews first).

All data is stored locally in your browser via `chrome.storage.local`. No
backend, no telemetry, no remote analytics.

## 7. Customize (white-label)

Edit `src/config/brand.js` to change the product name, colors, support email,
website, and links. Replace `assets/icons/*` with your branded icons. See
`docs/CUSTOMIZATION.md` for the full guide.

## 8. Get help

- Diagnostics: open the LeadDock panel → Diagnostics button (or Options →
  Diagnostics) for a health snapshot you can copy and share.
- Support: **witejackel@gmail.com**

## Independence notice

LeadDock is an independent productivity extension. It is not affiliated with
or endorsed by WhatsApp or Meta.
