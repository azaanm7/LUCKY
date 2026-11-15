import { useCallback, useEffect, useRef, useState } from "react";
import { playCues, playModalCue } from "../audio/cues";
import { startMusic } from "../audio/music";
import { startAudio } from "../audio/synth";
import { createGame, tick } from "../game/engine";
import { acknowledge, askEarth, choose } from "../game/missions";
import type { Flare, GameState, Input, PlanId, RecipeId } from "../game/types";
import type { Dict } from "../i18n/mn";
import { DRAG_TURN, screenToWorld, TURN_SPEED } from "../three/camera";
import { createWorld } from "../three/scene";

// three.js-ийн дэлгэц, тоглоомын давталт, гарын товчлуур, дууг нэг дор холбоно
// t: сонгосон хэлний толь. 3D хаягууд үүгээр зурагдана, хэл солигдвол ертөнцийг шинээр үүсгэнэ.
export function useGameLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>, started: boolean, paused: boolean, t: Dict) {
  const [hud, setHud] = useState<GameState>(() => createGame()); // React-д 10 удаа/сек шинэчилнэ
  const stateRef = useRef<GameState>(hud); // бодит цагийн state (60 удаа/сек)
  const once = useRef<{ action: boolean; step: boolean; cancel: boolean; craft?: RecipeId }>({ action: false, step: false, cancel: false }); // нэг frame-д л хүчинтэй товчнууд
  const keys = useRef(new Set<string>());
  const stick = useRef({ x: 0, z: 0 });
  const rigRef = useRef<ReturnType<typeof createWorld>["rig"] | null>(null); // камер: харагдац солих, эргүүлэх
  const startedRef = useRef(started), pausedRef = useRef(paused);
  useEffect(() => { startedRef.current = started; pausedRef.current = paused; }, [started, paused]);

  // tick-ээс гадуурх өөрчлөлт (цонх хаах, төлөвлөгөө сонгох, шинээр эхлэх)
  const apply = useCallback((change: (s: GameState) => GameState) => {
    const next = change(stateRef.current);
    playModalCue(stateRef.current, next);
    stateRef.current = next;
    setHud(next);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const world = createWorld(canvas, t);
    world.resize();
    rigRef.current = world.rig;
    const onResize = () => world.resize();
    // e.code = товчны байрлал (KeyW, Space). Монгол гарын байрлал дээр ч WASD ажиллана.
    const down = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (pausedRef.current) return; // түр зогссон үед товчнууд тоглоомд нөлөөлөхгүй
      if (s.modal) { // цонх нээлттэй: 1 / 2 = төлөвлөгөө, 3 = Дэлхийгээс асуух, Enter = үргэлжлүүлэх
        const decided = s.modal.kind === "debrief" || !!s.plan;
        if (e.repeat) return;
        if (decided && (e.code === "Enter" || e.code === "NumpadEnter" || e.code === "Space")) apply(acknowledge);
        else if (!decided && e.code === "Digit1") apply((x) => choose(x, "a"));
        else if (!decided && e.code === "Digit2") apply((x) => choose(x, "b"));
        else if (!decided && e.code === "Digit3" && s.modal.kind === "brief") apply(askEarth);
        else return;
        e.preventDefault();
        return;
      }
      keys.current.add(e.code);
      if (e.code === "Escape") once.current.cancel = true;
      if (e.code === "KeyV" && !e.repeat) world.rig.toggle(); // харагдац солих
      if (e.code !== "Space" && e.code !== "KeyE") return;
      e.preventDefault();
      if (e.repeat) return; // удаан дарахад дахин дахин асааж унтраахгүй
      if (s.task) once.current.step = true; // гараар хийдэг ажлын үед Space = нэг алхам
      else once.current.action = true;
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear(); // цонх солиход товч "гацаж" үлдэхгүй
    // Дэлгэцийг чирэхэд камер тоглогчийг тойрч эргэнэ (хурууны чиглэлийг дагана)
    let dragId = -1, dragX = 0; // movementX нь iPhone дээр 0 байдаг тул байрлалыг өөрсдөө санана
    const grab = (e: PointerEvent) => { dragId = e.pointerId; dragX = e.clientX; };
    const drag = (e: PointerEvent) => {
      if (e.pointerId !== dragId || !e.buttons || !startedRef.current || pausedRef.current) return;
      world.rig.turn((dragX - e.clientX) * DRAG_TURN);
      dragX = e.clientX;
    };
    canvas.addEventListener("pointerdown", grab);
    canvas.addEventListener("pointermove", drag);
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
      const turn = (k.has("KeyQ") ? 1 : 0) - (k.has("KeyR") ? 1 : 0);
      if (turn && startedRef.current && !pausedRef.current) world.rig.turn(turn * TURN_SPEED * dt);
      // Алхах чиглэл дэлгэцтэй тохирно: камер эргэсэн бол оролтыг мөн эргүүлнэ
      const input: Input = { ...screenToWorld(kx || stick.current.x, kz || stick.current.z, world.rig.yaw), ...once.current };
      once.current = { action: false, step: false, cancel: false };
      if (startedRef.current && !pausedRef.current) {
        const before = stateRef.current;
        stateRef.current = tick(before, input, dt);
        if (stateRef.current !== before) { playCues(before, stateRef.current); playModalCue(before, stateRef.current); }
      } else if (!startedRef.current) introTime += dt;
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
      canvas.removeEventListener("pointerdown", grab);
      canvas.removeEventListener("pointermove", drag);
      world.dispose();
    };
  }, [canvasRef, apply, t]);

  return {
    hud,
    press: () => { once.current.action = true; },
    step: () => { once.current.step = true; },
    cancel: () => { once.current.cancel = true; },
    craft: (id: RecipeId) => { once.current.craft = id; },
    setStick: (x: number, z: number) => { stick.current = { x, z }; },
    toggleView: () => rigRef.current?.toggle(),
    restart: (live: Flare | null = null) => { startAudio(); startMusic(); apply(() => createGame(undefined, live)); },
    ack: () => apply(acknowledge),
    choose: (plan: PlanId) => apply((s) => choose(s, plan)),
    ask: () => apply(askEarth),
  };
}
