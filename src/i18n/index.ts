import { SITES } from "../game/config";
import type { Msg, Step } from "../game/types";
import { en } from "./en";
import { mn } from "./mn";
import type { Dict } from "./mn";

export type { Dict };
export type Lang = "en" | "mn";
export const LANGS: Lang[] = ["en", "mn"];
// Шинэ тоглогч (олон улсын шүүгчид ч) англиар эхэлнэ. MN товч эхлэх дэлгэц дээр, сонголт нь хадгалагдана.
export const DEFAULT_LANG: Lang = "en";
export const DICTS: Record<Lang, Dict> = { mn, en };

const KEY = "lucky.lang";

// Хадгалсан хэлийг уншина. Анх удаа, хувийн цонх, хаалттай storage, сервер дээр бол DEFAULT_LANG (англи).
export function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "en" || saved === "mn" ? saved : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

// Хадгалж чадахгүй бол зүгээр л алгасна: тоглоом үүнгүйгээр ажиллана
export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // storage хаалттай: энэ удаагийн тоглолтод л хэл хадгалагдана
  }
}

// Engine-ийн мэдэгдлийн кодыг (game/types.ts: Msg) бичвэр болгоно
export function say(t: Dict, m: Msg): string {
  switch (m.kind) {
    case "fact": return t.facts[m.id];
    case "flareHit": case "fixed": return t.msg[m.kind](t.machines[m.machine]);
    case "needOut": return t.msg.needOut(t.needs[m.need]);
    case "banked": case "stormStudy": return t.msg[m.kind](m.points);
    case "sampled": {
      const site = SITES.find((x) => x.id === m.site)!;
      return t.msg.sampled(site.icon, site.worth);
    }
    default: return t.msg[m.kind];
  }
}

// Төгсгөлийн тайлангийн алхмыг (game/types.ts: Step) бичвэр болгоно
export function stepText(t: Dict, step: Step): string {
  const s = t.report.steps;
  switch (step.id) {
    case "out": return s.out(t.needs[step.need]);
    case "broken": case "weakFix": case "off": case "slowed": case "late": return s[step.id](t.machines[step.machine]);
    case "dusty": return s.dusty(step.pct);
    case "stormSol": return s.stormSol(step.sol);
    default: return s[step.id];
  }
}
