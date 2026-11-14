import { FLARE_DAMAGE } from "./config";
import type { Flare } from "./types";

// Нарны дэлбэрэлтийн БОДИТ бүртгэл: NASA DONKI (Space Weather Database Of Notifications, Knowledge, Information).
// Тоглоом эхлэхэд сүүлийн 30 хоногийн бүртгэлийг шууд татна (hooks/use-space-weather.ts). Татаж чадаагүй бол доорх архивыг хэрэглэнэ.
export const DONKI_FLARES = "https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR";

// Архив: 2024 оны бүртгэлээс (2026-11-14-нд татсан). Огноо, зэрэглэл, идэвхтэй бүсийн дугаарыг DONKI-д байгаагаар нь бичсэн. Өөрчилж болохгүй.
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

// Рентген зэрэглэл: үсэг бүр өмнөхөөсөө 10 дахин хүчтэй (C < M < X), тоо нь үржигдэнэ. X1 = 1.
const SCALE: Record<string, number> = { A: 0.0001, B: 0.001, C: 0.01, M: 0.1, X: 1 };
export const flarePower = (f: Flare) => (SCALE[f.cls[0]] ?? 0) * (parseFloat(f.cls.slice(1)) || 0);

// Машинуудаа унтраагаагүй бол цацраг нэг машиныг гэмтээх магадлал (тоглоомын дүрэм, бодит тоо биш)
export const damageChance = (f: Flare) => Math.min(FLARE_DAMAGE.max, FLARE_DAMAGE.base + flarePower(f) * FLARE_DAMAGE.perX);

// DONKI-ийн хариунаас (JSON) хамгийн хүчтэй дэлбэрэлтийг сонгоно. Хариу буруу хэлбэртэй бол null.
export function strongest(records: unknown): Flare | null {
  if (!Array.isArray(records)) return null;
  const flares: Flare[] = [];
  for (const r of records as Record<string, unknown>[]) {
    if (typeof r?.classType !== "string" || typeof r.peakTime !== "string" || !/^[A-Z]\d/.test(r.classType)) continue;
    flares.push({
      date: r.peakTime.slice(0, 10), cls: r.classType, live: true,
      region: typeof r.activeRegionNum === "number" ? r.activeRegionNum : 0,
      link: typeof r.link === "string" ? r.link : DONKI_FLARES,
    });
  }
  return flares.sort((a, b) => flarePower(b) - flarePower(a))[0] ?? null;
}
