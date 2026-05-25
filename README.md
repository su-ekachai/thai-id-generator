# Thai National ID Generator

[![CI](https://github.com/su-ekachai/thai-id-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/su-ekachai/thai-id-generator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-installable%20%2B%20offline-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

> Educational single-page web app that demonstrates the Thai national ID 13-digit checksum algorithm.

> [!WARNING]
> **Educational use only.** The numbers produced by this tool satisfy the official Thai national ID checksum so the algorithm can be inspected and tested. They are not real identities. The numbers must not be used to impersonate any person, complete real forms, commit fraud, or otherwise affect the integrity of another person's identity.

## Demo

`https://su-ekachai.github.io/thai-id-generator/`

## Features

- Generates a 13-digit number that satisfies the official Department of Provincial Administration check-digit formula.
- Renders a step-by-step view of the checksum math (weights, products, sum, modulo).
- Renders a colour-coded breakdown of what each position in the ID represents, including the eight person-type codes for position 1.
- Installable Progressive Web App with offline support via a Workbox-managed service worker.
- Self-hosted Noto Sans Thai and JetBrains Mono fonts — no third-party network requests at runtime.
- Strict Content-Security-Policy, cryptographically random ID generation, no analytics, no tracking.

## Tech stack

| Component | Version | Role |
| --- | --- | --- |
| `Bun` | `>= 1.1.0` | Package manager and script runner |
| `Vite` | `^8.0.0` | Bundler and dev server (Rolldown-powered as of v8) |
| `TypeScript` | `^6.0.0` | Strict type checking |
| `Tailwind CSS` | `^4.0.0` | Design tokens and utilities via `@tailwindcss/vite` |
| `vite-plugin-pwa` | `^1.3.0` | Service worker and web manifest via Workbox |
| `Vitest` | `^4.1.7` | Test runner |
| `happy-dom` | `^20.9.0` | Headless DOM environment for tests |
| `tslog` | `^4.10.2` | Structured logger |

## Architecture

All source modules sit directly under `src/`. There are no sub-folders. Each module is named for what it does:

- `src/generator.ts` — the 13-digit algorithm. No DOM, no `localStorage`.
- `src/dom.ts` — safe DOM construction helpers used by every renderer.
- `src/algorithm-view.ts`, `src/digits-view.ts`, `src/update-banner.ts` — DOM renderers; each exports a `render*` / `clear*` pair.
- `src/i18n.ts`, `src/theme.ts`, `src/logger.ts`, `src/sw-register.ts` — browser-platform integrations (string table, theme persistence, structured logging, service-worker registration).
- `src/main.ts` — composition root. Wires the algorithm, the renderers, and the platform modules to the DOM declared in `index.html`.

See `CLAUDE.md` for the full conventions enforced in code review.

## Project structure

```text
thai-id-generator/
├── .github/workflows/ci.yml         CI: audit, typecheck, test, build, deploy
├── public/
│   ├── fonts/                       Self-hosted woff2 subsets
│   ├── icons/                       PWA icons + favicon (generated)
│   ├── theme-init.js                Theme-flash prevention (loaded before bundle)
│   └── .nojekyll                    Disable Jekyll on GitHub Pages
├── src/
│   ├── generator.ts                 checkDigit, generateThaiId, validateThaiId, formatThaiId
│   ├── algorithm-view.ts            Step-by-step checksum table
│   ├── digits-view.ts               Colour-coded segment breakdown
│   ├── update-banner.ts             "New version available" toast
│   ├── dom.ts                       Shared safe DOM builders
│   ├── i18n.ts                      Bilingual EN/TH string table
│   ├── theme.ts                     Light / dark theme persistence
│   ├── logger.ts                    tslog singleton
│   ├── sw-register.ts               Service worker registration wrapper
│   ├── style.css                    Tailwind v4 @theme tokens + @utility classes
│   └── main.ts                      Composition root + bootstrap
├── tests/setup.ts                   Vitest globals (matchMedia, localStorage shim, clipboard)
├── index.html                       Markup with strict CSP + iOS meta tags
├── package.json, tsconfig.json, vite.config.ts, vitest.config.ts, bun.lock
├── CLAUDE.md                        Conventions for AI assistants and contributors
└── LICENSE                          MIT
```

## Prerequisites

| Requirement | Version |
| --- | --- |
| `Bun` | `>= 1.1.0` |
| A Chromium, Firefox, or Safari browser at the current `Baseline Widely Available` level | — |

## Getting started

### Installation

```bash
git clone https://github.com/su-ekachai/thai-id-generator.git
cd thai-id-generator
bun install
```

### Development

```bash
bun run dev          # serves http://localhost:5173/thai-id-generator/
```

### Testing

```bash
bun run typecheck        # tsc --noEmit
bun run test             # watch mode
bun run test:run         # single run
bun run test:coverage    # enforces the 90% gate locally
```

### Build

```bash
bun run build            # production output written to dist/
bun run preview          # serves dist/ locally on http://localhost:4173/
```

### Deploy

The workflow at `.github/workflows/ci.yml` runs on every pull request and on every push to `main`. Pushes to `main` additionally publish the site to GitHub Pages. To enable GitHub Pages on a fresh fork:

1. Push the repository to GitHub.
2. Navigate to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. If the repository name is not `thai-id-generator`, update `base` in `vite.config.ts` to match `/<repository-name>/` and the `start_url` / `scope` fields inside the `VitePWA` manifest block.

## Browser support

The project targets `Baseline Widely Available` features. Newly-available features are adopted only with a custom in-tree fallback that adds fewer than 20 lines and avoids external polyfills. Tested viewports include:

| Viewport | Device |
| --- | --- |
| 375×667 | iPhone SE |
| 390×844 | iPhone 14 |
| 768×1024 | iPad |
| 1024×1366 | iPad Pro |
| 1440×900 | Desktop |

## Privacy and security

- No analytics, no telemetry, no tracking pixels.
- No third-party network requests at runtime. Fonts and icons are self-hosted under `public/`.
- The only data persisted is the user's chosen theme (`thai-id-theme`) and language (`thai-id-lang`), both in `localStorage`.
- A strict `Content-Security-Policy` meta tag forbids inline scripts and external origins.
- Random ID digits come from `crypto.getRandomValues`, not `Math.random`.
- The service worker is locked to scope `/thai-id-generator/` and uses Workbox `clientsClaim: false` + `skipWaiting: false` so updates require an explicit user reload.

## License

MIT — see `LICENSE`.

## Acknowledgements

- Department of Provincial Administration, Ministry of Interior, Thailand — for the official check-digit specification.
- Noto Sans Thai (`@fontsource/noto-sans-thai`) and JetBrains Mono (`@fontsource/jetbrains-mono`) for the bundled fonts.
- `vite-plugin-pwa` and Workbox for the service worker scaffolding.
