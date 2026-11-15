import * as THREE from "three";
import { drawSprite, SIZE } from "../pixel/pix";
import type { SpriteName } from "../pixel/pix";
import { plain } from "../i18n/plain";

// Пиксел дүрсийг three.js-ийн texture болгоно (NearestFilter = цэгүүд бүдгэрэхгүй, хурц).
const textures = new Map<SpriteName, THREE.Texture>();
export function pixelTexture(name: SpriteName): THREE.Texture {
  const cached = textures.get(name);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = c.height = SIZE * 4;
  drawSprite(c.getContext("2d")!, name, 0, 0, 4);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  textures.set(name, tex);
  return tex;
}

// Цуглуулах зүйлсийн дээр хөвөх тэмдэг. Дэлгэц дээр үргэлж ижил хэмжээтэй (утсан дээр ч уншигдана).
export function createMarker(name: SpriteName, size = 0.045): THREE.Sprite {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: pixelTexture(name), transparent: true, sizeAttenuation: false, toneMapped: false, depthWrite: false }));
  s.scale.set(size, size, 1);
  s.renderOrder = 9;
  return s;
}

// Хаяг: пиксел дүрс + богино бичиг (эможиг хасна). Бичиг урт бол үсгийг жижигрүүлж багтаана.
export function createLabel(text: string, bg = "rgba(21,17,15,.82)", icon?: SpriteName, fg = "#f6eee6"): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.roundRect(8, 8, 496, 112, 28); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 4; ctx.stroke();
  const left = icon ? 108 : 28, room = 484 - left;
  if (icon) drawSprite(ctx, icon, 28, 22, 7); // 12 цэг × 7 = 84 пиксел
  const words = plain(text);
  let size = 50;
  ctx.font = `bold ${size}px Nunito, Segoe UI, sans-serif`;
  while (size > 26 && ctx.measureText(words).width > room) ctx.font = `bold ${(size -= 2)}px Nunito, Segoe UI, sans-serif`;
  ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(words, left + room / 2, 66, room);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false, toneMapped: false }));
  s.scale.set(0.168, 0.042, 1); // дэлгэц дээр үргэлж ижил хэмжээтэй
  s.renderOrder = 10;
  return s;
}
