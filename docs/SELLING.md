# Selling LeadDock

This document is the seller's playbook for LeadDock: how to position it, what
each of the two license tiers means, how to structure the product page, the
demo video script, the delivery contents, support and refund guidance, buyer
onboarding, and pricing rationale.

> **Independence notice.** LeadDock is an independent productivity extension
> for WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or
> Meta. Every sales surface (product page, listing, demo video, delivery
> email, receipt) must preserve this notice. **Do not use deceptive claims** —
> no "WhatsApp-approved," no "ban-proof," no "auto-send," no "scrape
> anything."

---

## 1. Positioning

LeadDock's positioning, verbatim:

> Turn WhatsApp Web into a lightweight sales CRM.
>
> Organize leads, add notes, manage follow-ups, and insert reusable replies
> without leaving WhatsApp Web.

Pitch the buyer on what LeadDock replaces: the spreadsheet / notepad / sticky
note combo that small sales teams use to manage WhatsApp leads. Emphasize:

- **Local-first.** No backend, no SaaS subscription, no monthly seat fees, no
  data leaving the browser.
- **Lightweight.** Not a Salesforce replacement. A focused sales layer on top
  of WhatsApp Web.
- **White-label source.** Buyers receive the full source and can rebrand it
  under their own name (per their license tier).

Avoid:

- Comparisons that imply WhatsApp integration partnerships.
- Promises of CRM-level metrics (revenue forecasts, opportunity scoring) that
  LeadDock does not provide in v1.
- Any claim about future roadmap features as if they ship today.

## 2. The two tiers

| Tier       | Price | Best for                             | What you can do                                                                        |
| ---------- | ----- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| Commercial | $59   | One organization using it internally | Modify the source, ship one branded end product inside your org. No reselling the kit. |
| Agency     | $99   | Agencies delivering client work      | Deliver up to 5 branded end products to clients. Clients get the binary, not the source. |

Neither tier grants source-resale rights — LeadDock may be rebranded per the
tier, but it may not become someone else's developer kit.

See `docs/LICENSES.md` for the plain-language summary and `LICENSE.md` for
the full license template.

## 3. Product page structure

A high-converting product page for LeadDock uses this skeleton:

1. **Hero** — headline + subheadline + primary CTA.
   - Headline: "Turn WhatsApp Web into a lightweight sales CRM."
   - Subheadline: "Organize leads, add notes, manage follow-ups, and insert
     reusable replies without leaving WhatsApp Web."
   - Primary CTA: "Get LeadDock."
2. **Independence notice** — small, prominent callout under the hero.
3. **Core benefits** — 6–8 bullet points (track leads, attach notes, reusable
   replies, slash shortcuts, follow-ups without auto-send, search, export /
   backup, white-label source).
4. **Demo video / mockup** — embedded video or a CSS mockup of WhatsApp Web
   with the CRM panel docked.
5. **Feature grid** — 12 cards (statuses, tags, notes, quick replies, slash
   shortcuts, follow-ups, command palette, CSV import/export, JSON backup,
   pipeline, privacy mode, white-label).
6. **How it works** — 4 numbered steps (install, open WhatsApp Web, set
   status/notes/follow-ups, insert replies manually).
7. **Pricing** — 2 tiers with bullets per tier. Mark Commercial as "Most
   Popular."
8. **FAQ** — 6–8 short Q&As (local-first, no auto-send, permissions, privacy,
   license tiers, upgrade path).
9. **Final CTA** — repeat the primary CTA with a download / GitHub link.
10. **Footer** — links (Privacy, Support, GitHub), copyright, independence
    notice.

See `docs/PRODUCT-LISTING.md` for ready-to-paste copy.

## 4. Demo video sequence (script)

Target runtime: 60–90 seconds. Use the demo dataset throughout — never real
customer data.

| #   | Action                                                                                                | Voiceover / caption                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Open Chrome. Show `chrome://extensions`. Toggle Developer mode. Click **Load unpacked**.              | "LeadDock installs as a Manifest V3 Chrome extension. Load it unpacked or from the Chrome Web Store."       |
| 2   | Open `https://web.whatsapp.com`. A 1:1 chat opens.                                                   | "Open WhatsApp Web. LeadDock detects the chat you're on."                                                   |
| 3   | Show the CRM panel sliding in beside the chat.                                                        | "The CRM panel appears beside your conversation."                                                          |
| 4   | Click the status dropdown, change to "Interested."                                                   | "Set a lead status. New Lead, Contacted, Interested, Follow Up, Qualified, Won, Lost — all editable."    |
| 5   | Add a tag "Hot" and a note "Wants pricing for 50 units."                                              | "Add tags and notes. They attach to the contact, not the chat."                                           |
| 6   | Set a follow-up to "In 3 Days." Show the dashboard popup with the follow-up listed.                  | "Set follow-ups. They appear in your dashboard. LeadDock never auto-sends anything."                         |
| 7   | Type `/price` in the composer. The reply picker opens. Press Enter.                                  | "Type a slash shortcut to insert a saved reply."                                                          |
| 8   | Show the inserted text with `{{name}}` substituted. Highlight that the user still presses send.      | "Template variables fill in automatically. You always press send."                                       |
| 9   | Press `Ctrl/Cmd+K`. Show the command palette. Run "Search contacts."                                  | "Open the command palette with Ctrl or Cmd+K."                                                            |
| 10  | Open the popup dashboard. Show total leads, status counts, today's follow-ups.                       | "A focused dashboard. Total leads, status counts, today's follow-ups."                                    |
| 11  | Export CSV. Export JSON backup.                                                                       | "Export to CSV. Back up to JSON. Your data stays local."                                                  |
| 12  | End card: headline, "Get LeadDock," independence notice.                                                | "LeadDock — Turn WhatsApp Web into a lightweight sales CRM. Independent. Not affiliated with WhatsApp or Meta." |

