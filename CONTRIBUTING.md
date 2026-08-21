# Contributing to LeadDock

Thanks for your interest in improving LeadDock. This document describes how to
set up a development environment, the code style we use, how to run tests, how
to add features safely (i.e., via the adapter abstraction), and the PR
process.

> **Independence notice.** LeadDock is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.
> Contributed code must respect this — do not introduce claims of WhatsApp/Meta
> affiliation, automated bulk messaging, or message-history scraping.

---

## 1. Development environment

Requirements:

- Node.js `>=18` (for the test suite and packaging scripts).
- Chrome / Chromium with Manifest V3 support.
- A code editor with JavaScript syntax highlighting.
- `git`.

```bash
git clone https://github.com/witejackel-eng/leaddock-whatsapp-crm.git
cd leaddock-whatsapp-crm/leaddock
npm install
```

Load the extension into Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `leaddock/` folder.
5. Open `https://web.whatsapp.com`.

After making changes, reload the extension card and reload the WhatsApp Web tab.

## 2. Code style

LeadDock is written in **vanilla JavaScript using ES modules**. We deliberately
avoid a build step inside the extension runtime; the only build outputs are
produced by `scripts/build.js` and `scripts/package.js`, which copy and zip
source into distribution artifacts.

Conventions:

- **Indentation:** 2 spaces.
- **No semicolons** (the codebase uses ASI). Be consistent within a file — if
  the file you're editing already uses semicolons, match it and consider a
  follow-up cleanup PR.
- **Quotes:** double quotes (`"..."`).
- **Strict mode:** every module starts with `"use strict";`.
- **Naming:** `camelCase` for variables and functions, `PascalCase` for
  factory/class constructors, `CONSTANT_CASE` for module-level constants.
- **Module shape:** prefer named exports. Avoid default exports.
- **No `var`.** Use `const` by default, `let` only when reassignment is needed.
- **No `eval`, no `new Function(...)`, no `innerHTML` with untrusted strings.**
  See `SECURITY.md`.
- **Selectors:** never import WhatsApp DOM selectors into the CRM layer. See
  §4.

Format your code before committing:

```bash
npm run format
npm run lint
```

Prettier configuration is shared in the repository root.

## 3. Running tests

LeadDock ships a unit-test suite using Node's built-in test runner:

```bash
npm test
```

This runs `node --test tests/` and executes every `*.test.js` file under
`tests/`. Tests are pure-Node where possible (no browser DOM), and they focus
on the CRM and storage layers — the parts that can be deterministic.

Test scope:

- Contact CRUD.
- Note operations.
- Status / tag / reply management.
- Follow-up date math and due-state calculation.
- Search filtering.
- CSV parse / serialize round-trips.
- Storage schema migrations.

When adding a feature, add a test under `tests/` that exercises the new
behavior without requiring a live WhatsApp Web page.

## 4. Adding features via the adapter abstraction

The single most important architectural rule:

> **The CRM layer must not know WhatsApp DOM selectors.**

All WhatsApp-specific DOM logic lives in `src/content/whatsapp/`. The CRM
layer (`src/content/crm/`, `src/content/replies/`, `src/content/storage/`)
operates only on plain data records and the storage schema.

The contract between the two layers is the WhatsApp adapter interface
(`src/content/whatsapp/adapter.js`):

```js
getCurrentChat()           // -> { id, name } | null
getCurrentContact()        // -> { phone, name } | null
getComposer()              // -> HTMLElement | null
insertMessage(text)        // -> boolean (true on success)
openChat(contact)          // -> Promise<boolean>
observeChatChanges(callback)  // -> unsubscribe function
```

When you add a CRM feature:

1. Implement it against the adapter interface, not against selectors.
2. If the feature requires new WhatsApp DOM access, add a method to the adapter
   and implement it inside `src/content/whatsapp/`, with selector fallbacks in
   `src/content/whatsapp/selectors.js`.
