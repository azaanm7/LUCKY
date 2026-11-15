import { DAY_PART, DUSK_WARN, MACHINES, RECIPES, SITES, TRAINING } from "../game/config";
import { canCraft, packRoom } from "../game/gather";
import { repairTarget } from "../game/missions";
import { nextTraining } from "../game/training";
import type { GameState, Need } from "../game/types";
import { dayPhase, idle, isDay, powerDemand, solarInput, works } from "../game/world";
import { useT } from "../i18n/context";
import type { Dict } from "../i18n/mn";
import { plain } from "../i18n/plain";
import type { SpriteName } from "../pixel/pix";
import { ITEM_ICON, LESSON_ICON } from "./icons";
import { Pix } from "./pix";
import { ReadAloud } from "./read-aloud";

interface Task {
  icon: SpriteName;
  text: string;
  tone: string;
}

const NEEDS: Need[] = ["oxygen", "water", "food"];

// Эрчим хүч дутвал аль машиныг унтраах вэ: нөөц нь хамгийн дүүрэн, одоо ажиллаж байгааг
function spare(s: GameState, t: Dict): string {
  const on = MACHINES.filter((m) => works(s, m.id) && !idle(s, m.id)).sort((a, b) => s.res[b.makes] - s.res[a.makes]);
  return on.length > 1 ? plain(t.mission.spare("", t.machines[on[0].id])) : "";
}

// "Одоо юу хийх вэ?" Хамгийн яаралтай нэг ажлыг л харуулна (three/actors.ts-ийн сумтай ижил дараалал).
function nextTask(s: GameState, t: Dict): Task {
  const say = t.mission;
  const part = RECIPES.find((r) => r.id === "part")!;
  const makePart: Task = canCraft(s, part) ? { icon: "printer", text: say.printPart, tone: "bg-amber-600" } : { icon: "ore", text: say.needOre, tone: "bg-amber-600" };
  if (s.flare > 0) return { icon: "rad", text: say.flareNow, tone: "bg-red-600" };
  if (s.flareWarn > 0) return { icon: "rad", text: say.flareSoon(Math.ceil(s.flareWarn)), tone: "bg-red-600 animate-pulse" };
  if (s.suitO2 < 30) return { icon: "suit", text: say.suitLow, tone: "bg-cyan-700 animate-pulse" };
  if (s.drill > 0) return { icon: "pick", text: say.drilling, tone: "bg-sky-700" };
  if (s.earthAt > 0) return { icon: "antenna", text: say.waitEarth(Math.ceil(s.earthAt - s.time)), tone: "bg-sky-700 animate-pulse" };
  const fix = repairTarget(s);
  if (fix && s.problem) {
    if (s.carrying) return { icon: ITEM_ICON[fix.item], text: say.install("", "", t.machines[fix.id]), tone: "bg-amber-600" };
    return s.parts > 0 ? { icon: "part", text: say.getPart(t.items[fix.item]), tone: "bg-amber-600" } : makePart;
  }
  const off = spare(s, t);
  if (s.storm > 0) return { icon: "storm", text: say.storm(off), tone: "bg-amber-700" };
  if (s.dust > 0.5) return { icon: "wipe", text: say.dusty, tone: "bg-amber-600" };
  if (s.crop !== null && s.crop >= 1) return { icon: "crop", text: say.harvest, tone: "bg-green-700 animate-pulse" };
  if (packRoom(s) <= 0) return { icon: "pack", text: say.packFull, tone: "bg-orange-700" };

  // Нөөц багасвал: машин нь унтраалттай юу, материал нь байна уу, эрчим хүч хүрч байна уу
  const short = powerDemand(s) > 0 && s.load < 0.95;
  const low = NEEDS.filter((k) => s.res[k] < 35).sort((a, b) => s.res[a] - s.res[b])[0];
  if (low) {
    const machine = MACHINES.find((m) => m.makes === low)!;
    const name = t.machines[machine.id], lowText = plain(say.low[low]);
    if (!s.on[machine.id]) return { icon: "power", text: say.turnOn(lowText, "", name), tone: "bg-red-600" };
    if (low === "water" && s.store.ice < 1 && s.melt <= 0) return { icon: "ice", text: say.needIce, tone: "bg-blue-600" };
    if (low === "food" && s.crop === null) return { icon: "seed", text: say.needSeed, tone: "bg-green-700" };
    if (low === "oxygen" && s.filter <= 0) return makePart;
    if (short) return { icon: "battery", text: say.noPower(lowText, off), tone: "bg-yellow-600" };
    return { icon: low, text: say.keepOn(lowText, "", name), tone: "bg-sky-700" };
  }
  if (s.samples.length) return { icon: "flask", text: say.samples(s.samples.length), tone: "bg-sky-700" };
  if (fix) return s.carrying || s.parts > 0 ? { icon: "patch", text: say.weak(t.machines[fix.id], !!s.carrying), tone: "bg-amber-700" } : makePart;
  if (s.filter <= 0.15 && s.parts < 1 && !s.job) return makePart;
  if (s.crop === null && s.store.seed < 1 && !s.pack.includes("seed")) return { icon: "seed", text: say.needSeed, tone: "bg-green-700" };
  if (s.store.ice < 1 && s.melt <= 0 && !s.pack.includes("ice")) return { icon: "ice", text: say.needIce, tone: "bg-blue-600" };

  if (isDay(s.time)) {
    const dusk = dayPhase(s.time) > DAY_PART - DUSK_WARN;
    if (dusk && off) return { icon: "moon", text: say.dusk(off), tone: "bg-indigo-600" };
    // Батарей бүрэн хоосрохоос өмнө сануулна: нар хүрэхгүй, батарей 40%-аас доош
    const draining = solarInput(s) < powerDemand(s) && s.res.battery < 40;
    if (draining && off) return { icon: "battery", text: say.draining(off), tone: "bg-yellow-600" };
  }
  const lesson = nextTraining(s); // сургалтын дараагийн алхам
  if (lesson && !s.problem) return { icon: LESSON_ICON[lesson.id], text: t.training[lesson.id], tone: "bg-emerald-700" };
  if (!isDay(s.time)) return { icon: "moon", text: s.res.battery <= 0 ? say.batteryEmpty : say.night(off), tone: "bg-indigo-600" };
  if (SITES.some((x) => s.siteLeft[x.id] > 0) && s.pack.length === 0) return { icon: "flask", text: say.science, tone: "bg-black/45" };
  return { icon: "pack", text: say.gather, tone: "bg-black/45" };
}

