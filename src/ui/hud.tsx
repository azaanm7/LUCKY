import type { ReactNode } from "react";
import { HEARTS, ITEMS, SOL_SECONDS, STARS, TRAINING, WIN_SOL } from "../game/config";
import type { GameState } from "../game/types";
import { inShelter, isDay, powerDemand, solarInput, solOf } from "../game/world";
import { useT } from "../i18n/context";
import { Mission } from "./mission";

interface HudProps {
  s: GameState;
  muted: boolean;
  onMute: () => void;
  onPause: () => void;
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
  const t = useT().hud;
  const input = Math.round(solarInput(s));
  const demand = powerDemand(s);
  const short = input < demand;
  return (
    <div className={`text-[11px] leading-4 font-extrabold ${short ? "text-red-300" : "text-emerald-300"}`}>
      <div>{t.power(input, demand)}</div>
      {s.load < 1 && <div className="animate-pulse">{t.slow(Math.round(s.load * 100))}</div>}
      {s.safeMode > 0 && <div className="text-amber-200">{t.safeMode(Math.ceil(s.safeMode))}</div>}
    </div>
  );
}

// Шинжлэх ухааны оноо ба од: 1 од = амьд үлдэх, 2-3 од = оноо цуглуулах
function Science({ s }: { s: GameState }) {
  const t = useT().hud;
  const stars = 1 + STARS.filter((n) => s.science >= n).length;
  const next = STARS.find((n) => s.science < n);
  return (
    <div className="text-xs font-bold text-white/85">
      <div>{"⭐".repeat(stars)}{"☆".repeat(3 - stars)} 🔬 {s.science}{next ? `/${next}` : ""} {t.points}</div>
      {s.samples.length > 0 && <div className="mt-0.5 rounded-full bg-sky-300 px-2 py-0.5 font-extrabold text-black">{t.samples(s.samples.length)}</div>}
    </div>
  );
}

const ROUND = "pointer-events-auto rounded-full bg-black/40 px-2 py-1 text-sm active:scale-90";

export function Hud({ s, muted, onMute, onPause }: HudProps) {
  const sol = Math.min(WIN_SOL, solOf(s.time));
  const progress = Math.min(100, (s.time / (WIN_SOL * SOL_SECONDS)) * 100);
  const inside = inShelter(s.player);
  const all = useT(), t = all.hud;
  return (
    <div className="safe-top pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="grid gap-1.5 rounded-2xl bg-black/35 p-2.5 backdrop-blur-sm">
          <p className="text-[10px] font-extrabold tracking-widest text-white/70 uppercase">{t.base}</p>
          <Bar icon={<span>💨</span>} label={t.air} value={s.res.oxygen} color="bg-sky-400" />
          <Bar icon={<span>💧</span>} label={t.water} value={s.res.water} color="bg-blue-500" />
          <Bar icon={<span>🥕</span>} label={t.food} value={s.res.food} color="bg-orange-400" />
          <Bar icon={<span>🔋</span>} label={t.battery(Math.round((1 - s.dust) * 100))} value={s.res.battery} color="bg-yellow-400" />
          <Power s={s} />
          <p className="mt-1 text-[10px] font-extrabold tracking-widest text-white/70 uppercase">{t.you}</p>
          <Bar icon={<span>👩‍🚀</span>} label={inside ? t.suitCharging : t.suit} value={s.suitO2} color="bg-cyan-300" />
        </div>
        <div className="grid justify-items-end gap-1 rounded-2xl bg-black/35 p-2.5 text-right backdrop-blur-sm">
          <div className="font-display text-xl whitespace-nowrap text-white">{isDay(s.time) ? "☀️" : "🌙"} Sol {sol}/{WIN_SOL}</div>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-black/50"><div className="h-full bg-mars" style={{ width: `${progress}%` }} /></div>
          <div className="text-xl whitespace-nowrap">{Array.from({ length: HEARTS }, (_, i) => <span key={i} className={i < s.hearts ? "" : "opacity-25 grayscale"}>❤️</span>)}</div>
          <div className="flex gap-1.5">
            <button onClick={onPause} aria-label={t.pause} className={ROUND}>⏸️</button>
            <button onClick={onMute} aria-label={muted ? t.unmute : t.mute} className={ROUND}>{muted ? "🔇" : "🔊"}</button>
          </div>
          <Science s={s} />
          <div className="text-xs font-bold text-white/85">{t.solved(s.solved.length)}</div>
          {s.trained.length < TRAINING.length && <div className="text-xs font-bold text-emerald-300">{t.training(s.trained.length, TRAINING.length)}</div>}
          {s.carrying && (
            <div className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-extrabold text-black">
              {ITEMS[s.carrying].icon} {all.items[s.carrying]}
            </div>
          )}
        </div>
      </div>
      <Mission s={s} />
    </div>
  );
}
