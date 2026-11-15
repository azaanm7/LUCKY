import { DEPOT, DRILL_O2, DRILL_SECONDS, MACHINES, MACHINE_POWER, PLAYER_SPEED, RECIPES, SAMPLES_MAX, SHELTER, SITES, SOLAR_FIELD, SUIT_USE } from "./config";
import { createGame, tick } from "./engine";
import { canCraft, packRoom } from "./gather";
import { acknowledge, advise, choose, repairTarget } from "./missions";
import type { GameState, Input, Machine, Material, PlanId, RecipeId, Vec2 } from "./types";
import { dist, idle as resting_machine, inShelter, inZone, isDay, nearMachine, powerDemand, solarInput } from "./world";

// Тэнцвэр шалгах ботууд. Олон тоглолтыг автоматаар тоглож, аль арга барил ялдгийг хэмжинэ.
export type Bot = (s: GameState) => Input;
export type Pick = (s: GameState) => PlanId; // асуудлын цонхонд аль төлөвлөгөөг сонгох вэ
type Setup = (s: GameState) => GameState;

const stay: Input = { dx: 0, dz: 0, action: false };
const press: Input = { ...stay, action: true };
const danger = (s: GameState) => s.flareWarn > 0 || s.flare > 0;
const nearest = <T extends Vec2>(s: GameState, list: T[]): T | undefined => [...list].sort((a, b) => dist(a, s.player) - dist(b, s.player))[0];
const have = (s: GameState, m: Material) => s.store[m] + s.pack.filter((x) => x === m).length;
const recipe = (id: RecipeId) => RECIPES.find((r) => r.id === id)!;
// effort 0..1: бот цагийнхаа хэдэн хувьд хөдөлдөг вэ (хүүхэд төгс тоглогч биш)
const resting = (s: GameState, effort: number) => Math.floor(s.time / 2) % 10 >= effort * 10;
// Гараар хийдэг ажлын алхмыг хүний хурдаар хийнэ (секундэд 3 орчим)
const stepNow = (s: GameState) => Math.floor(s.time / 0.35) !== Math.floor((s.time - 0.05) / 0.35);

function go(s: GameState, to: Vec2, stop = 0.5): Input {
  const dx = to.x - s.player.x, dz = to.z - s.player.z, d = Math.hypot(dx, dz);
  return d < stop ? stay : { dx: dx / d, dz: dz / d, action: false };
}
const print = (s: GameState, id: RecipeId): Input => (inZone(s.player, DEPOT) ? { ...stay, craft: id } : go(s, DEPOT));

// Дэлгэцийн дээд мөрөнд гардаг яаралтай ажлууд (ui/mission.tsx-тэй ижил дараалал). Яаралтай ажилгүй бол null.
function urgent(s: GameState): Input | null {
  const mustRun = s.flare > 0 || (s.flareWarn > 0 && s.flareWarn < 4) || s.suitO2 < 20;
  if (s.task) return mustRun ? { ...stay, cancel: true } : { ...stay, step: stepNow(s) };
  if (danger(s)) return go(s, SHELTER);
  if (s.suitO2 < 30 || (inShelter(s.player) && s.suitO2 < 95)) return go(s, SHELTER); // орсон бол дүүртэл цэнэглэнэ
  const fix = repairTarget(s); // засах машин: сэлбэг хэрэгтэй. Сэлбэггүй бол хүдрээр хэвлэнэ.
  if (fix && s.carrying) return go(s, fix.pos);
  if (fix && s.parts > 0) return go(s, DEPOT);
  if (fix && canCraft(s, recipe("part"))) return print(s, "part");
  if (s.dust > 0.5 && s.storm <= 0) return inZone(s.player, SOLAR_FIELD) ? press : go(s, SOLAR_FIELD, 1);
  return null;
}

// Суурьт одоо заавал хэрэгтэй материал (хангалттай бол null)
function needs(s: GameState): Material | null {
  if (s.crop === null && have(s, "seed") < 1) return "seed";
  if (s.parts < 1 && !s.job && have(s, "ore") < 2) return "ore";
  if (have(s, "ice") < 2) return "ice";
  if (have(s, "seed") < 1) return "seed";
  if (s.parts < 2 && have(s, "ore") < 2) return "ore";
  return have(s, "ice") < 3 ? "ice" : null;
}

// Хойшлуулж болохгүй суурийн ажил: ургац хураах, хэрэгтэй ачаагаа буулгах, сэлбэг хэвлэх
function duties(s: GameState): Input | null {
  const greenhouse = MACHINES.find((m) => m.id === "greenhouse")!;
  if (s.crop !== null && s.crop >= 1) return nearMachine(s.player) === "greenhouse" ? press : go(s, greenhouse.pos);
  const needed = (s.pack.includes("seed") && s.crop === null) || (s.pack.includes("ice") && s.store.ice < 1) || (s.parts < 1 && s.pack.filter((m) => m === "ore").length >= 2);
  if (s.pack.length && (packRoom(s) <= 1 || needed)) return go(s, nearest(s, [SHELTER, DEPOT])!);
  if (s.parts < 2 && canCraft(s, recipe("part"))) return print(s, "part");
  return null;
}

