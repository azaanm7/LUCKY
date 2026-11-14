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
- A dust storm cuts solar power, and afterwards the panels must be wiped clean by hand before power returns.
- Every emergency offers **two plans and no free one**: a careful plan that takes time, or a quick plan with a lasting cost.
- Science samples lie far from the base. The farther the site, the more a sample is worth and the more spacesuit oxygen the trip costs.

Every decision has a visible cost. The HUD shows the power budget as two numbers (what the sun gives, what the machines want), and a single line at the top of the screen always shows the most urgent task, so children can play without reading any rules.

At the end, a **failure report** traces every lost heart back to its cause, for example: *dust storm on sol 3 → panels 90% dusty → not enough power → oxygen maker slowed down → oxygen ran out*, with one tip for the next game. The game then explains in one sentence what a *trade-off* is and why engineers care about it.

### Real astronaut problems

From sol 2, every sol brings one emergency that real astronauts have actually faced, **in a different order every game**. The game pauses and shows a Mission Control card with two plans. Both cost something, so the player has to weigh them. After solving it, the player reads how real astronauts handled the same problem and earns a badge.

| Emergency | Careful plan | Quick plan | What really happened |
| --- | --- | --- | --- |
| CO₂ filter clogged, oxygen maker stops | Fetch a new filter and fit it by hand; the machine is down until then | Improvise a fix now; the machine runs at half strength until properly repaired | Apollo 13 (1970): the crew built a filter adapter from tape, plastic bags and cardboard |
| Dust storm | Low-power mode: keep the battery, earn nothing | Study the storm: science points, but the instruments drain the battery | Opportunity rover (2018) went silent in a planet-wide dust storm |
| Solar flare | Safe mode: machines off and undamaged, nothing produced | Keep machines running: radiation may damage one | Artemis / Orion: the crew builds a radiation shelter from stowage bags |
| Micrometeoroid hole in the greenhouse | Fetch a patch kit; air leaks until it is sealed | Plug the hole now; the greenhouse runs at half strength | ISS (2018): the crew sealed a 2 mm hole with sealant and gauze |
| Water recycler pump fails | Fetch a spare pump | Nurse the old pump along at half strength | ISS (2023): the water system now recycles 98% of the crew's water |

**Communication delay is a decision, not a caption.** Every card has a third button: *ask Earth*. The answer takes the real one-way light time for that card (6 to 20 minutes, played as 4 to 15 seconds) and the emergency keeps running while the player waits. Earth's advice depends on the base's actual state ("your oxygen is low, patch it fast"). During a solar flare the answer arrives after the flare has already started, which teaches why a Mars crew has to decide for itself.

**Repairs are done by hand.** Fitting a part or wiping the panels opens a short hands-on task (wipe each dusty cell, tap the leaks, build the Apollo 13 adapter from cardboard, a plastic bag and tape in the right order). Time keeps running, so the player can abandon a repair to run from a flare.

### Science expeditions and stars

Surviving earns one star. The second and third stars come from science: three sample sites lie at increasing distance from the base, worth 1, 2 and 3 points per sample. Drilling is hard work and drains the spacesuit fast, samples only count once they are carried back to the shelter, and a player who runs out of oxygen is rescued but loses a heart and the samples. Safe play wins with one star; three stars need risk.

### Real NASA data in the game

The solar flare is not invented. When the game opens it asks **NASA's DONKI** space weather database for the last 30 days of solar flares and uses the strongest one as this game's flare. The start screen shows it as "today's space weather", with its class and date. The flare's class sets how likely radiation is to damage a running machine, so the real measurement drives the decision, and the card and end screen name the event again.

If the request fails or takes more than 7 seconds (no internet, school firewall), the game falls back to eight real 2024 flares embedded in `src/game/donki.ts` (for example X9.0 on 2024-10-03) and says on screen that it is using the archive. It never presents archived data as live.

A "Science and sources" page inside the game (start screen and pause menu) lists every source with a link, and says plainly that consumption and production rates are tuned for play.

### First-sol training

Sol 1 has no emergency. Instead the prompt line walks the player through six actions, one at a time, with a green arrow pointing to each: collect ice, switch a machine, wipe the panels, refill the suit, exercise, and bring back a science sample. Each step ticks off as soon as it is done, in any order, and emergencies always take priority over the training prompt.

Two needs run all game long:
- **Spacesuit oxygen** drops whenever the astronaut is outside and refills in the shelter, so every trip outside must be planned.
- **Exercise once per sol** on the treadmill. Skipping it weakens the astronaut's muscles and they walk slower, just like real astronauts in low gravity.

## How to play

| Action | Desktop | Phone |
| --- | --- | --- |
| Walk | `WASD` or arrow keys | Joystick (bottom left) |
| Turn a machine on/off | Stand on its ring, press `Space` / `E` | Tap the big button |
| Choose a plan on a card | `1` or `2`, `3` to ask Earth | Tap the plan |
| Hands-on task | Mouse over or click the targets, or `Space` per step, `Esc` to stop | Swipe or tap the targets |
| Pause | `P` or the ⏸ button (also pauses when you switch tabs) | ⏸ button |

