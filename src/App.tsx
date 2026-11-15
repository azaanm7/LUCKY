import { useEffect, useRef, useState } from "react";
import { setMuted } from "./audio/synth";
import { useGameLoop } from "./hooks/use-game-loop";
import { useSpaceWeather } from "./hooks/use-space-weather";
import { LangContext } from "./i18n/context";
import { DICTS, loadLang, saveLang } from "./i18n/index";
import type { Lang } from "./i18n/index";
import { DEPOT, RECIPES } from "./game/config";
import { inZone } from "./game/world";
import { Controls } from "./ui/controls";
import { CraftPanel } from "./ui/craft-panel";
import { Hud } from "./ui/hud";
import { Landing } from "./ui/landing";
import { PauseMenu, Sources } from "./ui/menu";
import { EndOverlay } from "./ui/overlays";
import { ProblemModal } from "./ui/problem-modal";
import { TaskOverlay } from "./ui/task-overlay";

const LANDING_MS = 4500; // ялсны дараа нөөцийн хөлөг буухыг харуулаад дараа нь төгсгөлийн цонх гарна

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [intro, setIntro] = useState(true);
  const [lang, setLang] = useState<Lang>(loadLang);
  const t = DICTS[lang];
  const [paused, setPaused] = useState(false);
  const [sources, setSources] = useState(false);
  const [muted, setMute] = useState(false);
  const [landed, setLanded] = useState(false);
  const [crafting, setCrafting] = useState(false); // урлангийн цонх нээлттэй юу
  const weather = useSpaceWeather(); // NASA DONKI-оос шууд татсан нарны дэлбэрэлт (байвал)
  const game = useGameLoop(canvasRef, started, paused, t);
  const s = game.hud;
  const won = s.status === "won", playing = started && s.status === "playing";

  useEffect(() => {
    if (!won) return;
    const timer = setTimeout(() => setLanded(true), LANDING_MS);
    return () => { clearTimeout(timer); setLanded(false); };
  }, [won]);

  // P товч эсвэл өөр цонх руу шилжихэд түр зогсоно
  useEffect(() => {
    if (!playing) return;
    const key = (e: KeyboardEvent) => { if (e.code === "KeyP" && !e.repeat) setPaused((p) => !p); };
    const hide = () => { if (document.hidden) setPaused(true); };
    window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", hide);
    return () => { window.removeEventListener("keydown", key); document.removeEventListener("visibilitychange", hide); };
  }, [playing]);

  // Урлан: Space / E-ээр нээнэ, 1-3-аар хэвлэнэ, Esc-ээр хаана. Урлангаас холдвол өөрөө хаагдана.
  const atWorkshop = playing && !s.task && !s.modal && inZone(s.player, DEPOT);
  const showCraft = crafting && atWorkshop;
  useEffect(() => {
    if (!atWorkshop) return;
    const key = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "Space" || e.code === "KeyE") setCrafting(true);
      else if (e.code === "Escape") setCrafting(false);
      else if (crafting && /^Digit[1-9]$/.test(e.code)) { const r = RECIPES[+e.code.slice(5) - 1]; if (r) game.craft(r.id); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [atWorkshop, crafting, game]);

  const mute = () => { setMuted(!muted); setMute(!muted); };
  const start = () => { game.restart(weather.flare); setStarted(true); setPaused(false); };
  const changeLang = (next: Lang) => { setLang(next); saveLang(next); };
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  return (
    <LangContext value={t}>
      <main className="relative h-full w-full overflow-hidden select-none">
        <canvas ref={canvasRef} className="block h-full w-full" />
        {playing && (
          <>
            <Hud s={s} muted={muted} onMute={mute} onPause={() => setPaused(true)} />
            {s.task ? <TaskOverlay s={s} onStep={game.step} onCancel={game.cancel} />
              : showCraft ? <CraftPanel s={s} onCraft={game.craft} onClose={() => setCrafting(false)} />
              : <Controls s={s} onPress={game.press} onCraft={() => setCrafting(true)} onStick={game.setStick} />}
            {s.modal && <ProblemModal s={s} onChoose={game.choose} onAsk={game.ask} onClose={game.ack} />}
            {paused && !s.modal && <PauseMenu onResume={() => setPaused(false)} onRestart={start} onSources={() => setSources(true)} />}
          </>
        )}
        {intro && <Landing lang={lang} onLang={changeLang} weather={weather} onSources={() => setSources(true)} onLand={start} onDone={() => setIntro(false)} />}
        {started && won && !landed && (
          <div className="safe-top absolute inset-x-0 top-6 flex justify-center p-3">
            <p className="rounded-3xl bg-emerald-600 px-5 py-3 text-center font-display text-lg text-white shadow-xl">{t.end.ship}</p>
          </div>
        )}
        {started && (s.status === "lost" || (won && landed)) && <EndOverlay s={s} onRestart={start} />}
        {sources && <Sources onClose={() => setSources(false)} />}
      </main>
    </LangContext>
  );
}
