# CLAUDE.md

Guidance for AI coding assistants (Claude Code, Cursor, Copilot, etc.) working in this repository.
Team LUCKY · NASA Space Apps Challenge 2026 · Challenge: *Build a Junior Astronaut Mission Trainer*.

## What this project is

A 3D browser game for kids (about 8–14 years old). The player is an astronaut running a Mars outpost for 6 sols and must balance oxygen, water, food, battery power and radiation shielding. The educational goal is to make **engineering trade-offs** tangible and fun. Every feature should serve that goal and stay simple enough for a child to understand without reading rules.

## Commands

Use **bun**, never npm or yarn.

```bash
bun install
bun dev            # dev server at http://localhost:5173
bun test           # game logic and balance tests (src/game/*.test.ts)
bun run balance    # win rates of the balance bots
bun run typecheck  # tsc -b
bun run lint       # oxlint
bun run build      # production build to dist/
```

Before saying a task is done, run `bun test`, `bun run lint` and `bun run build`. All three must pass.

## Architecture

```
src/
  game/    Pure game logic. NO React, NO three.js, NO DOM.
    types.ts     All types. Read this first.
    config.ts    Every tunable number and every science fact.
    world.ts     Movement, collisions, day/night, power helpers.
    engine.ts    tick(state, input, dt) → new GameState
    missions.ts  Emergency cards: start (state.deck), choose a plan, ask Earth, repairs, acknowledge
    problems.ts  Emergency texts, the two plans and the real astronaut story behind each one
    donki.ts     Real NASA DONKI solar flare records. Never edit the numbers.
    gather.ts    Picking up deposits (ice, ore, seed) into state.pack, unloading at shelter/workshop, starting a print job
    machines.ts  produce(): the shared power budget and each machine's material (filter, melting ice, crop) plus the 3D printer job
    messages.ts  Msg, FactId, Step, TipId codes (re-exported from types.ts)
    tasks.ts     Hands-on work (wipe panels, fit a part, harvest): state.task advances on input.step
    science.ts   Sample sites, drilling, banking samples at the shelter, stars
    training.ts  First-sol training: compares the state before and after a tick and ticks off steps
    crew.ts      Spacesuit oxygen
    radiation.ts Crew radiation dose 0-100: accumulates and never goes down (like a real dose). Base rate is Curiosity RAD's
                 0.64 mSv/day, scaled (DOSE in config.ts); flares add by DONKI class; the shelter and the flare card's shield cut it.
    events.ts    Storm and flare timers, facts (once each), lost hearts (loseHeart), win/lose.
    report.ts    Failure report built from GameState.losses.
    bots.ts      Balance bots (idle, explorer, manager).
    *.test.ts
  three/   Rendering only. Reads GameState, never changes it.
    scene.ts     Renderer (tone mapping), camera, and the order everything updates in
    base.ts      All base buildings, labels, pads and resource tanks, plus their per-frame update
    buildings.ts Shelter, the three machines (each has run(power, night, dt, t)) and the tank gauge
    props.ts     Depot, comm dish, carried items
    power.ts     Solar field, battery rack and the cables whose moving lights show the power flow
    actors.ts    Astronaut, carried item, backpack contents
    guide.ts     Where the guide arrow points (same priority order as ui/mission.tsx)
    deposits.ts  Ice, ore and seed crates on the ground with pixel markers
    workshop.ts  3D printer and the storage piles at the workshop
    pixel-sprite.ts Pixel icons as textures, createMarker() and createLabel() (icon + short text)
    environment.ts Sky dome, sun, stars, lights and fog for day, dusk, night, storm and flare
    effects.ts   Dust storm particles
    sites.ts     Science sites: drill rig, beacon, samples left
    ship.ts      Supply ship that lands when the player wins
  pixel/   pix.ts + sprites-*.ts: every icon as a 12×12 text grid with one shared palette. UI uses <Pix> (ui/pix.tsx), 3D uses pixelTexture().
  audio/   synth.ts (Web Audio tones, no files) and cues.ts (compares two states and plays sounds).
           speech.ts: read-aloud through the browser's speechSynthesis (only on a 🔊 tap, never auto-play).
  hooks/   use-game-loop.ts: the one place that connects logic, 3D, input and sound.
           use-space-weather.ts: the only network request in the app (live NASA DONKI flares).
           use-speech.ts: voice available for the current language, speaking state, say/stop (used by ui/read-aloud.tsx).
  ui/      React + Tailwind HUD, joystick, overlays.
  i18n/    Every player-facing string. mn.ts (defines the Dict type) and en.ts (same shape),
           index.ts (Lang, DEFAULT_LANG = "en", loadLang/saveLang, say() for Msg, stepText() for report steps), context.ts (useT()).
```

The single most important rule: **logic decides, three.js draws.**
- New gameplay rule → `src/game/` + a test in the matching `*.test.ts` (helpers are in `testing.ts`).
- New number (rate, cost, duration) → `src/game/config.ts`, never hard-coded elsewhere.
- Changed a number in `config.ts` → run `bun run balance` and update the "Game balance" table in README. `bots.test.ts` must still pass: managing power has to beat not managing it.
- New 3D object → `src/three/`, driven by fields on `GameState`.
- New HUD element → `src/ui/`, reading the `hud` snapshot from `useGameLoop`.

