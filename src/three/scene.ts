import * as THREE from "three";
import { DEPOT, GYM, MACHINES, REPAIRS, SHELTER, SOLAR_FIELD } from "../game/config";
import type { GameState, ItemId, Vec2 } from "../game/types";
import { solOf } from "../game/world";
import { createBase } from "./base";
import { createLights, updateEnvironment } from "./environment";
import { createAstronaut, createGuideArrow, createIce } from "./models";
import { createCarried } from "./props";
import { createRocks, createStars, createTerrain, height } from "./terrain";

export function createWorld(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#e8a879", 40, 95);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
  const lights = createLights(scene);
  const stars = createStars();
  scene.add(createTerrain(), createRocks(), stars);

  const updateBase = createBase(scene);
  const astro = createAstronaut(); scene.add(astro.root);
  const carried = createCarried();
  for (const m of Object.values(carried)) { m.position.y = 2.75; astro.root.add(m); }
  const arrow = createGuideArrow(); scene.add(arrow);
  const iceMeshes = new Map<number, THREE.Group>();
  const camTarget = new THREE.Vector3();

  function update(s: GameState, dt: number, intro: boolean) {
    updateEnvironment(s, scene, lights, stars);
    const t = s.time;
    updateBase(s, t, dt);

    // Сансрын нисэгч: алхахдаа хөл гараа савчина, сэлбэгээ толгой дээрээ барина
    const p = s.player;
    astro.root.position.set(p.x, height(p.x, p.z), p.z);
    astro.root.rotation.y = p.angle;
    const swing = p.moving ? Math.sin(t * 12) * 0.6 : 0;
    astro.legL.rotation.x = swing; astro.legR.rotation.x = -swing;
    astro.armL.rotation.x = s.carrying ? -2.6 : -swing * 0.8;
    astro.armR.rotation.x = s.carrying ? -2.6 : swing * 0.8;
    astro.root.position.y += p.moving ? Math.abs(Math.sin(t * 12)) * 0.12 : 0;
    for (const [id, m] of Object.entries(carried)) m.visible = s.carrying === (id as ItemId);

    syncIce(s, t);
    guide(s, t);
    moveCamera(s, intro, dt);
    renderer.render(scene, camera);
  }

  function syncIce(s: GameState, t: number) {
    const ids = new Set(s.ice.map((i) => i.id));
    for (const [id, m] of iceMeshes) if (!ids.has(id)) { scene.remove(m); iceMeshes.delete(id); }
    for (const i of s.ice) {
      let m = iceMeshes.get(i.id);
      if (!m) { m = createIce(); scene.add(m); iceMeshes.set(i.id, m); }
      m.position.set(i.x, height(i.x, i.z) + Math.sin(t * 2 + i.id) * 0.2, i.z);
      m.rotation.y = t + i.id;
    }
  }

  // Сум: одоо хамгийн яаралтай очих газрыг заана (mission.tsx-ийн дараалалтай ижил)
  function guideTarget(s: GameState): { to: Vec2; color: string } | null {
    if (s.flareWarn > 0 || s.flare > 0) return { to: SHELTER, color: "#ff5a4a" };
    if (s.suitO2 < 30) return { to: SHELTER, color: "#7fe0ff" };
    const repair = s.problem ? REPAIRS[s.problem] : undefined;
    if (repair && !s.carrying) return { to: DEPOT, color: "#ffd84a" };
    if (repair) return { to: MACHINES.find((m) => m.id === repair.target)!.pos, color: "#ffd84a" };
    if (s.dust > 0.5 && s.storm <= 0) return { to: SOLAR_FIELD, color: "#ffd84a" };
    if (s.exercisedSol < solOf(s.time)) return { to: GYM, color: "#b98cff" };
    return null;
  }

  function guide(s: GameState, t: number) {
    const target = guideTarget(s);
    arrow.visible = !!target;
    if (!target) return;
    const p = s.player;
    arrow.position.set(p.x, height(p.x, p.z) + 3.6 + Math.sin(t * 5) * 0.15, p.z);
    arrow.lookAt(target.to.x, arrow.position.y, target.to.z);
    (arrow.material as THREE.MeshBasicMaterial).color.set(target.color);
  }

  function moveCamera(s: GameState, intro: boolean, dt: number) {
    if (intro) {
      const a = s.time * 0.15;
      camera.position.set(Math.cos(a) * 26, 14, Math.sin(a) * 26);
      camera.lookAt(0, 1, 0);
      return;
    }
    const p = s.player;
    const portrait = camera.aspect < 1; // утсан дээр камер илүү өндөрт
    camTarget.set(p.x, height(p.x, p.z) + (portrait ? 18 : 11), p.z + (portrait ? 16 : 15));
    camera.position.lerp(camTarget, Math.min(1, dt * 4));
    camera.lookAt(p.x, height(p.x, p.z) + 1, p.z - (portrait ? 1 : 3));
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 65 : 50;
    camera.updateProjectionMatrix();
  }

  return { update, resize, dispose: () => renderer.dispose() };
}
