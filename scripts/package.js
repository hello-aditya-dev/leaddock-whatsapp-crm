/**
 * scripts/package.js — produce release artifacts.
 *
 * Outputs:
 *   release/leaddock-extension-v{VERSION}.zip        — load-unpacked-ready build of dist/
 *   release/leaddock-commercial-kit-v{VERSION}.zip   — full source kit (no node_modules/dist/release/.git)
 *   release/checksums.txt                             — SHA-256 of both ZIPs
 *
 * Uses the system `zip` binary when available; falls back to a Node-only
 * store-mode zip writer otherwise.
 */
import { execFileSync, execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  copyFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const releaseDir = path.join(root, "release");

function readVersion() {
  const manifest = JSON.parse(readFileSync(path.join(root, "manifest.json"), "utf8"));
  return manifest.version || "0.0.0";
}

function hasZip() {
  if (process.platform === "win32") return false; // use PowerShell fallback below
  try {
    execFileSync("which", ["zip"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function zipDirPowerShell(dir, outFile, opts = {}) {
  // Compress-Archive has no include/exclude globs, so stage the file set
  // into a temp dir first, then zip it.
  const tmp = path.join(releaseDir, `.staging-${path.basename(outFile)}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const excludes = (opts.excludes || []).map((e) => e.replace(/\*\*?$/, "").replace(/\/$/, ""));
  const copyRecursive = (srcRel) => {
    for (const entry of readdirSync(path.join(dir, srcRel), { withFileTypes: true })) {
      const rel = path.join(srcRel, entry.name);
      if (excludes.some((ex) => rel === ex || rel.startsWith(ex + path.sep))) continue;
      const dest = path.join(tmp, rel);
      if (entry.isDirectory()) {
        mkdirSync(dest, { recursive: true });
        copyRecursive(rel);
      } else {
        mkdirSync(path.dirname(dest), { recursive: true });
        copyFileSync(path.join(dir, rel), dest);
      }
    }
  };
  copyRecursive(".");
  execSync(
    `Compress-Archive -Path (Join-Path '${tmp.replace(/'/g, "''")}' *) -DestinationPath '${outFile.replace(/'/g, "''")}' -Force`,
    { shell: "powershell.exe", stdio: "inherit" },
  );
  rmSync(tmp, { recursive: true, force: true });
}

function zipDir(dir, outFile, opts = {}) {
  if (hasZip()) {
    // -r recurse, -q quiet, -X no extra file attrs, exclude patterns.
    const args = ["-r", "-q", "-X", outFile, "."];
    if (opts.excludes) {
      for (const ex of opts.excludes) args.push("-x", ex);
    }
    execFileSync("zip", args, { cwd: dir, stdio: "inherit" });
    return;
  }
  zipDirPowerShell(dir, outFile, opts);
}

function main() {
  const version = readVersion();
  console.log(`[package] version ${version}`);
  if (!existsSync(path.join(root, "dist"))) {
    console.error("[package] dist/ missing — run `node scripts/build.js` first.");
    process.exit(1);
  }
  rmSync(releaseDir, { recursive: true, force: true });
  mkdirSync(releaseDir, { recursive: true });

  const extZip = path.join(releaseDir, `leaddock-extension-v${version}.zip`);
  console.log(`[package] writing ${extZip}`);
  zipDir(path.join(root, "dist"), extZip);

  const kitZip = path.join(releaseDir, `leaddock-commercial-kit-v${version}.zip`);
  console.log(`[package] writing ${kitZip}`);
  zipDir(root, kitZip, {
    excludes: [
      "node_modules/*",
      "node_modules/**",
      "dist/*",
      "dist/**",
      "release/*",
      "release/**",
      ".git/*",
      ".git/**",
    ],
  });

  // checksums.txt — SHA-256 of each artifact, for distribution integrity.
  const checksums = [];
  for (const fp of [extZip, kitZip]) {
    const data = readFileSync(fp);
    const hash = createHash("sha256").update(data).digest("hex");
    checksums.push(`${hash}  ${path.basename(fp)}`);
  }
  const checksumsFile = path.join(releaseDir, "checksums.txt");
  writeFileSync(checksumsFile, checksums.join("\n") + "\n");

  console.log("[package] done.");
  console.log("  " + extZip);
  console.log("  " + kitZip);
  console.log("  " + checksumsFile);
}

main();
