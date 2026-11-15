import * as THREE from "three";
import { createGlow, glowMat, mat, mesh } from "./models";

// power: 0-1 хэр хүчтэй ажиллаж байна · night: 0-1 хэр харанхуй · t: тоглоомын цаг
// level: машины материал (шүүлтүүр 0-1 · хайлж буй мөс 0-1 · ургац 0-1, null = тариагүй)
export interface Building {
  root: THREE.Group;
  run: (power: number, night: number, dt: number, t: number) => void;
  level: (k: number | null, t: number) => void;
}

const HULL = "#e4ded3", STEEL = "#8f99a6", DARK = "#4a5160";

// Хоргодох байр: цагаан бөмбөгөр, шөнө гэрэлтдэг цонхтой
export function createShelter() {
  const g = new THREE.Group();
  const windows = glowMat("#ffd27a", 0.2), beacon = glowMat("#ff5a4a", 1);
  const dome = mat("#ece6dd", { transparent: true });
  g.add(mesh(new THREE.SphereGeometry(3.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), dome, 0, 0, 0));
  g.add(mesh(new THREE.TorusGeometry(3.2, 0.14, 6, 32), mat("#e2693b"), 0, 0.15, 0).rotateX(Math.PI / 2));
  g.add(mesh(new THREE.TorusGeometry(2.3, 0.07, 6, 28), mat(STEEL), 0, 2.25, 0).rotateX(Math.PI / 2));
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.45;
    const w = mesh(new THREE.BoxGeometry(0.7, 0.42, 0.12), windows, Math.sin(a) * 2.95, 1.25, Math.cos(a) * 2.95);
    w.rotation.y = a;
    w.castShadow = false;
    g.add(w);
  }
  g.add(mesh(new THREE.BoxGeometry(1.5, 1.9, 1.3), mat("#d8d0c4"), 0, 0.95, 3));
  g.add(mesh(new THREE.BoxGeometry(0.9, 1.4, 0.1), mat("#2d3340"), 0, 0.75, 3.67));
  g.add(mesh(new THREE.BoxGeometry(1.0, 0.1, 0.1), windows, 0, 1.6, 3.68));
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), mat("#999"), 1.6, 3.6, 0));
  g.add(mesh(new THREE.SphereGeometry(0.15, 8, 6), beacon, 1.6, 4.85, 0));
  const halo = createGlow("#ffcf80", 11, 0);
  halo.position.y = 1.6;
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.9, 4.3, 48), new THREE.MeshBasicMaterial({ color: "#ff5a4a", transparent: true, opacity: 0 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06;
  g.add(halo, ring);
  const run = (night: number, t: number) => {
    windows.emissiveIntensity = 0.25 + night * 1.3;
    halo.material.opacity = night * 0.3;
    beacon.emissiveIntensity = Math.sin(t * 4) > 0.6 ? 3 : 0.2;
  };
  return { root: g, ring, dome, run };
}

// Агаар үйлдвэр: эргэдэг сэнс, цэнхэр гэрлийн зурвас
export function createO2(): Building {
  const g = new THREE.Group();
  const strip = glowMat("#7fe0ff");
  g.add(mesh(new THREE.BoxGeometry(3, 1.5, 2.4), mat(HULL), 0, 0.75, 0));
  g.add(mesh(new THREE.BoxGeometry(3.08, 0.14, 2.48), strip, 0, 1.1, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.95, 1.15, 1.3, 10), mat(STEEL), 0, 2.15, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.3, 8), mat(DARK), 1.2, 2.2, -0.85));
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.7, 8), mat(DARK), 0.85, 1.9, -0.95));
  const fan = new THREE.Group();
  fan.position.set(0, 2.92, 0);
  for (let i = 0; i < 3; i++) fan.add(mesh(new THREE.BoxGeometry(1.7, 0.06, 0.3), mat(DARK)).rotateY((i * Math.PI) / 3));
  const halo = createGlow("#7fe0ff", 6, 0);
  halo.position.y = 1.3;
  const filter = glowMat("#38b764", 1.2); // шүүлтүүрийн гэрэл: ногоон = цэвэр, улаан = бөглөрсөн
  g.add(fan, halo, mesh(new THREE.BoxGeometry(0.9, 0.5, 0.1), filter, 0, 0.75, 1.22));
  const clean = new THREE.Color("#38b764"), dirty = new THREE.Color("#b13e53");
  return {
    root: g,
    run(power, night, dt) { fan.rotation.y += dt * 8 * power; strip.emissiveIntensity = 0.1 + power * 2; halo.material.opacity = power * (0.1 + night * 0.35); },
    level(k, t) { filter.color.copy(dirty).lerp(clean, k ?? 0); filter.emissive.copy(filter.color); filter.emissiveIntensity = !k && Math.sin(t * 8) > 0 ? 0.1 : 1.2; },
  };
}

