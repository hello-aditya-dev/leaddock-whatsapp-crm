# LeadDock Architecture

This document describes LeadDock's component boundaries, the WhatsApp adapter
abstraction, the storage layer, the UI layer, the runtime data flow, failure
modes and graceful degradation, the observer strategy, and the performance
approach.

> **Independence notice.** LeadDock is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.

---

## 1. Component boundaries

LeadDock is a Manifest V3 Chrome extension with four runtime surfaces, plus the
build/test/scripts layer.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Chrome Browser                                                                │
│                                                                                │
│  ┌─────────────────────┐   ┌─────────────────────────────────────────────┐   │
│  │  Service Worker      │   │  Content Script (web.whatsapp.com only)    │   │
│  │  src/background/      │   │  src/content/main.js                       │   │
│  │  service-worker.js   │   │                                              │   │
│  │                       │   │  ┌────────────────────────────────────┐  │   │
│  │  - lifecycle          │   │  │ WhatsApp adapter                    │  │   │
│  │  - storage bridges    │◄──┼──│  src/content/whatsapp/              │  │   │
│  │  - install/upgrade    │   │  │  adapter, selectors, observer,      │  │   │
│  └─────────────────────┘   │  │  composer, navigation, detector      │  │   │
│                              │  └──────────────┬─────────────────────┘  │   │
│  ┌─────────────────────┐   │                 │                          │   │
│  │ Popup (action)       │   │  ┌──────────────▼─────────────────────┐  │   │
│  │ src/popup/           │   │  │ CRM core                            │  │   │
│  │  dashboard, search,   │   │ │  src/content/crm/                  │  │   │
│  │  quick actions        │   │ │  src/content/replies/               │  │   │
│  └─────────────────────┘   │  │  src/content/storage/               │  │   │
│                              │  └──────────────┬─────────────────────┘  │   │
│  ┌─────────────────────┐   │                 │                          │   │
│  │ Options page         │   │  ┌──────────────▼─────────────────────┐  │   │
│  │ src/options/          │   │  │ UI (shadow root)                   │  │   │
│  │  settings, backup,    │   │ │  src/content/ui/                   │  │   │
│  │  reset, brand links   │   │ │  panel, modal, toast, palette,     │  │   │
│  └─────────────────────┘   │  │  reply-picker, components, styles   │  │   │
│                              │  └────────────────────────────────────┘  │   │
│                              └─────────────────────────────────────────────┘   │
│                                                                                │
│  Storage: chrome.storage.local (versioned schema)                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Background service worker — `src/background/service-worker.js`

Registered in `manifest.json` as `"type": "module"`. Responsibilities:

- Extension lifecycle (`onInstalled`, `onUpdated`).
- Seeding default statuses / tags / replies on first install.
- Bridging messages between popup, options, and content script when needed.
- Scheduling follow-up notifications (chrome.alarms is **not** requested in v1;
  reminders surface when the popup or WhatsApp Web tab is open).

The service worker is intentionally minimal. Most logic lives in the content
script because that is where the WhatsApp DOM is available.

### 1.2 Content script — `src/content/main.js`

Matched to `https://web.whatsapp.com/*` and injected at `document_idle`. It is
the orchestrator: it boots the WhatsApp adapter, registers observers, mounts
the CRM UI inside a shadow root, and wires user interactions to the CRM core.

### 1.3 Popup — `src/popup/`

Opens from the browser toolbar icon. Renders the dashboard: total leads,
status counts, today's follow-ups, recent leads, search box, and quick
actions (export, settings, demo). Reads from `chrome.storage.local` directly;
does not depend on the content script.

### 1.4 Options page — `src/options/`

Opens in a tab (`"open_in_tab": true`). Hosts brand display, support links,
backup/restore, CSV import/export, demo-mode toggle, privacy-mode toggle,
data reset, and (where present) diagnostics mode.

## 2. The WhatsApp adapter

The CRM layer must not know WhatsApp DOM selectors. The adapter is the
**single boundary** between the WhatsApp Web DOM and the CRM core.

