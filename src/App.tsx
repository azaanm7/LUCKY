import { useEffect, useRef, useState } from "react";
import { setMuted } from "./audio/synth";
import { useGameLoop } from "./hooks/use-game-loop";
import { Controls } from "./ui/controls";
import { Hud } from "./ui/hud";
import { EndOverlay, StartOverlay } from "./ui/overlays";
import { ProblemModal } from "./ui/problem-modal";
import { TaskOverlay } from "./ui/task-overlay";

const LANDING_MS = 4500; // ялсны дараа нөөцийн хөлөг буухыг харуулаад дараа нь төгсгөлийн цонх гарна

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [muted, setMute] = useState(false);
  const [landed, setLanded] = useState(false);
  const game = useGameLoop(canvasRef, started);
  const s = game.hud;
  const won = s.status === "won";

  useEffect(() => {
    if (!won) return;
    const timer = setTimeout(() => setLanded(true), LANDING_MS);
    return () => { clearTimeout(timer); setLanded(false); };
  }, [won]);

  const mute = () => { setMuted(!muted); setMute(!muted); };

  return (
    <main className="relative h-full w-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {started && s.status === "playing" && (
        <>
          <Hud s={s} muted={muted} onMute={mute} />
          {s.task ? <TaskOverlay s={s} onStep={game.step} onCancel={game.cancel} /> : <Controls s={s} onPress={game.press} onStick={game.setStick} />}
          {s.modal && <ProblemModal s={s} onChoose={game.choose} onAsk={game.ask} onClose={game.ack} />}
        </>
      )}
      {!started && <StartOverlay onStart={() => { game.restart(); setStarted(true); }} />}
      {started && won && !landed && (
        <div className="absolute inset-x-0 top-6 flex justify-center p-3">
          <p className="rounded-3xl bg-emerald-600 px-5 py-3 text-center font-display text-lg text-white shadow-xl">🚀 Нөөцийн хөлөг ирлээ! Чи багаа авралаа!</p>
        </div>
      )}
      {started && (s.status === "lost" || (won && landed)) && <EndOverlay s={s} onRestart={game.restart} />}
    </main>
  );
}
