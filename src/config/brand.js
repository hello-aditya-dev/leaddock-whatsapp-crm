/**
 * WaFlow brand / white-label configuration.
 *
 * This is the SINGLE place to rebrand the extension. Buyers rebranding the
 * commercial kit should edit values here and drop a replacement logo at
 * `assets/logo.svg` (and the icon PNGs). No other source file hard-codes the
 * product name or links.
 *
 * Every field is documented inline.
 */

export const brand = {
  /** Display name of the product. Shown in panel header, popup, options, docs. */
  name: "WaFlow",
  /** Short label used where horizontal space is limited (badges, compact headers). */
  shortName: "WF",
  /** One-line positioning statement. */
  tagline: "The lightweight CRM for WhatsApp Web",
  /** Longer hero line for marketing surfaces (popup header, landing). */
  hero: "Turn WhatsApp Web into a lightweight sales CRM.",
  /** Accent / primary color used across UI chrome. Any valid CSS color. */
  primaryColor: "#0F766E",
  /** Accent color for dark surfaces. */
  primaryColorDark: "#14B8A6",
  /** Public marketing website. */
  website: "https://github.com/witejackel-eng/waflow-whatsapp-crm",
  /** Support contact shown in options + popup. */
  supportEmail: "support@example.com",
  /** docs/help deep link. */
  helpUrl: "https://github.com/witejackel-eng/waflow-whatsapp-crm/blob/main/docs/INSTALLATION.md",
  /** Privacy policy deep link. */
  privacyUrl: "https://github.com/witejackel-eng/waflow-whatsapp-crm/blob/main/PRIVACY.md",
  /** Relative path (from extension root) to the logo used in chrome. */
  logoPath: "assets/icons/icon-128.png",
  /** Version label mirrored from manifest. */
  version: "1.0.0",
  /** CRITICAL independence notice — never remove. */
  independenceNotice:
    "WaFlow is an independent productivity extension. It is not affiliated with or endorsed by WhatsApp or Meta.",
};

// Backward-compatible global (for any non-module consumers).
if (typeof globalThis !== "undefined") {
  globalThis.WAFLOW_BRAND = brand;
}

export default brand;
