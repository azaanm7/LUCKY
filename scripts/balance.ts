// Тэнцвэрийн хүснэгт хэвлэнэ: `bun run balance` (README-ийн "Game balance" хэсгийн тоонууд эндээс гарна)
import { explorer, idle, manager, play, shelterOnly } from "../src/game/bots";
import type { Bot, Pick } from "../src/game/bots";
import { advise } from "../src/game/missions";
import { starsOf } from "../src/game/science";
import type { GameState } from "../src/game/types";

const GAMES = 300;
const recyclerOff = (s: GameState): GameState => ({ ...s, on: { ...s.on, recycler: false } });
const quick: Pick = () => "b";
const rows: [string, Bot, ((s: GameState) => GameState)?, Pick?][] = [
  ["Stand still", idle],
  ["Sit in the shelter all game", shelterOnly],
  ["Follow every prompt, never switch a machine (fast player)", explorer(1)],
  ["Follow every prompt, never switch a machine (slow player)", explorer(0.4)],
  ["Follow every prompt, recycler off all game (slow player)", explorer(0.4), recyclerOff],
  ["Manage power, always the careful plan (slow player)", manager(0.4)],
  ["Manage power, always the quick plan (slow player)", manager(0.4), undefined, quick],
  ["Manage power, follow Earth's advice (slow player)", manager(0.4), undefined, advise],
  ["Manage power and go on expeditions (fast player)", manager(1, true), undefined, advise],
];

console.log(`${GAMES} games each: win rate · hearts left · science points · games with 2 or 3 stars`);
for (const [name, bot, setup, pick] of rows) {
  const games = Array.from({ length: GAMES }, (_, i) => play(bot, i * 7919 + 1, setup, pick));
  const pct = (n: number) => `${Math.round((n / GAMES) * 100)}%`.padStart(4);
  const avg = (of: (s: GameState) => number) => (games.reduce((a, s) => a + of(s), 0) / GAMES).toFixed(1);
  const stars = (k: number) => pct(games.filter((s) => starsOf(s) >= k).length);
  console.log(`${pct(games.filter((s) => s.status === "won").length)} · ${avg((s) => s.hearts)} ♥ · ${avg((s) => s.science).padStart(4)} pts · ★★${stars(2)} ★★★${stars(3)}  ${name}`);
}
