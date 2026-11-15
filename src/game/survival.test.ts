import { describe, expect, test } from "bun:test";
import { CLOGGED_OUTPUT, CROP_SECONDS, DEPOT, FILTER_SECONDS, HARVEST_FOOD, MELT_SECONDS, O2_RATE, PACK_MAX, RECIPES, SOL_SECONDS, TASK_STEPS } from "./config";
import { createGame, tick } from "./engine";
import { canCraft, packRoom } from "./gather";
import { at, game, idle, press, run, step } from "./testing";
import type { GameState, Material } from "./types";
import { powerDemand, solarInput } from "./world";

const NIGHT = SOL_SECONDS * 0.8;
const full = { oxygen: 50, water: 50, food: 50, battery: 100 };
const none: Record<Material, number> = { ice: 0, ore: 0, seed: 0 };
const first = (s: GameState, kind: Material) => s.deposits.find((d) => d.kind === kind)!;

describe("цуглуулах ба суурьт буулгах", () => {
  test("дээгүүр нь алхвал үүргэвчинд орж, өөр газар шинээр гарна", () => {
    const s = createGame(1), ore = first(s, "ore");
    const next = tick(at(s, ore.x, ore.z), idle, 0.05);
    expect(next.pack).toEqual(["ore"]);
    expect(next.collected).toBe(1);
    expect(next.deposits.filter((d) => d.kind === "ore")).toHaveLength(s.deposits.filter((d) => d.kind === "ore").length);
    expect(next.deposits).not.toContain(ore);
  });

  test("үүргэвч дүүрсэн бол авахгүй, дээж ч мөн зай эзэлнэ", () => {
    const s = game({ pack: Array(PACK_MAX - 1).fill("ice"), samples: [3] }), ore = first(s, "ore");
    expect(packRoom(s)).toBe(0);
    const next = tick(at(s, ore.x, ore.z), idle, 0.05);
    expect(next.pack).toHaveLength(PACK_MAX - 1);
    expect(next.toast?.msg).toEqual({ kind: "packFull" });
  });

  test("суурьт ирвэл агуулахад буулгана", () => {
    const s = tick(at(game({ pack: ["ice", "ore", "ore"], store: none }), DEPOT.x, DEPOT.z), idle, 0.05);
    expect(s.pack).toEqual([]);
    expect(s.store).toMatchObject({ ice: 1, ore: 2 });
  });

  test("скафандрын O2 дуусч аврагдвал үүргэвчээ гээнэ", () => {
    expect(run(at(game({ pack: ["ore", "ore"], suitO2: 1 }), 30, 0), 1).pack).toEqual([]);
  });
});

