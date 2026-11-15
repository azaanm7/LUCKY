import { expect, test } from "bun:test";
import { PALETTE, SIZE, SPRITES, pixels, spriteUrl } from "./pix";
import type { SpriteName } from "./pix";

const names = Object.keys(SPRITES) as SpriteName[];

test("дүрс бүр 12×12 цэгтэй, зөвхөн самбарын өнгөтэй", () => {
  for (const name of names) {
    const rows: readonly string[] = SPRITES[name];
    expect([name, rows.length]).toEqual([name, SIZE]);
    rows.forEach((row, y) => {
      expect([name, y, row.length]).toEqual([name, y, SIZE]);
      for (const ch of row) expect([name, y, ch === "." || ch in PALETTE]).toEqual([name, y, true]);
    });
  }
});

test("дүрс бүр хоосон биш, зураг болж чадна", () => {
  for (const name of names) {
    expect(pixels(name).length).toBeGreaterThan(15);
    expect(spriteUrl(name).startsWith("data:image/svg+xml,")).toBe(true);
  }
  expect(Object.keys(PALETTE).length).toBeLessThanOrEqual(16);
});
