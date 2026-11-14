# Junior Astronaut 3D

**Team LUCKY · NASA Space Apps Challenge 2026 · Ulaanbaatar**
Challenge: *Build a Junior Astronaut Mission Trainer*

🎮 **Play:** *(add the Vercel link here after deploy)*

A 3D browser game where kids become the commander of a small Mars outpost. Keep your crew alive for **6 sols** (Martian days) until the supply ship arrives by balancing **oxygen, water, food, power and radiation shielding**.

## The problem

Space-themed STEM content for kids usually goes one of two ways: it oversimplifies the engineering trade-offs that define a real mission, or it explains them at a level too complex to hold a young learner's attention. Very few tools make those trade-offs both tangible and fun.

## Our solution

Instead of reading about trade-offs, the player **lives them**:

- Every machine draws from **one power budget** (solar panels plus battery). The panels cannot run all three machines all day and still charge the battery for the night, so the player must **choose** which machines stay on. When power runs short, every machine slows down together.
- The greenhouse makes food but **uses water**, so growing more food means collecting more ice or running the water recycler.
- A solar flare forces the player to **drop everything** and run to the shelter.
- A dust storm cuts solar power, and afterwards the panels must be cleaned before power returns.

Every decision has a visible cost. The HUD shows the power budget as two numbers (what the sun gives, what the machines want), and a single line at the top of the screen always shows the most urgent task, so children can play without reading any rules.

At the end, a **failure report** traces every lost heart back to its cause, for example: *dust storm on sol 3 → panels 90% dusty → not enough power → oxygen maker slowed down → oxygen ran out*, with one tip for the next game. The game then explains in one sentence what a *trade-off* is and why engineers care about it.

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
- 🌙 **Night:** no sunlight, no solar power. Machines run on the battery only.
- ⚡ **Power line:** when it turns red, the machines want more than the sun gives. Turn off the machine whose bar is fullest.

You win by surviving 6 sols. You lose if the crew's 3 hearts run out.

## Science behind the game

| In the game | Real world |
| --- | --- |
| Oxygen maker | NASA's MOXIE experiment on the Perseverance rover made oxygen from Martian CO₂ (2021), up to 12 grams an hour. [1] |
| Collecting ice | Mars has water ice under its surface and at its poles. [2] |
| Dust storms | Mars dust storms can cover much of the planet and weaken solar power. A planet-wide storm in June 2018 silenced the solar-powered Opportunity rover for good. [2] [3] |
| Cleaning panels | Wind "cleaning events" restored power to the Spirit and Opportunity rovers. [3] |
| Shelter from flares | Mars has no global magnetic field and a thin atmosphere, so solar particles reach the surface. Curiosity's RAD instrument measures how much shielding astronauts will need. [2] [4] [6] |
| Blue sunsets | Fine Martian dust lets blue light through more easily, so the sky near the setting Sun looks blue. [5] |
| 1 sol | A Martian day is about 40 minutes longer than an Earth day. [2] |
| Message delay to Earth | A radio signal between Mars and Earth takes about 3 to 22 minutes one way, so the crew must solve problems on their own. [9] |
| Daily exercise | ISS astronauts exercise about 2 hours a day to protect muscles and bones; Mars gravity is about 38% of Earth's. [8] |
| Spacesuit oxygen | Suit consumables are limited, so outside work is planned carefully. |

Game numbers (consumption and production rates) are tuned for play balance and are not real mission values.

## Game balance

We test balance with bots that play hundreds of games automatically (`bun run balance`, code in `src/game/bots.ts`). The bots follow the prompt line the way a child would: fix each emergency, shelter during flares, refill the suit, clean the panels, exercise, collect ice. A "slow player" only moves 40% of the time.

| Strategy | Wins (300 games) |
| --- | --- |
| Stand still, or sit in the shelter all game | 0%, lost by sol 3 |
| Follow every prompt, but never switch a machine | 98% fast player, 77% slow player |
| Follow every prompt, water recycler off all game | 0% slow player |
| Follow every prompt **and manage power** (switch off the fullest machine when power is short) | 100% fast and slow player |

So a child who explores and reacts usually wins, a child who also manages the power budget wins every time, and a child who ignores the base reads in the failure report why it failed. `bun test` fails if a change to the numbers breaks this order.

## Sources

The numbers in square brackets in the tables above refer to this list.

1. [NASA: Perseverance science instruments (MOXIE)](https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/)
2. [NASA: Mars facts](https://science.nasa.gov/mars/facts/)
3. [NASA: Mars Exploration Rover Opportunity](https://science.nasa.gov/mission/mer-opportunity/)
4. [NASA: Curiosity science instruments (RAD)](https://science.nasa.gov/mission/msl-curiosity/science-instruments/)
5. [NASA: Sunset in Mars' Gale Crater](https://science.nasa.gov/photojournal/sunset-in-mars-gale-crater)
6. [NASA: Orion radiation protection plan (storm shelter from stowage bags)](https://www.nasa.gov/missions/artemis/orion/scientists-and-engineers-evaluate-orion-radiation-protection-plan/)
7. [Space.com: ISS recycles 98% of crew water (2023)](https://www.space.com/astronaut-pee-iss-water-recycling-98-percent-milestone)
8. [NASA: Astronaut exercise on the ISS](https://www.nasa.gov/missions/station/iss-research/astronaut-exercise)
9. [NASA NTRS: Communication delay research for missions beyond low Earth orbit](https://ntrs.nasa.gov/citations/20250000703)

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
    world.ts     Movement, collisions, day/night, power helpers
    engine.ts    tick(state, input, dt) → new state
    missions.ts  Starts and solves the daily emergencies
    crew.ts      Spacesuit oxygen and exercise
    problems.ts  Emergency texts and the real stories behind them
    events.ts    Storm and flare timers, facts, lost hearts, win/lose
    report.ts    Failure report: why each heart was lost
    bots.ts      Bots that play the game to check balance
    *.test.ts
  three/     3D rendering only (terrain, buildings, astronaut, sky)
  hooks/     use-game-loop.ts connects game logic, 3D world and input
  ui/        React + Tailwind HUD, joystick, menus
scripts/
  balance.ts   Prints the balance table above
docs/
  AI_USAGE.md  Log of how AI tools were used
```

The logic and the visuals are fully separated: `tick()` decides **what happens**, `three/` only **draws** it.

## Run locally

```bash
bun install
bun dev        # http://localhost:5173
bun test       # game logic and balance tests
bun run balance  # win rates of the balance bots
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
