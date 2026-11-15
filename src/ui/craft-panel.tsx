import { RECIPES } from "../game/config";
import { canCraft } from "../game/gather";
import type { GameState, Material, RecipeId } from "../game/types";
import { useT } from "../i18n/context";
import { RECIPE_ICON } from "./icons";
import { Meter, Pix } from "./pix";

interface CraftPanelProps {
  s: GameState;
  onCraft: (id: RecipeId) => void;
  onClose: () => void;
}

const MATERIALS: Material[] = ["ice", "ore", "seed"];

// Урлан: зургаар харуулсан жор. Юу хийх, ямар материал хэрэгтэй, хэд байгаа, хэвлэлийн явц.
export function CraftPanel({ s, onCraft, onClose }: CraftPanelProps) {
  const all = useT(), t = all.craft;
  return (
    <div className="safe-bottom absolute inset-x-0 bottom-0 flex justify-center p-3">
      <div className="grid w-full max-w-sm gap-2.5 rounded-3xl bg-space/95 p-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <Pix name="printer" size={28} />
          <h2 className="font-display text-lg leading-tight">{t.title}</h2>
        </div>

        {s.job && (
          <div className="flex items-center gap-2 rounded-2xl bg-violet-900/60 p-2.5">
            <Pix name={RECIPE_ICON[s.job.recipe]} size={32} className="animate-pulse" />
            <div className="grid flex-1 gap-1 text-sm font-extrabold">
              {t.printing}
              <Meter value={s.job.done * 100} color="bg-violet-300" className="w-full" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {RECIPES.map((r, i) => {
            const made = s.built.filter((id) => id === r.id).length;
            const maxed = r.max > 0 && made >= r.max;
            const ok = canCraft(s, r);
            return (
              <button key={r.id} onClick={() => onCraft(r.id)} disabled={!ok} aria-label={all.recipes[r.id]}
                className={`grid justify-items-center gap-1 rounded-2xl border-2 p-2 text-center active:scale-95 ${ok ? "border-emerald-300 bg-emerald-900/50" : "border-white/10 bg-panel opacity-70"}`}>
                <Pix name={maxed ? "check" : RECIPE_ICON[r.id]} size={40} />
                <span className="text-xs leading-tight font-extrabold">{all.recipes[r.id]}</span>
                <span className="text-[10px] leading-tight text-orange-100/75">{maxed ? t.built : all.recipeUse[r.id]}</span>
                <span className="flex flex-wrap justify-center gap-1.5">
                  {MATERIALS.filter((m) => r.cost[m]).map((m) => (
                    <span key={m} className={`flex items-center text-xs font-extrabold ${s.store[m] >= r.cost[m]! ? "text-emerald-300" : "text-red-300"}`}>
                      <Pix name={m} size={16} />{s.store[m]}/{r.cost[m]}
                    </span>
                  ))}
                </span>
                <span className="text-[10px] font-bold text-white/35">[{i + 1}]{r.max > 0 && ` ${made}/${r.max}`}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-sm font-extrabold"><Pix name="part" size={18} />{all.hud.parts}: {s.parts}</span>
          <button onClick={onClose} className="rounded-xl bg-black/40 px-4 py-2 text-sm font-bold text-white/80 active:scale-95">{t.close} (Esc)</button>
        </div>
      </div>
    </div>
  );
}
