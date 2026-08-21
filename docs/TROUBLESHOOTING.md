# Troubleshooting

Common issues and how to fix them. If a problem isn't covered here, check
`docs/ARCHITECTURE.md` (for behavior) and `PRIVACY.md` / `SECURITY.md` (for
data and security posture) before reaching out to support.

> **Independence notice.** WaFlow is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.

---

## 1. The CRM panel does not appear

Symptoms: WaFlow is loaded in `chrome://extensions`, but no panel shows up
beside a WhatsApp Web chat.

| Possible cause                                       | Fix                                                                              |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| WhatsApp Web tab was open before the extension loaded | Reload the `https://web.whatsapp.com/` tab.                                     |
| Extension is disabled                                 | Toggle the WaFlow card on in `chrome://extensions`.                              |
| `host_permissions` does not match                    | Confirm `manifest.json` lists `"https://web.whatsapp.com/*"`. Reload extension. |
| Wrong folder loaded                                  | Confirm the loaded folder contains `manifest.json` at its root.                  |
| No chat is selected                                   | Open a 1:1 chat in WhatsApp Web; the panel only renders when a chat is active.  |
| You are logged out / WhatsApp is on the QR screen    | Log in. The panel waits for a chat context before rendering.                     |

## 2. WhatsApp UI changed (selectors are stale)

WhatsApp Web updates its DOM periodically. WaFlow's adapter uses ordered
selector fallback lists (see `docs/ARCHITECTURE.md` §2.3) to absorb small
changes, but a major refactor can require selector updates.

### 2.1 Diagnose

