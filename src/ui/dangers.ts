import { DOSE } from "../game/config";
import type { GameState } from "../game/types";

// Аюултай түвшин: HUD-ын заагч улаан болж анивчих, эвхсэн мөрөнд дүрс нь гарч ирэх
export function dangers(s: GameState): Record<"oxygen" | "battery" | "water" | "suit" | "food" | "rad", boolean> {
  return {
    oxygen: s.res.oxygen < 25, battery: s.res.battery < 25, water: s.res.water < 25,
    suit: s.suitO2 < 30, food: s.res.food < 25, rad: s.dose > DOSE.limit * 0.7,
  };
}
