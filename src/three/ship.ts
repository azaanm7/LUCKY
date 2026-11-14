import * as THREE from "three";
import type { GameState } from "../game/types";
import { createGlow, glowMat, mat, mesh } from "./models";

export const LANDING = { x: 8, z: 11 }; // нөөцийн хөлөг буух газар
const DESCENT = 3.6; // буух хугацаа (секунд)

// Нөөцийн хөлөг: тоглогч ялахад тэнгэрээс бууж ирнэ
export function createShip(scene: THREE.Scene) {
  const g = new THREE.Group();
  const hull = mat("#f1ece4");
  g.add(mesh(new THREE.CylinderGeometry(1.1, 1.3, 5, 14), hull, 0, 3.6, 0));
  g.add(mesh(new THREE.ConeGeometry(1.1, 2.2, 14), mat("#e2693b"), 0, 7.2, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.3, 14), mat("#e2693b"), 0, 2.2, 0));
  g.add(mesh(new THREE.SphereGeometry(0.42, 10, 8), glowMat("#7fe0ff", 1.2), 0, 5, 1.05));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = mesh(new THREE.BoxGeometry(0.22, 2.6, 0.22), mat("#59616b"), Math.cos(a) * 1.6, 1.1, Math.sin(a) * 1.6);
    leg.rotation.set(Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45);
    g.add(leg);
  }
  const flame = createGlow("#ffb84a", 7, 0);
  flame.position.y = 0.6;
  g.add(flame);
  g.visible = false;
  scene.add(g);
  let clock = 0; // ялснаас хойших хугацаа (дүрслэлийн цаг: тоглоомын цаг зогссон байна)

  // Хөлгийн одоогийн өндрийг буцаана (камер дагана)
  return function update(s: GameState, dt: number): number {
    if (s.status !== "won") { clock = 0; g.visible = false; return 0; }
    clock += dt;
    const k = Math.min(1, clock / DESCENT);
    const y = (1 - k) ** 2 * 80;
    g.visible = true;
    g.position.set(LANDING.x, y, LANDING.z);
    flame.material.opacity = k < 1 ? 0.95 : Math.max(0, 0.95 - (clock - DESCENT) * 2); // буусны дараа хөдөлгүүр унтарна
    flame.scale.setScalar(6 + Math.sin(clock * 40) * 1.2);
    return y;
  };
}
