import * as THREE from "three";

export const mat = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.7, ...extra });

export function mesh(geo: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// Сансрын нисэгч: цагаан хувцас, алтан шил, нуруун дээр нь хүчилтөрөгчийн сав
export function createAstronaut() {
  const root = new THREE.Group();
  const suit = mat("#f4f1ec"), dark = mat("#4a4f5c"), orange = mat("#e2693b");
  const body = mesh(new THREE.CapsuleGeometry(0.42, 0.55, 4, 10), suit, 0, 1.05, 0);
  const belt = mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.12, 12), orange, 0, 0.82, 0);
  const head = mesh(new THREE.SphereGeometry(0.42, 16, 12), suit, 0, 1.82, 0);
  const visor = mesh(new THREE.SphereGeometry(0.36, 16, 12, -Math.PI / 2.6, Math.PI / 1.3, Math.PI / 4, Math.PI / 2.4),
    mat("#f2b632", { metalness: 0.8, roughness: 0.15, emissive: "#5a3a00" }), 0, 1.84, 0.1);
  const pack = mesh(new THREE.BoxGeometry(0.62, 0.7, 0.32), dark, 0, 1.15, -0.42);
  const light = mesh(new THREE.SphereGeometry(0.06, 8, 6), mat("#7fe0ff", { emissive: "#7fe0ff" }), 0.22, 1.42, -0.6);
  const legL = mesh(new THREE.CapsuleGeometry(0.16, 0.35, 3, 8), suit, -0.18, 0.38, 0);
  const legR = legL.clone(); legR.position.x = 0.18;
  const armL = mesh(new THREE.CapsuleGeometry(0.12, 0.42, 3, 8), suit, -0.55, 1.15, 0);
  const armR = armL.clone(); armR.position.x = 0.55;
  root.add(body, belt, head, visor, pack, light, legL, legR, armL, armR);
  return { root, legL, legR, armL, armR };
}

export function createIce(): THREE.Group {
  const g = new THREE.Group();
  const m = mat("#bfe9ff", { emissive: "#3aa6d9", emissiveIntensity: 0.6, roughness: 0.2, transparent: true, opacity: 0.92 });
  g.add(mesh(new THREE.OctahedronGeometry(0.55, 0), m, 0, 0.9, 0));
  g.add(mesh(new THREE.OctahedronGeometry(0.32, 0), m, 0.45, 0.55, 0.2));
  g.add(mesh(new THREE.OctahedronGeometry(0.28, 0), m, -0.35, 0.5, -0.25));
  const glow = new THREE.PointLight("#7fd4ff", 3, 5);
  glow.position.y = 1;
  g.add(glow);
  return g;
}

export function createPad(): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.8, 32), new THREE.MeshBasicMaterial({ color: "#78c17c", transparent: true, opacity: 0.85 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.05;
  return m;
}

// Эмодзи + бичигтэй хаяг (sprite). Камер руу үргэлж харна.
export function createLabel(text: string, bg = "rgba(21,17,15,.82)", fg = "#f6eee6"): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.roundRect(8, 8, 496, 112, 40); ctx.fill();
  ctx.fillStyle = fg; ctx.font = "bold 50px Nunito, Segoe UI, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 66);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false }));
  s.scale.set(0.2, 0.05, 1); // дэлгэц дээр үргэлж ижил хэмжээтэй
  s.renderOrder = 10;
  return s;
}

// Тоглогчийн дээр гарч зорих газрыг заадаг сум
export function createGuideArrow(): THREE.Mesh {
  const geo = new THREE.ConeGeometry(0.45, 1.2, 4);
  geo.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: "#ffd84a" }));
  m.visible = false;
  return m;
}
