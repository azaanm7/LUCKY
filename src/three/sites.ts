import * as THREE from "three";
import { SITES, SITE_SAMPLES } from "../game/config";
import type { GameState } from "../game/types";
import { inZone } from "../game/world";
import type { Dict } from "../i18n/mn";
import { createGlow, createLabel, glowMat, mat, mesh } from "./models";
import { height } from "./terrain";

const COLOR = ["#7fe0ff", "#c9a0ff", "#ffd84a"]; // 1, 2, 3 оноотой талбайн өнгө

// Шинжлэх ухааны талбай: өрөм, гэрэлт цамхаг, үлдсэн дээжийн тоогоор жижиг савнууд
export function createSites(scene: THREE.Scene, t: Dict) {
  const units = SITES.map((site) => {
    const color = COLOR[site.worth - 1];
    const g = new THREE.Group();
    g.position.set(site.x, height(site.x, site.z), site.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(site.r - 0.45, site.r, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    for (let i = 0; i < 3; i++) { // гурван хөлтэй өрмийн тавиур
      const leg = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 6), mat("#c9ced4"), Math.cos(i * 2.1) * 0.55, 1.35, Math.sin(i * 2.1) * 0.55);
      leg.rotation.set(Math.sin(i * 2.1) * 0.4, 0, -Math.cos(i * 2.1) * 0.4);
      g.add(leg);
    }
    const bit = mesh(new THREE.ConeGeometry(0.26, 1.1, 6), mat("#59616b"), 0, 0.6, 0);
    bit.rotation.x = Math.PI;
    const lamp = mesh(new THREE.SphereGeometry(0.22, 8, 6), glowMat(color, 2), 0, 2.85, 0);
    const beam = createGlow(color, 6, 0.4);
    beam.position.y = 2.85;
    const tubes = Array.from({ length: SITE_SAMPLES }, (_, i) => {
      const a = (i / SITE_SAMPLES) * Math.PI * 2 + 0.5;
      return mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.55, 8), glowMat(color, 0.9), Math.cos(a) * 1.3, 0.3, Math.sin(a) * 1.3);
    });
    g.add(ring, bit, lamp, beam, ...tubes);
    const label = createLabel(`${site.icon} ${t.sites[site.id]} ×${site.worth}`, "rgba(20,45,80,.9)");
    label.position.set(site.x, g.position.y + 4.4, site.z);
    scene.add(g, label);
    return { site, ring, bit, beam, tubes, label };
  });

  return function update(s: GameState, t: number) {
    for (const u of units) {
      const left = s.siteLeft[u.site.id];
      const drilling = s.drill > 0 && inZone(s.player, u.site);
      u.tubes.forEach((tube, i) => { tube.visible = i < left; });
      u.label.visible = left > 0;
      u.beam.material.opacity = left > 0 ? 0.3 + Math.sin(t * 3) * 0.12 : 0;
      (u.ring.material as THREE.MeshBasicMaterial).opacity = left > 0 ? 0.8 : 0.15;
      u.ring.scale.setScalar(drilling ? 1 + Math.sin(t * 14) * 0.04 : 1);
      u.bit.rotation.y = drilling ? t * 25 : 0; // өрөмдөж байх үед эргэнэ
      u.bit.position.y = drilling ? 0.5 + Math.sin(t * 30) * 0.06 : 0.6;
    }
  };
}
