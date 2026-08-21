# LeadDock License Tiers (Plain-Language Guide)

This is a companion to `LICENSE.md`. It explains, in plain language, what each
of the four license tiers permits and forbids, how to choose, how to upgrade,
and answers common questions.

> **This is a summary, not legal advice.** The authoritative text is
> `LICENSE.md`. Where this guide and `LICENSE.md` disagree, `LICENSE.md`
> governs. **Review `LICENSE.md` with a lawyer** before relying on it for any
> commercial transaction.

> **Independence notice.** LeadDock is an independent productivity extension for
> WhatsApp Web. It is not affiliated with or endorsed by WhatsApp or Meta.

---

## 1. Tier summary

| Tier                | Price | One sentence                                                                                       |
| ------------------- | ----- | -------------------------------------------------------------------------------------------------- |
| Personal            | $29   | Use LeadDock for your own WhatsApp Web leads; do not resell, redistribute, or rebrand.               |
| Commercial          | $59   | Modify the source and ship one branded End Product inside your organization.                       |
| Agency              | $99   | Deliver up to 5 branded End Products to clients; clients get the binary, not the source.           |
| Extended Reseller   | $149  | Full white-label + resell rights. Resell the source or the binary under your brand, unlimited.     |

## 2. Personal — $29

### Permitted

- Install and use the built LeadDock extension on your own browser.
- Use all v1 features for personal WhatsApp Web lead management.
- Export JSON / CSV backups of your own CRM data.
- Move the install to a new computer (uninstall from the old one).

### Forbidden

- Any commercial use — including use by a sole trader for paying customers.
- Modifying, redistributing, or reselling the source or the binary.
- Rebranding the extension (changing `brand.name`, logo, colors, links to
  your own brand).
- Sharing the install with another person.

### Best for

Individuals who want a lightweight CRM on top of their own WhatsApp Web
conversations and do not need to rebrand or resell.

## 3. Commercial — $59

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

## 4. Agency — $99

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
solutions to a handful of clients.

## 5. Extended Reseller — $149

### Permitted

- White-label the Software end-to-end (name, logo, colors, links, copy).
- Resell the Binary to end users, in unlimited quantity.
- Resell the Source to other developers under the Licensee's own brand and
  pricing — provided the Licensee attaches a license at least as restrictive
  as the Commercial tier to downstream recipients.
- Modify, extend, or rebrand the Software without limit.

### Conditions

- Must not represent the Software as affiliated with or endorsed by WhatsApp
  or Meta.
- Must not use the "LeadDock" name or the Licensor's identity to imply
  endorsement of the Licensee's products.
- The Licensee is solely responsible for end-user support, refunds, and
  compliance for products it distributes.
- This License, the independence notice, and the privacy policy must travel
  with any redistribution of the Source.

### Best for

Resellers, SaaS businesses, and white-label agencies that want to distribute
LeadDock under their own brand as a product or developer kit.

## 6. How to choose

| If you want to…                                                            | Choose               |
| -------------------------------------------------------------------------- | -------------------- |
| Use LeadDock for your own leads, nothing more                                | Personal            |
| Rebrand LeadDock for your own company                                         | Commercial           |
| Deliver LeadDock (built) to a small number of clients                         | Agency               |
| Resell LeadDock under your own brand, as source or binary, without limit      | Extended Reseller    |
| Sell a SaaS product that wraps LeadDock's source                              | Extended Reseller    |

## 7. Upgrade path

You can upgrade at any time by paying the difference between your current tier
and the target tier. Contact the support email in `src/config/brand.js` with
your original order reference.

- Personal → Commercial: pay $30.
- Personal → Agency: pay $70.
- Personal → Extended Reseller: pay $120.
- Commercial → Agency: pay $40.
- Commercial → Extended Reseller: pay $90.
- Agency → Extended Reseller: pay $50.

Downgrades are not offered; the lower-tier license terms cannot retract
rights already granted for the period you held the higher tier.

## 8. FAQ

### Can I use LeadDock on more than one computer?

- **Personal:** Yes, for your own use. Uninstall from the old computer first.
- **Commercial:** Yes, within your organization, up to a reasonable seat count.
- **Agency:** You install it on the computers you control for client delivery.
  Each client End Product can be installed on the client's own machines.
- **Extended Reseller:** Your downstream license governs the end users.

### Can I show my clients the source code?

- **Personal / Commercial:** No — the source is for you, not for redistribution.
- **Agency:** No. Clients receive the Binary only. Showing or delivering the
  source requires an Extended Reseller license (or an additional Agency
  license per client).
- **Extended Reseller:** Yes, you may resell the source, subject to attaching
  a downstream license at least as restrictive as the Commercial tier.

### Can I modify the source?

- **Personal:** No.
- **Commercial / Agency / Extended Reseller:** Yes.

### Can I remove the independence notice?

No. The independence notice (stating LeadDock is not affiliated with WhatsApp or
Meta) must travel with the product, the source, and the documentation in all
tiers. Removing it is a license violation and a Chrome Web Store policy risk.

### Do I get future updates?

- Personal and Commercial buyers get the version they purchased.
- Agency and Extended Reseller buyers get minor updates within the same major
  version (e.g., 1.0.x → 1.0.y). Major version upgrades (1.x → 2.0) are
  offered at a discount to existing buyers.

### Can I get a refund?

See `docs/SELLING.md` §6.2 for the refund policy. The short version: refunds
are available within 7 days if the source has not been downloaded (for tiers
that ship source).

### Can I claim LeadDock is "WhatsApp-approved"?

No. LeadDock is not approved, certified, or endorsed by WhatsApp or Meta. Do
not make such claims in any sales surface, product listing, or
in-product copy.

### What if my use case is not covered here?

Email the support address in `src/config/brand.js`. We will help you pick the
right tier or arrange a custom license.

## 9. Get legal review

This guide and `LICENSE.md` are starting templates, not legal advice.
Before any commercial distribution, especially for the Agency and Extended
Reseller tiers, have a qualified lawyer in your jurisdiction review the
license and your intended use. Common adjustments:

- Specifying governing law and jurisdiction (placeholder in `LICENSE.md` §12).
- Adding data processing addenda if you operate under GDPR / CCPA / similar.
- Adjusting the limitation-of-liability cap to match your commercial
  insurance coverage.
- Adding specific clauses for SaaS distribution (Extended Reseller) if you
  plan to operate LeadDock as a hosted product rather than a downloaded one.