Keep the screen capture 1280×800 or higher. Render at 30 fps minimum. Add
captions for accessibility.

## 5. Delivery contents

When a buyer purchases any tier, deliver:

| Item                                                          | Commercial | Agency |
| ------------------------------------------------------------ | ---------- | ------ |
| `leaddock-extension-vX.Y.Z.zip` (built, installable)           | Yes        | Yes    |
| `leaddock-commercial-kit-vX.Y.Z.zip` (full source kit)         | Yes        | Yes    |
| `README.md`                                                   | Yes        | Yes    |
| `LICENSE.md` (their tier highlighted)                          | Yes        | Yes    |
| `PRIVACY.md`                                                  | Yes        | Yes    |
| `SECURITY.md`                                                 | Yes        | Yes    |
| `CHANGELOG.md`                                                | Yes        | Yes    |
| `docs/` (full documentation set)                              | Yes        | Yes    |
| Screenshots (5, 1280×800)                                     | Yes        | Yes    |
| Demo video link                                               | Yes        | Yes    |
| Support email + how to file issues                            | Yes        | Yes    |

Both tiers receive the source. The difference is deployment rights:
Commercial ships one internal Branded End Product; Agency delivers up to five
client End Products as binaries only.

## 6. Support and refund guidance

### 6.1 Support

- **Channel:** email (see `brand.supportEmail`) or GitHub issues on the
  private buyer-only repo mirror.
- **Response SLA:** 2 business days for tier-appropriate issues.
- **Scope:** install help, bug reports, migration questions, brand/customization
  questions (Commercial and above).
- **Out of scope:** WhatsApp Web bugs, Meta account issues, custom feature
  development without a separate statement of work.

### 6.2 Refunds

Recommended refund policy (state it on the product page):

- Commercial / Agency: refund within 7 days if the source has not been
  downloaded / unzipped. Once the source is downloaded, refunds are at the
  seller's discretion because the asset cannot be "returned."

This policy is a starting point — adapt to your jurisdiction and payment
processor rules. State the policy clearly on the product page before
purchase.

## 7. Buyer onboarding

A smooth onboarding flow reduces refund requests and bad reviews.

1. **Purchase confirmation email** with download links, the license tier,
   and the support email.
2. **Install** — point them to `docs/INSTALLATION.md` for the load-unpacked
    steps.
3. **Load demo data** — Options → Load demo data. This gives the buyer a
   populated CRM to explore in 30 seconds.
4. **Reset demo** — Options → Reset all CRM data, or `npm run demo:reset`
   for source buyers.
5. **Customize brand** — point them to
   `docs/CUSTOMIZATION.md`. They edit `src/config/brand.js`, replace the
   icons, edit the fixture defaults.
6. **Publish** (Agency, for client deployments) — point them to
   `docs/PUBLISHING.md` for the Chrome Web Store submission flow.

## 8. Pricing rationale

- **Commercial $59** — the hero offer. The buyer gets the source and the
  right to ship one branded internal product. Justified by the value of
  rebranding plus source access; undercuts a single month of most team CRMs
  as a one-time payment.
- **Agency $99** — roughly 1.7× Commercial. Five client End Products at ~$20
  per client end-product is an attractive effective price for a small agency.
  Exists to raise average order value and to make the offer obvious for
  client-serving buyers.

The tier structure intentionally makes Commercial the "default" choice for
most buyers — it is the tier that delivers the most value for the lowest
friction. Marking it "Most Popular" on the pricing page aligns the
visual hierarchy with that intent.

## 9. What you must NOT do

To protect the product, the Chrome Web Store listing, and the buyer:

- Do **not** claim LeadDock is affiliated with or endorsed by WhatsApp or Meta.
- Do **not** claim LeadDock is "WhatsApp-approved," "ban-proof," or "policy
  certified."
- Do **not** sell features that do not exist in v1 (e.g., "AI lead scoring,"
  "automated campaigns," "cloud sync"). See `docs/ROADMAP.md` for V2 ideas
  that are explicitly **not** committed.
- Do **not** advertise auto-send, bulk-send, or scheduled-send. LeadDock
  inserts text into the composer; the user always presses send.
- Do **not** imply that buying the source grants rights beyond the tier
  purchased. The license is tier-scoped (see `LICENSE.md`).
- Do **not** use real customer data in screenshots, videos, or marketing.
  Use the demo dataset exclusively.

## 10. Independence notice (for reuse)

Include this notice, verbatim, on every public-facing sales surface:

> LeadDock is an independent productivity extension for WhatsApp Web. It is not
> affiliated with or endorsed by WhatsApp or Meta. "WhatsApp" and "WhatsApp
> Web" are used descriptively to identify the application the extension
> interoperates with.

If you rebrand, the notice must still appear. Replace "LeadDock" with your
brand name, but keep the substance of the claim.
