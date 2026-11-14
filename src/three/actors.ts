import * as THREE from "three";
import { DEPOT, GYM, SAMPLES_MAX, SHELTER, SITES, SOLAR_FIELD } from "../game/config";
import { repairTarget } from "../game/missions";
import type { GameState, ItemId, Vec2 } from "../game/types";
import { dist, isDay, solOf } from "../game/world";
import { createAstronaut, createGuideArrow, createIce, glowMat, mesh } from "./models";
import { createCarried } from "./props";
import { height } from "./terrain";

// Сум: одоо хамгийн яаралтай очих газрыг заана (ui/mission.tsx-ийн дараалалтай ижил)
function guideTarget(s: GameState): { to: Vec2; color: string } | null {
  if (s.flareWarn > 0 || s.flare > 0) return { to: SHELTER, color: "#ff5a4a" };
  if (s.suitO2 < 30) return { to: SHELTER, color: "#7fe0ff" };
  const fix = repairTarget(s);
  if (fix && s.problem) return { to: s.carrying ? fix.pos : DEPOT, color: "#ffd84a" };
  if (s.dust > 0.5 && s.storm <= 0) return { to: SOLAR_FIELD, color: "#ffd84a" };
  if (s.samples.length) return { to: SHELTER, color: "#7fe0ff" }; // дээжээ лабораторид хүргэ
  if (fix) return { to: s.carrying ? fix.pos : DEPOT, color: "#ffd84a" };
  if (s.exercisedSol < solOf(s.time)) return { to: GYM, color: "#b98cff" };
  // Тайван өдөр: дээж үлдсэн хамгийн ойрын шинжлэх ухааны талбайг заана
  const open = SITES.filter((x) => s.siteLeft[x.id] > 0).sort((a, b) => dist(a, s.player) - dist(b, s.player))[0];
  return open && isDay(s.time) && !s.problem && !s.drill ? { to: open, color: "#c9a0ff" } : null;
}

// Хөдөлдөг зүйлс: сансрын нисэгч, барьж яваа сэлбэг, мөс, зорих газрыг заах сум
export function createActors(scene: THREE.Scene) {
  const astro = createAstronaut();
  const headlamp = new THREE.PointLight("#cfe4ff", 0, 11); // шөнө эргэн тойрноо гэрэлтүүлнэ
  headlamp.position.set(0, 2.2, 1.2);
  const carried = createCarried();
  for (const m of Object.values(carried)) { m.position.y = 2.75; astro.root.add(m); }
  // Гартаа яваа дээжүүд: нуруун дээрх гэрэлтдэг жижиг савнууд
  const tubes = Array.from({ length: SAMPLES_MAX }, (_, i) => mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.4, 8), glowMat("#7fe0ff", 1.4), (i - 1) * 0.22, 1.75, -0.48));
  astro.root.add(headlamp, ...tubes);
  const arrow = createGuideArrow();
  scene.add(astro.root, arrow);
  const iceMeshes = new Map<number, THREE.Group>();

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
    tubes.forEach((tube, i) => { tube.visible = i < s.samples.length; });
    astro.lamp.material.opacity = night;
    headlamp.intensity = night * 14;

    // Мөс: state-д байгаа нь л дэлгэц дээр байна
    const ids = new Set(s.ice.map((i) => i.id));
    for (const [id, m] of iceMeshes) if (!ids.has(id)) { scene.remove(m); iceMeshes.delete(id); }
    for (const i of s.ice) {
      let m = iceMeshes.get(i.id);
      if (!m) { m = createIce(); scene.add(m); iceMeshes.set(i.id, m); }
      m.position.set(i.x, height(i.x, i.z) + Math.sin(t * 2 + i.id) * 0.2, i.z);
      m.rotation.y = t + i.id;
    }

    const target = guideTarget(s);
    arrow.visible = !!target;
    if (!target) return;
    arrow.position.set(p.x, ground + 3.6 + Math.sin(t * 5) * 0.15, p.z);
    arrow.lookAt(target.to.x, arrow.position.y, target.to.z);
    (arrow.material as THREE.MeshBasicMaterial).color.set(target.color);
  };
}
