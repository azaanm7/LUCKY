import * as THREE from "three";

export const mat = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.7, ...extra });

// Өөрөө гэрэлтдэг материал (гэрлийн зурвас, чийдэн)
export const glowMat = (color: string, intensity = 1.5) => mat(color, { emissive: color, emissiveIntensity: intensity });

export function mesh(geo: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

let glowTexture: THREE.Texture | null = null;
// Голдоо тод, захаараа уусдаг зөөлөн дугуй зураг
export function glowTex(): THREE.Texture {
  if (glowTexture) return glowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return (glowTexture = new THREE.CanvasTexture(c));
}

// Гэрлийн туяа (sprite). PointLight-аас хамаагүй хямд тул утсан дээр хурдан.
export function createGlow(color: string, size: number, opacity = 1, additive = true): THREE.Sprite {
  const blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, opacity, transparent: true, blending, depthWrite: false, fog: false }));
  s.scale.setScalar(size);
  s.userData.glow = true; // scene.ts: бүрэн бүдэгэрсэн үед зурахгүй
  return s;
}

// Сансрын нисэгч: цагаан хувцас, алтан шил, өнгөт бүс, нуруун дээр нь хүчилтөрөгчийн сав
export function createAstronaut(accent = "#e2693b") {
  const root = new THREE.Group();
  const suit = mat("#f4f1ec"), dark = mat("#3d4350"), color = mat(accent);
  const body = mesh(new THREE.CapsuleGeometry(0.42, 0.55, 4, 10), suit, 0, 1.05, 0);
  const belt = mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.12, 12), color, 0, 0.82, 0);
  const collar = mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.14, 12), color, 0, 1.5, 0);
  const head = mesh(new THREE.SphereGeometry(0.42, 16, 12), suit, 0, 1.82, 0);
  const visor = mesh(new THREE.SphereGeometry(0.36, 16, 12, -Math.PI / 2.6, Math.PI / 1.3, Math.PI / 4, Math.PI / 2.4),
    mat("#f2b632", { metalness: 0.8, roughness: 0.15, emissive: "#5a3a00" }), 0, 1.84, 0.1);
  const pack = mesh(new THREE.BoxGeometry(0.62, 0.7, 0.32), dark, 0, 1.15, -0.42);
  const tank = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8), color, 0, 1.2, -0.62);
  const legL = mesh(new THREE.CapsuleGeometry(0.16, 0.35, 3, 8), suit, -0.18, 0.38, 0);
  const legR = legL.clone(); legR.position.x = 0.18;
  const armL = mesh(new THREE.CapsuleGeometry(0.12, 0.42, 3, 8), suit, -0.55, 1.15, 0);
  const armR = armL.clone(); armR.position.x = 0.55;
  const lamp = createGlow("#d7ecff", 0.8, 0); // дуулганы гэрэл: шөнө асна
  lamp.position.set(0, 2.05, 0.38);
  root.add(body, belt, collar, head, visor, pack, tank, legL, legR, armL, armR, lamp);
  return { root, legL, legR, armL, armR, lamp };
}

export function createPad(): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.8, 32), new THREE.MeshBasicMaterial({ color: "#78c17c", transparent: true, opacity: 0.85 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.05;
  return m;
}

// Хаяг (createLabel) нь pixel-sprite.ts-д: пиксел дүрс + богино бичиг.
export { createLabel } from "./pixel-sprite";

// Зорих газрыг заах сум: газар дээр хэвтсэн хавтгай сум (иш + хошуу), бараан хүрээтэй тул улаан хөрсөн дээр тод.
// Дээрээс харахад аль тийш заасан нь шууд ойлгогдоно. +Z тал руу заана (lookAt-д тохирно).
function arrowShape(w: number): THREE.ShapeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-0.3 * w, 0); s.lineTo(0.3 * w, 0); s.lineTo(0.3 * w, 1.1); s.lineTo(0.8 * w, 1.1);
  s.lineTo(0, 1.1 + 1.0 * w); s.lineTo(-0.8 * w, 1.1); s.lineTo(-0.3 * w, 1.1); s.closePath();
  const g = new THREE.ShapeGeometry(s);
  g.rotateX(Math.PI / 2); // хавтгай хэвтүүлнэ: хошуу нь +Z
  return g;
}

export function createGuideArrow() {
  const root = new THREE.Group();
  const flat = (geo: THREE.BufferGeometry, color: string, order: number, y: number) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, depthTest: false, transparent: true, toneMapped: false }));
    m.renderOrder = order; m.position.y = y;
    root.add(m);
    return m;
  };
  const outline = flat(arrowShape(1.35), "#1a1c2c", 8, 0);
  outline.position.z = -0.2;
  const fill = flat(arrowShape(1), "#ffd84a", 9, 0.01);
  // Очих газар дээрх гэрлийн багана: холоос харагдана
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 14, 10, 1, true),
    new THREE.MeshBasicMaterial({ color: "#ffd84a", transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  root.scale.setScalar(1.35);
  root.visible = beam.visible = false;
  return { root, fill: fill.material as THREE.MeshBasicMaterial, beam };
}
