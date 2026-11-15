import { PACK_MAX } from "../game/config";
import type { GameState, Material } from "../game/types";
import { useT } from "../i18n/context";
import type { SpriteName } from "../pixel/pix";
import { Meter, Pix } from "./pix";

const MATERIALS: Material[] = ["ice", "ore", "seed"];

// Нэг тоо: дүрс + тоо. 0 бол улаан.
function Count({ icon, n, label }: { icon: SpriteName; n: number; label: string }) {
  return (
    <span aria-label={`${label}: ${n}`} className={`flex items-center gap-0.5 text-xs font-extrabold ${n > 0 ? "text-white" : "text-red-300"}`}>
      <Pix name={icon} size={16} />{n}
    </span>
  );
}

// Үүргэвч (гартаа яваа) ба суурийн агуулах. Бичвэргүй: дүрс, тоо, нүднүүд.
export function Inventory({ s }: { s: GameState }) {
  const t = useT();
  const carried: SpriteName[] = [...s.pack, ...s.samples.map((): SpriteName => "flask")];
  const full = carried.length >= PACK_MAX;
  const ready = s.crop !== null && s.crop >= 1;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 self-start rounded-xl bg-black/35 px-2 py-1.5 backdrop-blur-sm">
      <div aria-label={t.hud.pack} className="flex items-center gap-0.5">
        <Pix name="pack" size={18} className={full ? "animate-pulse" : ""} />
        {Array.from({ length: PACK_MAX }, (_, i) => (
          <span key={i} className={`grid h-5 w-5 place-items-center rounded-sm ring-1 ${full ? "bg-red-900/60 ring-red-400" : "bg-black/45 ring-white/15"}`}>
            {carried[i] && <Pix name={carried[i]} size={16} />}
          </span>
        ))}
      </div>
      <div aria-label={t.hud.store} className="flex items-center gap-2">
        <Pix name="shelter" size={18} />
        {MATERIALS.map((m) => <Count key={m} icon={m} n={s.store[m]} label={t.materials[m]} />)}
        <Count icon="part" n={s.parts} label={t.hud.parts} />
      </div>
      <div className="flex items-center gap-1" aria-label={t.items.filter}>
        <Pix name="filter" size={16} className={s.filter <= 0 ? "animate-pulse" : ""} />
        <Meter value={s.filter * 100} color="bg-yellow-300" danger={s.filter <= 0.15} className="w-8" />
      </div>
      <div className="flex items-center gap-1" aria-label={t.machines.greenhouse}>
        <Pix name={s.crop === null ? "seed" : "crop"} size={16} className={ready ? "animate-bounce" : s.crop === null ? "opacity-40 grayscale" : ""} />
        <Meter value={(s.crop ?? 0) * 100} color={ready ? "bg-lime-300" : "bg-green-500"} className="w-8" />
      </div>
    </div>
  );
}
