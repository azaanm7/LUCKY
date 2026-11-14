import { describe, expect, test } from "bun:test";
import { DAY_PART, DEPOT, FACTS, GYM, ICE_WATER, SHELTER, SOL_SECONDS, WIN_SOL } from "./config";
import { createGame, tick } from "./engine";
import { acknowledge } from "./missions";
import type { GameState, Input } from "./types";

const idle: Input = { dx: 0, dz: 0, action: false };
const at = (s: GameState, x: number, z: number): GameState => ({ ...s, player: { x, z, angle: 0, moving: false } });
// Цонх гарвал шууд хааж, тоглоомыг тодорхой хугацаагаар урагшлуулна
const run = (s: GameState, seconds: number, input = idle) => {
  for (let t = 0; t < seconds; t += 0.05) s = tick(s.modal ? acknowledge(s) : s, input, 0.05);
  return s;
};
const NIGHT = SOL_SECONDS * 0.8; // шөнийн цаг
const NOON = SOL_SECONDS * 0.35; // үд дунд
const game = (over: Partial<GameState>): GameState => ({ ...createGame(1), ...over });

describe("tick", () => {
  test("анхны state-ийг өөрчлөхгүй (immutable)", () => {
    const s = createGame(1);
    tick(s, { dx: 1, dz: 0, action: false }, 0.1);
    expect(s.time).toBe(0);
    expect(s.player.x).toBe(0);
  });

  test("мөс түүвэл ус нэмэгдэнэ", () => {
    const s = createGame(1);
    const next = tick(at(s, s.ice[0].x, s.ice[0].z), idle, 0.05);
    expect(next.collected).toBe(1);
    expect(next.res.water).toBeGreaterThan(s.res.water + ICE_WATER - 1);
    expect(next.ice.length).toBe(s.ice.length); // шинэ мөс гарч ирнэ
  });

  test("машины дэвсгэр дээр товч дарвал асаана / унтраана", () => {
    const s = at(createGame(1), -9, 2);
    expect(tick(s, { ...idle, action: true }, 0.05).on.o2).toBe(false);
  });

  test("юу ч хийхгүй бол ялахгүй", () => {
    expect(run(createGame(1), WIN_SOL * SOL_SECONDS + 1).status).toBe("lost");
  });
});

describe("сансрын нисэгчийн асуудлууд", () => {
  test("цонх нээлттэй үед тоглоом зогсоно", () => {
    const s = { ...createGame(1), modal: { kind: "brief" as const, id: "filter" as const } };
    expect(tick(s, idle, 1).time).toBe(0);
  });

  test("CO₂ шүүлтүүр: агуулахаас аваад агаар үйлдвэрт аваачвал засагдана", () => {
    let s = run(createGame(1), SOL_SECONDS + 7); // Sol 2-т асуудал эхэлнэ
    expect(s.problem).toBe("filter");
    expect(s.broken).toBe("o2");
    s = tick(at(s, DEPOT.x, DEPOT.z), idle, 0.05);
    expect(s.carrying).toBe("filter");
    s = tick(at(s, -9, 2), idle, 0.05);
    expect(s.solved).toContain("filter");
    expect(s.broken).toBeNull();
    expect(s.modal?.kind).toBe("debrief");
  });

  test("дэлбэрэлтийн үед гадаа байвал 1 зүрх алдана, байранд бол үгүй", () => {
    const base = { ...createGame(1), flare: 3, problem: "flare" as const };
    const hit = run(at(base, 20, 0), 1);
    expect(hit.hearts).toBe(2);
    expect(hit.losses.map((l) => l.cause)).toEqual(["radiation"]);
    expect(run(at(base, SHELTER.x, SHELTER.z), 1).hearts).toBe(3);
  });

  test("скафандрын O2 гадаа буурч, байранд цэнэглэгдэнэ", () => {
    const out = run(at(createGame(1), 20, 0), 10);
    expect(out.suitO2).toBeLessThan(90);
    expect(run(at(out, 0, 0), 2).suitO2).toBe(100);
  });

  test("скафандрын O2 дуусвал зүрх алдаж, шалтгааныг тэмдэглэнэ", () => {
    const s = run(at(game({ suitO2: 1 }), 20, 0), 1);
    expect(s.hearts).toBe(2);
    expect(s.losses[0].cause).toBe("suit");
  });

  test("гүйлтийн зам дээр 3 секунд зогсвол дасгал хийгдэнэ", () => {
    const s = run(at({ ...createGame(1), fitness: 50 }, GYM.x, GYM.z), 3.5);
    expect(s.fitness).toBe(100);
    expect(s.exercisedSol).toBe(1);
  });
});

