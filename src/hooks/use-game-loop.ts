import { useEffect, useRef, useState } from "react";
import { createGame, tick } from "../game/engine";
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
    // e.code = товчны байрлал (KeyW, Space). Монгол гарын байрлал дээр ч WASD ажиллана.
    const down = (e: KeyboardEvent) => {
      keys.current.add(e.code);
      if (e.code !== "Space" && e.code !== "KeyE") return;
      e.preventDefault();
      if (!e.repeat) inputRef.current.action = true; // удаан дарахад дахин дахин асааж унтраахгүй
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear(); // цонх солиход товч "гацаж" үлдэхгүй
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);

    let last = performance.now(), hudTimer = 0, introTime = 0, raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = keys.current;
      const kx = (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) - (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0);
      const kz = (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0) - (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0);
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
      window.removeEventListener("blur", blur);
      world.dispose();
    };
  }, [canvasRef]);

  return {
    hud,
    press: () => { inputRef.current.action = true; },
    setStick: (x: number, z: number) => { stick.current = { x, z }; },
    restart: () => { stateRef.current = createGame(); setHud(stateRef.current); },
  };
}