// Материал цуглуулна. extra = хэрэгцээгээ хангасан ч сайжруулалтад зориулж хүдэр цуглуулах уу
function collect(s: GameState, extra: boolean): Input {
  const next = (["panel", "tank"] as const).map(recipe).find((r) => canCraft(s, r));
  if (extra && next) return print(s, next.id); // илүүдэл хүдрээр сайжруулалт хэвлэнэ
  const kind = needs(s) ?? (extra && s.built.length < 3 ? "ore" : null);
  const target = kind ? nearest(s, s.deposits.filter((d) => d.kind === kind)) : undefined;
  if (target) return go(s, target, 0);
  return s.pack.length ? go(s, nearest(s, [SHELTER, DEPOT])!) : go(s, SHELTER); // хийх зүйлгүй бол суурьтаа амарна
}

// Аль машины унтраалгыг өөрчлөх ёстой вэ. Эрчим хүч дутвал одоо хамгийн бага хэрэгтэйг унтраана:
// хайлуулах мөсгүй ус цэвэршүүлэгч бага ус гаргадаг, ургаж буй ургацыг зогсоовол хоол хоцорно, агаар хамгийн чухал.
function wrongSwitch(s: GameState): Machine | undefined {
  const level = (m: Machine) => s.res[m.makes];
  const melting = s.melt > 0 || s.store.ice > 0;
  const spare: Record<Machine["id"], boolean> = {
    recycler: s.res.water > (melting ? 80 : 50),
    greenhouse: s.res.food > 85 && !resting_machine(s, "greenhouse"),
    o2: s.res.oxygen > 92,
  };
  const wanted: Record<Machine["id"], boolean> = { recycler: s.res.water < (melting ? 60 : 35), greenhouse: s.res.food < 70, o2: s.res.oxygen < 80 };
  const back = MACHINES.find((m) => !s.on[m.id] && wanted[m.id]);
  if (back) return back;
  const short = s.load < 1 || (s.res.battery < 40 && solarInput(s) < powerDemand(s));
  if (short) return (["recycler", "greenhouse", "o2"] as const).map((id) => MACHINES.find((m) => m.id === id)!).find((m) => s.on[m.id] && s.broken !== m.id && spare[m.id]);
  const plenty = s.res.battery > 60 && solarInput(s) >= powerDemand(s) + MACHINE_POWER;
  return plenty ? MACHINES.find((m) => !s.on[m.id] && level(m) < 95) : undefined;
}

// Шинжлэх ухааны экспедиц: тайван үед хамгийн хол (үнэтэй) талбай руу явж, буцах O2-оо үлдээгээд дээж авна
function expedition(s: GameState): Input | null {
  const walk = (a: Vec2, b: Vec2) => (dist(a, b) / PLAYER_SPEED) * SUIT_USE; // алхахад зарах O2
  const sample = (DRILL_SECONDS - s.drill) * (SUIT_USE + DRILL_O2); // дараагийн дээжид зарах O2
  const here = SITES.find((x) => inZone(s.player, x));
  if (s.samples.length) {
    const more = here && s.siteLeft[here.id] > 0 && s.samples.length < SAMPLES_MAX && packRoom(s) > 0 && s.suitO2 > sample + walk(here, SHELTER) + 14;
    return more ? stay : go(s, SHELTER);
  }
  const calm = !s.problem && isDay(s.time) && s.res.oxygen > 70 && s.filter > 0.3 && Math.min(s.res.water, s.res.food) > 45;
  const site = [...SITES].reverse().find((x) => s.siteLeft[x.id] > 0);
  if (!calm || !site) return null;
  if (s.pack.length) return go(s, nearest(s, [SHELTER, DEPOT])!); // эхлээд үүргэвчээ суллана
  if (s.suitO2 > walk(s.player, site) + sample + walk(site, SHELTER) + 14) return here === site ? stay : go(s, site, 1);
  return s.suitO2 < 95 ? go(s, SHELTER) : null; // эхлээд скафандраа цэнэглэнэ
}

export const idle: Bot = () => stay;
export const shelterOnly: Bot = (s) => go(s, SHELTER); // хоргодох байрандаа л сууна

// Дээд мөрний заавар бүрийг дагана (засвар, панель, ургац, материал). Машиныг асааж унтраахгүй, экспедицэд явахгүй.
export const explorer = (effort = 1): Bot => (s) => urgent(s) ?? (resting(s, effort) ? stay : (duties(s) ?? collect(s, false)));

// explorer + эрчим хүчээ удирдаж, сайжруулалт хэвлэнэ. science = true бол тайван үед экспедицэд явна.
export const manager = (effort = 1, science = false): Bot => (s) => {
  const first = urgent(s);
  if (first) return first;
  if (resting(s, effort) && !s.samples.length) return stay;
  const duty = s.samples.length ? null : duties(s);
  if (duty) return duty;
  const fix = wrongSwitch(s);
  if (fix && !s.samples.length) return dist(s.player, fix.pos) < 1 ? press : go(s, fix.pos, 0);
  const stocked = s.store.ice >= 1 && s.parts >= 1 && (s.crop !== null || have(s, "seed") > 0); // суурь хангалттай үед л экспедицэд явна
  return (science && stocked ? expedition(s) : null) ?? collect(s, true);
};

// pick өгөөгүй бол Дэлхийн зөвлөгөөг дагана (сэлбэггүй бол хурдан засварыг сонгоно)
export function play(bot: Bot, seed: number, setup: Setup = (s) => s, pick: Pick = advise): GameState {
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

