import * as THREE from "three";
import type { GameState } from "../game/types";
import { createActors } from "./actors";
import { createBase } from "./base";
import { createDust } from "./effects";
import { createEnvironment, nightLevel, updateEnvironment } from "./environment";
import { createPowerGrid } from "./power";
import { createRocks, createTerrain, height } from "./terrain";

export function createWorld(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // гэрэл, сүүдрийн ялгааг кино шиг зөөлөн болгоно
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#e8a879", 40, 95);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
  const env = createEnvironment(scene);
  scene.add(createTerrain(), createRocks());
  const updateBase = createBase(scene);
  const grid = createPowerGrid(scene);
  const updateActors = createActors(scene);
  const updateDust = createDust(scene);
  const camTarget = new THREE.Vector3(), focus = new THREE.Vector3();

  function update(s: GameState, dt: number, intro: boolean) {
    const night = nightLevel(s.time);
    moveCamera(s, intro, dt);
    updateEnvironment(s, scene, env, camera);
    updateBase(s, night, dt);
    grid.update(s, s.time);
    updateActors(s, night);
    updateDust(s, dt, focus);
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
    const p = s.player, ground = height(p.x, p.z);
    const portrait = camera.aspect < 1; // утсан дээр камер илүү өндөрт
    focus.set(p.x, ground, p.z);
    camTarget.set(p.x, ground + (portrait ? 18 : 11), p.z + (portrait ? 16 : 15));
    camera.position.lerp(camTarget, Math.min(1, dt * 4));
    camera.lookAt(p.x, ground + 1, p.z - (portrait ? 1 : 3));
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
