import { createGame, tick } from "./engine";
import { acknowledge } from "./missions";
import type { GameState, Input } from "./types";

// Тестүүдэд хэрэглэдэг жижиг туслахууд
export const idle: Input = { dx: 0, dz: 0, action: false };
export const step: Input = { ...idle, step: true };
export const press: Input = { ...idle, action: true };

export const at = (s: GameState, x: number, z: number): GameState => ({ ...s, player: { x, z, angle: 0, moving: false } });
export const game = (over: Partial<GameState>): GameState => ({ ...createGame(1), ...over });

// Цонх гарвал шууд хааж (төлөвлөгөө сонгохгүйгээр), тоглоомыг тодорхой хугацаагаар урагшлуулна
export function run(s: GameState, seconds: number, input = idle): GameState {
  for (let t = 0; t < seconds; t += 0.05) s = tick(s.modal ? acknowledge(s) : s, input, 0.05);
  return s;
}

// Цонх гартал урагшлуулна (хамгийн ихдээ max секунд)
export function untilModal(s: GameState, max = 60): GameState {
  for (let t = 0; t < max && !s.modal; t += 0.05) s = tick(s, idle, 0.05);
  return s;
}
