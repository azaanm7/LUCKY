import { useEffect, useRef, useState } from "react";
import { createGame, tick } from "../game/engine";
import { acknowledge } from "../game/missions";
import type { GameState, Input } from "../game/types";
import { createWorld } from "../three/scene";

// three.js-ийн дэлгэц, тоглоомын давталт, гарын товчлуурыг нэг дор холбоно
export function useGameLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>, started: boolean) {
  const [hud, setHud] = useState<GameState>(() => createGame()); // React-д 10 удаа/сек шинэчилнэ
  const stateRef = useRef<GameState>(hud); // бодит цагийн state (60 удаа/сек)
  const inputRef = useRef<Input>({ dx: 0, dz: 0, action: false });
  const keys = useRef(new Set<string>());
  const stick = useRef({ x: 0, z: 0 });
  const startedRef = useRef(started);
  useEffect(() => { startedRef.current = started; }, [started]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const world = createWorld(canvas);
    world.resize();
    const onResize = () => world.resize();
    const down = (e: KeyboardEvent) => {
      if (stateRef.current.modal && (e.key === "Enter" || e.key === " ")) { // цонхыг гараар хаана
        stateRef.current = acknowledge(stateRef.current);
        e.preventDefault();
        return;
      }
      keys.current.add(e.key.toLowerCase());
      if (e.key === " " || e.key.toLowerCase() === "e") { inputRef.current.action = true; e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    let last = performance.now(), hudTimer = 0, introTime = 0, raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = keys.current;
      const kx = (k.has("d") || k.has("arrowright") ? 1 : 0) - (k.has("a") || k.has("arrowleft") ? 1 : 0);
      const kz = (k.has("s") || k.has("arrowdown") ? 1 : 0) - (k.has("w") || k.has("arrowup") ? 1 : 0);
      const input: Input = { dx: kx || stick.current.x, dz: kz || stick.current.z, action: inputRef.current.action };
      inputRef.current.action = false;
      if (startedRef.current) stateRef.current = tick(stateRef.current, input, dt);
      else introTime += dt;
      const s = startedRef.current ? stateRef.current : { ...stateRef.current, time: 8 + introTime };
      world.update(s, dt, !startedRef.current);
      hudTimer += dt;
      if (hudTimer > 0.1) { hudTimer = 0; setHud(stateRef.current); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      world.dispose();
    };
  }, [canvasRef]);

  return {
    hud,
    press: () => { inputRef.current.action = true; },
    setStick: (x: number, z: number) => { stick.current = { x, z }; },
    restart: () => { stateRef.current = createGame(); setHud(stateRef.current); },
    ack: () => { stateRef.current = acknowledge(stateRef.current); setHud(stateRef.current); },
  };
}