describe("эрчим хүчний төсөв", () => {
  const empty = { oxygen: 50, water: 50, food: 50, battery: 0 };

  test("шөнө батарей хоосон бол машин ажиллахгүй", () => {
    const next = tick(game({ time: NIGHT, res: empty }), idle, 0.05);
    expect(next.load).toBe(0);
    expect(next.res.oxygen).toBeLessThan(50);
  });

  test("батарей хүрэлцэж байвал машин бүрэн хүчээр ажиллана", () => {
    const next = tick(game({ time: NIGHT, res: { ...empty, battery: 80 } }), idle, 0.05);
    expect(next.load).toBe(1);
    expect(next.res.oxygen).toBeGreaterThan(50);
    expect(next.res.battery).toBeLessThan(80);
  });

  test("нэг машинаа унтраавал үлдсэн нь илүү хүчтэй ажиллана", () => {
    const s = game({ time: NOON, res: empty, dust: 0.6 });
    const all = tick(s, idle, 0.05);
    const two = tick({ ...s, on: { ...s.on, recycler: false } }, idle, 0.05);
    expect(all.load).toBeLessThan(1);
    expect(two.load).toBeGreaterThan(all.load);
    expect(two.res.oxygen).toBeGreaterThan(all.res.oxygen);
  });

  test("эвдэрсэн машин эрчим хүч авахгүй, юу ч хийхгүй", () => {
    const s = game({ time: NIGHT, res: { ...empty, battery: 80 } });
    const fine = tick(s, idle, 0.05);
    const broken = tick({ ...s, broken: "o2" }, idle, 0.05);
    expect(broken.res.oxygen).toBeLessThan(50);
    expect(broken.res.battery).toBeGreaterThan(fine.res.battery);
  });

  test("бүх машин өдөржин асвал батарей цэнэглэгдэхгүй, нэгийг унтраавал цэнэглэгдэнэ (trade-off)", () => {
    const s = game({ res: { oxygen: 100, water: 100, food: 100, battery: 0 } });
    const day = SOL_SECONDS * DAY_PART - 1; // нар жаргахын өмнөхөн
    expect(run(at(s, 0, 0), day).res.battery).toBeLessThan(10);
    expect(run(at({ ...s, on: { ...s.on, greenhouse: false } }, 0, 0), day).res.battery).toBeGreaterThan(20);
  });
});

describe("баримт ба тэмдэглэл", () => {
  test("нөөц дуусвал зүрх алдаж, шалтгааныг тэмдэглэнэ", () => {
    const s = at(game({ time: NIGHT, res: { oxygen: 0, water: 50, food: 50, battery: 0 } }), 0, 0);
    expect(run(s, 5).losses[0]).toMatchObject({ cause: "oxygen", machineOn: true, broken: false, night: true, load: 0 });
  });

  test("баримт бүрийг ганц удаа үзүүлнэ", () => {
    const first = tick(at(createGame(1), createGame(1).ice[0].x, createGame(1).ice[0].z), idle, 0.05);
    expect(first.seen).toContain("ice");
    const quiet = { ...first, toast: null };
    const second = tick(at(quiet, quiet.ice[0].x, quiet.ice[0].z), idle, 0.05);
    expect(second.collected).toBe(2);
    expect(second.toast).toBeNull();
  });

  test("агаар үйлдвэр дээр очиход MOXIE-ийн баримт гарна", () => {
    expect(tick(at(createGame(1), -9, 2), idle, 0.05).toast?.text).toBe(FACTS.moxie);
  });
});
