# Storefront Setup Checklist

Everything needed to start selling LeadDock. Target: live in under a day.

> **Recommendation:** use a merchant-of-record platform (Lemon Squeezy or
> Polar). They act as reseller of record and handle global sales tax/VAT,
> which you would otherwise owe yourself. Gumroad works too but has weaker
> license/delivery tooling for kits.

---

## 1. Account & payouts (do this first — KYC takes days)

- [ ] Create account (Lemon Squeezy or Polar)
- [ ] Complete identity verification + bank details for payouts
- [ ] Business type: individual/sole trader is fine to start

## 2. Products (2 SKUs)

### SKU A — LeadDock Commercial — $59

- **Headline:** Turn WhatsApp Web into your sales workspace.
- **Copy:** paste from `docs/PRODUCT-LISTING.md`
- **Files attached:**
  - [ ] `release/leaddock-extension-v1.0.0.zip`
  - [ ] `release/leaddock-commercial-kit-v1.0.0.zip`
  - [ ] `release/checksums.txt`
- **Checkout description must include:**
  - License summary (one branded end product, internal use, no source resale)
  - Refund policy (14 days if source not downloaded)
  - Independence notice (not affiliated with WhatsApp/Meta)

### SKU B — LeadDock Agency — $99

- Same copy with Agency table row emphasized
- Same files (kit includes the binary build)
- License summary: up to 5 client deployments, binary-only delivery

## 3. Fulfillment email template

```
Subject: Your LeadDock license + download links

Thanks for buying LeadDock!

Download ({{tier}}):
  • Extension ZIP + commercial kit: {{download_links}}
  • SHA-256 checksums: {{checksums_link}}

Install in 2 minutes: https://leaddock.vercel.app/docs
License terms: https://leaddock.vercel.app/license

Questions? Reply to this email — witejackel@gmail.com

LeadDock is an independent productivity extension. Not affiliated with
or endorsed by WhatsApp or Meta.
```

## 4. Payment link wiring

- [ ] Site `/pricing` "Buy" buttons → storefront checkout URLs
      (replace the placeholder `href="#"` in `build.js`, run `node build.js`,
      push — site redeploys automatically)
- [ ] Test-purchase BOTH SKUs yourself; verify ZIP downloads open and match checksums
- [ ] Test refund flow once

## 5. Post-launch hygiene

- [ ] Weekly payout check first month
- [ ] Keep release ZIPs in sync: any product update → new upload on both SKUs → bump CHANGELOG
- [ ] Never put CRM-user data anywhere near analytics; store metrics are marketing-only