3. Never reach into the DOM from `src/content/crm/` or `src/content/ui/`.

This rule keeps LeadDock functional when WhatsApp ships DOM changes — only
`src/content/whatsapp/selectors.js` needs updating.

## 5. Project structure map

```
leaddock/
  manifest.json
  package.json
  src/
    background/service-worker.js
    content/
      main.js
      whatsapp/  (adapter.js, selectors.js, observer.js, composer.js, navigation.js, contact-detector.js)
      crm/       (contacts.js, notes.js, statuses.js, tags.js, followups.js, fields.js)
      replies/   (manager.js, parser.js, renderer.js)
      ui/        (panel.js, modal.js, toast.js, command-palette.js, reply-picker.js, components.js, styles.css)
      storage/   (storage.js, schema.js, migrations.js)
      utils/     (ids.js, dates.js, csv.js, debounce.js, sanitize.js, validators.js)
      config/brand.js
    popup/   (index.html, popup.js, popup.css)
    options/ (index.html, settings.js, settings.css)
  assets/icons/
  scripts/  (build.js, package.js, release.js)
  fixtures/ (demo-contacts.csv, demo-statuses.json, demo-tags.json, demo-replies.json, DATA_SCHEMA.json)
  tests/
```

See `docs/ARCHITECTURE.md` for the full component map.

## 6. Commit message style

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short imperative summary>

<optional body explaining why>

<optional footer>
```

Types:

- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `refactor` — code change that neither fixes a bug nor adds a feature
- `perf` — performance improvement
- `test` — test-only change
- `chore` — build, tooling, config

Examples:

```
feat(crm): add tag filter to pipeline view
fix(whatsapp/selectors): fallback for composer when header role changes
docs(readme): clarify permissions table
```

## 7. Pull request process

1. Open an issue describing the change before starting non-trivial work. This
   avoids wasted effort on contributions that may not align with the project
   direction.
2. Fork the repo, create a feature branch (`feat/...`, `fix/...`, `docs/...`).
3. Make your changes. Keep PRs focused — one logical change per PR.
4. Run `npm test`, `npm run lint`, and `npm run format`.
5. Update or add tests under `tests/`.
6. Update documentation (`README.md`, `docs/`, `CHANGELOG.md` if user-facing).
7. Open the PR against `main`. Fill in the PR template.
8. Address review feedback. Force-push to the same branch.

PR checklist (paste into the PR description):

- [ ] Tests added or updated.
- [ ] `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] No new permissions added without justification.
- [ ] No WhatsApp selectors introduced outside `src/content/whatsapp/`.
- [ ] No `eval`, `new Function`, or untrusted `innerHTML`.
- [ ] No new outbound network calls.
- [ ] Documentation updated.
- [ ] CHANGELOG entry added under `[Unreleased]` (when user-facing).
- [ ] Independence notice preserved in any modified public-facing surface.

## 8. Code of conduct (short)

Be kind, be specific, be patient. Treat maintainers and contributors with
respect. Harassment, discrimination, or personal attacks are not tolerated and
will result in being blocked from the repository. Disagree about code, not
about people. If you observe unacceptable behavior, report it via the support
email in `src/config/brand.js`.

## 9. Things we will not accept

To protect users, the Chrome Web Store review, and the product's
independence:

- Auto-send, bulk-send, or scheduled-send features.
- Message-history scraping or message-content reading.
- Outbound telemetry / analytics added without opt-in.
- New permissions beyond `storage` and `host_permissions: web.whatsapp.com`.
- Claims of WhatsApp or Meta affiliation.
- Obfuscation of the source code.

If your contribution requires any of the above, open an issue first to discuss
whether the goal can be met within the constraints.

## 10. Licensing of contributions

By contributing, you agree that your contributions will be licensed under the
same license that covers the file you changed (see `LICENSE.md`). If you add a
new file, mark it clearly with a header referencing `LICENSE.md`.

---

Thanks for helping make LeadDock better.
