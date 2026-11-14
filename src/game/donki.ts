import { FLARE_DAMAGE } from "./config";

// Нарны дэлбэрэлтийн БОДИТ бүртгэл: NASA DONKI (Space Weather Database Of Notifications, Knowledge, Information).
// Эх сурвалж: https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR (2024 оны бүртгэл, 2026-11-14-нд татсан архив; шууд дамжуулалт биш).
// Огноо, зэрэглэл, идэвхтэй бүсийн дугаарыг DONKI-д байгаагаар нь бичсэн. Өөрчилж болохгүй.
export interface Flare {
  date: string; // оргил үеийн огноо (UTC)
  cls: string; // рентген зэрэглэл: M < X, тоо нь их байх тусам хүчтэй
  region: number; // Нарны идэвхтэй бүсийн дугаар
  link: string;
}

export const FLARES: Flare[] = [
  { date: "2024-10-03", cls: "X9.0", region: 13842, link: "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/33693/-1" },
  { date: "2024-05-14", cls: "X8.7", region: 13664, link: "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30849/-1" },
  { date: "2024-02-22", cls: "X6.3", region: 13590, link: "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/29349/-1" },
  { date: "2024-05-11", cls: "X5.8", region: 13664, link: "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30711/-1" },
  { date: "2024-09-14", cls: "X4.5", region: 13825, link: "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/33428/-1" },
  { date: "2024-10-24", cls: "X3.3", region: 13869, link: "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/34148/-1" },
  { date: "2024-07-28", cls: "M9.9", region: 13766, link: "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/32263/-1" },
  { date: "2024-03-28", cls: "M9.7", region: 13615, link: "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/29833/-1" },
];

// Дэлбэрэлтийн хүч: X1 = 1, M-зэрэглэл нь X-ээс 10 дахин сул
export const flarePower = (f: Flare) => (f.cls[0] === "X" ? 1 : 0.1) * parseFloat(f.cls.slice(1));

// Машинуудаа унтраагаагүй бол цацраг нэг машиныг гэмтээх магадлал (тоглоомын дүрэм, бодит тоо биш)
export const damageChance = (f: Flare) => Math.min(FLARE_DAMAGE.max, FLARE_DAMAGE.base + flarePower(f) * FLARE_DAMAGE.perX);
