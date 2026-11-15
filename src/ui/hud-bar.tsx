import { HEARTS, WIN_SOL } from "../game/config";
import type { GameState } from "../game/types";
import { isDay, solOf } from "../game/world";
import { useT } from "../i18n/context";
import type { SpriteName } from "../pixel/pix";
import { dangers } from "./dangers";
import { Mission } from "./mission";
import { Pix } from "./pix";

const ROUND = "pointer-events-auto rounded-lg bg-black/40 p-1 active:scale-90";

// Утсан дээр HUD-ыг эвхэхэд үлдэх нэг нарийн мөр: sol, зүрх, аюултай нөөцийн дүрс, одоогийн ажил, товчнууд
export function HudBar({ s, onPause, onExpand }: { s: GameState; onPause: () => void; onExpand: () => void }) {
  const t = useT().hud;
  const alerts = (Object.entries(dangers(s)) as [SpriteName, boolean][]).filter(([, on]) => on).map(([icon]) => icon);
  return (
    <div className="flex items-center gap-2 rounded-xl bg-black/45 p-1.5 backdrop-blur-sm sm:hidden">
      <span className="flex items-center gap-1 font-display text-sm whitespace-nowrap text-white">
        <Pix name={isDay(s.time) ? "sun" : "moon"} size={14} />{Math.min(WIN_SOL, solOf(s.time))}/{WIN_SOL}
      </span>
      <span className="flex">{Array.from({ length: HEARTS }, (_, i) => <Pix key={i} name="heart" size={14} className={i < s.hearts ? "" : "opacity-25 grayscale"} />)}</span>
      {alerts.map((icon) => <Pix key={icon} name={icon} size={18} className="animate-pulse rounded-sm bg-red-600/70" />)}
      <button onClick={onExpand} aria-label={t.expand} className="pointer-events-auto"><Mission s={s} compact /></button>
      <span className="ml-auto flex gap-1">
        <button onClick={onPause} aria-label={t.pause} className={ROUND}><Pix name="pause" size={18} /></button>
        <button onClick={onExpand} aria-label={t.expand} className={ROUND}><Pix name="unfold" size={18} /></button>
      </span>
    </div>
  );
}
