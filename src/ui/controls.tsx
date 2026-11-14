import { MACHINES } from "../game/config";
import type { GameState } from "../game/types";
import { nearMachine } from "../game/world";
import { Joystick } from "./joystick";

interface ControlsProps {
  s: GameState;
  onPress: () => void;
  onStick: (x: number, z: number) => void;
}

export function Controls({ s, onPress, onStick }: ControlsProps) {
  const near = nearMachine(s.player);
  const machine = MACHINES.find((m) => m.id === near);
  const fact = s.toast && s.time < s.toast.until ? s.toast.text : null;
  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-3">
      {fact && (
        <div className="mx-auto max-w-md rounded-2xl bg-black/60 px-4 py-2.5 text-center text-sm text-white backdrop-blur-sm">
          <b>💡 Мэдсэн үү?</b> {fact}
        </div>
      )}
      <div className="flex items-end justify-between">
        <Joystick onMove={onStick} />
        {machine ? (
          <button
            onClick={onPress}
            className={`rounded-3xl px-5 py-4 text-lg font-extrabold text-white shadow-xl active:scale-95 ${s.on[machine.id] ? "bg-red-500" : "bg-emerald-500"}`}
          >
            {machine.icon} {s.on[machine.id] ? "Унтраах" : "Асаах"}
            <span className="block text-xs font-bold opacity-90">{machine.name} · Space</span>
          </button>
        ) : (
          <span className="hidden rounded-xl bg-black/40 px-3 py-2 text-xs font-bold text-white/80 sm:block">WASD / ← ↑ → ↓ алхах · Space асаах</span>
        )}
      </div>
    </div>
  );
}
