import { DRILL_O2, DRILL_SECONDS, PACK_MAX, SAMPLES_MAX, SITES, STARS } from "./config";
import { fact, toast } from "./events";
import type { GameState } from "./types";
import { inShelter, inZone } from "./world";

// Шинжлэх ухааны экспедиц: талбай дээр зогсож дээж өрөмдөнө, хоргодох байранд хүргэвэл оноо болно.
// Хол талбайн дээж үнэтэй. Өрөмдөх нь хүнд ажил тул скафандрын O2 хурдан буурна.
export function explore(s: GameState, dt: number): GameState {
  if (s.samples.length && inShelter(s.player)) {
    const points = s.samples.reduce((a, b) => a + b, 0);
    return toast({ ...s, science: s.science + points, samples: [], drill: 0 }, { kind: "banked", points });
  }
  const site = SITES.find((x) => inZone(s.player, x));
  const full = s.samples.length >= SAMPLES_MAX || s.samples.length + s.pack.length >= PACK_MAX; // дээж, материал нэг үүргэвчинд явна
  if (!site || s.task || s.siteLeft[site.id] <= 0 || full) return s.drill ? { ...s, drill: 0 } : s;
  s = { ...s, drill: s.drill + dt, suitO2: Math.max(0, s.suitO2 - DRILL_O2 * dt) };
  if (s.drill < DRILL_SECONDS) return s;
  s = { ...s, drill: 0, samples: [...s.samples, site.worth], siteLeft: { ...s.siteLeft, [site.id]: s.siteLeft[site.id] - 1 } };
  return fact(toast(s, { kind: "sampled", site: site.id }), site.id);
}

// Тоглоомын үнэлгээ: 1 од = амьд үлдсэн, 2-3 од = шинжлэх ухааны оноо
export const starsOf = (s: GameState) => (s.status === "won" ? 1 + STARS.filter((n) => s.science >= n).length : 0);
