# LeadDock Security Policy

**Version:** 1.0.0
**Effective date:** 2026-01-01

> **Independence notice.** LeadDock is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.

This document describes LeadDock's threat model, the security-relevant decisions
in its architecture, how data is stored, how to report vulnerabilities, and
what versions are supported.

---

## 1. Threat model

LeadDock is a local-first, client-only Chrome extension. It has no backend, no
remote API, and no remote code execution surface in the default build.

| Threat surface                | LeadDock's posture                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| Remote code execution         | No `eval`, no `Function(...)` constructor, no dynamic `<script>` injection. MV3's CSP forbids remote code. |
| Cross-site data exfiltration  | CRM data lives only in `chrome.storage.local`, scoped to the extension's origin. The content script can read only the WhatsApp Web DOM. |
| Tampered WhatsApp DOM         | LeadDock sanitizes untrusted DOM strings before rendering them in its own (shadow-root-isolated) UI.     |
| Malicious extension updates   | Updates flow only through the Chrome Web Store's signed update channel (when published) or through the operator's own dev/update process for unpacked installs. The Licensor does not operate an update server. |
| Account compromise            | LeadDock never holds WhatsApp credentials. It does not log in, does not handle QR-session material, and cannot read your WhatsApp password. |
| Data leakage via permissions  | Minimal permissions (`storage` + `host_permissions: web.whatsapp.com`) by design. See §4.              |

## 2. How data is stored

- **Where:** `chrome.storage.local`. This is a browser-scoped storage partition
  tied to the extension's origin and the browser profile that installed it.
- **What:** CRM records only (see `PRIVACY.md` §3 and `fixtures/DATA_SCHEMA.json`).
- **Encryption at rest:** Provided by Chrome's storage implementation; LeadDock
  does not implement its own encryption layer in v1.
- **Backups:** When you export JSON or CSV, the file lands in your browser's
  default download location. Treat these exports as sensitive — they contain
  your CRM data in plain text.

## 3. Code quality and injection defenses

LeadDock follows a defensive coding baseline:

- **No `eval`.** No use of `eval`, `new Function(...)`, `setTimeout(string)`,
  or `setInterval(string)`.
- **No remote code.** All executable code ships inside the extension package.
  No `<script src="https://...">` references. MV3's Content Security Policy
  blocks remote scripts even if attempted.
- **No `innerHTML` with untrusted data.** Where the UI must render strings
  derived from the page (contact names, for instance), they pass through
  `src/utils/sanitize.js` and are inserted as `textContent` or via safe
  construction utilities in `src/content/ui/components.js`.
- **Schema validation.** Imported JSON and CSV pass through
  `src/utils/validators.js` and `src/content/storage/migrations.js` before any
  write to storage. Malformed input is rejected with a clear error rather than
  silently merged.
- **No secrets in source.** No API keys, tokens, or passwords are checked into
  the repository.
- **No unnecessary dependencies.** The extension itself ships zero
  third-party JavaScript dependencies. Dev-only `devDependencies` (eslint,
  prettier) are not bundled into the extension.

## 4. Permissions and minimization

LeadDock requests only the permissions it strictly needs:

| Permission                          | Justification                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `storage`                           | Persist CRM records in `chrome.storage.local`. Cannot function without it.                  |
| `host_permissions: web.whatsapp.com`| Content script must run on `https://web.whatsapp.com/*` to overlay the CRM panel.           |

The host permission is scoped to `web.whatsapp.com` only — not `<all_urls>`, not
`http://*/*`, not the broader `*://*/*`. LeadDock cannot read any other website
you visit.

## 5. Disclosure scope

LeadDock accesses only the WhatsApp Web DOM (`https://web.whatsapp.com/*`). The
DOM reads are limited to:

- The current chat header (to detect the active contact).
- The composer element (to insert text when you choose a quick reply).
- The chat list container (to observe when the active chat changes).

LeadDock does **not** read:

- Message bodies (incoming or outgoing).
- Media (images, voice notes, documents).
- Contacts in your phone address book beyond what WhatsApp Web renders in the
  open chat header.
- QR-session tokens or WhatsApp account credentials.
- Any other website.

## 6. Reporting a vulnerability

If you believe you have found a security vulnerability in LeadDock, please
report it responsibly:

- Email: see `supportEmail` in `src/config/brand.js` (default placeholder:
  `security@example.com` — replace before publishing).
- Subject: `[LeadDock Security] <short summary>`.
- Include: a clear description, reproduction steps, affected version
  (`manifest.json` `version` field), and any proof-of-concept.

Please do not open public GitHub issues for security reports.

### Disclosure timeline

- We acknowledge receipt within **3 business days**.
- We aim to provide an initial assessment within **14 days**.
- We coordinate a fix and disclosure timeline with you.
- We credit reporters in `CHANGELOG.md` unless you prefer to remain anonymous.

## 7. Supported versions

Only the latest minor release of LeadDock receives security fixes. Older
versions are supported on a best-effort basis. The current supported version is
listed in `manifest.json` (currently `1.0.0`) and in `CHANGELOG.md`.

## 8. What is out of scope

- Vulnerabilities in WhatsApp Web itself or in Meta's infrastructure — report
  those to Meta via their bug bounty program.
- Issues arising from a modified or rebranded version of LeadDock that you did
  not obtain from this repository or the Chrome Web Store listing maintained
  by the Licensor.
- Social-engineering or phishing attacks against LeadDock users.

## 9. Contact

For non-security issues, see the `supportEmail` value in `src/config/brand.js`.
For privacy questions, see `PRIVACY.md`. For licensing, see `LICENSE.md`.