// Ус цэвэршүүлэгч: хоёр цэнхэр сав, хоолой
export function createRecycler(): Building {
  const g = new THREE.Group();
  const tank = mat("#3d7fb0", { metalness: 0.3 }), strip = glowMat("#4aa8ff");
  g.add(mesh(new THREE.BoxGeometry(3.4, 0.3, 2.4), mat(DARK), 0, 0.15, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.6, 12), tank, -0.9, 1.6, 0));
  g.add(mesh(new THREE.SphereGeometry(0.9, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), tank, -0.9, 2.9, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.0, 12), tank, 0.95, 1.3, 0.2));
  g.add(mesh(new THREE.TorusGeometry(0.92, 0.07, 6, 16), strip, -0.9, 1.3, 0).rotateX(Math.PI / 2));
  g.add(mesh(new THREE.TorusGeometry(0.77, 0.07, 6, 16), strip, 0.95, 1.3, 0.2).rotateX(Math.PI / 2));
  g.add(mesh(new THREE.TorusGeometry(0.9, 0.12, 6, 12, Math.PI), mat("#c9ced4"), 0, 2.4, 0.1));
  const halo = createGlow("#4aa8ff", 6, 0);
  halo.position.y = 1.4;
  const ice = mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), glowMat("#bfe9ff", 0.7), 0.95, 2.7, 0.2); // хайлж буй мөс
  g.add(halo, ice);
  return {
    root: g,
    run(power, night) { strip.emissiveIntensity = 0.1 + power * 2; halo.material.opacity = power * (0.1 + night * 0.35); },
    level(k) { ice.visible = !!k; ice.scale.setScalar(0.3 + 0.7 * (k ?? 0)); ice.position.y = 2.3 + 0.4 * (k ?? 0); },
  };
}

// Хүлэмж: тунгалаг бөмбөгөр, ягаан ургамлын гэрэл
export function createGreenhouse(): Building {
  const g = new THREE.Group();
  const strip = glowMat("#ff7ad9");
  g.add(mesh(new THREE.CylinderGeometry(3, 3.1, 0.4, 20), mat("#cfc6ba"), 0, 0.2, 0));
  g.add(mesh(new THREE.TorusGeometry(2.92, 0.08, 6, 32), strip, 0, 0.45, 0).rotateX(Math.PI / 2));
  const glass = new THREE.Mesh(new THREE.SphereGeometry(2.9, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: "#e6fff4", transparent: true, opacity: 0.26, roughness: 0.05 }));
  glass.position.y = 0.35;
  const plants = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, r = i % 3 ? 1.75 : 0.8;
    plants.add(mesh(new THREE.ConeGeometry(0.33, 0.9 + (i % 4) * 0.12, 6), mat(i % 2 ? "#5fbf4a" : "#3f9a3c"), Math.cos(a) * r, 0.9, Math.sin(a) * r));
  }
  const light = new THREE.PointLight("#ff8fe0", 0, 9);
  light.position.y = 2;
  const halo = createGlow("#ff7ad9", 9, 0);
  halo.position.y = 1.4;
  const fruit = new THREE.Group(); // боловсорсон ургац: улаан жимс
  plants.children.forEach((p, i) => { if (i % 2 === 0) fruit.add(mesh(new THREE.SphereGeometry(0.16, 6, 4), glowMat("#ef7d57", 0.5), p.position.x + 0.2, 1.2, p.position.z)); });
  g.add(glass, plants, fruit, light, halo);
  let grown = 0;
  return {
    root: g,
    run(power, night) {
      strip.emissiveIntensity = 0.1 + power * 2.2;
      light.intensity = power * (2 + night * 8);
      halo.material.opacity = power * (0.08 + night * 0.4);
    },
    level(k, t) { // үр тариагүй бол хоосон, ургах тусам өндөр болно, боловсорвол жимс гарч дэвхцэнэ
      grown = k ?? 0;
      plants.visible = k !== null;
      plants.scale.set(1, 0.15 + grown * 0.85, 1);
      plants.position.y = -0.6 * (1 - grown);
      fruit.visible = grown >= 1;
      fruit.position.y = grown >= 1 ? Math.abs(Math.sin(t * 4)) * 0.12 : 0;
    },
  };
}

// Нөөцийн сав: дотор нь байгаа түвшин нөөцийн хэмжээг 3D-ээр харуулна
export function createTank(color: string) {
  const root = new THREE.Group();
  const liquid = glowMat(color, 0.8);
  root.add(mesh(new THREE.CylinderGeometry(0.64, 0.72, 0.3, 10), mat(DARK), 0, 0.15, 0));
  root.add(mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.14, 10), mat(DARK), 0, 2.77, 0));
  const fill = mesh(new THREE.CylinderGeometry(0.46, 0.46, 2.4, 10), liquid, 0, 1.5, 0);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 2.4, 10), new THREE.MeshStandardMaterial({ color: "#dff4ff", transparent: true, opacity: 0.2, roughness: 0.1 }));
  glass.position.y = 1.5;
  root.add(fill, glass);
  const set = (level: number) => {
    const k = Math.max(0.03, level / 100);
    fill.scale.y = k;
    fill.position.y = 0.3 + 1.2 * k;
    liquid.color.set(level < 25 ? "#ff5a4a" : color);
    liquid.emissive.copy(liquid.color);
  };
  return { root, set };
}
