import * as THREE from "three";
import { DEPOT, GYM, MACHINES, SHELTER } from "../game/config";
import type { GameState, MachineId, Need } from "../game/types";
import { inShelter, works } from "../game/world";
import { createGreenhouse, createO2, createRecycler, createShelter, createTank } from "./buildings";
import { createLabel, createPad } from "./models";
import { createDepot, createDish, createGym } from "./props";

const BUILD = { o2: createO2, recycler: createRecycler, greenhouse: createGreenhouse };
// Барилга бүр хаана байх, нөөцийн сав нь барилгаасаа хэр зайд байх
const SITE: Record<MachineId, { x: number; z: number; tank: [number, number] }> = {
  o2: { x: -9, z: -1.2, tank: [-2.2, 0.2] },
  recycler: { x: 9, z: -1.2, tank: [2.3, 0.2] },
  greenhouse: { x: 0, z: -11.6, tank: [-3.4, 0.5] },
};
const TANK_COLOR: Record<Need, string> = { oxygen: "#7fe0ff", water: "#3f8cff", food: "#ffa23f" };
const ON = new THREE.Color("#78c17c"), OFF = new THREE.Color("#ec5a52"), ALERT = new THREE.Color("#ff9f1a"), DIM = new THREE.Color("#5a3a10");

// Суурийн бүх барилга, хаяг, дэвсгэрийг нэг удаа үүсгээд frame бүр шинэчилнэ
export function createBase(scene: THREE.Scene) {
  const shelter = createShelter();
  const depot = createDepot(); depot.position.set(DEPOT.x + 0.5, 0, DEPOT.z - 3);
  const gym = createGym(); gym.root.position.set(GYM.x - 0.5, 0, GYM.z - 3);
  const dish = createDish(); dish.root.position.set(13, 0, -9);
  scene.add(shelter.root, depot, gym.root, dish.root);

  const fixed: [string, number, number, number][] = [
    ["🏠 Хоргодох байр", SHELTER.x, 5.6, SHELTER.z],
    ["📦 Агуулах", DEPOT.x, 3.4, DEPOT.z - 3],
    ["💪 Дасгал", GYM.x, 3.4, GYM.z - 3],
    ["📡 Дэлхийтэй холбоо", 13, 5.2, -9],
  ];
  for (const [text, x, y, z] of fixed) { const l = createLabel(text); l.position.set(x, y, z); scene.add(l); }
  for (const z of [DEPOT, GYM]) { const p = createPad(); p.position.set(z.x, 0.05, z.z); (p.material as THREE.MeshBasicMaterial).color.set("#ffd84a"); scene.add(p); }

  const units = MACHINES.map((m) => {
    const site = SITE[m.id];
    const building = BUILD[m.id]();
    building.root.position.set(site.x, 0, site.z);
    const pad = createPad();
    pad.position.set(m.pos.x, 0.05, m.pos.z);
    const tank = createTank(TANK_COLOR[m.makes]); // нөөцийн түвшинг 3D-ээр харуулна
    tank.root.position.set(site.x + site.tank[0], 0, site.z + site.tank[1]);
    const labels = {
      on: createLabel(`${m.icon} ${m.name} ✅`, "rgba(30,90,45,.88)"),
      off: createLabel(`${m.icon} ${m.name} ⛔`, "rgba(110,30,25,.88)"),
      broken: createLabel(`🔧 ${m.name} эвдэрсэн!`, "rgba(170,95,10,.92)"),
    };
    for (const l of Object.values(labels)) { l.position.set(site.x, m.id === "greenhouse" ? 6.2 : 5, site.z); scene.add(l); }
    scene.add(building.root, pad, tank.root);
    return { m, building, pad, tank, labels };
  });

  return function update(s: GameState, night: number, dt: number) {
    const t = s.time;
    shelter.run(night, t);
    (shelter.ring.material as THREE.MeshBasicMaterial).opacity = s.flareWarn > 0 || s.flare > 0 ? 0.5 + Math.sin(t * 10) * 0.4 : 0;
    shelter.dome.opacity = inShelter(s.player) ? 0.35 : 1; // дотор нь орвол бөмбөгөр тунгалаг болно
    for (const u of units) {
      const broken = s.broken === u.m.id, on = s.on[u.m.id];
      u.building.run(works(s, u.m.id) ? s.load : 0, night, dt, t); // эрчим хүч дутвал (load < 1) удааширч, бүдгэрнэ
      u.tank.set(s.res[u.m.makes]);
      u.labels.broken.visible = broken;
      u.labels.on.visible = !broken && on;
      u.labels.off.visible = !broken && !on;
      (u.pad.material as THREE.MeshBasicMaterial).color.copy(broken ? (Math.sin(t * 8) > 0 ? ALERT : DIM) : on ? ON : OFF);
      u.pad.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
    (gym.belt.material as THREE.MeshStandardMaterial).color.set(s.gymTimer > 0 ? "#4a7a52" : "#2a2d33");
    dish.head.rotation.y = Math.sin(t * 0.3) * 0.6;
    (dish.light.material as THREE.MeshStandardMaterial).emissiveIntensity = s.problem ? (Math.sin(t * 6) > 0 ? 2 : 0) : 0.6;
  };
}
