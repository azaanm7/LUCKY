# Junior Astronaut 3D

**Team LUCKY · NASA Space Apps Challenge 2026 · Ulaanbaatar**
Challenge: *Build a Junior Astronaut Mission Trainer*

🎮 **Play:** *(add the Vercel link here after deploy)*

A 3D browser game where kids become the commander of a small Mars outpost. Keep your crew alive for **6 sols** (Martian days) until the supply ship arrives by balancing **oxygen, water, food, power and radiation shielding**.

## The problem

Space-themed STEM content for kids usually goes one of two ways: it oversimplifies the engineering trade-offs that define a real mission, or it explains them at a level too complex to hold a young learner's attention. Very few tools make those trade-offs both tangible and fun.

## Our solution

Instead of reading about trade-offs, the player **lives them**:

- The solar panels never make enough power to run every machine through the night, so the player must **choose** which machines stay on.
- The greenhouse makes food but **uses water**, so growing more food means collecting more ice.
- A solar flare forces the player to **drop everything** and run to the shelter.
- A dust storm cuts solar power, and afterwards the panels must be cleaned before power returns.

Every decision has a visible cost. A single line at the top of the screen always shows the most urgent task, so children can play without reading any rules. At the end, the game explains in one sentence what a *trade-off* is and why engineers care about it.

### Real astronaut problems

From sol 2, every sol brings one emergency that real astronauts have actually faced. The game pauses, explains what happened and what to do, and reminds the player that a message to Earth takes minutes to arrive, so **they must solve it themselves**. After solving it, the player reads how real astronauts handled the same problem and earns a badge.

| Sol | Emergency | What the player does | What really happened |
| --- | --- | --- | --- |
| 2 | CO₂ filter clogged, oxygen maker stops | Fetch a new filter from the depot, install it | Apollo 13 (1970): the crew built a filter adapter from tape, plastic bags and cardboard |
| 3 | Dust storm | Save power, then clean the solar panels | Opportunity rover (2018) went silent in a planet-wide dust storm |
| 4 | Solar flare | Run to the shelter within 10 seconds | Artemis / Orion: the crew builds a radiation shelter from stowage bags |
| 5 | Micrometeoroid hole in the greenhouse | Fetch a patch kit and seal the leak | ISS (2018): the crew sealed a 2 mm hole with sealant and gauze |
| 6 | Water recycler pump fails | Fetch a spare pump, collect ice meanwhile | ISS (2023): the water system now recycles 98% of the crew's water |

Two needs run all game long:
- **Spacesuit oxygen** drops whenever the astronaut is outside and refills in the shelter, so every trip outside must be planned.
- **Exercise once per sol** on the treadmill. Skipping it weakens the astronaut's muscles and they walk slower, just like real astronauts in low gravity.

## How to play

| Action | Desktop | Phone |
| --- | --- | --- |
| Walk | `WASD` or arrow keys | Joystick (bottom left) |
| Turn a machine on/off | Stand on its ring, press `Space` / `E` | Tap the big button |

- 👩‍🚀 **Watch your suit oxygen** outside. Go back into the shelter to refill it.
- 🚨 **Solve the daily emergency.** Spare parts are in the 📦 depot. A yellow arrow shows where to go.
- 💪 **Exercise once per sol** on the treadmill.
- 🧊 **Collect blue ice** to make water.
- 🫧 🚰 🌱 **Machines** (oxygen maker, water recycler, greenhouse) use battery power.
- 🧹 **Clean the solar panels** after dust storms by standing on them.
- ☢️ **Solar flare!** When the sky turns red, run into the shelter before the countdown ends.
- 🌙 **Night:** no sunlight, no solar power. Save your battery.

You win by surviving 6 sols. You lose if the crew's 3 hearts run out.

## Science behind the game

| In the game | Real world |
| --- | --- |
| Oxygen maker | NASA's MOXIE experiment on the Perseverance rover made oxygen from Martian CO₂ (2021). |
| Collecting ice | Mars has water ice under its surface and at its poles. |
| Dust storms | Mars dust storms can cover the whole planet and weaken solar power. |
| Cleaning panels | Wind "cleaning events" restored power to the Spirit and Opportunity rovers. |
| Shelter from flares | Mars has no global magnetic field and a thin atmosphere, so solar particles reach the surface. |
| Blue sunsets | Martian dust makes the sky near the setting Sun look blue. |
| 1 sol | A Martian day is about 40 minutes longer than an Earth day. |
| Message delay to Earth | A radio signal between Mars and Earth takes about 3 to 22 minutes one way, so the crew must solve problems on their own. |
| Daily exercise | ISS astronauts exercise about 2 hours a day to protect muscles and bones; Mars gravity is about 38% of Earth's. |
| Spacesuit oxygen | Suit consumables are limited, so outside work is planned carefully. |

