import * as THREE from "three";
import { DEPOT } from "../game/config";
import type { GameState, Material, RecipeId } from "../game/types";
import { MATERIAL_ICON } from "../ui/icons";
import { createGlow, glowMat, mat, mesh } from "./models";
import { createMarker } from "./pixel-sprite";

const MATERIALS: Material[] = ["ice", "ore", "seed"];
const SHOWN = 6; // овоолгод хамгийн ихдээ хэдэн ширхэг харуулах
const PRINT_COLOR: Record<RecipeId, string> = { part: "#ffcd75", panel: "#41a6f6", tank: "#73eff7" };

// 3D принтер: хэвлэж байхад толгой нь нааш цааш явж, бүтээгдэхүүн доороос дээш ургана
function createPrinter() {
  const g = new THREE.Group();
  const frame = mat("#c9ced4"), dark = mat("#4a5160");
  g.add(mesh(new THREE.BoxGeometry(2, 0.5, 1.6), dark, 0, 0.25, 0));
  for (const [x, z] of [[-0.9, -0.7], [0.9, -0.7], [-0.9, 0.7], [0.9, 0.7]]) g.add(mesh(new THREE.BoxGeometry(0.1, 1.9, 0.1), frame, x, 1.4, z));
  g.add(mesh(new THREE.BoxGeometry(2, 0.12, 1.6), frame, 0, 2.35, 0));
  const head = mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), mat("#ef7d57"), 0, 2.1, 0);
  const nozzle = glowMat("#a0522d", 0);
  head.add(mesh(new THREE.ConeGeometry(0.08, 0.2, 6), nozzle, 0, -0.22, 0).rotateX(Math.PI));
  const product = mesh(new THREE.BoxGeometry(0.7, 1, 0.7), glowMat("#ffcd75", 0.6), 0, 0.5, 0);
  const lamp = glowMat("#38b764", 1.2);
  g.add(head, product, mesh(new THREE.SphereGeometry(0.12, 8, 6), lamp, 0.85, 2.55, 0.65));
  const halo = createGlow("#a07cff", 4, 0);
  halo.position.y = 1.2;
  g.add(halo);
  return {
    root: g,
    set(s: GameState, t: number) {
      const job = s.job, on = !!job && s.load > 0;
      head.position.x = on ? Math.sin(t * 9) * 0.6 : 0;
      head.position.z = on ? Math.cos(t * 6.3) * 0.4 : 0;
      nozzle.emissiveIntensity = on ? 2 : 0;
      product.visible = !!job;
      if (job) {
        const k = Math.max(0.05, job.done);
        product.scale.set(1, k, 1);
        product.position.y = 0.5 + k * 0.5;
        (product.material as THREE.MeshStandardMaterial).color.set(PRINT_COLOR[job.recipe]);
        (product.material as THREE.MeshStandardMaterial).emissive.set(PRINT_COLOR[job.recipe]);
      }
      lamp.color.set(job ? "#a07cff" : "#38b764");
      lamp.emissive.copy(lamp.color);
      halo.material.opacity = on ? 0.35 + Math.sin(t * 8) * 0.1 : 0;
    },
  };
}

// Агуулах: мөс, хүдэр, үр бүрийн овоолго. Хэд байгаа нь шууд харагдана.
function createPile(kind: Material) {
  const g = new THREE.Group();
  const look = {
    ice: () => mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), mat("#bfe9ff", { emissive: "#3aa6d9", emissiveIntensity: 0.6, roughness: 0.2 })),
    ore: () => mesh(new THREE.DodecahedronGeometry(0.22, 0), mat("#8a4a30", { emissive: "#d06a20", emissiveIntensity: 0.25 })),
    seed: () => mesh(new THREE.CapsuleGeometry(0.13, 0.18, 3, 6), mat("#38b764")),
  }[kind];
  const items = Array.from({ length: SHOWN }, (_, i) => {
    const m = look();
    m.position.set((i % 3 - 1) * 0.4, 0.2 + Math.floor(i / 3) * 0.36, (i % 2) * 0.1);
    g.add(m);
    return m;
  });
  const marker = createMarker(MATERIAL_ICON[kind], 0.03);
  marker.position.y = 1.35;
  g.add(mesh(new THREE.BoxGeometry(1.4, 0.06, 0.8), mat("#4a5160"), 0, 0.03, 0), marker);
  return { root: g, set: (n: number) => { items.forEach((m, i) => { m.visible = i < n; }); marker.visible = n > 0; } };
}

export function createWorkshop(scene: THREE.Scene) {
  const printer = createPrinter();
  printer.root.position.set(DEPOT.x + 2.8, 0, DEPOT.z + 0.4);
  printer.root.rotation.y = -0.5;
  const piles = MATERIALS.map((kind, i) => {
    const p = createPile(kind);
    p.root.position.set(DEPOT.x + 2.4 + i * 0.2, 0, DEPOT.z - 1.8 - i * 1.05);
    p.root.rotation.y = -0.5;
    scene.add(p.root);
    return { kind, ...p };
  });
  scene.add(printer.root);
  return (s: GameState, t: number) => {
    printer.set(s, t);
    for (const p of piles) p.set(Math.min(SHOWN, s.store[p.kind]));
  };
}
