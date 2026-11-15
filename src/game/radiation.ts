import { DOSE } from "./config";
import { flarePower } from "./donki";
import { fact, loseHeart, toast } from "./events";
import type { GameState } from "./types";
import { inShelter } from "./world";

// Цацрагийн тун: гадаа байх тусам аажим, нарны дэлбэрэлтийн үед хурдан хуримтлагдана. Хоргодох байр хамгаална.
// Тун буурдаггүй. Хязгаарт хүрвэл 1 зүрх алдана. Хүчтэй дэлбэрэлт (NASA DONKI-ийн зэрэглэл) тунг илүү хурдан өсгөнө.
// Бодит хэмжилт: Curiosity роверын RAD багаж гадарга дээр өдөрт дунджаар 0.67 мЗв хэмжсэн (i18n: facts.rad). Тоглоомын хурд бодит биш.
export function irradiate(s: GameState, dt: number): GameState {
  if (inShelter(s.player)) return s;
  const strength = Math.min(DOSE.strongest, Math.max(DOSE.weakest, DOSE.weakest + flarePower(s.solarFlare) * DOSE.perX));
  const rate = DOSE.outside + (s.flare > 0 ? DOSE.flare * strength : 0);
  const dose = s.dose + rate * dt;
  if (s.flare > 0 && !s.flareHit) s = toast({ ...s, flareHit: true }, { kind: "doseRising" });
  if (s.dose < DOSE.warn && dose >= DOSE.warn) s = fact(s, "rad");
  if (dose < DOSE.limit) return { ...s, dose };
  return { ...loseHeart(s, "radiation", { kind: "radiation" }), dose: DOSE.after };
}
