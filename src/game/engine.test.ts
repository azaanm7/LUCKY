import { describe, expect, test } from "bun:test";
import { DEPOT, GYM, SHELTER, SOL_SECONDS, WIN_SOL } from "./config";
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
    expect(next.res.water).toBeGreaterThan(s.res.water);
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
    expect(run(at(base, 20, 0), 1).hearts).toBe(2);
    expect(run(at(base, SHELTER.x, SHELTER.z), 1).hearts).toBe(3);
  });

  test("скафандрын O2 гадаа буурч, байранд цэнэглэгдэнэ", () => {
    const out = run(at(createGame(1), 20, 0), 10);
    expect(out.suitO2).toBeLessThan(90);
    expect(run(at(out, 0, 0), 2).suitO2).toBe(100);
  });

  test("гүйлтийн зам дээр 3 секунд зогсвол дасгал хийгдэнэ", () => {
    const s = run(at({ ...createGame(1), fitness: 50 }, GYM.x, GYM.z), 3.5);
    expect(s.fitness).toBe(100);
    expect(s.exercisedSol).toBe(1);
  });
});
