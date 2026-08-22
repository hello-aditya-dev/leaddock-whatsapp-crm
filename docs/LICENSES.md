# LeadDock License Tiers (Plain-Language Guide)

This is a companion to `LICENSE.md`. It explains, in plain language, what each
of the two license tiers permits and forbids, how to choose, how to upgrade,
and answers common questions.

> **This is a summary, not legal advice.** The authoritative text is
> `LICENSE.md`. Where this guide and `LICENSE.md` disagree, `LICENSE.md`
> governs. **Review `LICENSE.md` with a lawyer** before relying on it for any
> commercial transaction.

> **Independence notice.** LeadDock is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.

---

## 1. Tier summary

| Tier       | Price | One sentence                                                                             |
| ---------- | ----- | ---------------------------------------------------------------------------------------- |
| Commercial | $59   | Modify the source and ship one branded End Product inside your organization.             |
| Agency     | $99   | Deliver up to 5 branded End Products to clients; clients get the binary, not the source. |

## 2. Commercial — $59

### Permitted

- Modify the source (edit `brand.js`, customize statuses / tags / replies,
  extend features).
- Ship **one (1) Branded End Product** for use within the Licensee's own
  organization.
- Distribute the Binary internally to the Licensee's own personnel.
- Install on multiple browsers within the Licensee's organization (up to a
  reasonable internal limit; recommended 25 seats).

### Forbidden

- Reselling, sublicensing, or redistributing the Source to third parties.
- Selling the Software or End Product as a product (paid download, SaaS, or
  installable product to non-Licensee customers).
- Removing or altering the License, the independence notice, or the privacy
  policy.
- Claiming WhatsApp / Meta affiliation.

### Best for

A single business that wants to use LeadDock internally, with its own brand on
the extension. The business does not resell LeadDock.

## 3. Agency — $99

### Permitted

- Modify the Source to produce Branded End Products.
- Deliver the Binary to **up to five (5) distinct client organizations**.
- Charge clients for the agency's services (configuration, branding, support,
  training).
- Bundle the Binary with the agency's installation / onboarding services.

### Forbidden

- Delivering or exposing the Source to clients. Clients receive the Binary
  only.
- Producing more than five Branded End Products under a single Agency license.
- Reselling the Source or the Software as a standalone product (e.g., as a
  competing developer kit).
- Claiming WhatsApp / Meta affiliation.

### Best for

Small agencies, freelancers, and consultants delivering WhatsApp Web CRM
solutions to clients.

## 4. How to choose

| If you want to…                                                  | Choose     |
| ---------------------------------------------------------------- | ---------- |
| Rebrand LeadDock for your own company, used internally           | Commercial |
| Deliver LeadDock (built) to client companies                     | Agency     |

Neither tier grants source-resale rights. LeadDock may be rebranded per your
tier; it may not be resold as someone else's developer kit. For custom or OEM
arrangements, contact the support address in `src/config/brand.js`.

## 5. Upgrade path

You can upgrade at any time by paying the difference between your current tier
and the target tier. Contact the support email in `src/config/brand.js` with
your original order reference.

- Commercial → Agency: pay $40.

Downgrades are not offered; the lower-tier license terms cannot retract
rights already granted for the period you held the higher tier.

## 6. FAQ

### Can I use LeadDock on more than one computer?

- **Commercial:** Yes, within your organization, up to a reasonable seat count.
- **Agency:** You install it on the computers you control for client delivery.
  Each client End Product can be installed on the client's own machines.

### Can I show my clients the source code?

No — in both tiers the source is for the Licensee, not for redistribution.
Agency clients receive the Binary only.

### Can I modify the source?

Yes, in both tiers. Modification is a core part of both offers.

### Can I resell the source?

No. No tier grants source-resale rights. For custom/OEM licensing, contact the
support address in `src/config/brand.js`.

### Can I remove the independence notice?

No. The independence notice (stating LeadDock is not affiliated with WhatsApp or
Meta) must travel with the product, the source, and the documentation in all
tiers. Removing it is a license violation and a Chrome Web Store policy risk.
(Rebranding the *product identity* — name, logo, colors — is expected and fine.)

### Do I get future updates?

- Both tiers include minor updates within the same major version
  (e.g., 1.0.x → 1.0.y). Major version upgrades (1.x → 2.0) are offered at a
  discount to existing buyers.

### Can I get a refund?

See `docs/SELLING.md` §6.2 for the refund policy. The short version: refunds
are available within 7 days if the source has not been downloaded.

### Can I claim LeadDock is "WhatsApp-approved"?

No. LeadDock is not approved, certified, or endorsed by WhatsApp or Meta. Do
not make such claims in any sales surface, product listing, or
in-product copy.

### What if my use case is not covered here?

Email the support address in `src/config/brand.js`. We will help you pick the
right tier or arrange a custom license.

## 7. Get legal review

This guide and `LICENSE.md` are starting templates, not legal advice.
Before any commercial distribution, have a qualified lawyer in your
jurisdiction review the license and your intended use. Common adjustments:

- Specifying governing law and jurisdiction (placeholder in `LICENSE.md` §12).
- Adding data processing addenda if you operate under GDPR / CCPA / similar.
- Adjusting the limitation-of-liability cap to match your commercial
  insurance coverage.