describe("машин бүр материал шаардана", () => {
  test("ус: мөстэй бол их, мөсгүй бол бага ус гарна", () => {
    const base = game({ time: NIGHT, res: full, crop: null });
    const withIce = run(at({ ...base, store: { ...none, ice: 1 } }, 0, 0), 2), without = run(at({ ...base, store: none }, 0, 0), 2);
    expect(withIce.res.water).toBeGreaterThan(without.res.water + 2);
    expect(withIce.store.ice).toBe(0);
    expect(run(at({ ...base, store: { ...none, ice: 1 } }, 0, 0), MELT_SECONDS + 1).melt).toBe(0);
  });

  test("агаар: шүүлтүүр дуусвал сэлбэгээр солино, сэлбэггүй бол хагас хүчээр", () => {
    const base = at(game({ time: NIGHT, res: full, filter: 0.0001 }), 0, 0);
    const swapped = tick({ ...base, parts: 1 }, idle, 0.05);
    expect(swapped).toMatchObject({ filter: 1, parts: 0 });
    const clogged = tick({ ...base, parts: 0 }, idle, 0.05), fine = tick({ ...base, filter: 1 }, idle, 0.05);
    expect(clogged.filter).toBe(0);
    expect(fine.res.oxygen - clogged.res.oxygen).toBeCloseTo(O2_RATE * (1 - CLOGGED_OUTPUT) * 0.05, 5);
    expect(FILTER_SECONDS).toBeGreaterThan(30);
  });

  test("хүнс: үр тарьж, ургаж гүйцэхэд гараар хураана", () => {
    let s = tick(at(game({ time: NIGHT, res: full, crop: null, store: { ...none, seed: 1 } }), 0, -8), idle, 0.05);
    expect(s.crop).not.toBeNull();
    expect(s.store.seed).toBe(0);
    s = run({ ...s, res: full, time: NIGHT }, 0.1);
    const ready = { ...s, crop: 1 as number | null };
    expect(powerDemand(ready)).toBeLessThan(powerDemand(s)); // бэлэн ургацтай хүлэмж эрчим хүч авахгүй
    s = tick(ready, press, 0.05);
    expect(s.task).toEqual({ kind: "harvest", done: 0 });
    expect(s.on.greenhouse).toBe(true); // товч нь унтраасангүй, хураалт эхлүүллээ
    for (let i = 0; i < TASK_STEPS.harvest; i++) s = tick(s, step, 0.05);
    expect(s.res.food).toBeGreaterThan(ready.res.food + HARVEST_FOOD - 1);
    expect(s.crop).toBeNull();
    expect(CROP_SECONDS).toBeLessThan(SOL_SECONDS);
  });

  test("үргүй бол хүлэмж хоосон, хүнс гарахгүй", () => {
    const s = run(at(game({ res: full, crop: null, store: none }), 0, 0), 5);
    expect(s.crop).toBeNull();
    expect(s.res.food).toBeLessThan(50);
  });
});

describe("урлан: 3D принтер", () => {
  const part = RECIPES.find((r) => r.id === "part")!, panel = RECIPES.find((r) => r.id === "panel")!;
  const workshop = (over: Partial<GameState>) => at(game({ res: full, ...over }), DEPOT.x, DEPOT.z);

  test("хүдрээр сэлбэг хэвлэнэ: материал зарж, хугацаа ба эрчим хүч шаардана", () => {
    let s = workshop({ store: { ...none, ore: 2 }, parts: 0 });
    expect(canCraft(s, part)).toBe(true);
    const before = powerDemand(s);
    s = tick(s, { ...idle, craft: "part" }, 0.05);
    expect(s.job?.recipe).toBe("part");
    expect(s.store.ore).toBe(0);
    expect(powerDemand(s)).toBeGreaterThan(before);
    s = run(s, part.seconds + 0.5);
    expect(s).toMatchObject({ job: null, parts: 1 });
  });

  test("материал дутвал эсвэл урлан дээр биш бол эхлэхгүй", () => {
    expect(tick(workshop({ store: { ...none, ore: 1 } }), { ...idle, craft: "part" }, 0.05).job).toBeNull();
    expect(tick(at(game({ store: { ...none, ore: 9 } }), 20, 20), { ...idle, craft: "part" }, 0.05).job).toBeNull();
  });

  test("нэмэлт панель нарны эрчим хүчийг нэмнэ, дээд тоотой", () => {
    const s = game({ time: 15 });
    expect(solarInput({ ...s, built: ["panel"] })).toBeGreaterThan(solarInput(s));
    expect(canCraft(workshop({ store: { ...none, ore: 9 }, built: ["panel", "panel"] }), panel)).toBe(false);
  });

  test("сэлбэггүй бол бүрэн засварт хэвлэх хэрэгтэй", () => {
    const broken = at(game({ problem: "pump", plan: "a", broken: "recycler", parts: 0 }), DEPOT.x, DEPOT.z);
    expect(tick(broken, idle, 0.05).carrying).toBeNull();
    expect(tick({ ...broken, parts: 1 }, idle, 0.05)).toMatchObject({ carrying: "pump", parts: 0 });
  });
});
