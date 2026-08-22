/**
 * LeadDock brand / white-label configuration.
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
  name: "LeadDock",
  /** Short label used where horizontal space is limited (badges, compact headers). */
  shortName: "LD",
  /** One-line positioning statement. */
  tagline: "The lightweight CRM for WhatsApp Web",
  /** Longer hero line for marketing surfaces (popup header, landing). */
  hero: "Turn WhatsApp Web into your sales workspace.",
  /** Accent / primary color used across UI chrome. Any valid CSS color. */
  primaryColor: "#0F766E",
  /** Accent color for dark surfaces. */
  primaryColorDark: "#14B8A6",
  /** Public marketing website. */
  website: "https://leaddock.vercel.app",
  /** Support contact shown in options + popup. */
  supportEmail: "witejackel@gmail.com",
  /** docs/help deep link. */
  helpUrl: "https://leaddock.vercel.app/docs",
  /** Privacy policy deep link. */
  privacyUrl: "https://leaddock.vercel.app/privacy",
  /** Relative path (from extension root) to the logo used in chrome. */
  logoPath: "assets/icons/icon-128.png",
  /** Version label mirrored from manifest. */
  version: "1.0.0",
  /** CRITICAL independence notice — never remove. */
  independenceNotice:
    "LeadDock is an independent productivity extension. It is not affiliated with or endorsed by WhatsApp or Meta.",
};

// Backward-compatible global (for any non-module consumers).
if (typeof globalThis !== "undefined") {
  globalThis.LEADDOCK_BRAND = brand;
}

export default brand;
