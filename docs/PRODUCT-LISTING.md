# LeadDock Product Listing

Ready-to-paste product page copy for the LeadDock storefront. Use this for the
Chrome Web Store long description, the marketing landing page hero section,
and any marketplace listing (Gumroad, Lemon Squeezy, etc.).

> **Independence notice.** LeadDock is an independent productivity extension
> for WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or
> Meta. The independence notice below must appear on every public-facing
> surface where this copy is used.

---

## Headline

Turn WhatsApp Web into a lightweight sales CRM.

## Subheadline

Organize leads, add notes, manage follow-ups, and insert reusable replies
without leaving WhatsApp Web.

## Core benefits

- Track every enquiry with clear lead statuses.
- Keep notes attached to the customer.
- Insert reusable replies in seconds.
- Use `/shortcuts` for power-user workflows.
- Set follow-ups without sending anything automatically.
- Search contacts and CRM data quickly.
- Export and back up your local CRM data.
- White-label the source for commercial projects.

## Feature bullets

- Lead statuses — New Lead, Contacted, Interested, Follow Up, Qualified, Won,
  Lost. Fully editable.
- Tags — color-coded, fully editable, multi-tag per contact.
- Contact notes — add, edit, delete; newest-first; timestamped.
- Quick replies — save reusable messages, insert in one click.
- Slash shortcuts — type `/price`, `/hi`, `/followup` in the composer.
- Template variables — `{{name}}`, `{{phone}}`, `{{company}}`, `{{product}}`.
- Follow-up tracking — presets and custom dates; reminders, never auto-sends.
- Search — by name, phone, company, notes, tags; filter by status, tag, due.
- CSV import / export — bring in or take out your contact list.
- Local-first storage — your CRM data stays in your browser, no backend.
- White-label source code — full source under a commercial license.

## Local-first by design

Your CRM data lives in `chrome.storage.local` on your own machine. There is no
backend. No analytics. No telemetry by default. Nothing leaves your browser.

## You always send

LeadDock inserts text into the composer. It never auto-sends. There is no bulk
messaging, no campaign automation, no message-history scraping.

## Pricing

| Tier       | Price | Best for                             |
| ---------- | ----- | ------------------------------------ |
| Commercial | $59   | One organization using it internally |
| Agency     | $99   | Agencies delivering client work      |

See `docs/LICENSES.md` for the plain-language license guide and `LICENSE.md`
for the full license template.

## FAQ (short)

**Is LeadDock affiliated with WhatsApp or Meta?**
No. LeadDock is an independent productivity extension. It is not affiliated
with or endorsed by WhatsApp or Meta.

**Does LeadDock auto-send messages?**
No. LeadDock inserts text into the WhatsApp composer. You always press send.

**Does LeadDock read my messages?**
No. LeadDock reads only the current chat header (to identify the contact) and
the composer element (to insert text). It does not read message content or
scrape message history.

**Where is my CRM data stored?**
Locally, in your browser, via `chrome.storage.local`. Nothing is transmitted.

**What permissions does LeadDock request?**
Only `storage` and `host_permissions: https://web.whatsapp.com/*`. No
`<all_urls>`, no `tabs`, no `cookies`.

**Can I rebrand LeadDock?**
Yes, under both the Commercial and Agency tiers. Edit
`src/config/brand.js`, replace the icons, and rebuild.

**Can I resell LeadDock?**
No tier grants source-resale rights. See `docs/LICENSES.md`.

**Is there a backend / cloud sync?**
Not in v1.0.0. Cloud sync is on the V2 exploration list — see `docs/ROADMAP.md`.

## Independence notice

LeadDock is an independent productivity extension for WhatsApp Web. It is not
affiliated with or endorsed by WhatsApp or Meta. "WhatsApp" and "WhatsApp
Web" are used descriptively to identify the application the extension
interoperates with.

## Call to action

Get LeadDock.

- Download / install: see `docs/INSTALLATION.md`.
- Source code and releases: <https://github.com/witejackel-eng/leaddock-whatsapp-crm>
- License tiers: see `docs/LICENSES.md`.
- Privacy: see `PRIVACY.md`.

## Footer copy

LeadDock is an independent productivity extension for WhatsApp Web. Not
affiliated with or endorsed by WhatsApp or Meta. All CRM data is stored
locally in your browser. No backend. No telemetry by default.

---

## Storefront image / screenshot guidance

When you capture images for the storefront:

1. Use the demo dataset (`Options → Load demo data`). Never real customer
   data.
2. Resolution: 1280×800 (preferred) or 640×400.
3. Capture these five scenes:
   - WhatsApp Web with the CRM panel docked beside a chat.
   - The popup dashboard (total leads, status counts, today's follow-ups).
   - The command palette (`Ctrl/Cmd+K`) open.
   - The pipeline view with Kanban columns.
   - The quick-reply launcher near the composer with `/price` typed.
4. Keep the WhatsApp Web UI in its default state — do not visually modify it
   in a way that implies a partnership.
