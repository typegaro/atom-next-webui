import { build } from "esbuild";
import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname);

// 1. Build Next.js static export
console.log("[build] Building Next.js client...");
execSync("npx next build", { cwd: root, stdio: "inherit" });

// The static export goes to out/ — we leave it there for the server to serve

// 2. Bundle plugin server code
console.log("[build] Bundling plugin...");
await build({
  entryPoints: ["index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  sourcemap: false,
  external: ["@typegaro/atom-plugin"],
  loader: {
    ".html": "text",
  },
});

console.log("[build] Done.");
