import type { GameState } from "../game/types";

// "Одоо юу хийх вэ?" Хамгийн яаралтай нэг ажлыг л харуулна.
function nextTask(s: GameState): { text: string; tone: string } {
  if (s.flare > 0) return { text: "☢️ Нарны дэлбэрэлт! Хоргодох байрандаа бай!", tone: "bg-red-600" };
  if (s.flareWarn > 0) return { text: `☢️ ${Math.ceil(s.flareWarn)} секундын дараа дэлбэрэлт! Хоргодох байр руу гүй!`, tone: "bg-red-600 animate-pulse" };
  if (s.storm > 0) return { text: "🌪️ Шороон шуурга! Нар бүдэг, эрчим хүч бага", tone: "bg-amber-600" };
  if (s.dust > 0.5) return { text: "🧹 Нарны панель шороотой! Шар сумаар очиж дээр нь зогс", tone: "bg-amber-600" };
  if (s.res.water < 35) return { text: "💧 Ус багасаж байна! Цэнхэр мөс түү", tone: "bg-blue-600" };
  if (s.res.battery < 12) return { text: "🔋 Батарей дуусаж байна! Нэг машинаа унтраа", tone: "bg-yellow-600" };
  if (s.res.oxygen < 35) return { text: "💨 Агаар багасаж байна! Агаар үйлдвэр асаалттай юу?", tone: "bg-sky-700" };
  if (s.res.food < 35) return { text: "🥕 Хоол багасаж байна! Хүлэмжээ асаа", tone: "bg-orange-600" };
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
