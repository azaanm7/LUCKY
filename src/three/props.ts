import * as THREE from "three";
import { ITEMS } from "../game/config";
import type { ItemId } from "../game/types";
import { mat, mesh } from "./models";

// Сэлбэгийн агуулах: хэдэн хайрцаг, тэмдэгтэй
export function createDepot(): THREE.Group {
  const g = new THREE.Group();
  const crate = mat("#c9a26b"), band = mat("#6b5640");
  const boxes: [number, number, number, number][] = [[0, 0.6, 0, 1.2], [1.1, 0.45, 0.3, 0.9], [-1, 0.45, -0.2, 0.9], [0.2, 1.55, 0.1, 0.8]];
  for (const [x, y, z, s] of boxes) {
    g.add(mesh(new THREE.BoxGeometry(s, s, s), crate, x, y, z));
    g.add(mesh(new THREE.BoxGeometry(s + 0.02, 0.12, s + 0.02), band, x, y, z));
  }
  return g;
}

// Холбооны антен: Дэлхийтэй холбогддог
export function createDish(): { root: THREE.Group; head: THREE.Group; light: THREE.Mesh } {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.15, 0.25, 3, 8), mat("#c9ced4"), 0, 1.5, 0));
  const head = new THREE.Group();
  head.position.y = 3.1;
  const bowl = mesh(new THREE.SphereGeometry(1.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3), mat("#f1ece4", { side: THREE.DoubleSide }));
  bowl.rotation.x = Math.PI * 0.7;
  head.add(bowl, mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), mat("#888"), 0, 0.2, 0.45).rotateX(0.9));
  const light = mesh(new THREE.SphereGeometry(0.12, 8, 6), mat("#7fe0ff", { emissive: "#7fe0ff" }), 0, 0.8, 0.9);
  head.add(light);
  g.add(head);
  return { root: g, head, light };
}

// Сансрын нисэгчийн толгой дээр барьж яваа сэлбэг
export function createCarried(): Record<ItemId, THREE.Mesh> {
  const out = {} as Record<ItemId, THREE.Mesh>;
  for (const id of Object.keys(ITEMS) as ItemId[]) {
    const m = mat(ITEMS[id].color, { emissive: ITEMS[id].color, emissiveIntensity: 0.4 });
    out[id] = mesh(new THREE.BoxGeometry(0.6, 0.45, 0.45), m);
    out[id].visible = false;
  }
  return out;
}