While `state.modal` is open, `tick()` returns the state unchanged (the game is paused); `acknowledge()` closes it.

Power is one shared budget: when sun plus battery cannot cover the machines that are on and not broken, all of them slow down by the same share (`state.load`, 0–1). Anything that takes a heart must go through `loseHeart()` in `events.ts`, so the failure report can explain it.

Every emergency is a card with two plans, `a` (careful, slow) and `b` (quick, with a lasting cost), and **neither may be free**. `choose()` applies a plan, `askEarth()` delays the answer by the card's light time while the problem keeps running, and `advise()` decides what Earth recommends from the current state. The order of the cards is shuffled per game (`state.deck`).

Adding a new emergency: add its id to `ProblemId` and `PROBLEM_IDS`, its text, both plans, Earth's reasons and the real story to `PROBLEMS` (`problems.ts`), what each plan does to `choose()` and `advise()` (`missions.ts`), and, if it needs a spare part, an entry in `REPAIRS` and `ITEMS` (`config.ts`). Then update the mission line (`ui/mission.tsx`) and guide arrow (`three/guide.ts`), which follow the same priority order, and add a test.

The game must work with no internet. `createGame(seed, live)` takes the live flare if the fetch succeeded and otherwise picks one from the embedded archive; never label archived data as live.

Sound never comes from the engine: `audio/cues.ts` compares the state before and after a tick. The game must stay fully playable with sound off.

`tick()` must stay **pure and immutable**: return a new object with spread (`{ ...s }`), never mutate `prev`. Randomness goes through `random(seed)` in `world.ts`, never `Math.random()` inside the engine, so tests are repeatable.

## Code conventions

- TypeScript strict. No `any`. Use `import type` for type-only imports.
- **Relative imports** (`../game/config`), no path aliases.
- Keep every file **under ~150 lines**. Split by responsibility when a file grows.
- Components: function components, props typed with an `interface`. Pass icons as rendered JSX (`icon={<span>💧</span>}`).
- Use plain HTML elements styled with Tailwind. No UI component library.
- Icons are pixel sprites, not emoji: `<Pix name="ore" />` in React, `createMarker`/`createLabel(text, bg, icon)` in three.js. New icon → add a 12×12 grid to `src/pixel/sprites-*.ts` using only `PALETTE` letters. Strings in i18n may still contain emoji; screens pass them through `plain()` to strip them.
- Comments may be in Mongolian; identifiers in English.
- Player-facing text: short, friendly sentences a child (7–12) understands. **Never write it in game/, three/ or ui/ code**: add it to both `src/i18n/mn.ts` and `src/i18n/en.ts` (TypeScript fails if en.ts is missing a key) and read it with `useT()`. The engine returns codes, not text: toasts are a `Msg`, the failure report returns `Step` and `TipId`. `i18n.test.ts` checks both languages have the same shape and that English sentences stay short.

## Science and content rules

- Facts shown to players live in `facts` in `src/i18n/mn.ts` and `en.ts` (ids in `FactId`, `game/types.ts`) and must be true in both languages. If unsure, leave it out and ask the team.
- Game rates are tuned for fun and are not real NASA values; do not present them as real.
- **Never** use NASA logos, insignia, mission patches or other NASA branding (Space Apps rule).
- AI-generated images or videos must carry a visible "AI-generated" watermark (Space Apps rule).

## AI usage log (required for submission)

Space Apps requires teams to describe how AI was used. After any task where you (the AI) wrote or changed code, append one line to `docs/AI_USAGE.md`:

```
- YYYY-MM-DD · <tool> · <what you did, one line> · reviewed by <teammate>
```

## Git workflow (two-person hackathon team)

- `git pull` before starting work and before pushing.
- Small commits with clear messages, e.g. `feat: add meteor event`, `fix: shelter radius`.
- Do not commit `node_modules`, `dist`, `.env*` or zip files.
- Do not add AI tools as commit co-authors; commits are made by team members.

## Deploy

- Live at https://lucky-mars.vercel.app (Vercel project `lucky-mars`, linked to this repo). **A push to `main` is a release.**
- `vercel.json` builds with `bun test && bun run lint && bun run build`: a failing test stops the deploy and the old version stays live. Other branches and PRs get preview links.
- `.github/workflows/ci.yml` runs the same checks on GitHub for every push and PR. It does not deploy.

## Gotchas

- `three.js` objects are created once in `createWorld()`; per-frame work happens in `update()`. Do not create geometries or materials every frame.
- Glows are additive sprites (`createGlow` in `models.ts`), not `PointLight`s. Only the greenhouse and the astronaut's headlamp are real point lights; adding more is slow on phones.
- The sky is a shader dome that follows the camera. Its horizon colour is also the fog colour, so change both together in `environment.ts`.
- The HUD updates about 10 times per second from `stateRef`; the 3D world updates every frame. Do not put the full game state into React state on every frame.
- Labels are canvas-texture sprites (`createLabel`) with `sizeAttenuation: false`, so their scale is in screen units, not world units.
- On portrait phones the camera moves higher (`moveCamera` in `scene.ts`). Test both desktop and a ~390px wide phone viewport.
