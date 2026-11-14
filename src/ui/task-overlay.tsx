import { useState } from "react";
import { TASK_STEPS } from "../game/config";
import type { GameState } from "../game/types";
import { useT } from "../i18n/context";

interface TaskOverlayProps {
  s: GameState;
  onStep: () => void;
  onCancel: () => void;
}

const SHOWN = [2, 0, 1]; // товчнуудыг холилдуулж харуулна
const HOLES = [[22, 30], [68, 62], [40, 78]]; // нүхнүүдийн байрлал (%)

// Гараар хийдэг ажил: алхам бүр амжилттай болоход onStep дуудна. Space дарж ч алхам хийж болно.
export function TaskOverlay({ s, onStep, onCancel }: TaskOverlayProps) {
  const t = useT().task;
  const task = s.task!;
  const total = TASK_STEPS[task.kind];
  const index = Math.round(task.done * total); // хэддүгээр алхам дээр байна
  const [wiped, setWiped] = useState<number[]>([]);
  const [wrong, setWrong] = useState(-1);
  const hurry = s.flareWarn > 0 || s.flare > 0 ? t.hurryFlare : s.suitO2 < 30 ? t.hurryO2 : "";

  const wipe = (e: React.PointerEvent) => {
    const cell = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.dataset.cell;
    if (cell === undefined || wiped.includes(+cell)) return;
    setWiped([...wiped, +cell]);
    onStep();
  };
  const pick = (part: number) => {
    if (part === index) return onStep();
    setWrong(part);
    setTimeout(() => setWrong(-1), 300);
  };

  return (
    <div className="safe-bottom absolute inset-x-0 bottom-0 flex justify-center p-3">
      <div className="grid w-full max-w-sm gap-3 rounded-3xl bg-space/95 p-4 shadow-2xl">
        <div>
          <h2 className="font-display text-lg leading-tight">{t[task.kind][0]}</h2>
          <p className="text-sm text-orange-100/80">{t[task.kind][1]}</p>
        </div>
        {hurry && <p className="animate-pulse rounded-xl bg-red-600 px-3 py-1.5 text-center text-sm font-extrabold">{hurry}</p>}

        {task.kind === "wipe" && (
          <div onPointerMove={wipe} onPointerDown={wipe} className="grid touch-none grid-cols-3 gap-1.5 rounded-2xl bg-black/40 p-2">
            {Array.from({ length: total }, (_, i) => (
              <div key={i} data-cell={i} className={`h-14 rounded-lg transition-colors ${wiped.includes(i) ? "bg-[#1f3d6b]" : "bg-[#a5683e]"}`} />
            ))}
          </div>
        )}
        {task.kind === "filter" && (
          <div className="grid grid-cols-3 gap-2">
            {SHOWN.map((part) => (
              <button key={part} onClick={() => pick(part)} disabled={part < index}
                className={`rounded-2xl p-3 text-sm font-extrabold active:scale-95 ${part < index ? "bg-emerald-700/60 opacity-60" : wrong === part ? "bg-red-600" : "bg-panel"}`}>
                <span className="block text-xs text-white/50">{part + 1}</span>{t.parts[part]}
              </button>
            ))}
          </div>
        )}
        {task.kind === "patch" && (
          <div className="relative h-36 rounded-2xl bg-[#d9fff0]/20">
            <button onClick={onStep} style={{ left: `${HOLES[index % 3][0]}%`, top: `${HOLES[index % 3][1]}%` }}
              className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-black text-2xl ring-4 ring-sky-300 active:scale-90">💨</button>
          </div>
        )}
        {task.kind === "pump" && (
          <button onClick={onStep} className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-panel text-6xl shadow-xl active:scale-95">
            <span className="transition-transform" style={{ transform: `rotate(${index * 60}deg)` }}>🔧</span>
          </button>
        )}

        <div className="h-3 overflow-hidden rounded-full bg-black/50"><div className="h-full bg-emerald-400 transition-all" style={{ width: `${task.done * 100}%` }} /></div>
        <button onClick={onCancel} className="rounded-xl bg-black/40 py-2 text-sm font-bold text-white/80 active:scale-95">{t.cancel}</button>
      </div>
    </div>
  );
}
