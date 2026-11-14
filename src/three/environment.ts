import * as THREE from "three";
import { DAY_PART } from "../game/config";
import type { GameState } from "../game/types";
import { dayPhase } from "../game/world";
import { createGlow } from "./models";
import { createStars } from "./terrain";

const hex = (c: string) => new THREE.Color(c);
// Тэнгэрийн өнгө: [оргил, тэнгэрийн хаяа]
const DAY = [hex("#a9774f"), hex("#f2caa0")]; // Ангарагийн өдрийн тэнгэр шаргал улбар
const DUSK = [hex("#27355c"), hex("#8ea6d6")]; // Ангарагт нар жаргахад тэнгэр цэнхэр болдог
const NIGHT = [hex("#060814"), hex("#2a3763")];
const STORM = [hex("#6f3d1e"), hex("#b8733c")];
const FLARE = hex("#e0483a");
const SUN_DAY = hex("#fff1dc"), SUN_DUSK = hex("#bcd6ff"), MOON = hex("#8098e8");

const SKY_VERT = "varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const SKY_FRAG = `uniform vec3 top; uniform vec3 horizon; varying vec3 vDir;
void main() {
  float h = clamp(vDir.y * 1.5 + 0.05, 0.0, 1.0);
  gl_FragColor = vec4(mix(horizon, top, pow(h, 0.55)), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// 0 = өдөр, 1 = шөнө дунд. Барилгын гэрэл, дуулганы чийдэн үүгээр асна.
export function nightLevel(time: number): number {
  const p = dayPhase(time);
  if (p < DAY_PART) return Math.max(0, Math.abs(p / DAY_PART - 0.5) * 2 - 0.8) * 2.5; // үүр, үдшээр 0 → 0.5
  const k = (p - DAY_PART) / (1 - DAY_PART);
  return 0.5 + Math.min(1, Math.min(k, 1 - k) * 6) * 0.5;
}

export function createEnvironment(scene: THREE.Scene) {
  const hemi = new THREE.HemisphereLight("#ffe3c8", "#5a2a18", 1.1);
  const sun = new THREE.DirectionalLight("#fff1dc", 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const cam = sun.shadow.camera;
  cam.left = -36; cam.right = 36; cam.top = 36; cam.bottom = -36; cam.near = 1; cam.far = 140;
  const uniforms = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() } };
  const dome = new THREE.Mesh(new THREE.SphereGeometry(330, 24, 12),
    new THREE.ShaderMaterial({ uniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false }));
  dome.renderOrder = -1;
  const disc = createGlow("#fff1dc", 70); // нарны дугуй
  const stars = createStars();
  scene.add(hemi, sun, sun.target, dome, disc, stars);
  return { hemi, sun, dome, disc, stars, top: uniforms.top.value, horizon: uniforms.horizon.value };
}

// Цагаас хамаарч тэнгэр, нар, манан өөрчлөгдөнө
export function updateEnvironment(s: GameState, scene: THREE.Scene, env: ReturnType<typeof createEnvironment>, camera: THREE.Camera) {
  const { top, horizon, sun, hemi, disc, dome, stars } = env;
  const p = dayPhase(s.time);
  let starlight = 0;
  if (p < DAY_PART) {
    const k = p / DAY_PART; // 0 өглөө → 1 орой
    const edge = Math.max(0, Math.abs(k - 0.5) * 2 - 0.7) / 0.3; // өглөө/оройд 0..1
    const angle = Math.PI * k, up = Math.sin(angle);
    top.copy(DAY[0]).lerp(DUSK[0], edge);
    horizon.copy(DAY[1]).lerp(DUSK[1], edge * 0.85);
    sun.position.set(Math.cos(angle) * 60, up * 55 + 8, -25);
    sun.color.copy(SUN_DAY);
    sun.intensity = 0.7 + up * 2.3;
    hemi.intensity = 0.55 + up * 0.6;
    disc.material.color.copy(SUN_DAY).lerp(SUN_DUSK, edge);
    disc.material.opacity = 1;
  } else {
    const k = (p - DAY_PART) / (1 - DAY_PART);
    const deep = Math.min(1, Math.min(k, 1 - k) * 6); // шөнийн эхэн, төгсгөлд бүрэнхий
    top.copy(DUSK[0]).lerp(NIGHT[0], deep);
    horizon.copy(DUSK[1]).lerp(NIGHT[1], deep);
    sun.position.set(-30, 40, 20);
    sun.color.copy(MOON);
    sun.intensity = 0.9;
    hemi.intensity = 0.6;
    disc.material.opacity = 0;
    starlight = deep * 0.9;
  }
  if (s.storm > 0) {
    top.lerp(STORM[0], 0.8); horizon.lerp(STORM[1], 0.8);
    sun.intensity *= 0.45;
    disc.material.opacity *= 0.25;
    starlight = 0;
  }
  const flare = s.flare > 0 ? 0.55 + Math.sin(s.time * 10) * 0.15 : s.flareWarn > 0 ? 0.25 + Math.sin(s.time * 6) * 0.1 : 0;
  if (flare) { horizon.lerp(FLARE, flare); top.lerp(FLARE, flare * 0.7); }

  dome.position.copy(camera.position);
  disc.position.copy(sun.position).normalize().multiplyScalar(260).add(camera.position);
  const fog = scene.fog as THREE.Fog;
  fog.color.copy(horizon);
  fog.near = s.storm > 0 ? 6 : 40;
  fog.far = s.storm > 0 ? 38 : 95;
  (stars.material as THREE.PointsMaterial).opacity = starlight;
}
