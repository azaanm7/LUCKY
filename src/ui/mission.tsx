import { DAY_PART, DUSK_WARN, MACHINES } from "../game/config";
import type { GameState, Need } from "../game/types";
import { dayPhase, isDay, solarInput, powerDemand } from "../game/world";

interface Task {
  text: string;
  tone: string;
}

const NEEDS: Need[] = ["oxygen", "water", "food"];
const LOW: Record<Need, string> = { oxygen: "💨 Агаар", water: "💧 Ус", food: "🥕 Хоол" };

// Эрчим хүч дутвал аль машиныг унтраах вэ: нөөц нь хамгийн дүүрэн байгааг
function spare(s: GameState): string {
  const on = MACHINES.filter((m) => s.on[m.id]).sort((a, b) => s.res[b.makes] - s.res[a.makes]);
  return on.length > 1 ? `${on[0].icon} ${on[0].name}ийг түр унтраа` : "";
}

// "Одоо юу хийх вэ?" Хамгийн яаралтай нэг ажлыг л харуулна.
function nextTask(s: GameState): Task {
  if (s.flare > 0) return { text: "☢️ Нарны дэлбэрэлт! Хоргодох байрандаа бай!", tone: "bg-red-600" };
  if (s.flareWarn > 0) return { text: `☢️ ${Math.ceil(s.flareWarn)} секундын дараа дэлбэрэлт! Хоргодох байр руу гүй!`, tone: "bg-red-600 animate-pulse" };
  const off = spare(s);
  if (s.storm > 0) return { text: `🌪️ Шороон шуурга! Нар бүдэг, эрчим хүч бага. ${off}`, tone: "bg-amber-600" };
  if (s.dust > 0.5) return { text: "🧹 Нарны панель шороотой! Шар сумаар очиж дээр нь зогс", tone: "bg-amber-600" };

  const short = powerDemand(s) > 0 && s.load < 0.95;
  const low = NEEDS.filter((k) => s.res[k] < 35).sort((a, b) => s.res[a] - s.res[b])[0];
  if (low) {
    const machine = MACHINES.find((m) => m.makes === low)!;
    if (!s.on[machine.id]) return { text: `${LOW[low]} багасаж байна! ${machine.icon} ${machine.name}ээ асаа`, tone: "bg-red-600" };
    if (low === "water") return { text: "💧 Ус багасаж байна! Цэнхэр мөс түү", tone: "bg-blue-600" };
    if (short) return { text: `${LOW[low]} багасаж байна, эрчим хүч хүрэхгүй! ${off}`, tone: "bg-yellow-600" };
    return { text: `${LOW[low]} бага байна. ${machine.icon} ${machine.name}ээ бүү унтраа`, tone: "bg-sky-700" };
  }

  if (!isDay(s.time)) {
    if (s.res.battery <= 0) return { text: "🌙 Батарей хоослоо. Нар гартал машинууд зогсоно", tone: "bg-black/60" };
    return { text: `🌙 Шөнө машинууд зөвхөн батарейгаар ажиллана. ${off}`, tone: "bg-indigo-600" };
  }
  const dusk = dayPhase(s.time) > DAY_PART - DUSK_WARN;
  if (dusk && off) return { text: `🌙 Шөнө болох гэж байна! Батарейгаа хэмнэ: ${off}`, tone: "bg-indigo-600" };
  // Батарей бүрэн хоосрохоос өмнө сануулна: нар хүрэхгүй, батарей 40%-аас доош
  const draining = solarInput(s) < powerDemand(s) && s.res.battery < 40;
  if (draining && off) return { text: `🔋 Нар бүх машинд хүрэхгүй, батарей цэнэглэгдэхгүй байна! ${off}`, tone: "bg-yellow-600" };
  return { text: "🧊 Мөс түүж, машинуудаа хянаарай", tone: "bg-black/45" };
}

export function Mission({ s }: { s: GameState }) {
  const t = nextTask(s);
  return (
    <div className={`self-center rounded-3xl px-4 py-2 text-center text-sm font-extrabold text-white shadow-lg ${t.tone}`}>
      {t.text}
    </div>
  );
}
