import * as THREE from "three";

// Газрын өндөр: суурийн орчим тэгш, холдох тусам толгодтой, захаараа уул
export function height(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const hills = Math.sin(x * 0.15) * 1.2 + Math.cos(z * 0.13) * 1.0 + Math.sin((x + z) * 0.07) * 1.5;
  const flat = Math.min(1, Math.max(0, (r - 19) / 10));
  const rim = r > 33 ? (r - 33) * 1.1 : 0;
  return hills * flat + rim;
}

export function createTerrain(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(110, 110, 110, 110);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const a = new THREE.Color("#b5532c"), b = new THREE.Color("#8c3d22"), c = new THREE.Color("#d07a48");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i, height(x, z));
    const n = (Math.sin(x * 0.9) * Math.cos(z * 0.7) + 1) / 2;
    const col = a.clone().lerp(b, n * 0.6).lerp(c, Math.max(0, Math.sin(x * 0.05 + z * 0.04)) * 0.35);
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
  const mat = new THREE.MeshStandardMaterial({ color: "#6e3320", flatShading: true, roughness: 1 });
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    const angle = rnd() * Math.PI * 2, r = 9 + rnd() * 26;
    const x = Math.cos(angle) * r, z = Math.sin(angle) * r;
    if (Math.hypot(x + 13, z + 11) < 6.5 || Math.hypot(x, z + 11.6) < 5) continue; // барилгын газарт чулуу тавихгүй
    const s = 0.3 + rnd() * (r > 20 ? 1.4 : 0.6);
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), mat);
    rock.position.set(x, height(x, z) + s * 0.3, z);
    rock.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    rock.castShadow = true;
    g.add(rock);
  }
  return g;
}

export function createStars(): THREE.Points {
  const pts: number[] = [];
  for (let i = 0; i < 900; i++) {
    const t = Math.random() * Math.PI * 2, p = Math.random() * Math.PI * 0.45;
    pts.push(Math.cos(t) * Math.sin(p) * 160, Math.cos(p) * 160, Math.sin(t) * Math.sin(p) * 160);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: "#ffffff", size: 0.7, transparent: true, opacity: 0, fog: false }));
}
