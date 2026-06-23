// Bundles the .tsx test with esbuild (so it can import the app's TS/TSX source
// and run under Node + jsdom), then executes it. Invoked by `npm test`.
import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "node_modules", ".cache");
const outFile = path.join(outDir, "uwcf-tests.mjs");

mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [path.join(root, "test", "map-sync.test.tsx")],
  bundle: true,
  format: "esm",
  platform: "node",
  jsx: "automatic",
  packages: "external",
  outfile: outFile,
  logLevel: "error",
});

await import(outFile);
