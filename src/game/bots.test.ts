import { expect, test } from "bun:test";
import { explorer, idle, manager, shelterOnly, winRate } from "./bots";
import type { GameState } from "./types";

// Тэнцвэрийн шалгалт: тоо (config.ts) өөрчлөгдөхөд тоглоомын гол сургамж эвдрээгүйг батална.
const GAMES = 24;
const SLOW = 20_000; // олон тоглолт тоглодог тул тест удаан
const CHILD = 0.4; // цагийнхаа 40%-д л хөдөлдөг удаан тоглогч
const recyclerOff = (s: GameState): GameState => ({ ...s, on: { ...s.on, recycler: false } });
const managing = winRate(manager(CHILD), GAMES);

test("юу ч хийхгүй эсвэл хоргодох байрандаа л суувал хэзээ ч ялахгүй", () => {
  expect(winRate(idle, GAMES)).toBe(0);
  expect(winRate(shelterOnly, GAMES)).toBe(0);
}, SLOW);

test("эрчим хүчээ удирдсан тоглогч бараг үргэлж ялна", () => {
  expect(winRate(manager(1), GAMES)).toBeGreaterThanOrEqual(95);
  expect(managing).toBeGreaterThanOrEqual(90);
}, SLOW);

test("машинд хүрэхгүй тоглогч ялж болно, гэхдээ удирдсанаас муу", () => {
  const handsOff = winRate(explorer(CHILD), GAMES);
  expect(handsOff).toBeGreaterThan(40);
  expect(handsOff).toBeLessThan(managing - 10);
}, SLOW);

test("ус цэвэршүүлэгчийг үүрд унтраах нь удаан тоглогчид бүтэхгүй", () => {
  expect(winRate(explorer(CHILD), GAMES, recyclerOff)).toBeLessThan(managing - 20);
}, SLOW);
