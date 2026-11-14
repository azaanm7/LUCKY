import { EARTH_SECONDS_PER_MINUTE } from "../game/config";
import { damageChance, FLARES } from "../game/donki";
import { PROBLEMS } from "../game/problems";
import type { GameState, PlanId } from "../game/types";

interface ProblemModalProps {
  s: GameState;
  onChoose: (plan: PlanId) => void;
  onAsk: () => void;
  onClose: () => void;
}

const BIG = "rounded-2xl bg-mars py-3.5 font-display text-lg text-[#1b0f0a] active:scale-95";

// Хоёр төлөвлөгөө: аль аль нь үнэтэй. advice = Дэлхийн зөвлөсөн нь.
function Plans({ s, advice, onChoose }: { s: GameState; advice: PlanId | null; onChoose: (plan: PlanId) => void }) {
  const p = PROBLEMS[s.problem!];
  const risk = s.problem === "flare" ? ` (${Math.round(damageChance(FLARES[s.flareEvent]) * 100)}%)` : "";
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
  const modal = s.modal!;
  const p = PROBLEMS[modal.id];
  const flare = FLARES[s.flareEvent];
  const title = { brief: ["Онцгой байдал!", p.title, p.icon], answer: ["Дэлхийн хариу ирлээ", p.title, "📡"], debrief: ["Асуудлыг шийдлээ!", p.badge, "🏅"] }[modal.kind];
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
                🛰️ <b>Бодит өгөгдөл · NASA DONKI архив:</b> {flare.date}-нд Наран дээр <b>{flare.cls}</b> зэрэглэлийн дэлбэрэлт бүртгэгдсэн. Тоглоомын дэлбэрэлт яг ийм хүчтэй.
              </p>
            )}
            <p className="text-sm font-extrabold text-orange-200">Аль аль нь үнэтэй. Чи юуг сонгох вэ?</p>
            <Plans s={s} advice={null} onChoose={onChoose} />
            <button onClick={onAsk} className="rounded-2xl bg-sky-900/60 p-3 text-left text-sm active:scale-[.98]">
              <b>📡 Дэлхийгээс асуух</b> <span className="text-xs font-bold text-white/40">[3]</span>
              <span className="block text-sky-100/80">
                Ангараг маш хол тул хариу <b>{p.delay} минутын</b> дараа ирнэ (тоглоомд {Math.round(p.delay * EARTH_SECONDS_PER_MINUTE)} секунд). Тэр хооронд асуудал үргэлжилнэ!
              </span>
            </button>
          </>
        )}

        {modal.kind === "answer" && (s.plan ? (
          <>
            <p className="rounded-2xl bg-sky-900/50 p-3">📡 Дэлхий: «{p.why[s.advice ?? "a"]}»</p>
            <p className="text-orange-50/90">
              Гэхдээ хариу <b>хожимдлоо</b>: чи хүлээж байх хооронд дэлбэрэлт эхэлчихсэн. Ангараг дээр яаралтай шийдвэрийг сансрын нисэгчид өөрсдөө гаргадаг.
            </p>
            <button onClick={onClose} className={BIG}>Ойлголоо 💪</button>
          </>
        ) : (
          <>
            <p className="rounded-2xl bg-sky-900/50 p-3">📡 Дэлхий: «{p.why[s.advice ?? "a"]}»</p>
            <p className="text-sm font-extrabold text-orange-200">⭐ тэмдэгтэй нь Дэлхийн зөвлөгөө. Эцсийн шийдвэр чинийх!</p>
            <Plans s={s} advice={s.advice} onChoose={onChoose} />
          </>
        ))}

        {modal.kind === "debrief" && (
          <>
            <div className="grid gap-1 rounded-2xl bg-panel p-3">
              <p className="text-xs font-extrabold tracking-widest text-emerald-300 uppercase">Бодит амьдрал дээр · {p.realTitle}</p>
              <p className="text-orange-50/90">{p.real}</p>
            </div>
            <button onClick={onClose} className={BIG}>Үргэлжлүүлэх 🚀</button>
          </>
        )}
      </div>
    </div>
  );
}
