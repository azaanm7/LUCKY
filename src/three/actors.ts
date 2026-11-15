import * as THREE from "three";
import { PACK_MAX } from "../game/config";
import type { GameState, ItemId, Material } from "../game/types";
import { createDeposits } from "./deposits";
import { guideTarget } from "./guide";
import { createAstronaut, createGuideArrow, glowMat, mesh } from "./models";
import { createCarried } from "./props";
import { height } from "./terrain";

// Үүргэвчинд байгаа зүйл бүр нуруун дээр жижиг шоо болж харагдана: дээж, мөс, хүдэр, үр
const BIT_COLOR: Record<Material | "sample", string> = { sample: "#7fe0ff", ice: "#bfe9ff", ore: "#e8a04a", seed: "#a7f070" };

// Хөдөлдөг зүйлс: сансрын нисэгч, барьж яваа сэлбэг, цуглуулах ордууд, зорих газрыг заах сум
export function createActors(scene: THREE.Scene) {
  const astro = createAstronaut();
  const headlamp = new THREE.PointLight("#cfe4ff", 0, 11); // шөнө эргэн тойрноо гэрэлтүүлнэ
  headlamp.position.set(0, 2.2, 1.2);
  const carried = createCarried();
  for (const m of Object.values(carried)) { m.position.y = 2.75; astro.root.add(m); }
  // Үүргэвч: 2 × 3 үүр, нуруун дээр
  const bitMats = Object.fromEntries(Object.entries(BIT_COLOR).map(([k, c]) => [k, glowMat(c, 0.9)])) as Record<Material | "sample", THREE.MeshStandardMaterial>;
  const bits = Array.from({ length: PACK_MAX }, (_, i) =>
    mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), bitMats.sample, (i % 3 - 1) * 0.23, 1.0 + Math.floor(i / 3) * 0.26, -0.68));
  astro.root.add(headlamp, ...bits);
  const arrow = createGuideArrow();
  scene.add(astro.root, arrow.root, arrow.beam);
  const updateDeposits = createDeposits(scene);

  return function update(s: GameState, night: number) {
    const t = s.time, p = s.player, ground = height(p.x, p.z);
    // Алхахдаа хөл гараа савчина, сэлбэгээ толгой дээрээ барина
    const swing = p.moving ? Math.sin(t * 12) * 0.6 : 0;
    astro.root.position.set(p.x, ground + (p.moving ? Math.abs(Math.sin(t * 12)) * 0.12 : 0), p.z);
    astro.root.rotation.y = p.angle;
    astro.legL.rotation.x = swing; astro.legR.rotation.x = -swing;
    astro.armL.rotation.x = s.carrying ? -2.6 : -swing * 0.8;
    astro.armR.rotation.x = s.carrying ? -2.6 : swing * 0.8;
    for (const [id, m] of Object.entries(carried)) m.visible = s.carrying === (id as ItemId);
    const load: (Material | "sample")[] = [...s.samples.map(() => "sample" as const), ...s.pack];
    bits.forEach((b, i) => { b.visible = i < load.length; if (b.visible) b.material = bitMats[load[i]]; });
    astro.lamp.material.opacity = night;
    headlamp.intensity = night * 14;

    updateDeposits(s, t);

    // Сум астронавтын хажууд газар дээр хэвтэж, очих зүг рүү урагш хойш гулсана. Очих газар дээр гэрлийн багана.
    const target = guideTarget(s);
    const far = !!target && Math.hypot(target.to.x - p.x, target.to.z - p.z) > 2.5; // ирчихсэн бол сум хэрэггүй
    arrow.root.visible = far;
    arrow.beam.visible = far;
    if (!target) return;
    arrow.fill.color.set(target.color);
    (arrow.beam.material as THREE.MeshBasicMaterial).color.set(target.color);
    arrow.beam.position.set(target.to.x, height(target.to.x, target.to.z) + 7, target.to.z);
    if (!far) return;
    const dx = target.to.x - p.x, dz = target.to.z - p.z, len = Math.hypot(dx, dz);
    const ahead = 1.7 + (Math.sin(t * 5) + 1) * 0.25;
    arrow.root.position.set(p.x + (dx / len) * ahead, ground + 0.35, p.z + (dz / len) * ahead);
    arrow.root.lookAt(target.to.x, arrow.root.position.y, target.to.z);
  };
}
