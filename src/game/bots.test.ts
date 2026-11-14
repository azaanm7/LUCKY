import { expect, test } from "bun:test";
import { explorer, idle, manager, play, shelterOnly, winRate } from "./bots";
import type { Bot } from "./bots";
import { advise } from "./missions";
import type { GameState } from "./types";

// Тэнцвэрийн шалгалт: тоо (config.ts) өөрчлөгдөхөд тоглоомын гол сургамж эвдрээгүйг батална.
const GAMES = 24;
const SLOW = 20_000; // олон тоглолт тоглодог тул тест удаан
const CHILD = 0.4; // цагийнхаа 40%-д л хөдөлдөг удаан тоглогч
const recyclerOff = (s: GameState): GameState => ({ ...s, on: { ...s.on, recycler: false } });
const mean = (bot: Bot, of: (s: GameState) => number) => Array.from({ length: GAMES }, (_, i) => of(play(bot, i * 7919 + 1))).reduce((a, b) => a + b, 0) / GAMES;
const managing = winRate(manager(CHILD), GAMES);

test("юу ч хийхгүй эсвэл хоргодох байрандаа л суувал хэзээ ч ялахгүй", () => {
  expect(winRate(idle, GAMES)).toBe(0);
  expect(winRate(shelterOnly, GAMES)).toBe(0);
}, SLOW);

test("эрчим хүчээ удирдсан тоглогч бараг үргэлж ялна, аль ч төлөвлөгөөг сонгосон", () => {
  expect(winRate(manager(1), GAMES)).toBeGreaterThanOrEqual(95);
  expect(managing).toBeGreaterThanOrEqual(90);
  expect(winRate(manager(CHILD), GAMES, undefined, () => "b")).toBeGreaterThanOrEqual(85);
  expect(winRate(manager(CHILD), GAMES, undefined, advise)).toBeGreaterThanOrEqual(90);
}, SLOW);

test("машинд хүрэхгүй тоглогч ихэвчлэн ялна, гэхдээ зүрх алдана", () => {
  expect(winRate(explorer(CHILD), GAMES)).toBeGreaterThan(50);
  expect(mean(explorer(CHILD), (s) => s.hearts)).toBeLessThan(mean(manager(CHILD), (s) => s.hearts) - 0.5);
}, SLOW);

test("ус цэвэршүүлэгчийг үүрд унтраах нь удаан тоглогчид бүтэхгүй", () => {
  expect(winRate(explorer(CHILD), GAMES, recyclerOff)).toBeLessThan(managing - 20);
}, SLOW);

test("экспедицэд явбал оноо авна, аюулгүй тогловол 1 одтой үлдэнэ", () => {
  expect(mean(manager(1), (s) => s.science)).toBe(0);
  expect(mean(manager(1, true), (s) => s.science)).toBeGreaterThan(6);
  expect(winRate(manager(1, true), GAMES)).toBeGreaterThanOrEqual(95);
}, SLOW);
