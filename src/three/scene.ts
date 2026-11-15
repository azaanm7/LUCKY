import * as THREE from "three";
import type { GameState } from "../game/types";
import type { Dict } from "../i18n/mn";
import { createActors } from "./actors";
import { createBase } from "./base";
import { createCameraRig } from "./camera";
import { createDust } from "./effects";
import { createEnvironment, nightLevel, updateEnvironment } from "./environment";
import { createPowerGrid } from "./power";
import { createShip, LANDING } from "./ship";
import { createSites } from "./sites";
import { fadeLabels } from "./pixel-sprite";
import { createRocks, createTerrain, height } from "./terrain";

// t: 3D хаягууд ямар хэлээр байх. Хэл солигдвол ертөнцийг дахин үүсгэнэ (use-game-loop.ts).
export function createWorld(canvas: HTMLCanvasElement, t: Dict) {
  // Утас: мэдрэгч дэлгэц. Нягтралыг бага зэрэг бууруулж, сүүдрийн зургийг жижиг болгоно (хурдан, батарей хэмнэнэ).
  const phone = window.matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(phone ? 1.5 : 2, window.devicePixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false; // сүүдрийг 2 frame тутамд шинэчилнэ (доор): ялгаа харагдахгүй, ачаалал 2 дахин бага
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // гэрэл, сүүдрийн ялгааг кино шиг зөөлөн болгоно
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#e8a879", 40, 95);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
  const env = createEnvironment(scene, phone);
  scene.add(createTerrain(), createRocks());
  const updateBase = createBase(scene, t);
  const grid = createPowerGrid(scene, t);
  const updateActors = createActors(scene);
  const updateDust = createDust(scene);
  const updateSites = createSites(scene, t);
  const updateShip = createShip(scene);
  // Жижиг хэсгүүдийн (чийдэн, гэрлийн зурвас, боолт) сүүдэр харагдахгүй ч зурахад цаг зарна: унтраана
  scene.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || o instanceof THREE.InstancedMesh || !o.castShadow) return;
    o.geometry.computeBoundingSphere();
    if (o.geometry.boundingSphere!.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) < 0.35) o.castShadow = false;
  });
  const labels: THREE.Sprite[] = [], glows: THREE.Sprite[] = []; // хаягууд, гэрлийн туяанууд
  scene.traverse((o) => {
    if (!(o instanceof THREE.Sprite)) return;
    if (o.userData.near !== undefined) labels.push(o);
    if (o.userData.glow && o.visible) glows.push(o);
  });
  const rig = createCameraRig();
  const camTarget = new THREE.Vector3(), focus = new THREE.Vector3();
  let shake = 0, hearts = 3, shipY = 0, frame = 0;

  function update(s: GameState, dt: number, intro: boolean) {
    const night = nightLevel(s.time);
    if (s.hearts < hearts) shake = 0.7; // зүрх алдахад дэлгэц сэгсэрнэ
    hearts = s.hearts;
    shake = Math.max(0, shake - dt * 1.4);
    shipY = updateShip(s, dt);
    moveCamera(s, intro, dt);
    updateEnvironment(s, scene, env, camera, focus);
    updateBase(s, night, dt);
    grid.update(s, s.time);
    updateActors(s, night);
    updateDust(s, dt, focus);
    updateSites(s, s.time);
    fadeLabels(labels, intro ? { x: 1e3, z: 1e3 } : s.player); // эхлэлийн дүр зураг дээр хаяг харуулахгүй
    for (const g of glows) g.visible = g.material.opacity > 0.005; // өдөр унтарсан гэрэл зурахгүй
    renderer.shadowMap.needsUpdate = (frame++ & 1) === 0;
    renderer.render(scene, camera);
  }

  function moveCamera(s: GameState, intro: boolean, dt: number) {
    if (intro) {
      const a = s.time * 0.15;
      focus.set(0, 0, 0);
      camera.position.set(Math.cos(a) * 26, 14, Math.sin(a) * 26);
      camera.lookAt(0, 1, 0);
      return;
    }
    const portrait = camera.aspect < 1; // утсан дээр камер илүү өндөрт
    if (s.status === "won") { // нөөцийн хөлөг буухыг холоос харуулна
      focus.set(LANDING.x, 0, LANDING.z);
      camTarget.set(LANDING.x - 5, portrait ? 14 : 9, LANDING.z + (portrait ? 30 : 24));
      camera.position.lerp(camTarget, Math.min(1, dt * 2));
      camera.lookAt(LANDING.x, 4 + shipY * 0.45, LANDING.z);
      return;
    }
    const p = s.player, ground = height(p.x, p.z);
    focus.set(p.x, ground, p.z);
    const c = rig.step(dt, portrait); // харагдац (дээрээс / ойроос) ба тойрч эргэх өнцөг: camera.ts
    camTarget.set(p.x + c.sin * c.back, ground + c.up, p.z + c.cos * c.back);
    camera.position.lerp(camTarget, Math.min(1, dt * 4));
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;
    camera.lookAt(p.x - c.sin * c.ahead, ground + 1, p.z - c.cos * c.ahead);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 65 : 50; // утсан дээр (босоо) илүү өргөн харна
    camera.updateProjectionMatrix();
  }

  return { update, resize, rig, dispose: () => renderer.dispose() };
}
