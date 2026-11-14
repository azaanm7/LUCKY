import { useEffect, useRef, useState } from "react";
import { FACTS, WIN_SOL } from "../game/config";
import { Cockpit } from "./cockpit";
import type { LandingPhase } from "./cockpit";
import { SpaceWeather } from "./space-weather";
import type { Weather } from "./space-weather";

const STEPS = [
  ["🕹️", "WASD / сумаар эсвэл джойстикоор алх"],
  ["🚨", "Асуудал гарвал хоёр төлөвлөгөөнөөс сонго. Аль аль нь үнэтэй!"],
  ["🔬", "Хол талбайгаас дээж авчирвал од авна. Гэхдээ скафандрын O₂-оо хар!"],
  ["🔋", "Нар бүх машинд хүрэхгүй. Нөөц нь дүүрэн машинаа унтраа"],
];

// Газардах дараалал (миллисекунд). "dark" үед нүд анисан байх хооронд тоглоом эхэлнэ.
const TIMELINE: { phase: LandingPhase; at: number; caption?: string }[] = [
  { phase: "approach", at: 0, caption: FACTS.trip },
  { phase: "approach", at: 3200, caption: FACTS.red },
  { phase: "entry", at: 6400, caption: FACTS.landing },
  { phase: "close", at: 10600, caption: "Сэгсрэлт хүчтэй байна... Нүдээ ань! 😌" },
  { phase: "dark", at: 11500 },
  { phase: "open", at: 12200 }, // зовхины animation дуусахад onDone дуудна
];
const SKIP_FROM = 3; // "Алгасах" дарвал нүд анихаас эхэлнэ

interface LandingProps {
  weather: Weather; // NASA DONKI-ийн өнөөдрийн мэдээ (App.tsx: useSpaceWeather)
  onSources: () => void;
  onLand: () => void; // нүд анисан үед тоглоомыг эхлүүлнэ
  onDone: () => void; // нүд бүрэн нээгдсэний дараа
}

// Эхлэх дэлгэц: хөлгийн цонхоор Ангарагийг харж, ойртож, агаар мандалд орж, нүдээ аниад нээхэд тоглоом эхэлнэ
export function Landing({ weather, onSources, onLand, onDone }: LandingProps) {
  const [phase, setPhase] = useState<LandingPhase>("title");
  const [caption, setCaption] = useState("");
  const timer = useRef(0);
  const cb = useRef({ onLand, onDone });
  useEffect(() => { cb.current = { onLand, onDone }; });
  useEffect(() => () => clearTimeout(timer.current), []);

  // Алхам бүр өмнөхөө дууссаны дараа эхэлнэ (компьютер удаан байсан ч дараалал алдагдахгүй)
  function run(i: number) {
    clearTimeout(timer.current);
    const step = TIMELINE[i];
    if (step.phase === "dark") cb.current.onLand();
    setPhase(step.phase);
    setCaption(step.caption ?? "");
    const next = TIMELINE[i + 1];
    if (next) timer.current = window.setTimeout(() => run(i + 1), next.at - step.at);
  }

  const inCockpit = phase !== "dark" && phase !== "open";
  const lids = phase === "close" || phase === "dark" ? "lids-closed" : phase === "open" ? "lids-open" : "";

  return (
    <div className={`absolute inset-0 z-20 ${phase === "open" ? "pointer-events-none" : ""}`}>
      {inCockpit && <Cockpit phase={phase} />}

      {phase === "title" && (
        <div className="absolute inset-0 flex flex-col items-center justify-between gap-4 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mt-2 rounded-2xl bg-black/45 px-5 py-3 text-center backdrop-blur-sm">
            <h1 className="font-display text-2xl leading-tight sm:text-3xl">Бяцхан сансрын нисэгч</h1>
            <p className="text-sm text-orange-100/85 sm:text-base">Ангараг руу ойртож байна. Суурийг {WIN_SOL} өдөр хамгаал!</p>
          </div>
          <div className="grid w-full max-w-sm gap-3 rounded-3xl bg-space/85 p-4 shadow-2xl backdrop-blur">
            <ul className="grid gap-1.5 text-left text-sm font-bold">
              {STEPS.map(([icon, text]) => (
                <li key={text} className="flex items-center gap-3 rounded-xl bg-panel p-2"><span className="text-xl">{icon}</span>{text}</li>
              ))}
            </ul>
            <SpaceWeather {...weather} />
            <button autoFocus onClick={() => run(0)} className="rounded-2xl bg-mars py-4 font-display text-xl text-[#1b0f0a] active:scale-95">Газардах! 🚀</button>
            <button onClick={onSources} className="text-sm font-bold text-sky-300 underline">📚 Шинжлэх ухаан ба эх сурвалж</button>
          </div>
        </div>
      )}

      {caption && inCockpit && phase !== "title" && (
        <p key={caption} className="caption-in absolute inset-x-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] mx-auto max-w-md rounded-2xl bg-black/65 p-4 text-center font-bold backdrop-blur-sm">
          {caption}
        </p>
      )}

      {(phase === "approach" || phase === "entry") && (
        <button onClick={() => run(SKIP_FROM)} className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full bg-black/55 px-4 py-2 text-sm font-bold backdrop-blur-sm active:scale-95">
          Алгасах ⏭
        </button>
      )}

      {/* Зовхи: дээрээс, доороос хаагдаж, нээгдэхдээ бүдэг харагдана */}
      {phase === "open" && <div className="wake-blur absolute inset-0" />}
      <div className={`lid lid-top ${lids}`} onAnimationEnd={(e) => e.animationName === "lid-top-open" && cb.current.onDone()} />
      <div className={`lid lid-bottom ${lids}`} />
    </div>
  );
}
