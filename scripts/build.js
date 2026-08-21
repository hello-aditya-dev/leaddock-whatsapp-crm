/**
 * scripts/build.js — bundle the extension into dist/ for "load unpacked".
 *
 * - Bundles src/content/main.js (ES modules) into dist/content/main.js (IIFE).
 *   The content script cannot use ES module imports directly in MV3, so we
 *   bundle. styles.css is inlined as a string via esbuild's "text" loader.
 * - Copies manifest.json, popup/, options/, assets/, fixtures/ into dist/.
 * - Rewrites manifest content_scripts + web_accessible_resources to point at
 *   the bundled files.
 */
import * as esbuild from "esbuild";
import { cp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

async function main() {
  console.log("[build] cleaning dist/");
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  console.log("[build] bundling content script...");
  await esbuild.build({
    entryPoints: [path.join(root, "src/content/main.js")],
    bundle: true,
    format: "iife",
    target: ["chrome110"],
    outfile: path.join(dist, "src/content/main.js"),
    loader: { ".css": "text" },
    logLevel: "info",
    legalComments: "none",
  });

  // Bundle popup + options as modules (MV3 allows module scripts in pages).
  // We keep them as ES modules but bundle for fewer requests + node_modules safety.
  for (const [name, entry] of [
    ["popup/popup.js", "src/popup/popup.js"],
    ["options/settings.js", "src/options/settings.js"],
  ]) {
    await esbuild.build({
      entryPoints: [path.join(root, entry)],
      bundle: true,
      format: "esm",
      target: ["chrome110"],
      outfile: path.join(dist, name),
      logLevel: "info",
      legalComments: "none",
    });
  }

  console.log("[build] copying static assets...");
  await cp(path.join(root, "manifest.json"), path.join(dist, "manifest.json"));
  await cp(path.join(root, "src/popup/index.html"), path.join(dist, "src/popup/index.html"), { recursive: false });
  await cp(path.join(root, "src/popup/popup.css"), path.join(dist, "src/popup/popup.css"), { recursive: false });
  await cp(path.join(root, "src/options/index.html"), path.join(dist, "src/options/index.html"), { recursive: false });
  await cp(path.join(root, "src/options/settings.css"), path.join(dist, "src/options/settings.css"), { recursive: false });
  if (existsSync(path.join(root, "assets"))) {
    await cp(path.join(root, "assets"), path.join(dist, "assets"), { recursive: true });
  }
  if (existsSync(path.join(root, "fixtures"))) {
    await cp(path.join(root, "fixtures"), path.join(dist, "fixtures"), { recursive: true });
  }
  // Service worker is a module; copy as-is (MV3 supports type:module SW).
  await cp(path.join(root, "src/background/service-worker.js"), path.join(dist, "src/background/service-worker.js"));

  console.log("[build] done → dist/");
}

main().catch((err) => {
  console.error("[build] FAILED:", err);
  process.exit(1);
});