1. Open the **Options** page → **Diagnostics** toggle (or "WhatsApp UI may have
   changed" banner if visible). This surfaces which selectors are resolving
   and which are returning `null`.
2. In DevTools on the WhatsApp Web tab, run:

   ```js
   // Inspect the current chat header:
   document.querySelectorAll("header span[title]")
   // Inspect the composer:
   document.querySelectorAll("div[contenteditable='true']")
   ```

3. Compare against `src/content/whatsapp/selectors.js`.

### 2.2 Fix

Add the new selector as a new entry at the **top** of the relevant fallback
list in `src/content/whatsapp/selectors.js`. Keep the prior entries below —
they are useful fallbacks if WhatsApp reverts. Reload the extension and the
WhatsApp tab.

### 2.3 Avoid

- Do **not** import selectors into the CRM layer. All selector fixes stay in
  `src/content/whatsapp/`.
- Do **not** switch to a 100 ms polling loop. The observer pattern is robust
  enough — extend the observer's debounced callback instead.

## 3. Reset CRM data

If the CRM is in a bad state (bad import, corrupt record, demo data lingering):

1. Open the **Options** page.
2. Scroll to **Danger zone** → **Reset all CRM data**.
3. Confirm. This clears `contacts`, `notes`, `replies`, `tags`, `statuses`,
   `followUps`, and `settings` from `chrome.storage.local`. WhatsApp itself is
   unaffected.
4. Default statuses / tags / replies re-seed on next load.

For demo-only resets:

```bash
npm run demo:reset
```

Then reload the extension.

## 4. Backup / restore failures

### 4.1 Schema version mismatch

Symptom: importing a JSON backup shows an error mentioning
`schema version` or `migration`.

- If the backup's `version` is **lower** than the current schema: WaFlow should
  run migrations automatically. If the migration fails, the importer reports
  the failing step — file a bug with the backup file (after redacting personal
  data).
- If the backup's `version` is **higher** than the current schema: you are on
  an older WaFlow version. Upgrade WaFlow to the matching version before
  restoring.
- If the backup is **missing** the `version` field entirely: it is not a
  WaFlow backup. Reconstruct via CSV import instead.

### 4.2 Backup is not valid JSON

Symptom: "Could not parse backup file."

- Open the file in a JSON-aware editor. Fix syntax errors.
- Confirm the file was not truncated during download (compare file size to the
  size reported by the export toast).

### 4.3 Restore shows "0 contacts imported"

- The backup file's top-level keys must be `version`, `contacts`, `notes`,
  `replies`, `tags`, `statuses`, `followUps`, `settings`, `meta`. A file with
  only `contacts` is a partial export, not a full backup — re-export using
  the JSON backup button, not the CSV export.

## 5. CSV import errors

| Error                                          | Cause                                                                 | Fix                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| "Header row missing required columns"          | One of `name`, `phone` is absent.                                     | Add the missing column to the CSV header.                          |
| "Unknown column 'X' ignored"                   | Optional column name typo (e.g., `compny` instead of `company`).     | Fix the column name or accept that the column is skipped.            |
| "Row N: invalid phone"                          | Phone contains non-numeric characters other than `+`, spaces, `-`.  | Normalize the phone field.                                           |
| "Row N: missing name and phone"                | Both required fields are empty in the same row.                      | Remove the row or fill in a name or phone.                          |
| "Tags column references unknown tag 'X'"        | CSV mentions a tag that doesn't exist in your `tags` collection.     | Pre-create the tag, or accept that the tag will be auto-created on import (if the importer is configured to do so). |
| Encoding garbled for non-Latin characters       | CSV is not UTF-8.                                                     | Re-export the CSV as UTF-8 from the source spreadsheet.              |

### 5.1 Validation preview

The CSV importer always shows a validation preview before any write. Use it.
If the preview shows N valid rows and M warnings, those are the rows that
will be imported. Cancel if the warning count is high.

### 5.2 CSV header reference

WaFlow's importer expects this header (case-insensitive):

```
name,phone,company,email,product,budget,source,status,tags,notes,followUpDate
```

The `tags` column uses a pipe separator: `Hot|Wholesale`.

## 6. Storage quota

`chrome.storage.local` has a quota (typically ~5 MB for unpacked / 10 MB for
installed extensions in Chrome). WaFlow's records are small, but large
note volumes can add up.

- Check the Options page → **Storage usage** indicator.
- If approaching the limit:
  - Export a JSON backup (so nothing is lost).
  - Delete old notes on contacts you no longer actively work.
  - Export contacts you no longer need to CSV, then archive them in a CSV file
    outside the browser.
- If you routinely hit the limit, request `unlimitedStorage` permission —
  weigh this against the Chrome Web Store review friction (more permissions =
  more reviewer scrutiny).

## 7. Multi-tab conflicts

If you open WhatsApp Web in two tabs simultaneously, both content scripts
write to the same `chrome.storage.local`. Conflicts are unlikely (each write
is keyed by record id) but possible if you edit the same contact in both tabs.

Mitigations:

- Edits to the same record in two tabs follow last-write-wins. The
  `updatedAt` timestamp is refreshed on every write.
- The panel does not auto-refresh when the underlying storage changes from
  another tab in v1. If you suspect stale data, close the duplicate tab or
  reload the active one.

## 8. Performance issues

Symptoms: typing in the composer feels laggy, the panel takes >200 ms to
render after switching chats.

| Likely cause                                            | Fix                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| Stale observer firing on every mutation                   | Reload the WhatsApp tab to reset observers.                  |
| Very large notes list with no pagination                 | Split long notes; v1 paginates at 50 notes per contact.      |
| Slow Chrome profile / many other extensions              | Disable other extensions on the WhatsApp Web tab to isolate. |
| Old hardware / low RAM                                    | Close other tabs; reduce WhatsApp Web zoom level.            |

If performance is reproducible, open the Options page → **Diagnostics** and
capture the observer event count over 30 seconds. If it is climbing without
chat activity, an observer is misbehaving — file a bug.

## 9. Contact not detected

Symptom: A chat is open, but the panel says "No contact detected."

| State on WhatsApp Web           | Expected WaFlow behavior                                   |
| ------------------------------- | ---------------------------------------------------------- |
| Logged out / QR screen           | Panel does not render; nothing to detect.                  |
| Loading spinner                  | Panel waits; renders once the chat list resolves.         |
| No chat selected                 | Panel shows "No chat selected."                            |
| Individual (1:1) chat            | Contact name and phone (where available) are detected.     |
| Group chat                       | Group name is shown; no per-member CRM record is created. |
| Business account with no phone   | Name is detected; phone is null. CRM record still works.    |
| Contact with only phone (no name)| Phone is detected; name is null until you set one.          |
| Long contact name with emoji     | Name is captured verbatim; UI truncates with ellipsis.    |

If WaFlow still cannot detect a contact that you can see, switch on
Diagnostics mode (Options → Diagnostics) and review the captured selector
state. The most common cause is a WhatsApp UI change (see §2).

## 10. Quick replies do not insert

| Symptom                                | Likely cause                            | Fix                                              |
| -------------------------------------- | --------------------------------------- | ------------------------------------------------ |
| Reply chosen, nothing happens          | Composer not found                       | Reload the WhatsApp tab; review selectors.       |
| Reply inserts only part of the text     | WhatsApp composer lost focus mid-insert | Click the composer once, then choose the reply. |
| Reply inserts text but cursor jumps     | Composer state desync                    | Reload tab; this is rare but recoverable.        |
| `{{name}}` is not substituted           | Contact has no name set                  | Set a name on the contact card; re-insert.      |
| `{{nme}}` shown literally               | Typo in the template                     | Edit the reply; correct to `{{name}}`.           |

## 11. Command palette does not open

| Symptom                              | Likely cause                                       | Fix                                                              |
| ------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------- |
| `Ctrl/Cmd+K` does nothing            | Another extension or Chrome feature owns the combo | Open via the WaFlow toolbar icon → "Command palette", or remap. |
| Palette opens but commands are stale | Storage changed in another tab                      | Reload the WhatsApp tab.                                          |
| Palette search shows no results      | Search index not built                              | Reload the tab; index builds on first open.                      |

## 12. Privacy mode is stuck on

If you toggled Privacy mode on and forgot, the panel and popup will blur
sensitive fields. Toggle it off in the Options page or via the command
palette (`Ctrl/Cmd+K` → "Privacy mode").

## 13. Reporting a bug

When filing a bug:

1. Reproduce with the **demo dataset** if possible (`npm run demo:reset`,
   then Options → Load demo data).
2. Note the WaFlow version (Options page footer or `manifest.json`).
3. Note the Chrome version and OS.
4. Attach the Diagnostics output (Options → Diagnostics → Copy report).
5. Describe the steps, the expected behavior, and the actual behavior.
6. Redact any real customer data before sharing.

Open issues at <https://github.com/witejackel-eng/waflow-whatsapp-crm/issues>.
For security issues, see `SECURITY.md` §6.
