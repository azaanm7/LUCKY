import { DEPOT, DRILL_O2, DRILL_SECONDS, MACHINES, MACHINE_POWER, PLAYER_SPEED, REPAIRS, SAMPLES_MAX, SHELTER, SITES, SOLAR_FIELD, SUIT_USE } from "./config";
import { createGame, tick } from "./engine";
import { acknowledge, choose } from "./missions";
import type { GameState, Input, Machine, PlanId, Vec2 } from "./types";
import { dist, inShelter, inZone, isDay, powerDemand, solarInput } from "./world";

// Тэнцвэр шалгах ботууд. Олон тоглолтыг автоматаар тоглож, аль арга барил ялдгийг хэмжинэ.
export type Bot = (s: GameState) => Input;
export type Pick = (s: GameState) => PlanId; // асуудлын цонхонд аль төлөвлөгөөг сонгох вэ
type Setup = (s: GameState) => GameState;

const stay: Input = { dx: 0, dz: 0, action: false };
const danger = (s: GameState) => s.flareWarn > 0 || s.flare > 0;
const nearestIce = (s: GameState) => s.ice.reduce((a, b) => (dist(a, s.player) < dist(b, s.player) ? a : b));
// effort 0..1: бот цагийнхаа хэдэн хувьд хөдөлдөг вэ (хүүхэд төгс тоглогч биш)
const resting = (s: GameState, effort: number) => Math.floor(s.time / 2) % 10 >= effort * 10;
// Гараар хийдэг ажлын алхмыг хүний хурдаар хийнэ (секундэд 3 орчим)
const stepNow = (s: GameState) => Math.floor(s.time / 0.35) !== Math.floor((s.time - 0.05) / 0.35);

function go(s: GameState, to: Vec2, stop = 0.5): Input {
  const dx = to.x - s.player.x, dz = to.z - s.player.z, d = Math.hypot(dx, dz);
  return d < stop ? stay : { dx: dx / d, dz: dz / d, action: false };
}

// Дэлгэцийн дээд мөрөнд гардаг яаралтай ажлууд (ui/mission.tsx-тэй ижил дараалал). Яаралтай ажилгүй бол null.
function urgent(s: GameState): Input | null {
  const mustRun = s.flare > 0 || (s.flareWarn > 0 && s.flareWarn < 4) || s.suitO2 < 20;
  if (s.task) return mustRun ? { ...stay, cancel: true } : { ...stay, step: stepNow(s) };
  if (danger(s)) return go(s, SHELTER);
  if (s.suitO2 < 30 || (inShelter(s.player) && s.suitO2 < 95)) return go(s, SHELTER); // орсон бол дүүртэл цэнэглэнэ
  const repair = s.problem && s.plan === "a" ? REPAIRS[s.problem] : undefined;
  const target = repair ? MACHINES.find((m) => m.id === repair.target) : s.problem ? undefined : MACHINES.find((m) => m.id === s.weak[0]);
  if (target) return go(s, s.carrying ? target.pos : DEPOT);
  if (s.dust > 0.5 && s.storm <= 0) return inZone(s.player, SOLAR_FIELD) ? { ...stay, action: true } : go(s, SOLAR_FIELD, 1);
  return null;
}

const chores = (s: GameState): Input => go(s, nearestIce(s), 0);

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

// Шинжлэх ухааны экспедиц: тайван үед хамгийн хол (үнэтэй) талбай руу явж, буцах O2-оо үлдээгээд дээж авна
function expedition(s: GameState): Input | null {
  const walk = (a: Vec2, b: Vec2) => (dist(a, b) / PLAYER_SPEED) * SUIT_USE; // алхахад зарах O2
  const sample = (DRILL_SECONDS - s.drill) * (SUIT_USE + DRILL_O2); // дараагийн дээжид зарах O2
  const here = SITES.find((x) => inZone(s.player, x));
  if (s.samples.length) {
    const more = here && s.siteLeft[here.id] > 0 && s.samples.length < SAMPLES_MAX && s.suitO2 > sample + walk(here, SHELTER) + 14;
    return more ? stay : go(s, SHELTER);
  }
  const calm = !s.problem && isDay(s.time) && Math.min(s.res.oxygen, s.res.water, s.res.food) > 45;
  const site = [...SITES].reverse().find((x) => s.siteLeft[x.id] > 0);
  if (!calm || !site) return null;
  if (s.suitO2 > walk(s.player, site) + sample + walk(site, SHELTER) + 14) return here === site ? stay : go(s, site, 1);
  return s.suitO2 < 95 ? go(s, SHELTER) : null; // эхлээд скафандраа цэнэглэнэ
}

export const idle: Bot = () => stay;
export const shelterOnly: Bot = (s) => go(s, SHELTER); // хоргодох байрандаа л сууна

// Дээд мөрний заавар бүрийг дагана (засвар, панель, мөс). Машиныг асааж унтраахгүй, экспедицэд явахгүй.
export const explorer = (effort = 1): Bot => (s) => urgent(s) ?? (resting(s, effort) ? stay : chores(s));

// explorer + эрчим хүчээ удирдана. science = true бол тайван үед экспедицэд явна.
export const manager = (effort = 1, science = false): Bot => (s) => {
  const first = urgent(s);
  if (first) return first;
  if (resting(s, effort) && !s.samples.length) return stay;
  const fix = wrongSwitch(s);
  if (fix && !s.samples.length) return dist(s.player, fix.pos) < 1 ? { ...stay, action: true } : go(s, fix.pos, 0);
  return (science ? expedition(s) : null) ?? chores(s);
};

export function play(bot: Bot, seed: number, setup: Setup = (s) => s, pick: Pick = () => "a"): GameState {
  let s = setup(createGame(seed));
  while (s.status === "playing") {
    if (!s.modal) s = tick(s, bot(s), 0.05);
    else s = s.modal.kind === "debrief" || s.plan ? acknowledge(s) : choose(s, pick(s));
  }
  return s;
}

// games тоглолтын хэдэн хувьд нь ялсан бэ (0-100)
export function winRate(bot: Bot, games: number, setup?: Setup, pick?: Pick): number {
  let wins = 0;
  for (let i = 0; i < games; i++) if (play(bot, i * 7919 + 1, setup, pick).status === "won") wins++;
  return Math.round((wins / games) * 100);
}
