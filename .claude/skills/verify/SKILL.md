---
name: verify
description: How to run and verify the apps in this repo (static HTML/PWA pages, no build step).
---

# Verifying apps in this repo

Everything here is static HTML — no build, no install.

## Serve

```bash
cd <app-folder>            # e.g. gigtax/ or "sprkwash-final 2"/
python3 -m http.server 8123
```

## Drive (headless Chromium + global Playwright)

Playwright 1.56.1 is installed globally; require it with
`NODE_PATH=/opt/node22/lib/node_modules`. The browser binary is the
symlink `/opt/pw-browsers/chromium` (pass as `executablePath` —
do NOT append `/chrome-linux/chrome`, the symlink already points at
the binary).

```bash
NODE_PATH=/opt/node22/lib/node_modules node drive.js
```

```js
const { chromium } = require('playwright');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
```

## Gotchas

- Google Fonts requests fail in the sandbox (`ERR_CONNECTION_RESET` console
  errors) — fonts fall back to system-ui. Environment, not an app bug.
- gigtax state persists in `localStorage` key `gigtax_v1`; clear it (or use a
  fresh browser context) to re-test onboarding.
- Settings inputs commit on `change`, not `input` — fire a change event after
  `fill()` when driving programmatically.
