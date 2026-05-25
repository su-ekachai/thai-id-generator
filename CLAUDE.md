# CLAUDE.md

> Intended audience: AI assistants (Claude, Copilot, Gemini, Cursor) and human contributors entering this repository.

This file codifies the conventions that apply to every change in this codebase. Read it once at the start of a session and refer back when in doubt.

## Project overview

`thai-id-generator` is a single-page, client-side educational web application. It generates 13-digit numbers that satisfy the official Thai national ID checksum, demonstrates the check-digit math, and explains what each position represents.

The application:

- Has no backend, no database, no authentication, no analytics.
- Stores only theme and language preferences in `localStorage`.
- Deploys to GitHub Pages as a Progressive Web App.
- Targets `Baseline Widely Available` browsers.

## Stack and tooling

| Package | Version | Role |
| --- | --- | --- |
| `Bun` | `>= 1.1.0` | Package manager and script runner |
| `Vite` | `^8.0.0` | Bundler and dev server (Rolldown-powered as of v8) |
| `TypeScript` | `^6.0.0` | Strict type checking |
| `Tailwind CSS` | `^4.0.0` | CSS-first design tokens via `@tailwindcss/vite` |
| `vite-plugin-pwa` | `^1.3.0` | Service worker (`generateSW`) and web manifest |
| `Vitest` | `^4.1.7` | Test runner |
| `happy-dom` | `^20.9.0` | DOM environment for tests |
| `tslog` | `^4.10.2` | Singleton structured logger |

## Architecture

All source modules live directly under `src/`. There are no sub-folders. Each module is named for what it does rather than for the layer it belongs to:

| File | Responsibility |
| --- | --- |
| `src/generator.ts` | Pure algorithm. Must not import DOM, `window`, `document`, `navigator`, or `localStorage`. |
| `src/dom.ts` | Safe DOM construction helpers (`el`, `cell`, `text`, `clearChildren`). |
| `src/algorithm-view.ts`, `src/digits-view.ts`, `src/update-banner.ts` | DOM renderers. Build output through `src/dom.ts`. Each exports a `render*` / `clear*` pair. |
| `src/i18n.ts`, `src/theme.ts`, `src/logger.ts`, `src/sw-register.ts` | Browser-platform integrations. Each wraps one platform concern (string table, theme persistence, structured logging, service-worker registration). |
| `src/main.ts` | Composition root. Wires the renderers, the algorithm, and the platform modules to the DOM declared in `index.html`. The only module allowed to run code at import time. |

## Coding conventions

| Topic | Rule |
| --- | --- |
| TypeScript strictness | `strict: true`, `noUncheckedIndexedAccess: true`, `verbatimModuleSyntax: true`. Never relax these. |
| `any` | Never use `any`. Use `unknown` and narrow. |
| Type assertions (`as`) | Avoid. Use type narrowing or `satisfies`. The only acceptable assertion is at DOM boundaries (e.g. `as HTMLDetailsElement`). |
| DOM construction | Always use `src/dom.ts` helpers (`el`, `cell`, `text`, `clearChildren`). The HTML-string DOM APIs are forbidden. |
| Randomness | `crypto.getRandomValues` only. Never `Math.random`. |
| Styling | Tailwind v4 utility classes and `@theme` tokens. Custom CSS only in `src/style.css` under explicit `@layer base` or `@utility` blocks. |
| i18n key naming | Dotted: `group.subgroup.value`. Add the key in both EN and TH tables in `src/i18n.ts`. |
| Logging | Use the singleton from `src/logger.ts`. Never `console.log` in committed code. |
| External links | `target="_blank"` requires `rel="noopener noreferrer"`. |
| Side effects at import time | Forbidden in every module except `src/main.ts`, which is the only module allowed to run a bootstrap stanza. That stanza is excluded from coverage with `/* v8 ignore */`. |

## Naming conventions

| Surface | Convention | Example |
| --- | --- | --- |
| Source files | kebab-case `.ts` | `algorithm-view.ts`, `sw-register.ts` |
| Test files | Same stem + `.test.ts`, co-located | `generator.test.ts` |
| Exported functions | camelCase | `generateThaiId`, `renderDigitsBreakdown` |
| Exported types and interfaces | PascalCase | `AlgorithmTrace`, `BootstrapOptions` |
| Module-level constants | `UPPER_SNAKE_CASE` | `ID_LENGTH`, `STORAGE_KEY` |
| Local variables and parameters | camelCase | `currentRawId`, `first12` |
| CSS custom properties | `--prefix-kebab-case` | `--color-app-accent`, `--font-mono` |
| `@utility` class names | kebab-case | `segment-type`, `bg-app-surface-2` |
| BEM blocks for stand-alone components | `.block__element` | `.pwa-update-banner__text` |
| HTML `id` attributes | kebab-case | `id="btn-generate"` |
| `data-i18n*` attribute values | dotted i18n key | `data-i18n="app.title"` |
| i18n keys | dotted, 2–3 levels deep | `digits.label.type` |
| `localStorage` keys | `thai-id-{purpose}` | `thai-id-lang`, `thai-id-theme` |
| npm scripts | kebab-case, `:` for sub-commands | `test:coverage`, `generate-icons` |
| GitHub Actions workflow files | kebab-case `.yml` | `ci.yml` |
| GitHub Actions job ids | kebab-case or single word | `build`, `deploy` |
| GitHub Actions step names | Title Case English | `Type-check`, `Verify no source maps in dist` |

