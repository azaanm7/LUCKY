import { MACHINES, PLAYER_SPEED, SHELTER, SOLAR_FIELD, SOL_SECONDS, DAY_PART, WORLD_RADIUS } from "./config";
import type { GameState, Ice, Input, MachineId, Vec2 } from "./types";

// Seed-тэй санамсаргүй тоо: ижил seed → ижил тоглолт
export function random(seed: number): [number, number] {
  const next = (seed * 1664525 + 1013904223) >>> 0;
  return [next / 4294967296, next];
}

export const dist = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.z - b.z);
export const solOf = (t: number) => Math.floor(t / SOL_SECONDS) + 1;
export const dayPhase = (t: number) => (t % SOL_SECONDS) / SOL_SECONDS; // 0..1
export const isDay = (t: number) => dayPhase(t) < DAY_PART;

// Нарны гэрэл 0..1: өглөө, оройд бага, үд дунд их
export function sunlight(t: number): number {
  const p = dayPhase(t);
  if (p >= DAY_PART) return 0;
  return Math.sin((p / DAY_PART) * Math.PI) * 0.6 + 0.4;
}

// Барилгууд нь тойрог хэлбэрийн саад. Тоглогчийг түлхэж гаргана.
const OBSTACLES: (Vec2 & { r: number })[] = [
  { x: -9, z: -1.2, r: 2.2 },
  { x: 9, z: -1.2, r: 2.2 },
  { x: 0, z: -11.6, r: 3.2 },
];

export function movePlayer(s: GameState, input: Input, dt: number): GameState["player"] {
  const len = Math.hypot(input.dx, input.dz);
  if (len < 0.1) return { ...s.player, moving: false };
  const nx = input.dx / Math.max(1, len);
  const nz = input.dz / Math.max(1, len);
  let x = s.player.x + nx * PLAYER_SPEED * dt;
  let z = s.player.z + nz * PLAYER_SPEED * dt;
  for (const o of OBSTACLES) {
    const d = Math.hypot(x - o.x, z - o.z);
    if (d < o.r) { x = o.x + ((x - o.x) / d) * o.r; z = o.z + ((z - o.z) / d) * o.r; }
  }
  const r = Math.hypot(x, z);
  if (r > WORLD_RADIUS) { x = (x / r) * WORLD_RADIUS; z = (z / r) * WORLD_RADIUS; }
  return { x, z, angle: Math.atan2(nx, nz), moving: true };
}

// Тоглогч аль машины дэвсгэр дээр зогсож байна вэ
export function nearMachine(p: Vec2): MachineId | null {
  const m = MACHINES.find((m) => dist(p, m.pos) < 2.2);
  return m ? m.id : null;
}

export const inShelter = (p: Vec2) => dist(p, SHELTER) < SHELTER.r;
export const onSolarField = (p: Vec2) => dist(p, SOLAR_FIELD) < SOLAR_FIELD.r;

// Мөсийг суурингаас хол, санамсаргүй газар гаргана
export function spawnIce(s: GameState): { ice: Ice; seed: number } {
  let [a, seed] = random(s.seed);
  let b;
  [b, seed] = random(seed);
  const angle = a * Math.PI * 2;
  const r = 15 + b * 12;
  return { ice: { id: s.nextIceId, x: Math.cos(angle) * r, z: Math.sin(angle) * r }, seed };
}
