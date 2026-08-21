# LeadDock Launch Checklist

This is the canonical release checklist for shipping a LeadDock release. Use it
for every minor and patch release. Tick every item before tagging.

> **Independence notice.** LeadDock is an independent productivity extension
> for WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or
> Meta. The independence notice must appear in every public-facing surface
> listed below.

---

## 1. Code and version

- [ ] All planned changes merged into `main`.
- [ ] `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run format` applied (no diff after `npm run format`).
- [ ] Full QA gate passed — see `docs/QA.md` §5.
- [ ] `manifest.json` `version` bumped to `X.Y.Z`.
- [ ] `src/config/brand.js` `version` matches `manifest.json` `version`.
- [ ] `package.json` `version` matches (if you maintain it there).
- [ ] `CHANGELOG.md` has a new `[X.Y.Z] — YYYY-MM-DD` section with Added /
       Changed / Fixed entries as appropriate. The `[Unreleased]` section is
       empty or moved below the new release.

## 2. Release artifacts

- [ ] `npm run build` succeeds; `dist/` produced.
- [ ] `npm run package` succeeds; produced:
  - [ ] `release/leaddock-extension-vX.Y.Z.zip`
  - [ ] `release/leaddock-source-vX.Y.Z.zip`
- [ ] Extension ZIP excludes `node_modules/`, `tests/`, `.git/`, `fixtures/`,
       `release/`, `dist/`, editor files, OS files.
- [ ] Source ZIP includes the full repo (without `node_modules/`, `.git/`,
       OS files).
- [ ] Smoke-tested the extension ZIP in a clean Chrome profile: loaded
       unpacked, opened WhatsApp Web, exercised a representative flow.

## 3. Documentation

- [ ] `README.md` — version number current; features list accurate; status
       reflects stable.
- [ ] `LICENSE.md` — version/date current; tier table accurate.
- [ ] `PRIVACY.md` — version/date current; permissions table accurate; data
       flow accurate.
- [ ] `SECURITY.md` — version/date current; supported version matches
       `manifest.json`.
- [ ] `CHANGELOG.md` — release entry added.
- [ ] `CONTRIBUTING.md` — project structure map current.
- [ ] `docs/ARCHITECTURE.md` — component map current; adapter interface list
       matches source.
- [ ] `docs/INSTALLATION.md` — install steps current; permissions accurate.
- [ ] `docs/CUSTOMIZATION.md` — brand field table matches `brand.js`.
- [ ] `docs/PUBLISHING.md` — listing copy and permissions justification
       current.
- [ ] `docs/TROUBLESHOOTING.md` — diagnostics paths current.
- [ ] `docs/QA.md` — matrix and gate checklist current.
- [ ] `docs/SELLING.md` — tier table matches `LICENSE.md`; demo script
       matches current UI.
- [ ] `docs/LICENSES.md` — tier descriptions match `LICENSE.md`.
- [ ] `docs/ROADMAP.md` — V2 ideas reflect current thinking; shipped items
       moved to `CHANGELOG.md`.
- [ ] `docs/PRODUCT-LISTING.md` — copy reflects current features and tiers.
- [ ] `docs/LAUNCH-CHECKLIST.md` — this file current.

## 4. Independence notice verification

Independence notice present and accurate in:

- [ ] `README.md`
- [ ] `LICENSE.md`
- [ ] `PRIVACY.md`
- [ ] `SECURITY.md`
- [ ] `CHANGELOG.md` (in the release entry)
- [ ] `CONTRIBUTING.md`
- [ ] `docs/ARCHITECTURE.md`
- [ ] `docs/INSTALLATION.md`
- [ ] `docs/CUSTOMIZATION.md`
- [ ] `docs/PUBLISHING.md`
- [ ] `docs/TROUBLESHOOTING.md`
- [ ] `docs/QA.md`
- [ ] `docs/SELLING.md`
- [ ] `docs/LICENSES.md`
- [ ] `docs/ROADMAP.md`
- [ ] `docs/PRODUCT-LISTING.md`
- [ ] `docs/LAUNCH-CHECKLIST.md` (this file)
- [ ] In-product: popup footer (or about page).
- [ ] In-product: options page footer.
- [ ] Store listing long description (Chrome Web Store / marketplace).