## Writing rules

Every code comment, JSDoc block, README, and `*.md` file in this repository follows these twelve rules. The `content-editor` audit enforces them.

1. **Objective and impersonal.** Third person. No `we`, `I`, `my`.
2. **Explain the why, not just the what.** Comments and docstrings must convey intent.
3. **Declarative style.** State facts directly. No conversational lead-ins.
4. **No agentic meta-commentary.** No AI authorship traces, agent notes, or AI disclaimers.
5. **Technical precision.** Exact versions and concrete values. Never `might`, `could`, `possibly`.
6. **Actionable and imperative.** Instructions are direct and sequentially numbered when ordered.
7. **Acronyms and terminology consistency.** Spell out acronyms on first use. One term per concept throughout.
8. **Formatting discipline.** Backticks around code, commands, and file paths. Tables for comparisons.
9. **No filler or emotional language.** No `Great`, `Unfortunately`, `Sorry`, `Obviously`.
10. **Cross-referencing.** Link to specific files or sections. No vague references.
11. **Audience awareness.** Match technical depth to the document's audience.
12. **Completeness over brevity.** State scope boundaries explicitly. Cover prerequisites, assumptions, edge cases.

## Commands cheat sheet

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies. |
| `bun run dev` | Start the Vite dev server on `http://localhost:5173/thai-id-generator/`. |
| `bun run typecheck` | `tsc --noEmit`. Must be 0 errors. |
| `bun run test` | Vitest watch mode. |
| `bun run test:run` | Vitest single run. |
| `bun run test:coverage` | Coverage report with the 90% gate. |
| `bun run build` | Production build into `dist/`. |
| `bun run preview` | Serve `dist/` locally on `http://localhost:4173/`. |
| `bun audit` | Dependency vulnerability audit. CI runs this. |
| `bun run generate-icons` | Regenerate PWA icons from `public/icons/icon.svg`. |

## File organisation rules

- Source modules live directly in `src/`. No sub-folders. The algorithm (`generator.ts`) avoids DOM and `localStorage`; renderers (`*-view.ts`, `dom.ts`) build output through `src/dom.ts`; browser integrations (`i18n.ts`, `theme.ts`, `logger.ts`, `sw-register.ts`) wrap their respective platform APIs; `main.ts` wires everything together.
- Tests live next to the file they cover with the suffix `.test.ts`. The `tests/` directory holds the Vitest setup file only.
- `public/` files are copied verbatim into `dist/` by Vite. Use it for assets that must keep their filenames (icons, fonts, `theme-init.js`, `.nojekyll`).

## Common patterns

### Safe DOM builder pattern

Every renderer constructs its output through `src/dom.ts`:

```ts
import { el, cell, text, clearChildren } from './dom';

clearChildren(container);
const row = el('tr', 'border-t');
row.appendChild(cell('hello', 'p-2 font-mono'));
container.appendChild(row);
```

This eliminates HTML-string injection as a class of bug.

### Singleton logger

```ts
import { log } from './logger';

log.info('bootstrap complete', { lang });
log.warn('clipboard rejected; falling back', err);
log.error('SW registration failed', err);
```

The logger reads `import.meta.env.DEV` to switch between verbose (development) and `info`-and-above (production). No further configuration is needed at call sites.

### `render*` / `clear*` symmetry

Every DOM component exports both `renderX(container, ...)` and `clearX(container)`. The bootstrap routine calls `clearX` once at start-up so the panel begins in a known empty state before any user interaction.

### Segment-chip utility classes

The digit-meaning breakdown uses five Tailwind utility classes that wrap a coordinated set of background, foreground, and ring tokens. Each class is defined in `src/style.css` via `@utility` and reads from `@theme` tokens that have `.dark` overrides:

| Utility | Hue family (light → dark) |
| --- | --- |
| `segment-type` | blue-50/900/200 → blue-950@40 / 200 / 800@60 |
| `segment-location` | emerald-50/900/200 → emerald-950@40 / 200 / 800@60 |
| `segment-volume` | amber-50/900/200 → amber-950@40 / 200 / 800@60 |
| `segment-sequence` | violet-50/900/200 → violet-950@40 / 200 / 800@60 |
| `segment-check` | reuses `--color-app-accent-*` (Thai-flag crimson) |

