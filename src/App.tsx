import { useRef, useState } from "react";
import { useGameLoop } from "./hooks/use-game-loop";
import { Controls } from "./ui/controls";
import { Hud } from "./ui/hud";
import { EndOverlay, StartOverlay } from "./ui/overlays";
import { ProblemModal } from "./ui/problem-modal";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const game = useGameLoop(canvasRef, started);
  const s = game.hud;

  return (
    <main className="relative h-full w-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {started && s.status === "playing" && (
        <>
          <Hud s={s} />
          <Controls s={s} onPress={game.press} onStick={game.setStick} />
          {s.modal && <ProblemModal modal={s.modal} onClose={game.ack} />}
        </>
      )}
      {!started && <StartOverlay onStart={() => { game.restart(); setStarted(true); }} />}
      {started && s.status !== "playing" && <EndOverlay s={s} onRestart={game.restart} />}
    </main>
  );
}
