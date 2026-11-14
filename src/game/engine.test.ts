import { describe, expect, test } from "bun:test";
import { SHELTER, SOL_SECONDS, WIN_SOL } from "./config";
import { createGame, tick } from "./engine";
import type { GameState, Input } from "./types";

const idle: Input = { dx: 0, dz: 0, action: false };
const run = (s: GameState, seconds: number, input = idle) => {
  for (let t = 0; t < seconds; t += 0.05) s = tick(s, input, 0.05);
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
    const ice = s.ice[0];
    const next = tick({ ...s, player: { ...s.player, x: ice.x, z: ice.z } }, idle, 0.05);
    expect(next.collected).toBe(1);
    expect(next.res.water).toBeGreaterThan(s.res.water);
    expect(next.ice.length).toBe(s.ice.length); // шинэ мөс гарч ирнэ
  });

  test("дэлбэрэлтийн үед гадаа байвал 1 зүрх алдана", () => {
    const s = { ...createGame(1), flare: 3, nextEventAt: 999, player: { x: 20, z: 0, angle: 0, moving: false } };
    expect(run(s, 1).hearts).toBe(2);
  });

  test("хоргодох байранд байвал хамгаалагдана", () => {
    const s = { ...createGame(1), flare: 3, nextEventAt: 999, player: { x: SHELTER.x, z: SHELTER.z, angle: 0, moving: false } };
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
