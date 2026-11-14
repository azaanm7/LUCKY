import { describe, expect, test } from "bun:test";
import { DRILL_O2, DRILL_SECONDS, SAMPLES_MAX, SITES, SITE_SAMPLES, STARS, SUIT_USE } from "./config";
import { starsOf } from "./science";
import { at, game, run } from "./testing";

const [soil, , crater] = SITES;

describe("шинжлэх ухааны экспедиц", () => {
  test("талбай дээр зогсвол дээж өрөмдөнө, скафандрын O2 хурдан буурна", () => {
    const s = run(at(game({}), soil.x, soil.z), DRILL_SECONDS + 0.1);
    expect(s.samples).toEqual([soil.worth]);
    expect(s.siteLeft.soil).toBe(SITE_SAMPLES - 1);
    expect(s.suitO2).toBeLessThan(100 - DRILL_SECONDS * (SUIT_USE + DRILL_O2) + 1);
    expect(s.seen).toContain("soil");
  });

  test("хол талбайн дээж илүү үнэтэй", () => {
    expect(crater.worth).toBeGreaterThan(soil.worth);
    expect(Math.hypot(crater.x, crater.z)).toBeGreaterThan(Math.hypot(soil.x, soil.z));
  });

  test("дээжээ хоргодох байранд хүргэвэл оноо болно", () => {
    const s = run(at(game({ samples: [3, 3] }), 0, 0), 0.1);
    expect(s.science).toBe(6);
    expect(s.samples).toEqual([]);
  });

  test("гартаа дээд тал нь 3 дээж авч явна, талбайн дээж дуусдаг", () => {
    const full = run(at(game({ samples: Array(SAMPLES_MAX).fill(1), suitO2: 100 }), soil.x, soil.z), 2);
    expect(full.drill).toBe(0);
    const empty = run(at(game({ siteLeft: { soil: 0, delta: 4, crater: 4 } }), soil.x, soil.z), 2);
    expect(empty.drill).toBe(0);
  });

  test("скафандрын O2 дуусвал аврагдаж, дээжээ гээнэ", () => {
    const s = run(at(game({ samples: [3], suitO2: 3 }), crater.x, crater.z), 1);
    expect(s.hearts).toBe(2);
    expect(s.samples).toEqual([]);
    expect(s.science).toBe(0);
    expect(s.losses[0]).toMatchObject({ cause: "suit", drilling: true });
  });

  test("од: амьд үлдвэл 1, оноо цуглуулбал 2-3, ялагдвал 0", () => {
    expect(starsOf(game({ status: "won" }))).toBe(1);
    expect(starsOf(game({ status: "won", science: STARS[0] }))).toBe(2);
    expect(starsOf(game({ status: "won", science: STARS[1] }))).toBe(3);
    expect(starsOf(game({ status: "lost", science: 99 }))).toBe(0);
  });
});
