import { expect, test } from "bun:test";
import { explorer, idle, manager, shelterOnly, winRate } from "./bots";
import type { GameState } from "./types";

// Тэнцвэрийн шалгалт: тоо (config.ts) өөрчлөгдөхөд тоглоомын гол сургамж эвдрээгүйг батална.
const GAMES = 60;
const CHILD = 0.4; // цагийнхаа 40%-д л хөдөлдөг удаан тоглогч
const recyclerOff = (s: GameState): GameState => ({ ...s, on: { ...s.on, recycler: false } });

test("юу ч хийхгүй эсвэл зөвхөн нуугдвал хэзээ ч ялахгүй", () => {
  expect(winRate(idle, GAMES)).toBe(0);
  expect(winRate(shelterOnly, GAMES)).toBe(0);
});

test("эрчим хүчээ удирдсан тоглогч бараг үргэлж ялна", () => {
  expect(winRate(manager(1), GAMES)).toBeGreaterThanOrEqual(95);
  expect(winRate(manager(CHILD), GAMES)).toBeGreaterThanOrEqual(85);
});

test("машинд хүрэхгүй тоглогч ялж болно, гэхдээ удирдсанаас муу", () => {
  const hands_off = winRate(explorer(CHILD), GAMES);
  expect(hands_off).toBeGreaterThan(30);
  expect(hands_off).toBeLessThan(winRate(manager(CHILD), GAMES) - 10);
});

test("ус цэвэршүүлэгчийг үүрд унтраах нь удаан тоглогчид бүтэхгүй", () => {
  expect(winRate(explorer(CHILD), GAMES, recyclerOff)).toBeLessThan(winRate(manager(CHILD), GAMES) - 20);
});