When adding a new colour-coded surface, define a new pair of tokens and `@utility` rather than hard-coding Tailwind class strings in TypeScript.

## Anti-patterns to avoid

| Anti-pattern | Why it is forbidden | Replacement |
| --- | --- | --- |
| HTML-string DOM property assignments | Strict CSP rejects HTML-string DOM APIs as an injection vector. | `src/dom.ts` helpers. |
| `Math.random()` for ID digits | Predictable seeding leaks across runs. | `crypto.getRandomValues`. |
| Inline script in `index.html` | Strict CSP forbids it. | Extract to `public/*.js` and load with `<script src>`. |
| `console.log` | Bypasses level controls and pretty formatting. | `log.info` / `log.debug` from `src/logger.ts`. |
| `target="_blank"` without `rel` | Reverse tab-nabbing. | Add `rel="noopener noreferrer"`. |
| Network calls at runtime | The app has no backend. | None. Embed data at build time or fetch only at install time via the service worker. |
| Adding analytics | The project promises no tracking in `README.md`. | None. |
| DOM, `window`, or `localStorage` access inside `src/generator.ts` | The algorithm module must remain framework-agnostic so it can be unit-tested without a DOM environment. | Move the platform call into one of the platform modules (`i18n.ts`, `theme.ts`, `logger.ts`, `sw-register.ts`) and have `main.ts` orchestrate it. |

## Testing

| Concern | Rule |
| --- | --- |
| Runner | `Vitest` `^4.x`. |
| Environment | `happy-dom` `^20.x` configured in `vitest.config.ts`. |
| Location | Co-located with source: `src/foo.ts` + `src/foo.test.ts`. |
| Setup | `tests/setup.ts` provides `localStorage`, `matchMedia`, and `navigator.clipboard` shims. Do not remove. |
| Coverage gate | 90% on lines, branches, functions, statements. CI fails below this. |
| Coverage exclude | `src/sw-register.ts` (depends on `virtual:pwa-register`, not exercisable in `happy-dom`). |
| Determinism | Stub `Math.random`, `Date.now`, and `crypto.getRandomValues` via `vi.spyOn` when an exact output is required. |
| Mocking the service worker | Use `vi.mock('./sw-register', () => ({ registerServiceWorker: vi.fn() }))` in any test that imports `main.ts`. |

## Internationalisation

- Bilingual `en` / `th`. Default `en`. First-visit defaults to `th` only when `navigator.language` starts with `th`.
- Persistence key: `thai-id-lang`.
- Every visible string passes through `t('group.subgroup.value')`. Hard-coded text is allowed only as the default attribute value rendered before the bundle hydrates.
- Add new strings to both tables in `src/i18n.ts`. Translation gaps are visible because `t` returns the key when missing.

## PWA and service worker

- Strategy: `vite-plugin-pwa` with `generateSW` and Workbox runtime.
- Update flow: `clientsClaim: false`, `skipWaiting: false`. The user explicitly confirms an update via the toast in `src/update-banner.ts`.
- Scope: `/thai-id-generator/`. Update `start_url` and `scope` together with `vite.config.ts` `base` when forking.
- Precache budget: under 200 KiB. Increasing it requires a justification in the pull request description.
- Tests cannot exercise the registration path. `src/sw-register.ts` is excluded from coverage by design.

## Browser support

`Baseline Widely Available` features may be used without fallbacks. Newly-available features are adopted only with an in-tree fallback that adds fewer than 20 lines and avoids external polyfills. Document the fallback at the call site with a comment that names the feature and its `Baseline since` date.

## Security

- Strict `Content-Security-Policy` meta tag in `index.html`. Do not re-introduce inline scripts.
- `crypto.getRandomValues` only. Do not re-introduce `Math.random`.
- `bun audit` runs in CI before every deploy. A high or critical finding blocks the deploy.
- `dist/` must not ship `.map` files. The CI step `Verify no source maps in dist` enforces this.

## Things NOT to do

- Do not add a backend or any network call at runtime.
- Do not add analytics, telemetry, or tracking.
- Do not commit secrets, `.env` files, or API keys (there are none, and there must remain none).
- Do not weaken the CSP, the coverage gate, or the audit step to make CI pass.
- Do not introduce a UI framework. The page is plain TypeScript on purpose.
- Do not skip writing tests for new code. The 90% coverage gate is enforced.
- Do not edit `bun.lock` by hand. Use `bun install` / `bun add`.
- Do not write code comments or documentation that violate the twelve writing rules.
