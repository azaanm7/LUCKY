import * as THREE from "three";
import { DEPOT, GYM, MACHINES, SHELTER, SOLAR_FIELD } from "../game/config";
import type { GameState, MachineId } from "../game/types";
import { inShelter } from "../game/world";
import { createGreenhouse, createO2, createRecycler, createShelter, createSolarField } from "./buildings";
import { createLabel, createPad } from "./models";
import { createDepot, createDish, createGym } from "./props";

type Labels = { on: THREE.Sprite; off: THREE.Sprite; broken: THREE.Sprite };

// Суурийн бүх барилга, хаяг, дэвсгэрийг нэг удаа үүсгээд frame бүр шинэчилнэ
export function createBase(scene: THREE.Scene) {
  const shelter = createShelter();
  const o2 = createO2(); o2.root.position.set(-9, 0, -1.2);
  const rec = createRecycler(); rec.root.position.set(9, 0, -1.2);
  const gh = createGreenhouse(); gh.root.position.set(0, 0, -11.6);
  const solar = createSolarField(); solar.root.position.set(SOLAR_FIELD.x, 0, SOLAR_FIELD.z);
  const depot = createDepot(); depot.position.set(DEPOT.x + 0.5, 0, DEPOT.z - 3);
  const gym = createGym(); gym.root.position.set(GYM.x - 0.5, 0, GYM.z - 3);
  const dish = createDish(); dish.root.position.set(13, 0, -9);
  scene.add(shelter.root, o2.root, rec.root, gh.root, solar.root, depot, gym.root, dish.root);

  const fixed: [string, number, number, number][] = [
    ["🏠 Хоргодох байр", SHELTER.x, 5.6, SHELTER.z],
    ["☀️ Нарны панель", SOLAR_FIELD.x, 3.4, SOLAR_FIELD.z - 2.6],
    ["📦 Агуулах", DEPOT.x, 3.4, DEPOT.z - 3],
    ["💪 Дасгал", GYM.x, 3.4, GYM.z - 3],
    ["📡 Дэлхийтэй холбоо", 13, 5.2, -9],
  ];
  for (const [text, x, y, z] of fixed) { const l = createLabel(text); l.position.set(x, y, z); scene.add(l); }
  for (const z of [DEPOT, GYM]) { const p = createPad(); p.position.set(z.x, 0.05, z.z); (p.material as THREE.MeshBasicMaterial).color.set("#ffd84a"); scene.add(p); }

  const pads = {} as Record<MachineId, THREE.Mesh>;
  const labels = {} as Record<MachineId, Labels>;
  for (const m of MACHINES) {
    const pad = createPad(); pad.position.set(m.pos.x, 0.05, m.pos.z); scene.add(pad); pads[m.id] = pad;
    const y = m.id === "greenhouse" ? 6.2 : 5, lz = m.id === "greenhouse" ? -11.6 : -1.2;
    const l: Labels = {
      on: createLabel(`${m.icon} ${m.name} ✅`, "rgba(30,90,45,.88)"),
      off: createLabel(`${m.icon} ${m.name} ⛔`, "rgba(110,30,25,.88)"),
      broken: createLabel(`🔧 ${m.name} эвдэрсэн!`, "rgba(170,95,10,.92)"),
    };
    for (const s of [l.on, l.off, l.broken]) { s.position.set(m.pos.x, y, lz); scene.add(s); }
    labels[m.id] = l;
  }
  const domeMat = (shelter.root.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  domeMat.transparent = true;

  return function update(s: GameState, t: number, dt: number) {
    const works = (id: MachineId) => s.on[id] && s.broken !== id;
    o2.fan.rotation.y += works("o2") ? dt * 8 : 0;
    (o2.bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = works("o2") ? 1.5 : 0;
    (rec.bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = works("recycler") ? 1.5 : 0;
    gh.glow.intensity = works("greenhouse") ? 6 : 0;
    gh.plants.scale.setScalar(works("greenhouse") ? 1 + Math.sin(t * 2) * 0.04 : 0.9);
    for (const m of MACHINES) {
      const broken = s.broken === m.id;
      labels[m.id].broken.visible = broken;
      labels[m.id].on.visible = !broken && s.on[m.id];
      labels[m.id].off.visible = !broken && !s.on[m.id];
      const color = broken ? (Math.sin(t * 8) > 0 ? "#ff9f1a" : "#5a3a10") : s.on[m.id] ? "#78c17c" : "#ec5a52";
      (pads[m.id].material as THREE.MeshBasicMaterial).color.set(color);
      pads[m.id].scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
    solar.panels.color.set("#1f3d6b").lerp(new THREE.Color("#a5683e"), s.dust);
    (shelter.ring.material as THREE.MeshBasicMaterial).opacity = s.flareWarn > 0 || s.flare > 0 ? 0.5 + Math.sin(t * 10) * 0.4 : 0;
    domeMat.opacity = inShelter(s.player) ? 0.35 : 1; // дотор нь орвол бөмбөгөр тунгалаг болно
    (gym.belt.material as THREE.MeshStandardMaterial).color.set(s.gymTimer > 0 ? "#4a7a52" : "#2a2d33");
    dish.head.rotation.y = Math.sin(t * 0.3) * 0.6;
    (dish.light.material as THREE.MeshStandardMaterial).emissiveIntensity = s.problem ? (Math.sin(t * 6) > 0 ? 2 : 0) : 0.6;
  };
}
