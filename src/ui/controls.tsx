import { DEPOT, MACHINES, SOLAR_FIELD } from "../game/config";
import type { GameState } from "../game/types";
import { inZone, nearMachine } from "../game/world";
import { useT } from "../i18n/context";
import { say } from "../i18n/index";
import { plain } from "../i18n/plain";
import type { SpriteName } from "../pixel/pix";
import { Joystick } from "./joystick";
import { Pix } from "./pix";

interface ControlsProps {
  s: GameState;
  onPress: () => void;
  onCraft: () => void; // урлангийн цонхыг нээх
  onStick: (x: number, z: number) => void;
}

// Том үйлдлийн товч: пиксел дүрс + богино нэр
function Action({ icon, label, hint, tone, onClick }: { icon: SpriteName; label: string; hint: string; tone: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-lg font-extrabold text-white shadow-xl active:scale-95 ${tone}`}>
      <Pix name={icon} size={36} />
      <span>{label}<span className="block text-xs font-bold opacity-90">{hint}</span></span>
    </button>
  );
}

export function Controls({ s, onPress, onCraft, onStick }: ControlsProps) {
  const t = useT();
  const near = nearMachine(s.player);
  const machine = MACHINES.find((m) => m.id === near);
  const harvest = near === "greenhouse" && s.crop !== null && s.crop >= 1;
  const atWorkshop = !machine && inZone(s.player, DEPOT);
  const canWipe = !machine && !atWorkshop && inZone(s.player, SOLAR_FIELD) && s.dust > 0.05;
  const note = s.toast && s.time < s.toast.until ? plain(say(t, s.toast.msg)) : null;
  return (
    <div className="safe-bottom absolute inset-x-0 bottom-0 flex flex-col gap-3 p-3">
      {note && <div className="mx-auto max-w-md rounded-2xl bg-black/60 px-4 py-2 text-center text-sm text-white backdrop-blur-sm">{note}</div>}
      <div className="flex items-end justify-between">
        <Joystick onMove={onStick} />
        {harvest && <Action icon="crop" label={t.controls.harvest} hint={`${t.machines.greenhouse} · Space`} tone="bg-green-600 animate-pulse" onClick={onPress} />}
        {machine && !harvest && (
          <Action icon="power" label={s.on[machine.id] ? t.controls.off : t.controls.on} hint={`${t.machines[machine.id]} · Space`}
            tone={s.on[machine.id] ? "bg-red-500" : "bg-emerald-500"} onClick={onPress} />
        )}
        {atWorkshop && <Action icon="printer" label={t.controls.craft} hint={`${t.world.depot} · Space`} tone="bg-violet-600" onClick={onCraft} />}
        {canWipe && <Action icon="wipe" label={plain(t.controls.wipe)} hint={t.controls.dusty(Math.round(s.dust * 100))} tone="bg-amber-500" onClick={onPress} />}
        {!machine && !atWorkshop && !canWipe && (
          <span className="hidden rounded-xl bg-black/40 px-3 py-2 text-xs font-bold text-white/80 sm:block">{t.controls.keys}</span>
        )}
      </div>
    </div>
  );
}