- 👩‍🚀 **Watch your suit oxygen** outside. Go back into the shelter to refill it.
- 🚨 **Solve the daily emergency.** Spare parts are in the 📦 depot. A yellow arrow shows where to go.
- 💪 **Exercise once per sol** on the treadmill.
- 🧊 **Collect blue ice** to make water.
- 🫧 🚰 🌱 **Machines** (oxygen maker, water recycler, greenhouse) use battery power.
- 🧹 **Wipe the solar panels** after dust storms: walk to them, press the button and wipe each cell.
- 🔬 **Collect science samples** at the marked sites and carry them back to the shelter for stars.
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
| Solar flare strength | Real flares from NASA's DONKI database (2024), shown with their date and class. [10] |
| Sample collecting | Perseverance collects cores of Martian rock and soil in tubes for a possible return to Earth. [11] |
| River delta site | Jezero Crater held a lake more than 3.5 billion years ago, fed by a river delta. [11] |
| Crater site | Curiosity found organic molecules, the chemical building blocks of life, in Gale Crater rocks. [12] |

Game numbers (consumption and production rates) are tuned for play balance and are not real mission values.

## Game balance

We test balance with bots that play hundreds of games automatically (`bun run balance`, code in `src/game/bots.ts`). The bots follow the prompt line the way a child would: fix each emergency, shelter during flares, refill the suit, clean the panels, exercise, collect ice. A "slow player" only moves 40% of the time.

| Strategy | Wins (300 games) | Hearts left | Stars |
| --- | --- | --- | --- |
| Stand still, or sit in the shelter all game | 0% | 0 | none |
| Follow every prompt, but never switch a machine | 89–90% | 1.9 | 1 |
| Follow every prompt, water recycler off all game (slow player) | 0% | 0 | none |
| Manage power; always the careful plan, always the quick plan, or Earth's advice (slow player) | 100% each | 3.0 | 1 |
| Manage power **and go on expeditions** (fast player) | 100% | 3.0 | 2 stars in 86% of games, 3 stars in 5% |

So a child who reacts usually wins but loses hearts, a child who manages the power budget wins every time, and only a child who takes the risk of expeditions earns more than one star. Neither card plan is the safe one: both win, with different costs. A child who ignores the base reads in the failure report why it failed. `bun test` fails if a change to the numbers breaks this order.

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
10. [NASA CCMC: DONKI, the Space Weather Database Of Notifications, Knowledge, Information](https://ccmc.gsfc.nasa.gov/tools/DONKI/) (flare records from `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR`)
11. [NASA: Mars 2020 Perseverance rover](https://science.nasa.gov/mission/mars-2020-perseverance/)
12. [NASA: Curiosity rover](https://science.nasa.gov/mission/msl-curiosity/)

## Tech stack

- **React 19 + TypeScript** for UI and state
- **Tailwind CSS 4** for the HUD
- **three.js** for the 3D world
- **Vite** for the build, **Bun** for packages and tests
- Runs in any modern browser on desktop and phone, and can be added to a phone home screen
- Works offline after loading: the only network request is the optional NASA space weather lookup

## Project structure

```
src/
  game/      Pure game logic. No React, no three.js. Easy to test.
    types.ts     All types (start reading here)
    config.ts    Every number and fact in one place
    world.ts     Movement, collisions, day/night, power helpers
    engine.ts    tick(state, input, dt) → new state
    missions.ts  Emergency cards: two plans, asking Earth, repairs
    problems.ts  Emergency texts, plans and the real stories behind them
    donki.ts     Real solar flare records from NASA DONKI
    tasks.ts     Hands-on work: wiping panels, fitting parts
    science.ts   Sample sites, banking samples, stars
    training.ts  First-sol training checklist
    crew.ts      Spacesuit oxygen and exercise
    events.ts    Storm and flare timers, facts, lost hearts, win/lose
    report.ts    Failure report: why each heart was lost
    bots.ts      Bots that play the game to check balance
    *.test.ts
  three/     3D rendering only (terrain, buildings, astronaut, sky, science sites, supply ship)
  audio/     Sound made in code with the Web Audio API (no audio files)
  hooks/     use-game-loop.ts connects game logic, 3D world and input; use-space-weather.ts fetches live NASA flares
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
- [x] Short tutorial for the first sol
- [x] Sound effects

## Use of AI

<!-- Required by NASA Space Apps. Update this from docs/AI_USAGE.md before submitting. -->
The team designed the game concept, rules, resource system and balance. AI coding assistants helped write parts of the code from our specifications; we reviewed, tested and changed it ourselves. Every AI-assisted change is logged in [docs/AI_USAGE.md](./docs/AI_USAGE.md). No AI-generated images or audio files and no NASA branding are used; the sound effects are simple tones produced by code while the game runs.

## Team LUCKY

- Munkhtuvshin Aznorov ([@azaanm7](https://github.com/azaanm7))
- *(teammate name and GitHub)*

---

### Монгол хэлээр товч

**Junior Astronaut 3D** нь хүүхдүүдэд зориулсан 3D тоглоом. Тоглогч Ангараг дээрх суурийн командлагч болж, 6 sol-ын турш хүчилтөрөгч, ус, хүнс, эрчим хүч, цацрагийн хамгаалалтыг тэнцвэржүүлнэ. Эрчим хүч хязгаартай тул бүх машиныг зэрэг асааж чадахгүй. Юуг нь түрүүлж хийхээ сонгох нь инженерүүдийн "trade-off" гэдэг ойлголт бөгөөд тоглоомын гол сургамж юм.
