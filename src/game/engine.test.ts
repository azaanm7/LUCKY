import { describe, expect, test } from "bun:test";
import { DAY_PART, ICE_WATER, SHELTER, SOL_SECONDS, WIN_SOL } from "./config";
import { createGame, tick } from "./engine";
import type { GameState, Input } from "./types";

const idle: Input = { dx: 0, dz: 0, action: false };
const run = (s: GameState, seconds: number, input = idle) => {
  for (let t = 0; t < seconds; t += 0.05) s = tick(s, input, 0.05);
  return s;
};
const NIGHT = SOL_SECONDS * 0.8; // шөнийн цаг
const NOON = SOL_SECONDS * 0.35; // үд дунд
const quiet = (over: Partial<GameState>): GameState => ({ ...createGame(1), nextEventAt: 9999, ...over });

describe("tick", () => {
  test("анхны state-ийг өөрчлөхгүй (immutable)", () => {
    const s = createGame(1);
    tick(s, { dx: 1, dz: 0, action: false }, 0.1);
    expect(s.time).toBe(0);
    expect(s.player.x).toBe(0);
  });

  test("мөс түүвэл ус нэмэгдэнэ", () => {
    const s = createGame(1);
    const ice = s.ice[0];
    const next = tick({ ...s, player: { ...s.player, x: ice.x, z: ice.z } }, idle, 0.05);
    expect(next.collected).toBe(1);
    expect(next.res.water).toBeGreaterThan(s.res.water + ICE_WATER - 1);
    expect(next.ice.length).toBe(s.ice.length); // шинэ мөс гарч ирнэ
  });

  test("дэлбэрэлтийн үед гадаа байвал 1 зүрх алдана", () => {
    const s = quiet({ flare: 3, player: { x: 20, z: 0, angle: 0, moving: false } });
    const next = run(s, 1);
    expect(next.hearts).toBe(2);
    expect(next.losses.map((l) => l.cause)).toEqual(["radiation"]);
  });

  test("хоргодох байранд байвал хамгаалагдана", () => {
    const s = quiet({ flare: 3, player: { x: SHELTER.x, z: SHELTER.z, angle: 0, moving: false } });
    expect(run(s, 1).hearts).toBe(3);
  });

  test("машины дэвсгэр дээр товч дарвал асаана / унтраана", () => {
    const s = { ...createGame(1), player: { x: -9, z: 2, angle: 0, moving: false } };
    const next = tick(s, { ...idle, action: true }, 0.05);
    expect(next.on.o2).toBe(!s.on.o2);
  });

  test("юу ч хийхгүй бол ялахгүй", () => {
    const s = run(createGame(1), WIN_SOL * SOL_SECONDS + 1);
    expect(s.status).toBe("lost");
  });
});

describe("эрчим хүчний төсөв", () => {
  const empty = { oxygen: 50, water: 50, food: 50, battery: 0 };

  test("шөнө батарей хоосон бол машин ажиллахгүй", () => {
    const next = tick(quiet({ time: NIGHT, res: empty }), idle, 0.05);
    expect(next.load).toBe(0);
    expect(next.res.oxygen).toBeLessThan(50);
  });

  test("батарей хүрэлцэж байвал машин бүрэн хүчээр ажиллана", () => {
    const next = tick(quiet({ time: NIGHT, res: { ...empty, battery: 80 } }), idle, 0.05);
    expect(next.load).toBe(1);
    expect(next.res.oxygen).toBeGreaterThan(50);
    expect(next.res.battery).toBeLessThan(80);
  });

  test("нэг машинаа унтраавал үлдсэн нь илүү хүчтэй ажиллана", () => {
    const s = quiet({ time: NOON, res: empty, dust: 0.6 });
    const all = tick(s, idle, 0.05);
    const two = tick({ ...s, on: { ...s.on, recycler: false } }, idle, 0.05);
    expect(all.load).toBeLessThan(1);
    expect(two.load).toBeGreaterThan(all.load);
    expect(two.res.oxygen).toBeGreaterThan(all.res.oxygen);
  });

  test("бүх машин өдөржин асвал батарей цэнэглэгдэхгүй, нэгийг унтраавал цэнэглэгдэнэ (trade-off)", () => {
    const s = quiet({ res: { oxygen: 100, water: 100, food: 100, battery: 0 } });
    const day = SOL_SECONDS * DAY_PART - 1; // нар жаргахын өмнөхөн
    expect(run(s, day).res.battery).toBeLessThan(10);
    expect(run({ ...s, on: { ...s.on, greenhouse: false } }, day).res.battery).toBeGreaterThan(50);
  });
});

describe("баримт ба тэмдэглэл", () => {
  test("нөөц дуусвал зүрх алдаж, шалтгааныг тэмдэглэнэ", () => {
    const s = quiet({ time: NIGHT, res: { oxygen: 0, water: 50, food: 50, battery: 0 } });
    const loss = run(s, 5).losses[0];
    expect(loss).toMatchObject({ cause: "oxygen", machineOn: true, night: true, load: 0 });
  });

  test("баримт бүрийг ганц удаа үзүүлнэ", () => {
    const s = createGame(1);
    const at = (st: GameState, i: number) => ({ ...st, player: { ...st.player, x: st.ice[i].x, z: st.ice[i].z } });
    const first = tick(at(s, 0), idle, 0.05);
    expect(first.seen).toContain("ice");
    const second = tick(at({ ...first, toast: null }, 0), idle, 0.05);
    expect(second.collected).toBe(2);
    expect(second.toast).toBeNull();
  });
});
