import { DAY_PART, DUSK_WARN, ITEMS, MACHINES, SITES, TRAINING } from "../game/config";
import { repairTarget } from "../game/missions";
import { nextTraining } from "../game/training";
import type { GameState, Need } from "../game/types";
import { dayPhase, isDay, powerDemand, solarInput, works } from "../game/world";
import { useT } from "../i18n/context";
import type { Dict } from "../i18n/mn";

interface Task {
  text: string;
  tone: string;
}

const NEEDS: Need[] = ["oxygen", "water", "food"];

// Эрчим хүч дутвал аль машиныг унтраах вэ: нөөц нь хамгийн дүүрэн байгааг
function spare(s: GameState, t: Dict): string {
  const on = MACHINES.filter((m) => works(s, m.id)).sort((a, b) => s.res[b.makes] - s.res[a.makes]);
  return on.length > 1 ? t.mission.spare(on[0].icon, t.machines[on[0].id]) : "";
}

// "Одоо юу хийх вэ?" Хамгийн яаралтай нэг ажлыг л харуулна (three/actors.ts-ийн сумтай ижил дараалал).
function nextTask(s: GameState, t: Dict): Task {
  const say = t.mission;
  if (s.flare > 0) return { text: say.flareNow, tone: "bg-red-600" };
  if (s.flareWarn > 0) return { text: say.flareSoon(Math.ceil(s.flareWarn)), tone: "bg-red-600 animate-pulse" };
  if (s.suitO2 < 30) return { text: say.suitLow, tone: "bg-cyan-700 animate-pulse" };
  if (s.drill > 0) return { text: say.drilling, tone: "bg-sky-700" };
  if (s.earthAt > 0) return { text: say.waitEarth(Math.ceil(s.earthAt - s.time)), tone: "bg-sky-700 animate-pulse" };
  const fix = repairTarget(s);
  if (fix && s.problem) {
    const item = ITEMS[fix.item];
    return { text: s.carrying ? say.install(item.icon, fix.icon, t.machines[fix.id]) : say.getPart(t.items[fix.item]), tone: "bg-amber-600" };
  }
  const off = spare(s, t);
  if (s.storm > 0) return { text: say.storm(off), tone: "bg-amber-700" };
  if (s.dust > 0.5) return { text: say.dusty, tone: "bg-amber-600" };

  // Нөөц багасвал: машин нь унтраалттай юу, эрчим хүч хүрч байна уу
  const short = powerDemand(s) > 0 && s.load < 0.95;
  const low = NEEDS.filter((k) => s.res[k] < 35).sort((a, b) => s.res[a] - s.res[b])[0];
  if (low) {
    const machine = MACHINES.find((m) => m.makes === low)!;
    const name = t.machines[machine.id], lowText = say.low[low];
    if (!s.on[machine.id]) return { text: say.turnOn(lowText, machine.icon, name), tone: "bg-red-600" };
    if (low === "water") return { text: say.getIce, tone: "bg-blue-600" };
    if (short) return { text: say.noPower(lowText, off), tone: "bg-yellow-600" };
    return { text: say.keepOn(lowText, machine.icon, name), tone: "bg-sky-700" };
  }
  if (s.samples.length) return { text: say.samples(s.samples.length), tone: "bg-sky-700" };
  if (fix) return { text: say.weak(t.machines[fix.id], !!s.carrying), tone: "bg-amber-700" };

  if (isDay(s.time)) {
    const dusk = dayPhase(s.time) > DAY_PART - DUSK_WARN;
    if (dusk && off) return { text: say.dusk(off), tone: "bg-indigo-600" };
    // Батарей бүрэн хоосрохоос өмнө сануулна: нар хүрэхгүй, батарей 40%-аас доош
    const draining = solarInput(s) < powerDemand(s) && s.res.battery < 40;
    if (draining && off) return { text: say.draining(off), tone: "bg-yellow-600" };
  }
  const lesson = nextTraining(s); // сургалтын дараагийн алхам
  if (lesson && !s.problem) return { text: say.lesson(s.trained.length + 1, TRAINING.length, t.training[lesson.id]), tone: "bg-emerald-700" };
  if (!isDay(s.time)) {
    if (s.res.battery <= 0) return { text: say.batteryEmpty, tone: "bg-black/60" };
    return { text: say.night(off), tone: "bg-indigo-600" };
  }
  if (SITES.some((x) => s.siteLeft[x.id] > 0)) return { text: say.science, tone: "bg-black/45" };
  return { text: say.idle, tone: "bg-black/45" };
}

export function Mission({ s }: { s: GameState }) {
  const t = nextTask(s, useT());
  return (
    <div className={`self-center rounded-3xl px-4 py-2 text-center text-sm font-extrabold text-white shadow-lg ${t.tone}`}>
      {t.text}
    </div>
  );
}