## 5. Screenshots

- [ ] 5 screenshots captured at 1280×800 (or 640×400).
- [ ] All screenshots use the demo dataset — no real customer data.
- [ ] Scene coverage: CRM panel docked, popup dashboard, command palette,
       pipeline view, quick-reply launcher.
- [ ] No screenshots imply WhatsApp / Meta affiliation.

## 6. Demo video

- [ ] Demo video recorded using the demo dataset only.
- [ ] Runtime 60–90 seconds.
- [ ] Captions added for accessibility.
- [ ] Independence notice in the closing card.
- [ ] Video hosted at a public URL (YouTube unlisted, Loom, or your own host).

## 7. Store copy

- [ ] Long description matches `docs/PUBLISHING.md` §5 (or `docs/PRODUCT-LISTING.md`).
- [ ] Short summary (132 characters max) accurate.
- [ ] Category set to Productivity.
- [ ] Privacy policy URL publicly reachable (mirrors `PRIVACY.md`).
- [ ] Permissions justification text prepared (`docs/PUBLISHING.md` §7).
- [ ] Single-purpose statement prepared (`docs/PUBLISHING.md` §8).

## 8. Support

- [ ] `src/config/brand.js` `supportEmail` is monitored.
- [ ] Security reporting email (or alias) monitored.
- [ ] GitHub Issues collection enabled at
       <https://github.com/witejackel-eng/leaddock-whatsapp-crm/issues>.
- [ ] Issue templates (bug report, feature request) present.
- [ ] Refund / support policy written on the product page
       (`docs/SELLING.md` §6).

## 9. Version tag and GitHub release

- [ ] `git tag -a vX.Y.Z -m "LeadDock vX.Y.Z"`
- [ ] `git push origin main && git push origin vX.Y.Z`
- [ ] GitHub Release created from the tag.
- [ ] Release notes = the `CHANGELOG.md` entry for the version.
- [ ] Both ZIPs attached to the GitHub Release:
  - `release/leaddock-extension-vX.Y.Z.zip`
  - `release/leaddock-source-vX.Y.Z.zip`

## 10. Chrome Web Store submission (if applicable)

- [ ] `release/leaddock-extension-vX.Y.Z.zip` uploaded to the existing listing
       as a new package.
- [ ] Version bumped (Chrome Web Store rejects downgrades).
- [ ] Submit for review.
- [ ] Review tracked to completion; reviewer feedback addressed if any.

## 11. Social announcement

- [ ] Announcement drafted (headline, subheadline, link to GitHub release, link
       to storefront, independence notice).
- [ ] Posted to the chosen channels (Twitter/X, LinkedIn, Hacker News, product
       hunt, etc., as appropriate).
- [ ] Announcement does **not** claim WhatsApp / Meta affiliation.
- [ ] Announcement does **not** promise V2 features as shipped.

## 12. Post-launch monitoring

- [ ] First 48 hours: monitor GitHub Issues and support email for install
       problems.
- [ ] First 7 days: collect feedback; tag candidate V1 patch items vs V2
       ideas.
- [ ] Triage Chrome Web Store reviews (when published) and respond
       professionally.
- [ ] Update `docs/TROUBLESHOOTING.md` with any new recurring issue.

## 13. Final sign-off

- [ ] Every box above ticked.
- [ ] Independence notice verified in all required surfaces (§4).
- [ ] No claim of WhatsApp / Meta affiliation anywhere.
- [ ] No auto-send, bulk-send, or scraping features added.
- [ ] Version tag pushed; GitHub release live; (optional) Chrome Web Store
       submission in review.

Release is ready.
