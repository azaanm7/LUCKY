import * as THREE from "three";
import { SITES, WORLD_RADIUS } from "../game/config";

// Тогоонууд (суурингаас хол). r = радиус. Эхнийх нь "Том тогоо" шинжлэх ухааны талбай.
const CRATERS = [
  { x: 30, z: -30, r: 9 }, { x: 26, z: 8, r: 4 }, { x: 10, z: -27, r: 4.5 }, { x: -27, z: -19, r: 4.5 },
  { x: 2, z: 30, r: 4 }, { x: -40, z: 2, r: 5 }, { x: 40, z: 16, r: 5 }, { x: -12, z: 38, r: 4.5 },
];
const RIM = WORLD_RADIUS + 4; // уулс эндээс эхэлнэ

// Тогооны хэлбэр: голдоо хонхор, ирмэгээрээ өргөгдсөн
function crater(x: number, z: number): number {
  let h = 0;
  for (const c of CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z) / c.r;
    if (d > 1.6) continue;
    h += (d < 1 ? -(1 - d * d) * c.r * 0.3 : 0) + Math.exp(-((d - 1) ** 2) / 0.04) * c.r * 0.14;
  }
  return h;
}

// Газрын өндөр: суурийн орчим тэгш, холдох тусам толгод, тогоотой, захаараа уул
export function height(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const hills = Math.sin(x * 0.15) * 1.2 + Math.cos(z * 0.13) * 1.0 + Math.sin((x + z) * 0.07) * 1.5;
  const flat = Math.min(1, Math.max(0, (r - 19) / 10));
  const rim = r > RIM ? (r - RIM) * 1.1 + Math.sin(x * 0.4) * Math.cos(z * 0.35) * (r - RIM) * 0.35 : 0;
  return hills * flat + rim + crater(x, z);
}

export function createTerrain(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(150, 150, 150, 150);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const sand = new THREE.Color("#b25a33"), dark = new THREE.Color("#7a3620"), pale = new THREE.Color("#d58a58"), rock = new THREE.Color("#5c2a1c");
  const col = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = height(x, z);
    pos.setY(i, h);
    const n = (Math.sin(x * 0.9) * Math.cos(z * 0.7) + 1) / 2;
    col.copy(sand).lerp(dark, n * 0.55).lerp(pale, Math.max(0, Math.sin(x * 0.05 + z * 0.04)) * 0.4);
    col.lerp(dark, Math.min(1, Math.max(0, -crater(x, z)) * 0.7)); // тогооны ёроол бараан
    col.lerp(rock, Math.min(1, Math.max(0, h - 4) * 0.12)); // уулс хадархаг
    colors.push(col.r, col.g, col.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
  mesh.receiveShadow = true;
  return mesh;
}

export function createRocks(): THREE.Group {
  const g = new THREE.Group();
  const mats = ["#6e3320", "#58281a", "#834129"].map((color) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1 }));
  // Барилга, кабелийн газарт чулуу тавихгүй: [x, z, радиус]
  const busy = [[-13, -11, 6.5], [0, -11.6, 5], [5.5, -8, 3.5], [13, -9, 3], [-4, -8, 5], [0, -4, 6], [8, 11, 4], ...SITES.map((x) => [x.x, x.z, x.r + 1.5])];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 130; i++) {
    const angle = rnd() * Math.PI * 2, r = 9 + rnd() * 40;
    const x = Math.cos(angle) * r, z = Math.sin(angle) * r;
    const s = 0.3 + rnd() * (r > 20 ? 1.5 : 0.6);
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), mats[i % 3]);
    rock.position.set(x, height(x, z) + s * 0.3, z);
    rock.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    rock.scale.y = 0.6 + rnd() * 0.6;
    rock.castShadow = true;
    if (!busy.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br)) g.add(rock);
  }
  return g;
}

export function createStars(): THREE.Points {
  const pts: number[] = [];
  for (let i = 0; i < 1100; i++) {
    const t = Math.random() * Math.PI * 2, p = Math.random() * Math.PI * 0.47;
    pts.push(Math.cos(t) * Math.sin(p) * 160, Math.cos(p) * 160, Math.sin(t) * Math.sin(p) * 160);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: "#ffffff", size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false }));
}
