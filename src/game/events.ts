import { EMPTY_SECONDS, FLARE_SECONDS, MACHINES, SOL_SECONDS, WIN_SOL } from "./config";
import { damageChance } from "./donki";
import type { Cause, FactId, GameState, HeartLoss, MachineId, Msg, Need } from "./types";
import { isDay, random, solOf } from "./world";

// Мэдэгдлийн кодыг хадгална. Бичвэрийг нь UI сонгосон хэлээр гаргана (i18n/index.ts: say).
export const toast = (s: GameState, msg: Msg, sec = 6): GameState => ({ ...s, toast: { msg, until: s.time + sec } });

// Баримт бүрийг нэг тоглолтод ганц удаа үзүүлнэ
export function fact(s: GameState, id: FactId, sec = 7): GameState {
  if (s.seen.includes(id)) return s;
  return toast({ ...s, seen: [...s.seen, id] }, { kind: "fact", id }, sec);
}

// Машинд материал нь дутсан уу: шүүлтүүр бөглөрсөн, хайлуулах мөсгүй, тарих үргүй
const starved = (s: GameState, id: MachineId) =>
  id === "o2" ? s.filter <= 0 : id === "recycler" ? s.melt <= 0 && s.store.ice <= 0 : s.crop === null;

// Зүрх алдахдаа тухайн үеийн нөхцөлийг тэмдэглэнэ (төгсгөлийн тайланд хэрэгтэй)
export function loseHeart(s: GameState, cause: Cause, msg: Msg): GameState {
  const machine = MACHINES.find((m) => m.makes === cause);
  const loss: HeartLoss = {
    sol: solOf(s.time), cause,
    machineOn: machine ? s.on[machine.id] : true,
    broken: machine ? s.broken === machine.id : false,
    weak: machine ? s.weak.includes(machine.id) : false,
    leak: s.problem === "leak",
    drilling: s.drill > 0,
    starved: machine ? starved(s, machine.id) : false,
    flare: s.flare > 0,
    load: s.load, dust: s.dust, storm: s.storm > 0, night: !isDay(s.time), stormSol: s.stormSol,
  };
  return toast({ ...s, hearts: s.hearts - 1, losses: [...s.losses, loss] }, msg);
}

// Дэлбэрэлт эхлэх мөч: машинуудаа унтраагаагүй бол цацраг нэгийг нь гэмтээж магадгүй (хүчтэй дэлбэрэлт бол магадлал өндөр)
function flareStarts(s: GameState): GameState {
  if (s.problem !== "flare") return s;
  if (!s.plan) s = { ...s, plan: "b" }; // шийдэж амжаагүй бол машинууд ажилласаар үлдэнэ
  if (s.plan !== "b") return s;
  const [hit, seed] = random(s.seed);
  const [pick, next] = random(seed);
  s = { ...s, seed: next };
  if (hit >= damageChance(s.solarFlare)) return toast(s, { kind: "luckyFlare" });
  const victim = MACHINES[Math.floor(pick * MACHINES.length)];
  return toast({ ...s, weak: [...s.weak.filter((m) => m !== victim.id), victim.id] }, { kind: "flareHit", machine: victim.id }, 8);
}

// Шуурга, нарны дэлбэрэлт, аюулгүй горим (хэзээ эхлэхийг missions.ts шийднэ)
export function weather(s: GameState, dt: number): GameState {
  let { flareWarn, flare, flareHit } = s;
  const storm = Math.max(0, s.storm - dt), safeMode = Math.max(0, s.safeMode - dt);
  if (flareWarn > 0) {
    flareWarn -= dt;
    if (flareWarn <= 0) { flareWarn = 0; flare = FLARE_SECONDS; flareHit = false; s = flareStarts(s); }
  }
  if (flare > 0) flare = Math.max(0, flare - dt); // гадаа байвал цацрагийн тун хурдан өснө: radiation.ts
  return { ...s, storm, safeMode, flareWarn, flare, flareHit };
}

export function checkEnd(s: GameState, dt: number): GameState {
  const out: Need | null = s.res.oxygen <= 0 ? "oxygen" : s.res.water <= 0 ? "water" : s.res.food <= 0 ? "food" : null;
  let emptyTimer = out ? s.emptyTimer + dt : 0;
  if (out && emptyTimer > EMPTY_SECONDS) { emptyTimer = 0; s = loseHeart(s, out, { kind: "needOut", need: out }); }
  s = { ...s, emptyTimer };
  if (s.hearts <= 0) return { ...s, hearts: 0, status: "lost" };
  if (s.time >= WIN_SOL * SOL_SECONDS && !s.problem) return { ...s, status: "won" };
  const night = !isDay(s.time) && isDay(s.time - dt);
  return night ? fact(s, "night") : s;
}
