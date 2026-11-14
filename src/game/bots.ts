import { DEPOT, GYM, MACHINES, MACHINE_POWER, REPAIRS, SHELTER, SOLAR_FIELD } from "./config";
import { createGame, tick } from "./engine";
import { acknowledge } from "./missions";
import type { GameState, Input, Machine, Vec2 } from "./types";
import { dist, inShelter, inZone, powerDemand, solarInput, solOf } from "./world";

// Тэнцвэр шалгах ботууд. Олон тоглолтыг автоматаар тоглож, аль арга барил ялдгийг хэмжинэ.
export type Bot = (s: GameState) => Input;
type Setup = (s: GameState) => GameState;

const stay: Input = { dx: 0, dz: 0, action: false };
const danger = (s: GameState) => s.flareWarn > 0 || s.flare > 0;
const nearestIce = (s: GameState) => s.ice.reduce((a, b) => (dist(a, s.player) < dist(b, s.player) ? a : b));
// effort 0..1: бот цагийнхаа хэдэн хувьд хөдөлдөг вэ (хүүхэд төгс тоглогч биш)
const resting = (s: GameState, effort: number) => Math.floor(s.time / 2) % 10 >= effort * 10;

function go(s: GameState, to: Vec2, stop = 0.5): Input {
  const dx = to.x - s.player.x, dz = to.z - s.player.z, d = Math.hypot(dx, dz);
  return d < stop ? stay : { dx: dx / d, dz: dz / d, action: false };
}

// Дэлгэцийн дээд мөрөнд гардаг яаралтай ажлууд (ui/mission.tsx-тэй ижил дараалал). Яаралтай ажилгүй бол null.
function urgent(s: GameState): Input | null {
  if (danger(s)) return go(s, SHELTER);
  if (s.suitO2 < 30 || (inShelter(s.player) && s.suitO2 < 95)) return go(s, SHELTER); // орсон бол дүүртэл цэнэглэнэ
  const repair = s.problem ? REPAIRS[s.problem] : undefined;
  if (repair && !s.carrying) return go(s, DEPOT);
  if (repair) return go(s, MACHINES.find((m) => m.id === repair.target)!.pos);
  if (s.dust > 0.5 && s.storm <= 0) return go(s, SOLAR_FIELD, 1);
  return null;
}

const needsGym = (s: GameState) => s.exercisedSol < solOf(s.time);
const chores = (s: GameState): Input => (needsGym(s) ? (inZone(s.player, GYM) ? stay : go(s, GYM)) : go(s, nearestIce(s), 0));

// Аль машины унтраалгыг өөрчлөх ёстой вэ: эрчим хүч дутвал хамгийн дүүрэн нөөцтэйг унтраана
function wrongSwitch(s: GameState): Machine | undefined {
  const level = (m: Machine) => s.res[m.makes];
  const starving = MACHINES.find((m) => !s.on[m.id] && level(m) < 35);
  if (starving) return starving;
  const short = s.load < 1 || (s.res.battery < 40 && solarInput(s) < powerDemand(s));
  const fullest = MACHINES.filter((m) => s.on[m.id] && s.broken !== m.id).sort((a, b) => level(b) - level(a));
  if (short && fullest.length > 1 && level(fullest[0]) > 45) return fullest[0];
  const plenty = s.res.battery > 60 && solarInput(s) >= powerDemand(s) + MACHINE_POWER;
  if (plenty) return MACHINES.find((m) => !s.on[m.id] && level(m) < 90);
  return MACHINES.find((m) => s.on[m.id] && level(m) > 97);
}

export const idle: Bot = () => stay;
export const shelterOnly: Bot = (s) => go(s, SHELTER); // хоргодох байрандаа л сууна

// Дээд мөрний заавар бүрийг дагана (засвар, панель, дасгал, мөс). Машиныг асааж унтраахгүй.
export const explorer = (effort = 1): Bot => (s) => urgent(s) ?? (resting(s, effort) ? stay : chores(s));

// explorer + эрчим хүчээ удирдана: дутвал хамгийн дүүрэн нөөцтэй машинаа унтраана
export const manager = (effort = 1): Bot => (s) => {
  const first = urgent(s);
  if (first) return first;
  if (resting(s, effort)) return stay;
  const fix = wrongSwitch(s);
  if (fix) return dist(s.player, fix.pos) < 1 ? { ...stay, action: true } : go(s, fix.pos, 0);
  return chores(s);
};

export function play(bot: Bot, seed: number, setup: Setup = (s) => s): GameState {
  let s = setup(createGame(seed));
  while (s.status === "playing") s = s.modal ? acknowledge(s) : tick(s, bot(s), 0.05);
  return s;
}

// games тоглолтын хэдэн хувьд нь ялсан бэ (0-100)
export function winRate(bot: Bot, games: number, setup?: Setup): number {
  let wins = 0;
  for (let i = 0; i < games; i++) if (play(bot, i * 7919 + 1, setup).status === "won") wins++;
  return Math.round((wins / games) * 100);
}