Game numbers (consumption and production rates) are tuned for play balance and are not real mission values.

## Game balance

We test balance with bots that play hundreds of games automatically:

| Strategy | Result |
| --- | --- |
| Stand still, do nothing | Always loses, by sol 3 |
| Fix each emergency, exercise, shelter during flares, collect ice | Wins every test game with all 3 hearts |

So a child who explores and reacts will win, and a child who ignores the base learns why it failed.

## Sources

- [NASA: Orion radiation protection plan (storm shelter from stowage bags)](https://www.nasa.gov/missions/artemis/orion/scientists-and-engineers-evaluate-orion-radiation-protection-plan/)
- [Space.com: ISS recycles 98% of crew water (2023)](https://www.space.com/astronaut-pee-iss-water-recycling-98-percent-milestone)
- [NASA: Astronaut exercise on the ISS](https://www.nasa.gov/missions/station/iss-research/astronaut-exercise)
- [NASA NTRS: Communication delay research for missions beyond low Earth orbit](https://ntrs.nasa.gov/citations/20250000703)

## Tech stack

- **React 19 + TypeScript** for UI and state
- **Tailwind CSS 4** for the HUD
- **three.js** for the 3D world
- **Vite** for the build, **Bun** for packages and tests
- Runs in any modern browser on desktop and phone, and can be added to a phone home screen

## Project structure

```
src/
  game/      Pure game logic. No React, no three.js. Easy to test.
    types.ts     All types (start reading here)
    config.ts    Every number and fact in one place
    world.ts     Movement, collisions, day/night, helpers
    engine.ts    tick(state, input, dt) → new state
    missions.ts  Starts and solves the daily emergencies
    crew.ts      Spacesuit oxygen and exercise
    problems.ts  Emergency texts and the real stories behind them
    engine.test.ts
  three/     3D rendering only (terrain, buildings, astronaut, sky)
  hooks/     use-game-loop.ts connects game logic, 3D world and input
  ui/        React + Tailwind HUD, joystick, menus
docs/
  AI_USAGE.md  Log of how AI tools were used
```

The logic and the visuals are fully separated: `tick()` decides **what happens**, `three/` only **draws** it.

## Run locally

```bash
bun install
bun dev        # http://localhost:5173
bun test       # game logic tests
bun run build  # production build in dist/
```

Contributors and AI assistants: read [CLAUDE.md](./CLAUDE.md) first.

## Deploy

Import the repository on [Vercel](https://vercel.com/new). It detects Vite automatically (build: `bun run build`, output: `dist`).

## Roadmap

- [ ] English / Mongolian language switch
- [ ] Choose Moon or Mars (14-day lunar night vs. dust storms)
- [ ] Short tutorial for the first sol
- [ ] Sound effects

## Use of AI

<!-- Required by NASA Space Apps. Update this from docs/AI_USAGE.md before submitting. -->
The team designed the game concept, rules, resource system and balance. AI coding assistants helped write parts of the code from our specifications; we reviewed, tested and changed it ourselves. Every AI-assisted change is logged in [docs/AI_USAGE.md](./docs/AI_USAGE.md). No AI-generated images, audio or NASA branding are used.

## Team LUCKY

- Munkhtuvshin Aznorov ([@azaanm7](https://github.com/azaanm7))
- *(teammate name and GitHub)*

---

### Монгол хэлээр товч

**Junior Astronaut 3D** нь хүүхдүүдэд зориулсан 3D тоглоом. Тоглогч Ангараг дээрх суурийн командлагч болж, 6 sol-ын турш хүчилтөрөгч, ус, хүнс, эрчим хүч, цацрагийн хамгаалалтыг тэнцвэржүүлнэ. Эрчим хүч хязгаартай тул бүх машиныг зэрэг асааж чадахгүй. Юуг нь түрүүлж хийхээ сонгох нь инженерүүдийн "trade-off" гэдэг ойлголт бөгөөд тоглоомын гол сургамж юм.
