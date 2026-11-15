import * as THREE from "three";
import { MACHINES, SOLAR_FIELD, SOLAR_POWER } from "../game/config";
import type { GameState, MachineId } from "../game/types";
import { solarInput, works } from "../game/world";
import { createGlow, createLabel, glowMat, mat, mesh } from "./models";
import type { Dict } from "../i18n/mn";

// Эрчим хүчний сүлжээ: нарны панель → батарей → машинууд. Кабелиар гүйх гэрэл нь эрчим хүчний урсгал.
const FLOWING = new THREE.Color("#19d3ff"), SHORT = new THREE.Color("#ff3d1f");
const CLEAN = new THREE.Color("#1f3d6b"), DUSTY = new THREE.Color("#a5683e");
const LEVELS = ["#ff5a4a", "#ff5a4a", "#ffc94a", "#7be07f", "#7be07f"]; // батарейн үүрний өнгө

type Route = [number, number][]; // газраар явах цэгүүд [x, z]
const BATTERY: [number, number] = [0, -3.7]; // хоргодох байрны урд хананд
// Кабель бүр барилга, дэвсгэрийг тойрч гарна
const FROM_SUN: Route = [[SOLAR_FIELD.x + 2, SOLAR_FIELD.z], [-12, -14.5], [-6, -12], [-2.8, -7.8], BATTERY];
const TO_MACHINE: Record<MachineId, Route> = {
  o2: [BATTERY, [-4, -2.8], [-9, -2], [-13, -1.5]],
  recycler: [BATTERY, [4, -2.8], [9, -2], [13, -1.5]],
  greenhouse: [BATTERY, [2.4, -6.5], [3.4, -11], [3.6, -14.5], [0, -16.6]],
};

function createSolarField() {
  const g = new THREE.Group();
  const panels = mat("#1f3d6b", { metalness: 0.5, roughness: 0.3 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const x = (i - 1) * 2.6, z = (j - 0.5) * 2.8;
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6), mat("#aaa"), x, 0.55, z));
    const p = mesh(new THREE.BoxGeometry(2.3, 0.08, 1.6), panels, x, 1.15, z);
    const frame = mesh(new THREE.BoxGeometry(2.42, 0.05, 1.72), mat("#c9ced4"), x, 1.12, z);
    p.rotation.x = frame.rotation.x = -0.35;
    g.add(frame, p);
  }
  return { root: g, panels };
}

// Батарейн тавиур: 5 үүр нь батарейн түвшнийг харуулна
function createBattery() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(2.4, 0.4, 0.9), mat("#4a5160"), 0, 0.2, 0));
  g.add(mesh(new THREE.BoxGeometry(2.2, 1.2, 0.7), mat("#d9d4cc"), 0, 1.0, 0));
  const cells = LEVELS.map((_, i) => {
    const m = glowMat("#20242c", 0);
    g.add(mesh(new THREE.BoxGeometry(0.3, 0.85, 0.1), m, (i - 2) * 0.4, 1.0, -0.38));
    return m;
  });
  const set = (battery: number) => {
    const color = LEVELS[Math.min(4, Math.floor(battery / 20))];
    cells.forEach((m, i) => {
      const lit = battery > i * 20 + 1;
      m.color.set(lit ? color : "#20242c");
      m.emissive.copy(m.color);
      m.emissiveIntensity = lit ? 0.9 : 0;
    });
  };
  return { root: g, set };
}

function createCable(scene: THREE.Scene, route: Route) {
  const curve = new THREE.CatmullRomCurve3(route.map(([x, z]) => new THREE.Vector3(x, 0.09, z)));
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.1, 5), mat("#232833"));
  tube.receiveShadow = true;
  const pulses = [0, 1, 2, 3].map(() => createGlow("#19d3ff", 1.1, 0, false));
  scene.add(tube, ...pulses);
  // flow 0-1: хэр их эрчим хүч гүйж байна
  return (flow: number, color: THREE.Color, t: number) => {
    pulses.forEach((p, i) => {
      p.material.opacity = flow > 0.02 ? 0.95 : 0;
      p.material.color.copy(color);
      curve.getPointAt((t * (0.1 + flow * 0.25) + i / pulses.length) % 1, p.position);
      p.position.y = 0.3;
    });
  };
}

export function createPowerGrid(scene: THREE.Scene, t: Dict) {
  const solar = createSolarField();
  solar.root.position.set(SOLAR_FIELD.x, 0, SOLAR_FIELD.z);
  const battery = createBattery();
  battery.root.position.set(BATTERY[0], 0, BATTERY[1]);
  const label = createLabel(t.world.solar, undefined, "panel");
  label.position.set(SOLAR_FIELD.x, 3.4, SOLAR_FIELD.z - 2.6);
  scene.add(solar.root, battery.root, label);

  const fromSun = createCable(scene, FROM_SUN);
  const toMachine = MACHINES.map((m) => ({ id: m.id, set: createCable(scene, TO_MACHINE[m.id]) }));

  function update(s: GameState, t: number) {
    solar.panels.color.copy(CLEAN).lerp(DUSTY, s.dust); // шороотой панель улбар болно
    battery.set(s.res.battery);
    fromSun(solarInput(s) / SOLAR_POWER, FLOWING, t);
    const color = s.load < 1 ? SHORT : FLOWING; // эрчим хүч дутвал кабель улаан болно
    for (const c of toMachine) c.set(works(s, c.id) ? s.load : 0, color, t);
  }
  return { update };
}
