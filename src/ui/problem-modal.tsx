import { EARTH_SECONDS_PER_MINUTE } from "../game/config";
import { damageChance } from "../game/donki";
import { PROBLEMS } from "../game/problems";
import { shelteredFlareDose } from "../game/radiation";
import type { GameState, PlanId } from "../game/types";
import { useT } from "../i18n/context";

interface ProblemModalProps {
  s: GameState;
  onChoose: (plan: PlanId) => void;
  onAsk: () => void;
  onClose: () => void;
}

const BIG = "rounded-2xl bg-mars py-3.5 font-display text-lg text-[#1b0f0a] active:scale-95";

// Хоёр төлөвлөгөө: аль аль нь үнэтэй. advice = Дэлхийн зөвлөсөн нь.
function Plans({ s, advice, onChoose }: { s: GameState; advice: PlanId | null; onChoose: (plan: PlanId) => void }) {
  const p = useT().problems[s.problem!];
  const risk = s.problem === "flare" ? ` (${Math.round(damageChance(s.solarFlare) * 100)}%)` : "";
  return (
    <div className="grid gap-2">
      {(["a", "b"] as const).map((id, i) => (
        <button key={id} onClick={() => onChoose(id)}
          className={`rounded-2xl border-2 p-3 text-left active:scale-[.98] ${advice === id ? "border-emerald-300 bg-emerald-900/50" : "border-white/15 bg-panel"}`}>
          <span className="block font-extrabold">{advice === id && "⭐ "}{p.plans[id].label} <span className="text-xs font-bold text-white/40">[{i + 1}]</span></span>
          <span className="block text-sm text-orange-100/80">{p.plans[id].cost}{id === "b" && risk}</span>
        </button>
      ))}
    </div>
  );
}

// Асуудал эхлэхэд: юу болсон, юуг сонгох вэ. Дэлхийн хариу. Шийдсэний дараа: бодит амьдрал дээр яасан бэ.
export function ProblemModal({ s, onChoose, onAsk, onClose }: ProblemModalProps) {
  const all = useT(), t = all.modal;
  const modal = s.modal!;
  const p = all.problems[modal.id], icon = PROBLEMS[modal.id].icon, delay = PROBLEMS[modal.id].delay;
  const flare = s.solarFlare;
  const title = { brief: [t.emergency, p.title, icon], answer: [t.earthReplied, p.title, "📡"], debrief: [t.solved, p.badge, "🏅"] }[modal.kind];
  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-black/45 p-4">
      <div className="grid w-full max-w-md gap-3 rounded-3xl bg-space/95 p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{title[2]}</span>
          <div>
            <p className="text-xs font-extrabold tracking-widest text-orange-200/70 uppercase">{title[0]}</p>
            <h2 className="font-display text-xl leading-tight">{title[1]}</h2>
          </div>
        </div>

        {modal.kind === "brief" && (
          <>
            <p className="text-orange-50/90">{p.what}</p>
            {modal.id === "flare" && (
              <p className="rounded-2xl bg-red-900/50 p-3 text-sm">
                🛰️ <b>{t.donkiLabel(!!flare.live)}</b> {t.donki(flare.date, flare.cls, !!flare.live)}
              </p>
            )}
            {modal.id === "flare" && (
              <p className="rounded-2xl bg-lime-900/40 p-3 text-sm">
                {t.doseInfo(Math.round(s.dose), Math.round(shelteredFlareDose(flare, false)), Math.round(shelteredFlareDose(flare, true)))}
              </p>
            )}
            <p className="text-sm font-extrabold text-orange-200">{t.choose}</p>
            <Plans s={s} advice={null} onChoose={onChoose} />
            <button onClick={onAsk} className="rounded-2xl bg-sky-900/60 p-3 text-left text-sm active:scale-[.98]">
              <b>{t.ask}</b> <span className="text-xs font-bold text-white/40">[3]</span>
              <span className="block text-sky-100/80">
                {t.askText(delay, Math.round(delay * EARTH_SECONDS_PER_MINUTE))}
              </span>
            </button>
          </>
        )}

        {modal.kind === "answer" && (s.plan ? (
          <>
            <p className="rounded-2xl bg-sky-900/50 p-3">{t.earthSays(p.why[s.advice ?? "a"])}</p>
            <p className="text-orange-50/90">{t.late}</p>
            <button onClick={onClose} className={BIG}>{t.gotIt}</button>
          </>
        ) : (
          <>
            <p className="rounded-2xl bg-sky-900/50 p-3">{t.earthSays(p.why[s.advice ?? "a"])}</p>
            <p className="text-sm font-extrabold text-orange-200">{t.adviceHint}</p>
            <Plans s={s} advice={s.advice} onChoose={onChoose} />
          </>
        ))}

        {modal.kind === "debrief" && (
          <>
            <div className="grid gap-1 rounded-2xl bg-panel p-3">
              <p className="text-xs font-extrabold tracking-widest text-emerald-300 uppercase">{t.realLife(p.realTitle)}</p>
              <p className="text-orange-50/90">{p.real}</p>
            </div>
            <button onClick={onClose} className={BIG}>{t.next}</button>
          </>
        )}
      </div>
    </div>
  );
}
