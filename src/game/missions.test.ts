import { describe, expect, test } from "bun:test";
import { DEPOT, EARTH_SECONDS_PER_MINUTE, PROBLEM_TIMES, SHIELD_POWER, SOLAR_FIELD, STUDY_POWER, STUDY_SCIENCE, TASK_STEPS, WIPE_DUST } from "./config";
import { createGame, tick } from "./engine";
import { askEarth, choose } from "./missions";
import { PROBLEMS } from "./problems";
import { at, game, idle, press, run, step, untilModal } from "./testing";
import type { GameState, ProblemId } from "./types";
import { powerDemand } from "./world";

// Тодорхой асуудал дөнгөж эхэлсэн тоглоом (цонх нээлттэй). Тоглогч хоргодох байранд.
const facing = (id: ProblemId, over: Partial<GameState> = {}): GameState =>
  tick(at({ ...createGame(1), deck: [id], time: PROBLEM_TIMES[0], ...over }, 0, 0), idle, 0.05);
const steps = (s: GameState, n: number) => { for (let i = 0; i < n; i++) s = tick(s, step, 0.05); return s; };

describe("асуудлын цонх: хоёр төлөвлөгөө", () => {
  test("асуудал эхлэхэд тоглоом зогсож, сонголт хүлээнэ", () => {
    const s = facing("filter");
    expect(s).toMatchObject({ problem: "filter", broken: "o2", plan: null, modal: { kind: "brief", id: "filter" } });
    expect(tick(s, idle, 1).time).toBe(s.time);
  });

  test("A: сэлбэг авчирч гараараа суулгавал бүрэн засагдана", () => {
    let s = choose(facing("filter"), "a");
    expect(s.modal).toBeNull();
    s = tick(at(s, DEPOT.x, DEPOT.z), idle, 0.05);
    expect(s.carrying).toBe("filter");
    s = tick(at(s, -9, 2), idle, 0.05);
    expect(s.task).toEqual({ kind: "filter", done: 0 });
    expect(tick(s, { dx: 1, dz: 0, action: false }, 0.5).player.x).toBe(-9); // ажиллаж байхдаа алхахгүй
    s = steps(s, TASK_STEPS.filter);
    expect(s).toMatchObject({ solved: ["filter"], broken: null, carrying: null, task: null, weak: [], modal: { kind: "debrief" } });
  });

  test("B: түр засвар шууд ажиллана, гэхдээ машин хагас хүчтэй болно", () => {
    const s = choose(facing("pump"), "b");
    expect(s).toMatchObject({ solved: ["pump"], broken: null, weak: ["recycler"], modal: { kind: "debrief" } });
  });

  test("түр зассан машинаа тайван үед сэлбэгээр бүрэн засаж болно", () => {
    let s = tick(at(game({ weak: ["greenhouse"] }), DEPOT.x, DEPOT.z), idle, 0.05);
    expect(s.carrying).toBe("patch");
    s = steps(tick(at(s, 0, -8), idle, 0.05), TASK_STEPS.patch);
    expect(s).toMatchObject({ weak: [], carrying: null, task: null });
  });

  test("ажлаа орхиж болно", () => {
    const s = tick(game({ task: { kind: "pump", done: 0.5 }, carrying: "pump" }), { ...idle, cancel: true }, 0.05);
    expect(s.task).toBeNull();
    expect(s.carrying).toBe("pump");
  });

  test("шуургыг судалбал оноо авч, батарей зарна", () => {
    const before = facing("storm");
    const s = choose(before, "b");
    expect(s.science).toBe(STUDY_SCIENCE);
    expect(s.res.battery).toBe(Math.max(0, before.res.battery - STUDY_POWER));
  });

  test("дэлбэрэлт: A бамбайг асааж батарей зарна, B батарейгаа хэмнэнэ", () => {
    const before = facing("flare");
    const shielded = choose(before, "a");
    expect(shielded.shield).toBe(true);
    expect(shielded.res.battery).toBe(Math.max(0, before.res.battery - SHIELD_POWER));
    expect(powerDemand(shielded)).toBe(powerDemand(before)); // машинууд ажилласаар
    const saved = choose(before, "b");
    expect(saved.shield).toBe(false);
    expect(saved.res.battery).toBe(before.res.battery);
    expect(run(shielded, 20).shield).toBe(false); // дэлбэрэлт дуусахад бамбай унтарна
  });
});

describe("Дэлхийтэй холбоо: хариу хожуу ирнэ", () => {
  test("хариу ирэх хүртэл асуудал үргэлжилж, сэлбэг авч болохгүй", () => {
    const asked = askEarth(facing("filter"));
    expect(asked).toMatchObject({ modal: null, plan: null });
    expect(tick(at(asked, DEPOT.x, DEPOT.z), idle, 0.05).carrying).toBeNull();
    const s = untilModal(asked);
    expect(s.time - asked.time).toBeCloseTo(PROBLEMS.filter.delay * EARTH_SECONDS_PER_MINUTE, 0);
    expect(s).toMatchObject({ modal: { kind: "answer" }, advice: "a", broken: "o2" }); // агаар хангалттай: бүрэн зас
  });

  test("нөөц бага бол Дэлхий хурдан засварыг зөвлөнө", () => {
    const low = { oxygen: 30, water: 60, food: 60, battery: 60 };
    expect(untilModal(askEarth(facing("leak", { res: low }))).advice).toBe("b");
  });

  test("дэлбэрэлтийн үед хариу хожимдоно: өөрөө шийдэх хэрэгтэй", () => {
    const s = untilModal(askEarth(facing("flare")));
    expect(s.modal?.kind).toBe("answer");
    expect(s.flare).toBeGreaterThan(0); // дэлбэрэлт аль хэдийн эхэлсэн
    expect(s.plan).toBe("b"); // шийдээгүй тул машинууд ажилласаар үлдсэн
  });
});

describe("нарны панелийг гараар арчих", () => {
  const dusty = at(game({ dust: 0.7 }), SOLAR_FIELD.x, SOLAR_FIELD.z);

  test("зүгээр зогсоход цэвэрлэгдэхгүй", () => {
    expect(run(dusty, 3).dust).toBeGreaterThanOrEqual(0.7);
  });

  test("товч дарж эхлээд, алхам бүрд шороо арилна", () => {
    let s = tick(dusty, press, 0.05);
    expect(s.task?.kind).toBe("wipe");
    s = tick(s, step, 0.05);
    expect(s.dust).toBeCloseTo(0.7 - WIPE_DUST, 2);
    s = steps(s, 5);
    expect(s.dust).toBeLessThan(0.01);
    expect(s.task).toBeNull();
  });
});
