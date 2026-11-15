import { expect, test } from "bun:test";
import { createCameraRig, DEFAULT_VIEW, screenToWorld } from "./camera";

const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-9);

test("камер эргээгүй үед оролт өөрчлөгдөхгүй", () => {
  expect(screenToWorld(1, 0, 0)).toEqual({ dx: 1, dz: 0 });
  expect(screenToWorld(0, -1, 0)).toEqual({ dx: 0, dz: -1 });
});

test("камер зүүн талд (yaw = 90°) байхад дэлгэцийн 'урагш' нь ертөнцийн баруунаас зүүн тийш (−x)", () => {
  const up = screenToWorld(0, -1, Math.PI / 2); // W товч
  near(up.dx, -1); near(up.dz, 0);
  const right = screenToWorld(1, 0, Math.PI / 2); // D товч
  near(right.dx, 0); near(right.dz, -1);
});

test("эргүүлэхэд алхах хурд өөрчлөгдөхгүй (уртыг хадгална)", () => {
  for (const yaw of [0.3, 1.7, -2.4, 5]) {
    const v = screenToWorld(0.6, -0.8, yaw);
    near(Math.hypot(v.dx, v.dz), 1);
  }
});

test("харагдац солигдож, камер зорилт руугаа зөөлөн очно", () => {
  const rig = createCameraRig();
  expect(rig.view).toBe(DEFAULT_VIEW);
  const top = rig.step(0.016, false);
  rig.toggle();
  expect(rig.view).not.toBe(DEFAULT_VIEW);
  let c = rig.step(0.016, false);
  for (let i = 0; i < 200; i++) c = rig.step(0.016, false);
  expect(c.up).not.toBe(top.up);
  rig.turn(1);
  for (let i = 0; i < 200; i++) c = rig.step(0.016, false);
  near(rig.yaw, 1);
  near(c.sin, Math.sin(1));
});
