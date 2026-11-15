import { useEffect, useRef, useState } from "react";
import { WIN_SOL } from "../game/config";
import { useT } from "../i18n/context";
import { LANGS, weatherLine } from "../i18n/index";
import type { Lang } from "../i18n/index";
import { Cockpit } from "./cockpit";
import { ReadAloud } from "./read-aloud";
import type { LandingPhase } from "./cockpit";
import { START_ICONS } from "./icons";
import { Pix } from "./pix";
import { SpaceWeather } from "./space-weather";
import type { Weather } from "./space-weather";

type Caption = "trip" | "red" | "landing" | "closeEyes";

// Газардах дараалал (миллисекунд). "dark" үед нүд анисан байх хооронд тоглоом эхэлнэ.
const TIMELINE: { phase: LandingPhase; at: number; caption?: Caption }[] = [
  { phase: "approach", at: 0, caption: "trip" },
  { phase: "approach", at: 3200, caption: "red" },
  { phase: "entry", at: 6400, caption: "landing" },
  { phase: "close", at: 10600, caption: "closeEyes" },
  { phase: "dark", at: 11500 },
  { phase: "open", at: 12200 }, // зовхины animation дуусахад onDone дуудна
];
const SKIP_FROM = 3; // "Алгасах" дарвал нүд анихаас эхэлнэ

interface LandingProps {
  lang: Lang;
  onLang: (lang: Lang) => void; // MN / EN товч
  weather: Weather; // NASA DONKI-ийн өнөөдрийн мэдээ (App.tsx: useSpaceWeather)
  onSources: () => void;
  onLand: () => void; // нүд анисан үед тоглоомыг эхлүүлнэ
  onDone: () => void; // нүд бүрэн нээгдсэний дараа
}

// Хэл сонгох товч (зөвхөн эхлэх дэлгэц дээр)
function LangSwitch({ lang, onLang }: { lang: Lang; onLang: (lang: Lang) => void }) {
  const t = useT().start;
  return (
    <div role="group" aria-label={t.language} className="flex flex-1 justify-center gap-1 rounded-full bg-black/40 p-1 text-sm font-extrabold">
      {LANGS.map((l) => (
        <button key={l} onClick={() => onLang(l)} aria-pressed={lang === l}
          className={`rounded-full px-4 py-1.5 active:scale-95 ${lang === l ? "bg-mars text-[#1b0f0a]" : "text-white/75"}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Landing({ lang, onLang, weather, onSources, onLand, onDone }: LandingProps) {
  const all = useT(), t = all.start;
  const [phase, setPhase] = useState<LandingPhase>("title");
  const [caption, setCaption] = useState<Caption | null>(null);
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
    setCaption(step.caption ?? null);
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
            <h1 className="font-display text-2xl leading-tight sm:text-3xl">{t.title}</h1>
            <p className="text-sm text-orange-100/85 sm:text-base">{t.subtitle(WIN_SOL)}</p>
          </div>
          <div className="grid w-full max-w-sm gap-3 rounded-3xl bg-space/85 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2">
              <LangSwitch lang={lang} onLang={onLang} />
              <ReadAloud texts={[...t.steps.map(([, text]) => text), weatherLine(all, weather)]} />
            </div>
            <ol className="grid grid-cols-2 gap-1.5 text-center text-xs font-bold">
              {t.steps.map(([n, text], i) => (
                <li key={n} className="grid justify-items-center gap-1 rounded-xl bg-panel p-2"><Pix name={START_ICONS[i]} size={36} />{text}</li>
              ))}
            </ol>
            <SpaceWeather {...weather} />
            <button autoFocus onClick={() => run(0)} className="rounded-2xl bg-mars py-4 font-display text-xl text-[#1b0f0a] active:scale-95">{t.land}</button>
            <button onClick={onSources} className="text-sm font-bold text-sky-300 underline">{t.sources}</button>
          </div>
        </div>
      )}

      {caption && inCockpit && phase !== "title" && (
        <p key={caption} className="caption-in absolute inset-x-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] mx-auto max-w-md rounded-2xl bg-black/65 p-4 text-center font-bold backdrop-blur-sm">
          {caption === "closeEyes" ? t.closeEyes : all.facts[caption]}
        </p>
      )}

      {(phase === "approach" || phase === "entry") && (
        <button onClick={() => run(SKIP_FROM)} className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full bg-black/55 px-4 py-2 text-sm font-bold backdrop-blur-sm active:scale-95">
          {t.skip}
        </button>
      )}

      {/* Зовхи: дээрээс, доороос хаагдаж, нээгдэхдээ бүдэг харагдана */}
      {phase === "open" && <div className="wake-blur absolute inset-0" />}
      <div className={`lid lid-top ${lids}`} onAnimationEnd={(e) => e.animationName === "lid-top-open" && cb.current.onDone()} />
      <div className={`lid lid-bottom ${lids}`} />
    </div>
  );
}
