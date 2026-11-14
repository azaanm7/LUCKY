import * as THREE from "three";
import { MACHINES, SHELTER, SOLAR_FIELD } from "../game/config";
import type { GameState, MachineId } from "../game/types";
import { createGreenhouse, createO2, createRecycler, createShelter, createSolarField } from "./buildings";
import { createLights, updateEnvironment } from "./environment";
import { createAstronaut, createGuideArrow, createIce, createLabel, createPad } from "./models";
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

  // Барилгууд
  const shelter = createShelter();
  const o2 = createO2(); o2.root.position.set(-9, 0, -1.2);
  const rec = createRecycler(); rec.root.position.set(9, 0, -1.2);
  const gh = createGreenhouse(); gh.root.position.set(0, 0, -11.6);
  const solar = createSolarField(); solar.root.position.set(SOLAR_FIELD.x, 0, SOLAR_FIELD.z);
  scene.add(shelter.root, o2.root, rec.root, gh.root, solar.root);
  const shelterLabel = createLabel("🏠 Хоргодох байр"); shelterLabel.position.set(SHELTER.x, 5.6, SHELTER.z); scene.add(shelterLabel);
  const solarLabel = createLabel("☀️ Нарны панель"); solarLabel.position.set(SOLAR_FIELD.x, 3.4, SOLAR_FIELD.z - 2.6); scene.add(solarLabel);

  // Машин бүрийн дэвсгэр ба хаяг (асаалттай/унтраалттай үед солигдоно)
  const pads = {} as Record<MachineId, THREE.Mesh>;
  const labels = {} as Record<MachineId, { on: THREE.Sprite; off: THREE.Sprite }>;
  for (const m of MACHINES) {
    const pad = createPad(); pad.position.set(m.pos.x, 0.05, m.pos.z); scene.add(pad); pads[m.id] = pad;
    const y = m.id === "greenhouse" ? 6.2 : 5;
    const lz = m.id === "greenhouse" ? -11.6 : -1.2;
    const on = createLabel(`${m.icon} ${m.name} ✅`, "rgba(30,90,45,.88)");
    const off = createLabel(`${m.icon} ${m.name} ⛔`, "rgba(110,30,25,.88)");
    for (const l of [on, off]) { l.position.set(m.pos.x, y, lz); scene.add(l); }
    labels[m.id] = { on, off };
  }

  const astro = createAstronaut(); scene.add(astro.root);
  const arrow = createGuideArrow(); scene.add(arrow);
  const iceMeshes = new Map<number, THREE.Group>();
  const camTarget = new THREE.Vector3();

  function update(s: GameState, dt: number, intro: boolean) {
    updateEnvironment(s, scene, lights, stars);
    const t = s.time;

    // Тоглогч
    const p = s.player;
    astro.root.position.set(p.x, height(p.x, p.z), p.z);
    astro.root.rotation.y = p.angle;
    const swing = p.moving ? Math.sin(t * 12) * 0.6 : 0;
    astro.legL.rotation.x = swing; astro.legR.rotation.x = -swing;
    astro.armL.rotation.x = -swing * 0.8; astro.armR.rotation.x = swing * 0.8;
    astro.root.position.y += p.moving ? Math.abs(Math.sin(t * 12)) * 0.12 : 0;

    // Машинууд
    o2.fan.rotation.y += s.on.o2 ? dt * 8 : 0;
    (o2.bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = s.on.o2 ? 1.5 : 0;
    (rec.bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = s.on.recycler ? 1.5 : 0;
    gh.glow.intensity = s.on.greenhouse ? 6 : 0;
    gh.plants.scale.setScalar(s.on.greenhouse ? 1 + Math.sin(t * 2) * 0.04 : 0.9);
    for (const m of MACHINES) {
      labels[m.id].on.visible = s.on[m.id]; labels[m.id].off.visible = !s.on[m.id];
      (pads[m.id].material as THREE.MeshBasicMaterial).color.set(s.on[m.id] ? "#78c17c" : "#ec5a52");
      pads[m.id].scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
    // Шороотой панель улбар болно
    solar.panels.color.set("#1f3d6b").lerp(new THREE.Color("#a5683e"), s.dust);

    // Хоргодох байрны цагираг: дэлбэрэлтийн үед анивчина
    (shelter.ring.material as THREE.MeshBasicMaterial).opacity = s.flareWarn > 0 || s.flare > 0 ? 0.5 + Math.sin(t * 10) * 0.4 : 0;

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

  // Сум: дэлбэрэлтийн үед хоргодох байр руу, шороотой үед панель руу заана
  function guide(s: GameState, t: number) {
    const target = s.flareWarn > 0 || s.flare > 0 ? SHELTER : s.dust > 0.5 && s.storm <= 0 ? SOLAR_FIELD : null;
    arrow.visible = !!target;
    if (!target) return;
    const p = s.player;
    arrow.position.set(p.x, height(p.x, p.z) + 3.2 + Math.sin(t * 5) * 0.15, p.z);
    arrow.lookAt(target.x, arrow.position.y, target.z);
    (arrow.material as THREE.MeshBasicMaterial).color.set(s.flareWarn > 0 || s.flare > 0 ? "#ff5a4a" : "#ffd84a");
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
    camera.fov = w < h ? 65 : 50; // утсан дээр (босоо) илүү өргөн харна
    camera.updateProjectionMatrix();
  }

  return { update, resize, dispose: () => renderer.dispose() };
}
