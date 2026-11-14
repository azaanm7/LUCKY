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
    events.ts    Storms, flares, facts (once each), lost hearts, win/lose.
    report.ts    Failure report built from GameState.losses.
    bots.ts      Balance bots (idle, explorer, manager).
    *.test.ts
  three/   Rendering only. Reads GameState, never changes it.
  hooks/   use-game-loop.ts: the one place that connects logic, 3D and input.
  ui/      React + Tailwind HUD, joystick, overlays.
```

The single most important rule: **logic decides, three.js draws.**
- New gameplay rule → `src/game/` (engine.ts or world.ts) + a test in `engine.test.ts`.
- New number (rate, cost, duration) → `src/game/config.ts`, never hard-coded elsewhere.
- Changed a number in `config.ts` → run `bun run balance` and update the "Game balance" table in README. `bots.test.ts` must still pass: managing power has to beat not managing it.
- New 3D object → `src/three/`, driven by fields on `GameState`.
- New HUD element → `src/ui/`, reading the `hud` snapshot from `useGameLoop`.

`tick()` must stay **pure and immutable**: return a new object with spread (`{ ...s }`), never mutate `prev`. Randomness goes through `random(seed)` in `world.ts`, never `Math.random()` inside the engine, so tests are repeatable.

## Code conventions

- TypeScript strict. No `any`. Use `import type` for type-only imports.
- **Relative imports** (`../game/config`), no path aliases.
- Keep every file **under ~150 lines**. Split by responsibility when a file grows.
- Components: function components, props typed with an `interface`. Pass icons as rendered JSX (`icon={<span>💧</span>}`).
- Use plain HTML elements styled with Tailwind. No UI component library.
- Comments may be in Mongolian; identifiers in English.
- Player-facing text: short, friendly sentences a child understands. Mongolian now; every new string must also get an English version once i18n exists (see Roadmap in README).

## Science and content rules

- Facts shown to players live in `FACTS` in `config.ts` and must be true. If unsure, leave it out and ask the team.
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

## Gotchas

- `three.js` objects are created once in `createWorld()`; per-frame work happens in `update()`. Do not create geometries or materials every frame.
- The HUD updates about 10 times per second from `stateRef`; the 3D world updates every frame. Do not put the full game state into React state on every frame.
- Labels are canvas-texture sprites (`createLabel`) with `sizeAttenuation: false`, so their scale is in screen units, not world units.
- On portrait phones the camera moves higher (`moveCamera` in `scene.ts`). Test both desktop and a ~390px wide phone viewport.
