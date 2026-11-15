import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Хөдөлдөггүй жижиг хэсгүүдийг нэгтгэнэ: group-ын шууд хүүхэд mesh-үүдийг материал бүрээр нь нэг mesh болгоно.
// Олон жижиг зурах дуудлагын оронд материал бүрт нэг л удаа зурна (утсан дээр хурдан). keep: хөдөлдөг, нуугддаг хэсгүүд.
export function mergeStatic(group: THREE.Object3D, keep: THREE.Object3D[] = []) {
  const byMaterial = new Map<THREE.Material, THREE.Mesh[]>();
  for (const child of group.children) {
    if (!(child instanceof THREE.Mesh) || child instanceof THREE.InstancedMesh || keep.includes(child) || Array.isArray(child.material)) continue;
    const list = byMaterial.get(child.material) ?? [];
    list.push(child);
    byMaterial.set(child.material, list);
  }
  for (const [material, meshes] of byMaterial) {
    if (meshes.length < 2) continue;
    const parts = meshes.map((m) => {
      m.updateMatrix();
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(m.matrix);
      for (const name of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(name)) g.deleteAttribute(name);
      return g;
    });
    const geo = mergeGeometries(parts);
    if (!geo) continue; // нэгтгэж чадахгүй бол хэвээр нь үлдээнэ
    const merged = new THREE.Mesh(geo, material);
    merged.castShadow = meshes.some((m) => m.castShadow);
    merged.receiveShadow = meshes.some((m) => m.receiveShadow);
    merged.renderOrder = meshes[0].renderOrder;
    for (const m of meshes) { group.remove(m); m.geometry.dispose(); }
    for (const p of parts) p.dispose();
    group.add(merged);
  }
}
