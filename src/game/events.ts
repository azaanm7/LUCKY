import { EMPTY_SECONDS, FACTS, MACHINES, NEED_NAME, SOL_SECONDS, WIN_SOL } from "./config";
import type { FactId } from "./config";
import type { Cause, GameState, HeartLoss, Need } from "./types";
import { inShelter, isDay, solOf } from "./world";

export const toast = (s: GameState, text: string, sec = 6): GameState => ({ ...s, toast: { text, until: s.time + sec } });

// Баримт бүрийг нэг тоглолтод ганц удаа үзүүлнэ
export function fact(s: GameState, id: FactId, extra = "", sec = 7): GameState {
  if (s.seen.includes(id)) return s;
  return toast({ ...s, seen: [...s.seen, id] }, FACTS[id] + extra, sec);
}

// Зүрх алдахдаа тухайн үеийн нөхцөлийг тэмдэглэнэ (төгсгөлийн тайланд хэрэгтэй)
export function loseHeart(s: GameState, cause: Cause, text: string): GameState {
  const machine = MACHINES.find((m) => m.makes === cause);
  const loss: HeartLoss = {
    sol: solOf(s.time), cause,
    machineOn: machine ? s.on[machine.id] : true,
    broken: machine ? s.broken === machine.id : false,
    leak: s.problem === "leak",
    load: s.load, dust: s.dust, storm: s.storm > 0, night: !isDay(s.time), stormSol: s.stormSol,
  };
  return toast({ ...s, hearts: s.hearts - 1, losses: [...s.losses, loss] }, text);
}

// Шуурга, нарны дэлбэрэлт (хэзээ эхлэхийг missions.ts шийднэ)
export function weather(s: GameState, dt: number): GameState {
  let { flareWarn, flare, flareHit } = s;
  const storm = Math.max(0, s.storm - dt);
  if (flareWarn > 0) { flareWarn -= dt; if (flareWarn <= 0) { flareWarn = 0; flare = 6; flareHit = false; } }
  if (flare > 0) {
    flare = Math.max(0, flare - dt);
    if (!inShelter(s.player) && !flareHit) {
      flareHit = true;
      s = loseHeart(s, "radiation", "Цацрагт өртлөө! −1 ❤️ Дараагийн удаа хоргодох байр руу эрт гүй!");
    }
  }
  return { ...s, storm, flareWarn, flare, flareHit };
}

export function checkEnd(s: GameState, dt: number): GameState {
  const out: Need | null = s.res.oxygen <= 0 ? "oxygen" : s.res.water <= 0 ? "water" : s.res.food <= 0 ? "food" : null;
  let emptyTimer = out ? s.emptyTimer + dt : 0;
  if (out && emptyTimer > EMPTY_SECONDS) { emptyTimer = 0; s = loseHeart(s, out, `${NEED_NAME[out]} дууссан тул баг өвдлөө. −1 ❤️`); }
  s = { ...s, emptyTimer };
  if (s.hearts <= 0) return { ...s, hearts: 0, status: "lost" };
  if (s.time >= WIN_SOL * SOL_SECONDS && !s.problem) return { ...s, status: "won" };
  const night = !isDay(s.time) && isDay(s.time - dt);
  return night ? fact(s, "night") : s;
}
