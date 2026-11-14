import { ITEMS, MACHINES, REPAIRS } from "../game/config";
import { PROBLEMS } from "../game/problems";
import type { GameState } from "../game/types";
import { solOf } from "../game/world";

// "Одоо юу хийх вэ?" Хамгийн яаралтай нэг ажлыг л харуулна (scene.ts-ийн сумтай ижил дараалал).
function nextTask(s: GameState): { text: string; tone: string } {
  if (s.flare > 0) return { text: "☢️ Нарны дэлбэрэлт! Хоргодох байрандаа бай!", tone: "bg-red-600" };
  if (s.flareWarn > 0) return { text: `☢️ ${Math.ceil(s.flareWarn)} секундын дараа дэлбэрэлт! Хоргодох байр руу гүй!`, tone: "bg-red-600 animate-pulse" };
  if (s.suitO2 < 30) return { text: "👩‍🚀 Скафандрын O₂ дуусаж байна! Хоргодох байр руу буц!", tone: "bg-cyan-700 animate-pulse" };
  const repair = s.problem ? REPAIRS[s.problem] : undefined;
  if (repair && !s.carrying) return { text: `${PROBLEMS[s.problem!].icon} 📦 Агуулахаас ${ITEMS[repair.item].name} ав`, tone: "bg-amber-600" };
  if (repair) {
    const m = MACHINES.find((x) => x.id === repair.target)!;
    return { text: `${ITEMS[repair.item].icon} ${m.icon} ${m.name} руу аваачиж зас`, tone: "bg-amber-600" };
  }
  if (s.storm > 0) return { text: "🌪️ Шороон шуурга! Шаардлагагүй машинаа унтрааж цахилгаан хэмнэ", tone: "bg-amber-700" };
  if (s.dust > 0.5) return { text: "🧹 Нарны панель шороотой! Шар сумаар очиж дээр нь зогс", tone: "bg-amber-600" };
  if (s.res.water < 35) return { text: "💧 Ус багасаж байна! Цэнхэр мөс түү", tone: "bg-blue-600" };
  if (s.res.battery < 12) return { text: "🔋 Батарей дуусаж байна! Нэг машинаа унтраа", tone: "bg-yellow-600" };
  if (s.exercisedSol < solOf(s.time)) return { text: "💪 Өнөөдөр дасгал хийгээгүй байна. Гүйлтийн зам дээр 3 секунд зогс", tone: "bg-violet-700" };
  return { text: "🧊 Мөс түүж, машинуудаа хянаарай", tone: "bg-black/45" };
}

export function Mission({ s }: { s: GameState }) {
  const t = nextTask(s);
  return (
    <div className={`self-center rounded-full px-4 py-2 text-center text-sm font-extrabold text-white shadow-lg ${t.tone}`}>
      {t.text}
    </div>
  );
}
