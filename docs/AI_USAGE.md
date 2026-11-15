# AI usage log

NASA Space Apps requires every team to explain how AI tools were used. Each AI-assisted change gets one line here. The summary in README.md is written from this log before submission.

Format: `- YYYY-MM-DD · <tool> · <what was done> · reviewed by <teammate>`

- 2026-11-14 · Claude · Initial project setup: Vite + React + TypeScript + Tailwind + three.js structure, game engine from the team's rules, tests, README · reviewed by Munkhtuvshin
- 2026-11-14 · Claude · Added real astronaut emergencies (CO₂ filter, dust storm, solar flare, hull leak, water pump), spacesuit oxygen, exercise, depot/gym/antenna, problem dialogs and badges · reviewed by Munkhtuvshin
- 2026-11-14 · Claude Code · One shared power budget (machines slow down together when power is short), power line and hints in the HUD, balance bots and tests · review pending
- 2026-11-14 · Claude Code · Failure report on the end screen: each lost heart is traced back from result to cause, with one tip for next time · review pending
- 2026-11-14 · Claude Code · Keyboard fixes: WASD/E work on a Mongolian layout, holding Space no longer flickers a machine, keys no longer stick when the window loses focus · review pending
- 2026-11-14 · Claude Code · Facts: MOXIE fact shown at the oxygen maker, each fact appears once per game (checked against science.nasa.gov) · review pending
- 2026-11-14 · Claude Code · README and CLAUDE.md: balance table from the bots, failure report and power budget described, NASA references added · review pending
- 2026-11-14 · Claude Code · Merged the emergencies/spacesuit/exercise work with the power budget and failure report; retuned balance for the merged game (solar 12.5, ice 4 water, 5 ice) with bots that solve the emergencies · review pending
- 2026-11-14 · Claude Code · New 3D look: sky dome with sun and stars, tone mapping, night lighting, power cables with moving lights, battery rack, resource tanks beside each machine, dust storm particles, craters · review pending
- 2026-11-14 · Claude Code · Mission Control cards (two plans per emergency, ask Earth with a real delay, shuffled order), real NASA DONKI flare records downloaded and embedded, hands-on repair and panel-wiping tasks, science sites with stars, bots and tests for all of it · review pending
- 2026-11-14 · Claude Code · Sound effects generated in code (Web Audio API, no audio files), camera shake, supply ship landing, README and CLAUDE.md updated · review pending
- 2026-11-14 · Claude Code · First-sol training checklist, live NASA DONKI flare lookup with archive fallback, in-game sources page, pause menu, notch-safe padding, PNG home-screen icons rendered from our own icon.svg · review pending
- 2026-11-14 · Claude Code · Removed the daily exercise and muscle-strength requirement (bar, treadmill, slower walking) to leave fewer things for young players to track; ice retuned to 3.5 water so the recycler still matters · review pending
- 2026-11-14 · Claude Code · Landing intro: cockpit window view of Mars, approach and atmospheric entry with real facts, blink transition into the game (replaces the old start card; live space weather and sources link moved onto it) · review pending
- 2026-11-14 · Claude Code · i18n (merged with the training, live weather, pause and sources work): every player-facing string moved to src/i18n/mn.ts and en.ts (English for ages 7–12), engine returns message codes instead of text, MN/EN switch on the start screen saved in localStorage, i18n tests · review pending
- 2026-11-15 · Claude Code · Crew radiation dose (0–100, never goes down; base rate scaled from Curiosity RAD 0.64 mSv/day, flares add by DONKI class, shelter and shield reduce it, 100 = −1 heart); flare card is now shield (−30% battery) vs save battery, safe mode removed; SOLAR_POWER 14 → 13.5 to keep the balance; sources in README and on the end screen · review pending
- 2026-11-15 · Claude Code · English as the default language (MN one tap away on the start screen); Vercel build runs tests, lint and build before every deploy (vercel.json); GitHub Actions CI on every push and PR · review pending
- 2026-11-15 · Claude Code · Read-aloud button (browser speechSynthesis, no dependencies) on emergency cards, the prompt line and the start screen; speech.ts, use-speech.ts, read-aloud.tsx, speech tests · review pending
- 2026-11-15 · Claude Code · Read-aloud prefers natural voices (Natural/Neural > Google > Enhanced/Premium > others > old Windows David/Zira/Mark); offline uses only on-device voices; an online voice error retries the whole text once with the best local voice · review pending
