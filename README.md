# Mehul's terminal portfolio

A local Next.js App Router portfolio with custom CSS, an expandable shell, and a single GitHub/LeetCode activity calendar. The page content is server-rendered; the terminal and calendar are small interactive components.

## Run locally

Requires Node.js 20.9+ and npm. Node.js 22 is recommended.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Production: `npm run build`, then `npm start`. Deploy to a host supporting the Next.js Node runtime; the live API needs a server and is not a static export. This project has not been published.

## Edit the content

All personal copy, social links, usernames, and project metadata live in `src/config/portfolio.ts`. Experience contains the six entries from the supplied LinkedIn profile, with roles, dates, engagement types, locations where listed, and concise descriptions. The Clash Royale entry is explicitly labeled gaming. Roles without a LinkedIn description show only the available facts. About remains a visibly labeled draft; replace its paragraphs and disable its draft label when ready. Add only verified roles, dates, achievements, and interests. Project descriptions are based on their public READMEs and linked to the source documentation.

The supplied LinkedIn profile is included in the social links and Experience section. Experience was read through the signed-in profile on 15 October 2026. The terminal's `experience` and `cat experience.log` commands use the same entries as the page.

Each featured project has a server-rendered page at `/projects/<slug>`: `aco-its`, `driftbench`, `filinglens`, `reliable-queue`, and `internfly`. Project names in all three explorer views open these pages. Each page explains the purpose, a concrete example, the system flow, engineering decisions, and limitations, with a project directory and next-project navigation. The `story` field in the same typed configuration owns this content. GitHub remains available through explicit source links. Unknown and removed slugs return a 404. The job queue description reflects its documented V2 PostgreSQL/outbox/lease architecture and at-least-once execution. InternFly replaces Video-to-ASCII and describes the optional selected Male CNS v1.0 connectivity, engineered controller dynamics, offline fixture, and fictional internship simulation.

## Activity calendar

`GET /api/activity?year=2026` returns `year`, `days`, and per-source `sources`. The allowed range is 2024 through the current UTC year. Each day has `date`, nullable `github`, `leetcode`, `combined`, and `future`; each source has `status` (`live`, `stale`, `unavailable`), nullable `updatedAt`, and nullable `message`.

The server fetches GitHub's public contribution calendar and LeetCode's public GraphQL calendar. No credentials are required. Both are independently cached for six hours in `.cache/activity/` with a memory fallback. An unsuccessful refresh keeps the previous successful source data and marks it stale. Cache files are local runtime artifacts and excluded from Git. On ephemeral hosting, disk retention is limited to that instance's lifetime; use a persistent cache for retention across deployments.

GitHub dates are preserved. LeetCode Unix timestamps become UTC date keys. Combined counts add contributions and submissions; they do **not** represent unique solved problems. If one source is unavailable, Combined contains the known source sum and is visibly labeled partial; the missing source count remains `null`. Future days are inactive. Public endpoint formats can change: the parsers reject incomplete or malformed calendars, rather than fabricating zero counts. Requests have eight-second timeouts.

The five intensity levels represent 0, 1–2, 3–5, 6–9, and 10+ events. Use source tabs and year controls, then hover, focus, or tap a day to inspect its counts. Arrow keys move around the calendar; Home/End move to the first/last completed day. The map scrolls horizontally inside its panel on smaller screens.

## Terminal

Commands: `help`, `whoami`, `activity`, `projects`, `experience`, `about`, `clear`, `coffee`. Compact commands navigate to sections; expanded commands print fuller details. Up/Down recall history, Tab completes matching commands, and Escape collapses. This is a portfolio command interpreter and executes no system commands.

The virtual filesystem also supports `ls`, `cd projects`, `cd ..`, `pwd`, `cat about.txt`, and `open <project-slug>`. `history` prints the current session's commands; Ctrl+C cancels an unfinished line while preserving normal copy when text is selected. Suggestions complete commands and file/project arguments. Opening a project in compact mode reveals its existing details in the project explorer.

The analog instrument panel is a virtual oscilloscope. Its buttons and sliders share state with `signal sine|square|triangle`, `tune 1–8`, `gain 1–5`, `hold`, and `resume`. `scope` prints its settings. The illustrative waveform pauses for reduced motion; it represents no physical hardware or measured activity.

The pixelated CRT treatment uses stepped signal samples (3 units horizontally, 2 vertically), crisp SVG edges, a repeating phosphor-dot graticule, light scanlines, and a self-hosted VT323 display font. The full-page dual traces follow the same waveform, frequency, gain, and hold state as the terminal. Both background and panel respect reduced motion. All visuals are local SVG/CSS, with no gradients, external image requests, or canvas dependencies. The earlier electrical bench SVG is retained as an unused previous design asset.

## Background audio

The track supplied in `audio/` is served from `public/audio/the-son-of-flynn.mp3` and loops through a persistent audio component in the root layout. Playback continues through internal project navigation. It starts at 20% volume when browser autoplay policy allows it, otherwise after the first page interaction or the sound button. The fixed sound control pauses/resumes playback and adjusts volume; both preferences are remembered locally. An explicit pause is respected across later interactions and reloads. The player loads the track only when playback is attempted.

## Workspace navigation

A sticky file-explorer rail tracks the visible section on desktop. It includes public profile shortcuts, a UTC clock, elapsed browser-session time, and reading progress. On smaller screens, use the `workspace/index` disclosure above the introduction. The rail's **open terminal** button or **Ctrl/Command + backtick** expands the existing shell and focuses its input; command history is preserved.

The project section keeps its original list as the default, with optional Grid and Table views inspired by the reference portfolio. Search matches names, focus areas, descriptions, and technologies. Switching views retains expanded project details, shell state, and the selected activity source/year. The table scrolls inside its own container on mobile. A pre-refinement source snapshot is retained in ignored `.snapshots/` for restoring the previous design.

## Verify

```sh
npm run test
npm run typecheck
npm run build
npm run test:e2e
```

Browser tests use installed Microsoft Edge, run at desktop and mobile sizes, and start a local dev server when needed. Their activity responses are deterministic fixtures used only during tests. Screenshots and traces go to ignored `test-results/`. On another OS, change the Playwright `channel` to an installed Chromium browser or install Playwright Chromium and remove the channel setting.

With the app running, `node scripts/check-live.mjs` verifies real calendars for all supported years, invalid year responses, desktop and mobile renders, and browser runtime errors. This optional check requires network access and installed Edge; it stores screenshots in `.cache/preview/`.
