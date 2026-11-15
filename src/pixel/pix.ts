import { SPRITES_A } from "./sprites-a";
import { SPRITES_B } from "./sprites-b";
import { SPRITES_C } from "./sprites-c";
import { SPRITES_D } from "./sprites-d";

// Тоглоомын бүх дүрс нэг хязгаарлагдмал өнгөний самбартай (16 өнгө), 12×12 цэгтэй. Ингэснээр бүгд нэг тоглоомынх шиг харагдана.
export const SIZE = 12;
export const PALETTE: Record<string, string> = {
  k: "#1a1c2c", w: "#f4f4f4", g: "#94b0c2", d: "#566c86",
  r: "#b13e53", o: "#ef7d57", y: "#ffcd75", l: "#a7f070",
  n: "#38b764", t: "#257179", b: "#3b5dc9", c: "#41a6f6",
  a: "#73eff7", p: "#5d275d", m: "#a0522d",
};

export const SPRITES = { ...SPRITES_A, ...SPRITES_B, ...SPRITES_C, ...SPRITES_D };
export type SpriteName = keyof typeof SPRITES;

// Дүрсний цэг бүрийг (x, y, өнгө) болгож өгнө
export function pixels(name: SpriteName): { x: number; y: number; color: string }[] {
  const out: { x: number; y: number; color: string }[] = [];
  SPRITES[name].forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] !== ".") out.push({ x, y, color: PALETTE[row[x]] });
  });
  return out;
}

const urls = new Map<SpriteName, string>();

// <img>-д тавих SVG (цэг бүр нэг дөрвөлжин). Нэг удаа үүсгээд хадгална.
export function spriteUrl(name: SpriteName): string {
  const cached = urls.get(name);
  if (cached) return cached;
  const rects = pixels(name).map((p) => `<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">${rects}</svg>`;
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  urls.set(name, url);
  return url;
}

// Canvas дээр зурна (three.js-ийн texture, хаягны дүрс). scale = нэг цэг хэдэн пиксел.
export function drawSprite(ctx: CanvasRenderingContext2D, name: SpriteName, left: number, top: number, scale: number) {
  for (const p of pixels(name)) {
    ctx.fillStyle = p.color;
    ctx.fillRect(left + p.x * scale, top + p.y * scale, scale, scale);
  }
}
