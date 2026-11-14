import { PROBLEMS } from "../game/problems";
import type { Modal } from "../game/types";

// Асуудал эхлэхэд: юу болсон, юу хийх вэ. Шийдсэний дараа: бодит амьдрал дээр хэрхэн шийдсэн бэ.
export function ProblemModal({ modal, onClose }: { modal: Modal; onClose: () => void }) {
  const p = PROBLEMS[modal.id];
  const brief = modal.kind === "brief";
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/45 p-4">
      <div className="grid w-full max-w-md gap-3 rounded-3xl bg-space/95 p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{brief ? p.icon : "🏅"}</span>
          <div>
            <p className="text-xs font-extrabold tracking-widest text-orange-200/70 uppercase">{brief ? "Онцгой байдал!" : "Асуудлыг шийдлээ!"}</p>
            <h2 className="font-display text-xl leading-tight">{brief ? p.title : p.badge}</h2>
          </div>
        </div>
        {brief ? (
          <>
            <p className="text-orange-50/90">{p.what}</p>
            <ol className="grid gap-1.5 rounded-2xl bg-panel p-3 font-bold">
              {p.steps.map((step, i) => <li key={step}>{i + 1}. {step}</li>)}
            </ol>
            <p className="rounded-2xl bg-sky-900/50 p-3 text-sm">
              📡 Дэлхий рүү мессеж илгээлээ. Ангараг маш хол тул хариу <b>{p.delay} минутын</b> дараа ирнэ. Тиймээс өөрөө шийдэх хэрэгтэй!
            </p>
          </>
        ) : (
          <div className="grid gap-1 rounded-2xl bg-panel p-3">
            <p className="text-xs font-extrabold tracking-widest text-emerald-300 uppercase">Бодит амьдрал дээр · {p.realTitle}</p>
            <p className="text-orange-50/90">{p.real}</p>
          </div>
        )}
        <button onClick={onClose} className="rounded-2xl bg-mars py-3.5 font-display text-lg text-[#1b0f0a] active:scale-95">
          {brief ? "Ойлголоо, шийдье! 💪" : "Үргэлжлүүлэх 🚀"}
        </button>
      </div>
    </div>
  );
}
