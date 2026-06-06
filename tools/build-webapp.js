#!/usr/bin/env node
/* goVLESS Mini App build: precompile each design/*.jsx + app.jsx to plain .js
 * (React.createElement, sourceType:"script") so the browser loads classic
 * scripts with NO runtime Babel — lets the CSP drop 'unsafe-eval'/'unsafe-inline'.
 * Semantics are identical to the previous <script type="text/babel"> setup:
 * each file stays its own classic script (own parse unit, shared global object).
 * Usage: NODE_PATH=<dir with @babel/standalone> node tools/build-webapp.js [distDir]
 */
const Babel = require("@babel/standalone");
const fs = require("fs"), path = require("path");
const DIST = process.argv[2] || path.join(__dirname, "..", "phase-a", "webapp", "dist");
// Order matters: tokens/content first (define window.CONTENT/getTokens), app last.
const FILES = [
  "design/theme-tokens", "design/content", "design/motion-system", "design/intro-crawl",
  "design/disclaimer", "design/partners", "design/variants-light", "design/variants-dark",
  "design/theme-picker", "design/confirm", "design/states", "design/wizard",
  "design/clients", "design/system", "design/extras", "app",
];
let n = 0;
for (const f of FILES) {
  const srcPath = path.join(DIST, f + ".jsx");
  const src = fs.readFileSync(srcPath, "utf8");
  const { code } = Babel.transform(src, { presets: ["react"], sourceType: "script", filename: f + ".jsx" });
  const out = "/* generated from " + f + ".jsx by tools/build-webapp.js — DO NOT EDIT (edit the .jsx) */\n" + code + "\n";
  fs.writeFileSync(path.join(DIST, f + ".js"), out);
  n++; console.log("built " + f + ".js (" + out.length + "b)");
}
console.log("OK: " + n + " files");
