import { STARS, WIN_SOL } from "../game/config";
import { FLARES } from "../game/donki";
import { PROBLEMS } from "../game/problems";
import { starsOf } from "../game/science";
import type { GameState } from "../game/types";
import { solOf } from "../game/world";
import { FailureReport } from "./report";

const STEPS = [
  ["🕹️", "WASD / сумаар эсвэл джойстикоор алх"],
  ["🚨", "Асуудал гарвал хоёр төлөвлөгөөнөөс сонго. Аль аль нь үнэтэй!"],
  ["🔬", "Хол талбайгаас дээж авчирвал од авна. Гэхдээ скафандрын O₂-оо хар!"],
  ["🔋", "Нар бүх машинд хүрэхгүй. Нөөц нь дүүрэн машинаа унтраа"],
];

export function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-black/35 p-4">
      <div className="grid w-full max-w-sm gap-4 rounded-3xl bg-space/90 p-6 text-center shadow-2xl backdrop-blur">
        <div className="text-6xl">👩‍🚀</div>
        <h1 className="font-display text-2xl leading-tight">Бяцхан сансрын нисэгч</h1>
        <p className="text-orange-100/85">Ангараг дээрх суурийг {WIN_SOL} өдөр хамгаалж, жинхэнэ сансрын нисэгчид шиг шийдвэр гаргаарай!</p>
        <ul className="grid gap-2 text-left text-sm font-bold">
          {STEPS.map(([icon, text]) => (
            <li key={text} className="flex items-center gap-3 rounded-xl bg-panel p-2.5"><span className="text-2xl">{icon}</span>{text}</li>
          ))}
        </ul>
        <button onClick={onStart} className="rounded-2xl bg-mars py-4 font-display text-xl text-[#1b0f0a] active:scale-95">Эхлэх! 🚀</button>
      </div>
    </div>
  );
}

// Үнэлгээ: 1 од = амьд үлдсэн, 2-3 од = шинжлэх ухааны оноо
function Stars({ s }: { s: GameState }) {
  const stars = starsOf(s);
  const next = STARS.find((n) => s.science < n);
  return (
    <div className="rounded-2xl bg-panel p-3">
      <div className="text-4xl">{"⭐".repeat(stars)}<span className="opacity-30">{"⭐".repeat(3 - stars)}</span></div>
      <p className="text-sm font-bold">🔬 Шинжлэх ухаан: {s.science} оноо</p>
      {s.status === "won" && next && <p className="text-xs text-orange-100/70">Дараагийн од: {next} оноо. Хол талбайн дээж үнэтэй, гэхдээ эрсдэлтэй!</p>}
    </div>
  );
}

export function EndOverlay({ s, onRestart }: { s: GameState; onRestart: () => void }) {
  const won = s.status === "won";
  const flare = FLARES[s.flareEvent];
  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <div className="grid w-full max-w-md gap-3 rounded-3xl bg-space/95 p-5 text-center shadow-2xl">
        <div className="text-5xl">{won ? "🚀" : "💔"}</div>
        <h1 className="font-display text-2xl">{won ? "Баяр хүргэе! Багаа авралаа!" : "Энэ удаад бүтсэнгүй"}</h1>
        <p className="text-orange-100/85">{won ? `Чи суурийг ${WIN_SOL} өдөр хамгаалж, ${s.collected} мөс түүлээ.` : `Чи ${Math.min(WIN_SOL, solOf(s.time))}-р өдөр хүртэл тэслээ. Дахиад оролдоорой!`}</p>
        <Stars s={s} />
        <FailureReport s={s} />
        <div className="grid gap-2 rounded-2xl bg-panel p-4 text-left">
          <b>🏅 Чиний цолнууд ({s.solved.length}/{s.deck.length})</b>
          {s.solved.length === 0 && <p className="text-sm text-orange-100/70">Асуудал шийдвэл энд цол гарна.</p>}
          {s.solved.map((id) => (
            <p key={id} className="text-sm"><span className="mr-1">{PROBLEMS[id].icon}</span><b>{PROBLEMS[id].badge}</b> · {PROBLEMS[id].realTitle}</p>
          ))}
        </div>
        <div className="rounded-2xl bg-panel p-4 text-left text-sm">
          <b>🎓 Чи юу сурсан бэ?</b> Сансрын нисэгчид агаар, ус, хоол, эрчим хүчээ хэмнэж, эвдрэл гарвал Дэлхийгээс тусламж хүлээлгүй өөрсдөө засдаг. Юуг нь түрүүлж хийхээ сонгохыг инженерүүд <b>trade-off</b> гэдэг.
        </div>
        <p className="text-xs text-orange-100/60">
          🛰️ Энэ тоглолтын нарны дэлбэрэлт бодит: NASA DONKI архив, {flare.date}, {flare.cls} зэрэглэл. Дараагийн тоглолтод асуудлууд өөр дарааллаар гарна.
        </p>
        <button onClick={onRestart} className="rounded-2xl bg-mars py-4 font-display text-xl text-[#1b0f0a] active:scale-95">Дахин тоглох</button>
      </div>
    </div>
  );
}
