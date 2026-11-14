import type { ReactNode } from "react";
import { HEARTS, SOL_SECONDS, WIN_SOL } from "../game/config";
import type { GameState } from "../game/types";
import { isDay, solOf } from "../game/world";
import { Mission } from "./mission";

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

export function Hud({ s }: { s: GameState }) {
  const sol = Math.min(WIN_SOL, solOf(s.time));
  const day = isDay(s.time);
  const progress = Math.min(100, (s.time / (WIN_SOL * SOL_SECONDS)) * 100);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="grid gap-1.5 rounded-2xl bg-black/35 p-2.5 backdrop-blur-sm">
          <Bar icon={<span>💨</span>} label="Хүчилтөрөгч" value={s.res.oxygen} color="bg-sky-400" />
          <Bar icon={<span>💧</span>} label="Ус" value={s.res.water} color="bg-blue-500" />
          <Bar icon={<span>🥕</span>} label="Хүнс" value={s.res.food} color="bg-orange-400" />
          <Bar icon={<span>🔋</span>} label="Батарей" value={s.res.battery} color="bg-yellow-400" />
          <span className="text-[11px] font-bold text-white/80">☀️ Панель {Math.round((1 - s.dust) * 100)}% цэвэр</span>
        </div>
        <div className="grid justify-items-end gap-1 rounded-2xl bg-black/35 p-2.5 text-right backdrop-blur-sm">
          <div className="font-display text-xl text-white">{day ? "☀️" : "🌙"} Sol {sol}/{WIN_SOL}</div>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-black/50"><div className="h-full bg-mars" style={{ width: `${progress}%` }} /></div>
          <div className="text-xl">{Array.from({ length: HEARTS }, (_, i) => <span key={i} className={i < s.hearts ? "" : "opacity-25 grayscale"}>❤️</span>)}</div>
          <div className="text-xs font-bold text-white/85">🧊 {s.collected} мөс түүсэн</div>
        </div>
      </div>
      <Mission s={s} />
    </div>
  );
}
