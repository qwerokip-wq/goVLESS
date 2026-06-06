# goVLESS Mini App — design canvas

This folder contains the **visual design canvas** for the Mini App's
v1.1 UI (all 40+ screens designed to brief v1.0, both L5 Pastel Mint
and D2 Midnight Slate themes, RU and EN strings).

It is NOT the production Mini App. The production Mini App lives in
`../dist/` and is a vanilla-JS application wired to the daemon's
JSON-RPC. This folder is a React-+-Babel-standalone canvas, mock data
only, intended for design review.

To browse: open `https://<your-mini-app-host>/design/` in any browser.
On a Lite install behind cloudflared this is `https://<tunnel>/design/`.

## What's here
- `index.html` — entry, mounts the canvas with 40+ artboards
- `theme-tokens.jsx` — shared L5/D2 token system, `getTokens(theme)`
- `motion.css` — motion system (durations, easings, keyframes)
- 14 screen files organized by feature (confirm, states, wizard,
  clients, system, extras, variants-light, variants-dark, ...)
- `design-canvas.jsx` — the Figma-ish canvas wrapper (pan/zoom)

## Next step (Batch 2)
Port each screen from this canvas into the production Mini App by
swapping the mock `CONTENT` for real RPC calls (`fetch('/api/rpc', ...)`).
See `ai-bridge/claude-codex/052-architect-design-canvas-delivered.md`.