// Сургалтын алхмууд зургаар: хийсэн нь тэмдэглэгдэнэ, одоогийнх нь тод
function Lessons({ s }: { s: GameState }) {
  const now = nextTraining(s)?.id;
  return (
    <span className="flex items-center gap-0.5 rounded-lg bg-black/30 px-1 py-0.5">
      {TRAINING.map((step) => {
        const done = s.trained.includes(step.id);
        return <Pix key={step.id} name={done ? "check" : LESSON_ICON[step.id]} size={16} className={step.id === now ? "animate-bounce" : done ? "" : "opacity-40"} />;
      })}
    </span>
  );
}

// compact: утсан дээр HUD эвхэгдсэн үед зөвхөн дүрс нь (өнгө нь яаралтай эсэхийг харуулна)
export function Mission({ s, compact = false }: { s: GameState; compact?: boolean }) {
  const t = nextTask(s, useT());
  const training = !s.problem && s.trained.length < TRAINING.length;
  if (compact) return <span title={plain(t.text)} className={`grid h-7 w-7 place-items-center rounded-lg ${t.tone}`}><Pix name={t.icon} size={20} /></span>;
  return (
    <div className={`flex items-center gap-2 self-center rounded-2xl px-3 py-1.5 text-center text-sm font-extrabold text-white shadow-lg ${t.tone}`}>
      <Pix name={t.icon} size={24} />
      <span>{plain(t.text)}</span>
      {training && <Lessons s={s} />}
      <ReadAloud texts={[plain(t.text)]} small className="-my-1 -mr-2" />
    </div>
  );
}
