// Тэнцвэрийн хүснэгт хэвлэнэ: `bun run balance` (README-ийн "Game balance" хэсгийн тоонууд эндээс гарна)
import { explorer, idle, manager, shelterOnly, winRate } from "../src/game/bots";
import type { Bot } from "../src/game/bots";
import type { GameState } from "../src/game/types";

const GAMES = 300;
const recyclerOff = (s: GameState): GameState => ({ ...s, on: { ...s.on, recycler: false } });
const rows: [string, Bot, ((s: GameState) => GameState)?][] = [
  ["Stand still", idle],
  ["Only shelter during flares", shelterOnly],
  ["Explore, never touch a machine (fast player)", explorer(1)],
  ["Explore, never touch a machine (slow player)", explorer(0.4)],
  ["Explore, recycler off all game (slow player)", explorer(0.4), recyclerOff],
  ["Explore and manage power (fast player)", manager(1)],
  ["Explore and manage power (slow player)", manager(0.4)],
];

console.log(`Win rate over ${GAMES} games each`);
for (const [name, bot, setup] of rows) console.log(`${String(winRate(bot, GAMES, setup)).padStart(4)}%  ${name}`);
