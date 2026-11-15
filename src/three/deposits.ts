import * as THREE from "three";
import type { GameState, Material } from "../game/types";
import { MATERIAL_ICON } from "../ui/icons";
import { createGlow, mat, mesh } from "./models";
import { createMarker } from "./pixel-sprite";
import { height } from "./terrain";

// Газар дээрх цуглуулах зүйлс: мөсөн талст, хүдрийн чулуу, үрийн ачааны хайрцаг.
// Бүгд дээрээ пиксел тэмдэгтэй, гэрэлтэж хөвдөг тул холоос харагдана.
const GLOW: Record<Material, string> = { ice: "#6fd0ff", ore: "#ff9a5a", seed: "#a7f070" };

// Материалыг нэг удаа үүсгээд бүх ордод хуваалцана (frame бүр шинээр үүсгэхгүй)
const MATS = {
  ice: mat("#bfe9ff", { emissive: "#3aa6d9", emissiveIntensity: 0.9, roughness: 0.2, transparent: true, opacity: 0.92 }),
  rock: mat("#6b3a2a"),
  vein: mat("#e8a04a", { emissive: "#d06a20", emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.3 }),
  crate: mat("#d8d0c4"),
  band: mat("#38b764", { emissive: "#38b764", emissiveIntensity: 0.4 }),
  chute: mat("#ef7d57", { side: THREE.DoubleSide }),
};
// Хэлбэрүүдийг мөн нэг удаа үүсгэнэ: орд цуглуулагдаж шинээр гарах бүрд санах ой нэмэгдэхгүй
const GEO = {
  crystal: new THREE.OctahedronGeometry(1, 0), rock: new THREE.DodecahedronGeometry(1, 0), box: new THREE.BoxGeometry(1, 1, 1),
  chute: new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
};
const part = (geo: THREE.BufferGeometry, material: THREE.Material, size: number | [number, number, number], x: number, y: number, z: number) => {
  const m = mesh(geo, material, x, y, z);
  if (typeof size === "number") m.scale.setScalar(size); else m.scale.set(...size);
  return m;
};

function iceModel(g: THREE.Group) {
  g.add(part(GEO.crystal, MATS.ice, 0.55, 0, 0.9, 0), part(GEO.crystal, MATS.ice, 0.32, 0.45, 0.55, 0.2), part(GEO.crystal, MATS.ice, 0.28, -0.35, 0.5, -0.25));
}

// Хүдэр: бараан чулуу, дундуур нь гялалзсан металл судал
function oreModel(g: THREE.Group) {
  g.add(part(GEO.rock, MATS.rock, 0.6, 0, 0.45, 0), part(GEO.rock, MATS.rock, 0.35, 0.55, 0.25, 0.25));
  for (const [x, y, z] of [[0.2, 0.75, 0.35], [-0.35, 0.55, 0.3], [0.5, 0.45, -0.1]]) g.add(part(GEO.crystal, MATS.vein, 0.16, x, y, z));
}

// Үр: Дэлхийгээс урьдчилж буулгасан жижиг ачааны хайрцаг (Ангараг дээр үр ургадаггүй)
function seedModel(g: THREE.Group) {
  const box = part(GEO.box, MATS.crate, [0.9, 0.7, 0.9], 0, 0.35, 0);
  box.rotation.y = 0.4;
  const band = part(GEO.box, MATS.band, [0.94, 0.14, 0.94], 0, 0.45, 0);
  band.rotation.y = 0.4;
  const chute = mesh(GEO.chute, MATS.chute, 0.6, 0.05, -0.4);
  chute.rotation.z = 1.4; // газар унасан шүхэр
  g.add(box, band, chute);
}

const MODEL: Record<Material, (g: THREE.Group) => void> = { ice: iceModel, ore: oreModel, seed: seedModel };

function createDeposit(kind: Material) {
  const root = new THREE.Group(), body = new THREE.Group();
  MODEL[kind](body);
  const glow = createGlow(GLOW[kind], 3.2, 0.5);
  glow.position.y = 0.7;
  const marker = createMarker(MATERIAL_ICON[kind]);
  marker.position.y = 2.3;
  root.add(body, glow, marker);
  return { root, body, glow, marker, kind };
}

export function createDeposits(scene: THREE.Scene) {
  const shown = new Map<number, ReturnType<typeof createDeposit>>();
  return function update(s: GameState, t: number) {
    // state-д байгаа ордууд л дэлгэц дээр байна (цуглуулсан нь алга болно, шинэ нь гарч ирнэ)
    const ids = new Set(s.deposits.map((d) => d.id));
    for (const [id, d] of shown) if (!ids.has(id)) { scene.remove(d.root); d.glow.material.dispose(); d.marker.material.dispose(); shown.delete(id); }
    for (const dep of s.deposits) {
      let d = shown.get(dep.id);
      if (!d) { d = createDeposit(dep.kind); scene.add(d.root); shown.set(dep.id, d); }
      d.root.position.set(dep.x, height(dep.x, dep.z), dep.z);
      if (d.kind === "ice") { d.body.position.y = Math.sin(t * 2 + dep.id) * 0.2; d.body.rotation.y = t + dep.id; }
      d.marker.position.y = 2.3 + Math.sin(t * 3 + dep.id) * 0.15;
      d.glow.material.opacity = 0.35 + Math.sin(t * 2.5 + dep.id) * 0.15;
    }
  };
}