### 2.1 Interface

```js
// src/content/whatsapp/adapter.js

getCurrentChat()              // -> { id: string, name: string } | null
getCurrentContact()           // -> { phone: string|null, name: string|null } | null
getComposer()                 // -> HTMLElement | null
insertMessage(text)           // -> boolean  (true on success)
openChat(contact)             // -> Promise<boolean>  (true on success)
observeChatChanges(callback)  // -> () => void  (unsubscribe)
```

### 2.2 Why it exists

WhatsApp Web is a dynamic SPA. Selectors change. Layouts shift. Without an
abstraction:

- Every CRM feature would hard-code selectors that break on every WhatsApp
  UI update.
- Tests would need a real DOM, making the CRM layer untestable.
- Re-skinning for a different chat product (e.g., a future V2 adapter) would
  require rewriting every CRM module.

The adapter solves all three:

- Only `src/content/whatsapp/selectors.js` and the adapter files know the DOM.
- The CRM core is testable with plain objects.
- A future adapter implementation (for a different host) could replace
  `src/content/whatsapp/adapter.js` and the CRM would keep working.

### 2.3 Selectors and fallbacks

All selectors are centralized in `src/content/whatsapp/selectors.js` as a
single object with **ordered fallback lists** per concept:

```js
// Illustrative shape — see the source for the live version.
export const SELECTORS = {
  chatHeader: [
    "header[data-testid='conversation-header']",
    "div[role='button'] span[title]",
    "header span[title]",
  ],
  composer: [
    "div[contenteditable='true'][data-tab='10']",
    "footer div[contenteditable='true']",
    "div[contenteditable='true']",
  ],
  // ...
};
```

The adapter tries each entry in order and caches the first hit. If none match,
the adapter returns `null` / `false`, and the CRM core degrades gracefully
(see §6).

### 2.4 Composer insertion

