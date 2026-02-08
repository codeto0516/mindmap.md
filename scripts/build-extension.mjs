import * as esbuild from "esbuild";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

await esbuild.build({
  entryPoints: [join(root, "src/extension/extension.ts")],
  bundle: true,
  outfile: join(root, "dist/extension.js"),
  format: "cjs",
  platform: "node",
  external: ["vscode"],
  sourcemap: true,
  minify: false,
});

console.log("Extension built: dist/extension.js");
