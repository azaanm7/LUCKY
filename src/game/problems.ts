import type { ProblemId } from "./types";

// Асуудал бүрийн тоглоомын өгөгдөл. Тоглогчид харагдах бичвэр (юу болсон, хоёр төлөвлөгөө,
// Дэлхийн зөвлөгөө, бодит түүх, цол) src/i18n/mn.ts, en.ts-ийн `problems` хэсэгт байна.
// Бодит түүхүүдийн эх сурвалжийг README-ийн "Science behind the game" хэсгээс харна уу.
export interface Problem {
  icon: string;
  delay: number; // Дэлхийгээс хариу ирэх минут (3-22 минут)
}

export const PROBLEMS: Record<ProblemId, Problem> = {
  filter: { icon: "🫁", delay: 6 },
  storm: { icon: "🌪️", delay: 11 },
  flare: { icon: "☀️", delay: 14 },
  leak: { icon: "💨", delay: 17 },
  pump: { icon: "🚰", delay: 20 },
};
