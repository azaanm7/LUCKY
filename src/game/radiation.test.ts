import { describe, expect, test } from "bun:test";
import { DOSE, FLARE_SECONDS, PROBLEM_TIMES, RAD_MSV_PER_SOL, SHELTER, SOL_SECONDS } from "./config";
import { FLARES } from "./donki";
import { createGame, tick } from "./engine";
import { advise } from "./missions";
import { flareDose, shelteredFlareDose } from "./radiation";
import { at, game, idle, run } from "./testing";
import type { Flare, GameState } from "./types";

const OUT = { x: 20, z: 0 };
const outside = (s: GameState) => at(s, OUT.x, OUT.z);
const inside = (s: GameState) => at(s, SHELTER.x, SHELTER.z);
const STRONG = FLARES[0]; // X9.0, DONKI архив
const WEAK: Flare = { date: "2026-11-05", cls: "M3.5", region: 0, link: "", live: true };

describe("багийн цацрагийн тун", () => {
  test("суурь хурд нь Curiosity RAD-ийн 0.64 mSv/өдөр (масштабласан)", () => {
    const s = run(outside(game({})), 10);
    expect(s.dose).toBeCloseTo((RAD_MSV_PER_SOL * DOSE.perMsv * 10) / SOL_SECONDS, 1);
  });

  test("гадаа хурдан, хоргодох байранд удаан нэмэгдэнэ, хэзээ ч буурахгүй", () => {
    const out = run(outside(game({})), 10);
    const sheltered = run(inside(game({})), 10);
    expect(out.dose).toBeGreaterThan(sheltered.dose);
    expect(sheltered.dose).toBeGreaterThan(0);
    expect(run(inside(out), 10).dose).toBeGreaterThan(out.dose); // байранд орсон ч буурахгүй
  });

  test("хүчтэй DONKI дэлбэрэлт их тун өгнө", () => {
    expect(flareDose(STRONG)).toBeGreaterThan(flareDose(WEAK));
    const during = (f: Flare) => run(inside(game({ flare: FLARE_SECONDS, solarFlare: f })), FLARE_SECONDS).dose;
    expect(during(STRONG)).toBeGreaterThan(during(WEAK));
  });

  test("бамбай хоргодох байран дахь дэлбэрэлтийн тунг багасгана", () => {
    const flare = (shield: boolean) => run(inside(game({ flare: FLARE_SECONDS, solarFlare: STRONG, shield })), FLARE_SECONDS);
    expect(flare(true).dose).toBeLessThan(flare(false).dose / 4);
    expect(flare(false).flareDose).toBeCloseTo(shelteredFlareDose(STRONG, false), 0);
  });

  test("100-д хүрвэл ганц удаа 1 зүрх алдаж, шалтгааныг тэмдэглэнэ", () => {
    const hit = run(outside(game({ dose: DOSE.limit - 0.1 })), 2);
    expect(hit.hearts).toBe(2);
    expect(hit.dose).toBe(DOSE.limit);
    expect(hit.losses.map((l) => l.cause)).toEqual(["dose"]);
    expect(run(hit, 5).hearts).toBe(2); // дахин алдахгүй
  });

  test("Дэлхий тун хэт өсөх үед л бамбайг зөвлөнө", () => {
    const facing = (over: Partial<GameState>) => tick(inside({ ...createGame(1), deck: ["flare"], time: PROBLEM_TIMES[0], ...over }), idle, 0.05);
    expect(advise(facing({ solarFlare: WEAK }))).toBe("b");
    expect(advise(facing({ solarFlare: WEAK, dose: 70 }))).toBe("a");
    expect(advise(facing({ solarFlare: STRONG }))).toBe("a");
  });
});
