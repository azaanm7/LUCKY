import { afterEach, describe, expect, test } from "bun:test";
import { MACHINES, PROBLEM_IDS, SITES } from "../game/config";
import type { FactId, Msg, Step, TipId } from "../game/types";
import { DICTS, LANGS, loadLang, saveLang, say, stepText } from "./index";
import type { Dict } from "./index";

const FACT_IDS: FactId[] = ["trip", "red", "landing", "start", "ice", "night", "moxie", "suit", "soil", "delta", "crater"];
const TIPS: TipId[] = ["shelter", "returnEarly", "refill", "fetchPart", "fullFix", "turnBackOn", "patch", "dusk", "stormOff", "wipe", "spare", "ice", "early"];

// Engine-ийн гаргаж болох бүх мэдэгдэл ба тайлангийн алхам
const MSGS: Msg[] = [
  ...FACT_IDS.map((id): Msg => ({ kind: "fact", id })),
  { kind: "luckyFlare" }, { kind: "radiation" }, { kind: "suitOut" }, { kind: "trained" },
  ...MACHINES.flatMap((m): Msg[] => [{ kind: "flareHit", machine: m.id }, { kind: "fixed", machine: m.id }]),
  { kind: "needOut", need: "oxygen" }, { kind: "needOut", need: "water" }, { kind: "needOut", need: "food" },
  { kind: "banked", points: 3 }, { kind: "stormStudy", points: 4 },
  ...SITES.map((x): Msg => ({ kind: "sampled", site: x.id })),
];
const STEPS: Step[] = [
  ...(["outsideFlare", "radiationHit", "drillO2", "oneMore", "suitEmpty", "tooLong", "noPart", "halfPower", "leak", "slowPatch", "noPower", "night", "storm", "allOn", "fewIce"] as const).map((id) => ({ id })),
  { id: "out", need: "food" }, { id: "dusty", pct: 90 }, { id: "stormSol", sol: 2 },
  ...(["broken", "weakFix", "off", "slowed", "late"] as const).map((id) => ({ id, machine: "o2" as const })),
];

// Толийн бүх бичвэрийг (функцийг жишээ утгаар дуудаж) цуглуулна
function texts(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [String(value(...Array(value.length).fill("7")))];
  if (Array.isArray(value)) return value.flatMap(texts);
  if (value && typeof value === "object") return Object.values(value).flatMap(texts);
  return [];
}

// Бүтэц: түлхүүр, массивын урт, төрөл (бичвэр эсвэл функц, параметрийн тоо)
function shape(value: unknown): unknown {
  if (typeof value === "function") return `fn${value.length}`;
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]).sort());
  return typeof value;
}

const clean = (text: string) => text.length > 0 && !/undefined|NaN|\[object/.test(text);

describe("орчуулга", () => {
  test("mn ба en яг ижил бүтэцтэй", () => {
    expect(shape(DICTS.en)).toEqual(shape(DICTS.mn));
  });

  test.each(LANGS)("%s: бүх бичвэр хоосон биш, undefined алга", (lang) => {
    const t: Dict = DICTS[lang];
    for (const text of texts(t)) expect(clean(text)).toBe(true);
    for (const m of MSGS) expect(clean(say(t, m))).toBe(true);
    for (const st of STEPS) expect(clean(stepText(t, st))).toBe(true);
    for (const tip of TIPS) expect(clean(t.report.tips[tip])).toBe(true);
    for (const id of PROBLEM_IDS) expect(t.problems[id].plans.b.label.length).toBeGreaterThan(0);
  });

  test("англи бичвэр 7-12 насныханд: өгүүлбэр бүр богино, кирилл үсэг алга", () => {
    for (const text of texts(DICTS.en)) {
      expect(/[Ѐ-ӿ]/.test(text)).toBe(false);
      for (const sentence of text.split(/[.!?…]+\s/)) expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(20);
    }
  });
});

describe("хэл хадгалах", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const setStorage = (value: unknown) => Object.defineProperty(globalThis, "localStorage", { value, configurable: true, writable: true });
  afterEach(() => {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  test("хадгалсан хэлээ дахин уншина", () => {
    const store = new Map<string, string>();
    setStorage({ getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) });
    expect(loadLang()).toBe("mn");
    saveLang("en");
    expect(loadLang()).toBe("en");
  });

  test("storage алдаа өгвөл монгол хэл, хадгалахад унахгүй", () => {
    setStorage({ getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } });
    expect(loadLang()).toBe("mn");
    expect(() => saveLang("en")).not.toThrow();
  });

  test("танихгүй утга хадгалагдсан бол монгол хэл", () => {
    setStorage({ getItem: () => "fr", setItem: () => {} });
    expect(loadLang()).toBe("mn");
  });
});
