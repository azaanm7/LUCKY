import { EARTH_SECONDS_PER_MINUTE, REPAIRS } from "../game/config";
import { damageChance } from "../game/donki";
import { PROBLEMS } from "../game/problems";
import type { GameState, PlanId } from "../game/types";
import { useT } from "../i18n/context";
import { plain } from "../i18n/plain";
import { PLAN_ICON, PROBLEM_ICON } from "./icons";
import { Pix } from "./pix";

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
          <span className="flex items-center gap-2 font-extrabold">
            <Pix name={PLAN_ICON[s.problem!][id]} size={28} />
            <span>{plain(p.plans[id].label)} <span className="text-xs font-bold text-white/40">[{i + 1}]</span></span>
            {advice === id && <Pix name="star" size={20} className="ml-auto" />}
          </span>
          <span className="block text-sm text-orange-100/80">{p.plans[id].cost}{id === "b" && risk}</span>
          {id === "a" && REPAIRS[s.problem!] && ( // бүрэн засварт бэлэн сэлбэг хэрэгтэй
            <span className={`mt-1 flex items-center gap-1 text-xs font-extrabold ${s.parts > 0 ? "text-emerald-300" : "text-red-300"}`}><Pix name="part" size={16} />{s.parts}/1</span>
          )}
        </button>
      ))}
    </div>
  );
}

// Асуудал эхлэхэд: юу болсон, юуг сонгох вэ. Дэлхийн хариу. Шийдсэний дараа: бодит амьдрал дээр яасан бэ.
export function ProblemModal({ s, onChoose, onAsk, onClose }: ProblemModalProps) {
  const all = useT(), t = all.modal;
  const modal = s.modal!;
  const p = all.problems[modal.id], delay = PROBLEMS[modal.id].delay;
  const flare = s.solarFlare;
  const title = { brief: [t.emergency, p.title], answer: [t.earthReplied, p.title], debrief: [t.solved, p.badge] }[modal.kind];
  const icon = modal.kind === "brief" ? PROBLEM_ICON[modal.id] : modal.kind === "answer" ? "antenna" : "star";
  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-black/45 p-4">
      <div className="grid w-full max-w-md gap-3 rounded-3xl bg-space/95 p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <Pix name={icon} size={56} />
          <div>
            <p className="text-xs font-extrabold tracking-widest text-orange-200/70 uppercase">{title[0]}</p>
            <h2 className="font-display text-xl leading-tight">{title[1]}</h2>
          </div>
        </div>

        {modal.kind === "brief" && (
          <>
            <p className="text-sm text-orange-50/90">{p.what}</p>
            {modal.id === "flare" && ( // бодит өгөгдөл: NASA DONKI-ийн дэлбэрэлтийн огноо, зэрэглэл
              <p className="flex items-center gap-2 rounded-2xl bg-red-900/50 p-2 text-xs">
                <Pix name="rad" size={24} />
                <span><b>{t.donkiLabel(!!flare.live)}</b> {flare.date} · <b className="text-base">{flare.cls}</b></span>
              </p>
            )}
            <Plans s={s} advice={null} onChoose={onChoose} />
            <button onClick={onAsk} className="flex items-center gap-2 rounded-2xl bg-sky-900/60 p-2.5 text-left text-sm active:scale-[.98]">
              <Pix name="antenna" size={28} />
              <span>
                <b>{plain(t.ask)}</b> <span className="text-xs font-bold text-white/40">[3]</span>
                <span className="block text-xs text-sky-100/80">{t.askShort(delay, Math.round(delay * EARTH_SECONDS_PER_MINUTE))}</span>
              </span>
            </button>
          </>
        )}

        {modal.kind === "answer" && (s.plan ? (
          <>
            <p className="rounded-2xl bg-sky-900/50 p-3">{plain(t.earthSays(p.why[s.advice ?? "a"]))}</p>
            <p className="text-orange-50/90">{t.late}</p>
            <button onClick={onClose} className={BIG}>{plain(t.gotIt)}</button>
          </>
        ) : (
          <>
            <p className="rounded-2xl bg-sky-900/50 p-3">{plain(t.earthSays(p.why[s.advice ?? "a"]))}</p>
            <Plans s={s} advice={s.advice} onChoose={onChoose} />
          </>
        ))}

        {modal.kind === "debrief" && (
          <>
            <div className="grid gap-1 rounded-2xl bg-panel p-3">
              <p className="text-xs font-extrabold tracking-widest text-emerald-300 uppercase">{t.realLife(p.realTitle)}</p>
              <p className="text-orange-50/90">{p.real}</p>
            </div>
            <button onClick={onClose} className={BIG}>{plain(t.next)}</button>
          </>
        )}
      </div>
    </div>
  );
}