`insertMessage(text)` focuses the composer, sets its content via the browser's
native input events (so WhatsApp's React state updates), and returns `true` on
success. LeadDock **never** simulates a click on the send button. The user
always confirms and presses send.

## 3. Storage layer

A single versioned schema lives under `chrome.storage.local`:

```json
{
  "version": 1,
  "contacts": {},
  "notes": {},
  "replies": {},
  "tags": {},
  "statuses": {},
  "followUps": {},
  "settings": {},
  "meta": {}
}
```

- `version` is a positive integer. Increment on breaking schema changes.
- Each top-level key is a keyed collection: `{ id: record }`. This keeps reads
  and writes O(1) per record.
- `meta` holds install date, last backup date, schema migration log, and other
  non-CRM runtime metadata.

### 3.1 Files

- `src/content/storage/storage.js` — read/write/transactional helpers around
  `chrome.storage.local`.
- `src/content/storage/schema.js` — schema definition, defaults, and the
  current `version`.
- `src/content/storage/migrations.js` — ordered migrations keyed by source
  version. Each migration takes the prior schema shape and returns the next.

### 3.2 Migration flow

```
load stored snapshot
  │
  ▼
if snapshot.version === CURRENT_VERSION → use as-is
else if snapshot.version < CURRENT_VERSION → run migrations in order:
   v0 → v1 → v2 → ... → CURRENT
   each migration: (snapshot) => snapshot'
else (snapshot.version > CURRENT_VERSION) → refuse restore with a clear
   message; do not silently downgrade.
```

Migrations are pure functions of the data — they never call out to the network
or read the DOM.

## 4. UI layer

All CRM UI lives in `src/content/ui/`. To prevent WhatsApp Web's CSS from
bleeding into LeadDock (and vice versa), the CRM panel mounts inside a
**shadow root**:

```
host element (regular DOM)
  └── shadow root
        ├── <link rel="stylesheet" href="...styles.css">
        └── CRM panel markup
```

Components:

- `panel.js` — the main CRM panel docked beside the open chat.
- `command-palette.js` — `Ctrl/Cmd+K` palette with fuzzy search across
  commands and contacts.
- `reply-picker.js` — quick-reply launcher near the composer.
- `modal.js` — generic modal used by editors (status, tag, note, reply).
- `toast.js` — non-blocking toast notifications.
- `components.js` — safe DOM construction utilities (no `innerHTML` with
  untrusted strings).
- `styles.css` — bundled as a `web_accessible_resource` (see `manifest.json`).

## 5. Data flow

```
User opens / switches chat in WhatsApp Web
        │
        ▼
MutationObserver fires (whatsapp/observer.js, debounced)
        │
        ▼
adapter.getCurrentContact() → { name, phone } | null
        │
        ▼
crm/contacts.js upserts (or creates) a contact record
        │
        ▼
ui/panel.js renders the contact's CRM view (status, tags, notes,
follow-ups, replies) inside the shadow root
        │
        ▼
User action (set status, add note, choose reply, set follow-up)
        │
        ├── crm/* updates the in-memory record
        ├── storage/storage.js writes to chrome.storage.local
        └── ui re-renders the affected slice only

User chooses a quick reply
        │
        ▼
replies/parser.js substitutes {{name}}, {{phone}}, {{company}}, {{product}}
        │
        ▼
adapter.insertMessage(text) → focuses composer, inserts text
        │
        ▼
USER PRESSES SEND (LeadDock never auto-sends)
```

## 6. Failure modes and graceful degradation

LeadDock is designed to fail soft. No single WhatsApp selector mismatch should
break the whole CRM.

| Failure                                   | Behavior                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| Selector for chat header not found        | Panel shows "No chat detected." Quick replies still launch via toolbar.     |
| Selector for composer not found           | Reply insertion reports failure; user is told to reload the WhatsApp tab. |
| Adapter returns `null` repeatedly         | Panel enters diagnostics state; "WhatsApp UI may have changed" notice.    |
| `chrome.storage.local` write throws       | Operation surfaces a toast; in-memory state preserved; user can retry.    |
| Imported JSON has higher schema version   | Restore refused with a clear error; existing data untouched.             |
| Imported JSON has lower schema version    | Migrations run; success toast confirms the new version.                   |
| Imported CSV has missing/unknown headers  | Validation preview highlights the problem; user can fix or cancel.       |
| Service worker restarts (MV3 lifecycle)  | Content script and popup continue operating; rehydration is automatic.   |

No failure path spams `console.error`. Repeated failures are throttled and
summarized into a single diagnostics line.

## 7. Observer strategy

LeadDock uses `MutationObserver`, never whole-page polling.

- **Narrow targets.** Observers attach to specific containers (chat list, chat
  header, composer region) — never to `document.body`.
- **Debounced callbacks.** Each observer's callback is wrapped in a debounce
  (default ~120 ms) so a burst of mutations produces a single CRM update.
- **Subtree limited.** `subtree: true` only when observing a container whose
  target element may be re-rendered at depth; otherwise `subtree: false`.
- **CharacterData off by default.** Listening to text-node changes is
  expensive and unnecessary for contact-context detection.
- **Disconnect on tab hide.** When the document becomes hidden
  (`visibilitychange`), observers disconnect and reconnect on `visible` to
  avoid wasted work.
- **No 100 ms whole-page `setInterval`.** Periodic checks, when truly needed,
  are bounded (max 2 s interval, max 3 retries) and gated on observer failure.

## 8. Performance approach

- **Local-only.** No network round-trips on the critical path.
- **Shadow-root CSS isolation** keeps WhatsApp's CSS recalculation cost off
  LeadDock's components.
- **Render-slice updates.** The panel re-renders only the affected slice
  (e.g., just the notes list, not the whole panel) on each change.
- **Debounced observers** (see §7).
- **Keyed collections** in storage give O(1) record access by id.
- **Cached selector resolution.** The adapter caches the first working
  selector per concept per session and only re-tries when it returns `null`.
- **No React.** Vanilla JS means no virtual DOM overhead and a small bundle.
- **No third-party runtime dependencies.** The extension ships zero runtime
  npm packages.
