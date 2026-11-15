import { DOSE, FLARE_SECONDS, RAD_MSV_PER_SOL, SOL_SECONDS } from "./config";
import { flarePower } from "./donki";
import { fact, loseHeart } from "./events";
import type { Flare, GameState } from "./types";
import { inShelter } from "./world";

// Багийн цацрагийн тун (0-100). Бодит тун шиг хуримтлагдана, хэзээ ч буурахгүй.
// Суурь хурд нь Curiosity RAD-ийн 0.64 mSv/өдөр (масштабласан). Гадаа бүтэн хурдаар, хоргодох байранд удаан нэмэгдэнэ.
// Нарны дэлбэрэлт DONKI зэрэглэлээрээ нэмнэ. Бамбай (дэлбэрэлтийн картын A) хоргодох байран дахь дэлбэрэлтийн тунг багасгана.

// Дэлбэрэлт гадаа байгаа хүнд өгөх нийт тун (тоглоомын дүрэм: хүчтэй зэрэглэл = их тун)
export const flareDose = (f: Flare) => DOSE.flareBase + flarePower(f) * DOSE.flarePerX;

// Хоргодох байранд байх үеийн дэлбэрэлтийн тун: бамбайтай, бамбайгүй
export const shelteredFlareDose = (f: Flare, shield: boolean) => flareDose(f) * (shield ? DOSE.shield : DOSE.shelter);

// Секундэд хэдэн оноо нэмэгдэх вэ: [нийт, үүнээс дэлбэрэлтээс]
export function doseRate(s: GameState): [number, number] {
  const inside = inShelter(s.player);
  const base = (RAD_MSV_PER_SOL * DOSE.perMsv) / SOL_SECONDS * (inside ? DOSE.shelter : 1);
  if (s.flare <= 0) return [base, 0];
  const cover = !inside ? 1 : s.shield ? DOSE.shield : DOSE.shelter;
  const flare = (flareDose(s.solarFlare) / FLARE_SECONDS) * cover;
  return [base + flare, flare];
}

export function absorb(s: GameState, dt: number): GameState {
  const [rate, flare] = doseRate(s);
  const dose = Math.min(DOSE.limit, s.dose + rate * dt);
  s = { ...s, dose, flareDose: s.flareDose + flare * dt };
  if (dose >= DOSE.factAt) s = fact(s, "rad");
  if (dose >= DOSE.limit && !s.doseHit) s = loseHeart({ ...s, doseHit: true }, "dose", { kind: "doseLimit" });
  return s;
}
