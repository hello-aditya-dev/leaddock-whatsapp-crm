/**
 * scripts/release.js — one-command release: build + package.
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function run(cmd, args) {
  console.log(`[release] ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { cwd: root, stdio: "inherit" });
}

console.log("[release] step 1/2: build");
run("node", ["scripts/build.js"]);
console.log("[release] step 2/2: package");
run("node", ["scripts/package.js"]);
console.log("[release] complete.");
