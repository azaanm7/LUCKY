import { DOSE, HEARTS, SOL_SECONDS, STARS, WIN_SOL } from "../game/config";
import type { GameState } from "../game/types";
import { isDay, powerDemand, solarInput, solOf } from "../game/world";
import { useT } from "../i18n/context";
import type { SpriteName } from "../pixel/pix";
import { ITEM_ICON } from "./icons";
import { Inventory } from "./inventory";
import { Mission } from "./mission";
import { Meter, Pix } from "./pix";

interface HudProps {
  s: GameState;
  muted: boolean;
  onMute: () => void;
  onPause: () => void;
}

// Нэг жижиг заагч: пиксел дүрс + нарийн зураас. Аюултай үед улаан болж анивчина.
function Gauge({ icon, label, value, color, danger }: { icon: SpriteName; label: string; value: number; color: string; danger: boolean }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${label} ${Math.round(value)}%`}>
      <Pix name={icon} size={22} className={danger ? "animate-pulse" : ""} />
      <Meter value={value} color={color} danger={danger} className="w-14 sm:w-20" />
    </div>
  );
}

// Эрчим хүчний төсөв: нарнаас орж ирэх ба машинуудын хүсэх хэмжээ. Дутвал улаан болно.
function Power({ s }: { s: GameState }) {
  const input = Math.round(solarInput(s)), demand = powerDemand(s);
  return (
    <div className={`col-span-2 flex items-center gap-1 text-[11px] font-extrabold ${input < demand ? "text-red-300" : "text-emerald-300"}`}>
      <Pix name={isDay(s.time) ? "sun" : "moon"} size={14} />+{input}
      <Pix name="gear" size={14} className="ml-1.5" />−{demand}
      {s.load < 1 && <span className="ml-1.5 flex animate-pulse items-center gap-0.5"><Pix name="warn" size={14} />{Math.round(s.load * 100)}%</span>}
    </div>
  );
}

const ROUND = "pointer-events-auto rounded-lg bg-black/40 p-1 active:scale-90";

export function Hud({ s, muted, onMute, onPause }: HudProps) {
  const all = useT(), t = all.hud;
  const sol = Math.min(WIN_SOL, solOf(s.time));
  const progress = Math.min(100, (s.time / (WIN_SOL * SOL_SECONDS)) * 100);
  const stars = 1 + STARS.filter((n) => s.science >= n).length;
  const next = STARS.find((n) => s.science < n);
  const low = (v: number) => v < 25;
  return (
    <div className="safe-top pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-1.5 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-xl bg-black/35 p-2 backdrop-blur-sm">
          <Gauge icon="oxygen" label={t.air} value={s.res.oxygen} color="bg-cyan-300" danger={low(s.res.oxygen)} />
          <Gauge icon="battery" label={t.battery(Math.round((1 - s.dust) * 100))} value={s.res.battery} color="bg-lime-300" danger={low(s.res.battery)} />
          <Gauge icon="water" label={t.water} value={s.res.water} color="bg-sky-400" danger={low(s.res.water)} />
          <Gauge icon="suit" label={t.suit} value={s.suitO2} color="bg-white" danger={s.suitO2 < 30} />
          <Gauge icon="food" label={t.food} value={s.res.food} color="bg-orange-400" danger={low(s.res.food)} />
          <Gauge icon="rad" label={t.dose} value={(s.dose / DOSE.limit) * 100} color="bg-yellow-300" danger={s.dose > DOSE.limit * 0.7} />
          <Power s={s} />
        </div>
        <div className="grid justify-items-end gap-1 rounded-xl bg-black/35 p-2 backdrop-blur-sm">
          <div className="flex items-center gap-1 font-display text-lg whitespace-nowrap text-white"><Pix name={isDay(s.time) ? "sun" : "moon"} size={18} />Sol {sol}/{WIN_SOL}</div>
          <div className="h-2 w-24 overflow-hidden rounded-sm bg-black/50"><div className="h-full bg-mars" style={{ width: `${progress}%` }} /></div>
          <div className="flex gap-0.5">{Array.from({ length: HEARTS }, (_, i) => <Pix key={i} name="heart" size={20} className={i < s.hearts ? "" : "opacity-25 grayscale"} />)}</div>
          <div className="flex items-center gap-0.5 text-xs font-extrabold text-white">
            {[0, 1, 2].map((i) => <Pix key={i} name="star" size={16} className={i < stars ? "" : "opacity-25 grayscale"} />)}
            <Pix name="flask" size={16} className="ml-1" />{s.science}{next ? `/${next}` : ""}
          </div>
          <div className="flex gap-1.5">
            <button onClick={onPause} aria-label={t.pause} className={ROUND}><Pix name="pause" size={20} /></button>
            <button onClick={onMute} aria-label={muted ? t.unmute : t.mute} className={ROUND}><Pix name={muted ? "mute" : "sound"} size={20} /></button>
          </div>
          {s.carrying && (
            <div className="flex items-center gap-1 rounded-lg bg-yellow-300 px-1.5 py-0.5 text-xs font-extrabold text-black">
              <Pix name={ITEM_ICON[s.carrying]} size={16} />{all.items[s.carrying]}
            </div>
          )}
        </div>
      </div>
      <Inventory s={s} />
      <Mission s={s} />
    </div>
  );
}
