import * as THREE from "three";
import { mat, mesh } from "./models";

// Хоргодох байр: цагаан бөмбөгөр, улбар шар судалтай
export function createShelter(): { root: THREE.Group; ring: THREE.Mesh } {
  const g = new THREE.Group();
  g.add(mesh(new THREE.SphereGeometry(3.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat("#ece6dd"), 0, 0, 0));
  g.add(mesh(new THREE.TorusGeometry(3.2, 0.12, 6, 32), mat("#e2693b"), 0, 0.15, 0).rotateX(Math.PI / 2));
  g.add(mesh(new THREE.BoxGeometry(1.4, 1.8, 1.2), mat("#d8d0c4"), 0, 0.9, 3));
  g.add(mesh(new THREE.BoxGeometry(0.9, 1.4, 0.1), mat("#2d3340"), 0, 0.75, 3.62));
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), mat("#999"), 1.6, 3.6, 0));
  g.add(mesh(new THREE.SphereGeometry(0.15, 8, 6), mat("#ff5a4a", { emissive: "#ff2a1a" }), 1.6, 4.85, 0));
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.9, 4.3, 48), new THREE.MeshBasicMaterial({ color: "#ff5a4a", transparent: true, opacity: 0 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06;
  g.add(ring);
  return { root: g, ring };
}

// Агаар үйлдвэр: эргэдэг сэнстэй
export function createO2(): { root: THREE.Group; fan: THREE.Group; bulb: THREE.Mesh } {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(3, 1.6, 2.4), mat("#d9d4cc"), 0, 0.8, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 12), mat("#9aa3ad"), 0, 2.3, 0));
  const fan = new THREE.Group();
  fan.position.set(0, 3.1, 0);
  for (let i = 0; i < 3; i++) fan.add(mesh(new THREE.BoxGeometry(1.6, 0.06, 0.3), mat("#59616b")).rotateY((i * Math.PI) / 3));
  const bulb = mesh(new THREE.SphereGeometry(0.25, 10, 8), mat("#7fe0ff", { emissive: "#7fe0ff" }), 1.2, 1.9, 1.0);
  g.add(fan, bulb);
  return { root: g, fan, bulb };
}

// Ус цэвэршүүлэгч: хоёр цэнхэр сав, хоолой
export function createRecycler(): { root: THREE.Group; bulb: THREE.Mesh } {
  const g = new THREE.Group();
  const tank = mat("#3d7fb0", { metalness: 0.3 });
  g.add(mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.8, 12), tank, -0.9, 1.4, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.2, 12), tank, 0.95, 1.1, 0.2));
  g.add(mesh(new THREE.SphereGeometry(0.9, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), tank, -0.9, 2.8, 0));
  g.add(mesh(new THREE.TorusGeometry(0.9, 0.12, 6, 12, Math.PI), mat("#c9ced4"), 0, 2.4, 0.1));
  const bulb = mesh(new THREE.SphereGeometry(0.25, 10, 8), mat("#7fe0ff", { emissive: "#7fe0ff" }), 0, 0.6, 1.2);
  g.add(bulb);
  return { root: g, bulb };
}

// Хүлэмж: тунгалаг бөмбөгөр дотор ногоон ургамал
export function createGreenhouse(): { root: THREE.Group; glow: THREE.PointLight; plants: THREE.Group } {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(3, 3.1, 0.4, 20), mat("#cfc6ba"), 0, 0.2, 0));
  const glass = new THREE.Mesh(new THREE.SphereGeometry(2.9, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: "#d9fff0", transparent: true, opacity: 0.28, roughness: 0.05 }));
  glass.position.y = 0.35;
  const plants = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, r = i % 2 ? 1.6 : 0.8;
    plants.add(mesh(new THREE.ConeGeometry(0.35, 1.1, 6), mat("#5fbf4a"), Math.cos(a) * r, 0.95, Math.sin(a) * r));
  }
  const glow = new THREE.PointLight("#9dff8a", 0, 8);
  glow.position.y = 2;
  g.add(glass, plants, glow);
  return { root: g, glow, plants };
}

// Нарны панелийн талбай: 3×2 панель
export function createSolarField(): { root: THREE.Group; panels: THREE.MeshStandardMaterial } {
  const g = new THREE.Group();
  const panels = mat("#1f3d6b", { metalness: 0.5, roughness: 0.3 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const x = (i - 1) * 2.6, z = (j - 0.5) * 2.8;
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6), mat("#aaa"), x, 0.55, z));
    const p = mesh(new THREE.BoxGeometry(2.3, 0.08, 1.6), panels, x, 1.15, z);
    p.rotation.x = -0.35;
    g.add(p);
  }
  return { root: g, panels };
}
