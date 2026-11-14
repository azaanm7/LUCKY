import type { ReactNode } from "react";
import { HEARTS, ITEMS, SOL_SECONDS, STARS, WIN_SOL } from "../game/config";
import type { GameState } from "../game/types";
import { inShelter, isDay, powerDemand, solarInput, solOf } from "../game/world";
import { Mission } from "./mission";

interface HudProps {
  s: GameState;
  muted: boolean;
  onMute: () => void;
}

function Bar({ icon, label, value, color }: { icon: ReactNode; label: string; value: number; color: string }) {
  const low = value < 25;
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-center text-lg">{icon}</span>
      <div className="relative h-5 w-32 overflow-hidden rounded-full bg-black/50 sm:w-40">
        <div className={`h-full rounded-full transition-all ${low ? "animate-pulse bg-red-500" : color}`} style={{ width: `${value}%` }} />
        <span className="absolute inset-0 px-2 text-[11px] leading-5 font-extrabold text-white drop-shadow">{label}</span>
      </div>
    </div>
  );
}

// Эрчим хүчний төсөв: нарнаас орж ирэх ба машинуудын хүсэх хэмжээ. Дутвал улаан болно.
function Power({ s }: { s: GameState }) {
  const input = Math.round(solarInput(s));
  const demand = powerDemand(s);
  const short = input < demand;
  return (
    <div className={`text-[11px] leading-4 font-extrabold ${short ? "text-red-300" : "text-emerald-300"}`}>
      <div>⚡ Нар +{input} · Машин −{demand}</div>
      {s.load < 1 && <div className="animate-pulse">🐢 Машинууд {Math.round(s.load * 100)}% хүчээр</div>}
      {s.safeMode > 0 && <div className="text-amber-200">🛑 Аюулгүй горим {Math.ceil(s.safeMode)} сек</div>}
    </div>
  );
}

// Шинжлэх ухааны оноо ба од: 1 од = амьд үлдэх, 2-3 од = оноо цуглуулах
function Science({ s }: { s: GameState }) {
  const stars = 1 + STARS.filter((n) => s.science >= n).length;
  const next = STARS.find((n) => s.science < n);
  return (
    <div className="text-xs font-bold text-white/85">
      <div>{"⭐".repeat(stars)}{"☆".repeat(3 - stars)} 🔬 {s.science}{next ? `/${next}` : ""} оноо</div>
      {s.samples.length > 0 && <div className="mt-0.5 rounded-full bg-sky-300 px-2 py-0.5 font-extrabold text-black">🧪 {s.samples.length} дээж гарт</div>}
    </div>
  );
}

export function Hud({ s, muted, onMute }: HudProps) {
  const sol = Math.min(WIN_SOL, solOf(s.time));
  const progress = Math.min(100, (s.time / (WIN_SOL * SOL_SECONDS)) * 100);
  const inside = inShelter(s.player);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="grid gap-1.5 rounded-2xl bg-black/35 p-2.5 backdrop-blur-sm">
          <p className="text-[10px] font-extrabold tracking-widest text-white/70 uppercase">Суурь</p>
          <Bar icon={<span>💨</span>} label="Агаар" value={s.res.oxygen} color="bg-sky-400" />
          <Bar icon={<span>💧</span>} label="Ус" value={s.res.water} color="bg-blue-500" />
          <Bar icon={<span>🥕</span>} label="Хүнс" value={s.res.food} color="bg-orange-400" />
          <Bar icon={<span>🔋</span>} label={`Батарей · панель ${Math.round((1 - s.dust) * 100)}% цэвэр`} value={s.res.battery} color="bg-yellow-400" />
          <Power s={s} />
          <p className="mt-1 text-[10px] font-extrabold tracking-widest text-white/70 uppercase">Чи</p>
          <Bar icon={<span>👩‍🚀</span>} label={inside ? "Скафандр · цэнэглэж байна" : "Скафандрын O₂"} value={s.suitO2} color="bg-cyan-300" />
          <Bar icon={<span>💪</span>} label="Булчингийн хүч" value={s.fitness} color="bg-violet-400" />
        </div>
        <div className="grid justify-items-end gap-1 rounded-2xl bg-black/35 p-2.5 text-right backdrop-blur-sm">
          <div className="font-display text-xl whitespace-nowrap text-white">{isDay(s.time) ? "☀️" : "🌙"} Sol {sol}/{WIN_SOL}</div>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-black/50"><div className="h-full bg-mars" style={{ width: `${progress}%` }} /></div>
          <div className="flex items-center gap-2 text-xl">
            <button onClick={onMute} aria-label={muted ? "Дуу асаах" : "Дуу хаах"} className="pointer-events-auto rounded-full bg-black/40 px-2 py-1 text-sm active:scale-90">{muted ? "🔇" : "🔊"}</button>
            <span>{Array.from({ length: HEARTS }, (_, i) => <span key={i} className={i < s.hearts ? "" : "opacity-25 grayscale"}>❤️</span>)}</span>
          </div>
          <Science s={s} />
          <div className="text-xs font-bold text-white/85">🏅 {s.solved.length} асуудал шийдсэн</div>
          {s.carrying && (
            <div className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-extrabold text-black">
              {ITEMS[s.carrying].icon} {ITEMS[s.carrying].name}
            </div>
          )}
        </div>
      </div>
      <Mission s={s} />
    </div>
  );
}
