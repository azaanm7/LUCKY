import * as THREE from "three";
import type { GameState } from "../game/types";
import { glowTex } from "./models";

const COUNT = 700, BOX = 70, TALL = 14;

// Шороон шуурга: салхинд хийсэх шороон ширхэгүүд. Шуургагүй үед харагдахгүй.
export function createDust(scene: THREE.Scene) {
  const pts = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) pts.set([(Math.random() - 0.5) * BOX, Math.random() * TALL, (Math.random() - 0.5) * BOX], i * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  const material = new THREE.PointsMaterial({ color: "#e0a36a", size: 0.7, map: glowTex(), transparent: true, opacity: 0, depthWrite: false, fog: false });
  const dust = new THREE.Points(geo, material);
  dust.frustumCulled = false;
  scene.add(dust);

  return function update(s: GameState, dt: number, focus: THREE.Vector3) {
    material.opacity += ((s.storm > 0 ? 0.75 : 0) - material.opacity) * Math.min(1, dt * 2);
    dust.visible = material.opacity > 0.02;
    if (!dust.visible) return;
    dust.position.set(focus.x, 0, focus.z); // шуурга тоглогчийг дагана
    for (let i = 0; i < COUNT; i++) {
      const x = pts[i * 3] + (16 + (i % 7) * 2) * dt; // салхи +x зүгт
      pts[i * 3] = x > BOX / 2 ? x - BOX : x;
      pts[i * 3 + 1] = (pts[i * 3 + 1] + Math.sin(s.time * 2 + i) * dt * 1.5 + TALL) % TALL;
    }
    geo.attributes.position.needsUpdate = true;
  };
}
