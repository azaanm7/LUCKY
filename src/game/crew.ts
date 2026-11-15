import { SHELTER, SUIT_REFILL, SUIT_USE, TANK_SAVING } from "./config";
import { loseHeart, toast } from "./events";
import type { GameState } from "./types";
import { inShelter } from "./world";

// Скафандр: гадаа байхад хүчилтөрөгч буурна, хоргодох байранд орвол цэнэглэгдэнэ
export function updateSuit(s: GameState, dt: number): GameState {
  if (inShelter(s.player)) return { ...s, suitO2: Math.min(100, s.suitO2 + SUIT_REFILL * dt) };
  const before = s.suitO2;
  const use = SUIT_USE * (s.built.includes("tank") ? TANK_SAVING : 1); // хэвлэсэн том сав удаан дуусна
  const suitO2 = Math.max(0, before - use * dt);
  if (before > 30 && suitO2 <= 30) s = toast(s, { kind: "fact", id: "suit" }); // гадаа гарах бүрд сануулна
  if (suitO2 > 0) return { ...s, suitO2 };
  // Скафандрын O2 дуусвал баг аврах ч 1 зүрх алдана
  s = loseHeart(s, "suit", { kind: "suitOut" });
  // Аврагдахдаа үүргэвчтэй материал, дээжээ гээнэ
  return { ...s, suitO2: 100, samples: [], pack: [], drill: 0, task: null, player: { x: SHELTER.x, z: SHELTER.z + 5, angle: Math.PI, moving: false } };
}
