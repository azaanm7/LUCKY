import * as THREE from "three";
import { DAY_PART } from "../game/config";
import type { GameState } from "../game/types";
import { dayPhase } from "../game/world";

const DAY_SKY = new THREE.Color("#e8a879"); // Ангарагийн өдрийн тэнгэр шар-улбар
const DUSK_SKY = new THREE.Color("#6d7fa3"); // Ангарагт нар жаргахад тэнгэр цэнхэр болдог
const NIGHT_SKY = new THREE.Color("#0b0e1c");
const STORM_SKY = new THREE.Color("#b46a35");
const FLARE_SKY = new THREE.Color("#d8483a");

export function createLights(scene: THREE.Scene) {
  const hemi = new THREE.HemisphereLight("#ffe3c8", "#5a2a18", 1.1);
  const sun = new THREE.DirectionalLight("#fff1dc", 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const cam = sun.shadow.camera;
  cam.left = -36; cam.right = 36; cam.top = 36; cam.bottom = -36; cam.near = 1; cam.far = 140;
  scene.add(hemi, sun, sun.target);
  return { hemi, sun };
}

// Цагаас хамаарч тэнгэр, нар, манан өөрчлөгдөнө
export function updateEnvironment(
  s: GameState,
  scene: THREE.Scene,
  lights: ReturnType<typeof createLights>,
  stars: THREE.Points,
) {
  const p = dayPhase(s.time);
  const sky = new THREE.Color();
  if (p < DAY_PART) {
    const k = p / DAY_PART; // 0 өглөө → 1 орой
    const edge = Math.max(0, Math.abs(k - 0.5) * 2 - 0.7) / 0.3; // өглөө/оройд 0..1
    sky.copy(DAY_SKY).lerp(DUSK_SKY, edge * 0.8);
    const angle = Math.PI * k;
    lights.sun.position.set(Math.cos(angle) * 60, Math.sin(angle) * 55 + 8, -25);
    lights.sun.intensity = 0.6 + Math.sin(angle) * 2.0;
    lights.hemi.intensity = 0.6 + Math.sin(angle) * 0.6;
  } else {
    sky.copy(NIGHT_SKY);
    lights.sun.intensity = 0.15;
    lights.sun.position.set(-30, 40, 20);
    lights.hemi.intensity = 0.35;
  }
  if (s.storm > 0) { sky.lerp(STORM_SKY, 0.75); lights.sun.intensity *= 0.45; }
  if (s.flare > 0) sky.lerp(FLARE_SKY, 0.55 + Math.sin(s.time * 10) * 0.15);
  else if (s.flareWarn > 0) sky.lerp(FLARE_SKY, 0.25 + Math.sin(s.time * 6) * 0.1);

  scene.background = sky;
  const fog = scene.fog as THREE.Fog;
  fog.color.copy(sky);
  fog.near = s.storm > 0 ? 6 : 40;
  fog.far = s.storm > 0 ? 38 : 95;
  (stars.material as THREE.PointsMaterial).opacity = p >= DAY_PART && s.storm <= 0 ? 0.9 : 0;
}
