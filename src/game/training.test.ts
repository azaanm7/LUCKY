import { describe, expect, test } from "bun:test";
import { DEPOT, SOLAR_FIELD, TRAINING } from "./config";
import { damageChance, flarePower, strongest } from "./donki";
import { createGame, tick } from "./engine";
import { at, game, idle, press, run, step } from "./testing";
import { nextTraining, trainingTarget } from "./training";

describe("эхний өдрийн сургалт", () => {
  test("үйлдэл бүрийг хиймэгц тэмдэглэнэ", () => {
    const s = createGame(1);
    expect(tick(at(s, s.deposits[0].x, s.deposits[0].z), idle, 0.05).trained).toEqual(["collect"]);
    expect(tick(at(game({ pack: ["ice"] }), 0, 0), idle, 0.05).trained).toEqual(["store"]);
    expect(tick(at(game({ store: { ice: 0, ore: 2, seed: 0 } }), DEPOT.x, DEPOT.z), { ...idle, craft: "part" }, 0.05).trained).toEqual(["craft"]);
    expect(tick(at(s, -9, 2), press, 0.05).trained).toEqual(["switch"]);
    expect(run(at(game({ samples: [2] }), 0, 0), 0.1).trained).toEqual(["sample"]);
    const wiping = tick(at(game({ dust: 0.6 }), SOLAR_FIELD.x, SOLAR_FIELD.z), press, 0.05);
    expect(tick(wiping, step, 0.05).trained).toEqual(["wipe"]);
  });

  test("нэг алхмыг хоёр удаа тоолохгүй, бүгдийг хийвэл баяр хүргэнэ", () => {
    const all = TRAINING.map((t) => t.id);
    const s = game({ trained: all.slice(1) });
    const done = tick(at(s, s.deposits[0].x, s.deposits[0].z), idle, 0.05);
    expect(done.trained).toHaveLength(TRAINING.length);
    expect(done.toast?.msg).toEqual({ kind: "trained" });
    const again = tick(at({ ...done, toast: null, pack: [] }, done.deposits[0].x, done.deposits[0].z), idle, 0.05);
    expect(again.trained).toHaveLength(TRAINING.length);
  });

  test("сум дараагийн алхмыг хийх газрыг заана", () => {
    const s = createGame(1);
    expect(nextTraining(s)?.id).toBe("collect");
    expect(s.deposits).toContain(trainingTarget(s));
    expect(trainingTarget(game({ trained: ["collect", "store"], store: { ice: 0, ore: 2, seed: 0 } }))).toBe(DEPOT); // хүдэртэй бол урлан руу
    expect(trainingTarget(game({ trained: ["collect", "store"], store: { ice: 0, ore: 0, seed: 0 } }))).toMatchObject({ kind: "ore" }); // хүдэргүй бол хүдэр рүү
    expect(trainingTarget(game({ trained: ["collect", "store", "craft", "switch"] }))).toBe(SOLAR_FIELD);
    expect(trainingTarget(game({ trained: TRAINING.map((t) => t.id) }))).toBeNull();
  });
});

describe("NASA DONKI-ийн нарны дэлбэрэлт", () => {
  const records = [
    { peakTime: "2026-11-01T10:00Z", classType: "M5.2", activeRegionNum: 14560, link: "https://example.test/1" },
    { peakTime: "2026-11-03T08:30Z", classType: "X1.4", activeRegionNum: 14562, link: "https://example.test/2" },
    { peakTime: "2026-11-05T01:00Z", classType: "C9.9", activeRegionNum: null },
    { classType: 42 }, // буруу хэлбэртэй бүртгэлийг алгасна
  ];

  test("хамгийн хүчтэйг нь сонгож, шууд татсан гэж тэмдэглэнэ", () => {
    expect(strongest(records)).toEqual({ date: "2026-11-03", cls: "X1.4", region: 14562, link: "https://example.test/2", live: true });
    expect(strongest([])).toBeNull();
    expect(strongest("алдаа")).toBeNull();
  });

  test("X нь M-ээс 10 дахин хүчтэй, хүчтэй дэлбэрэлт машиныг илүү гэмтээнэ", () => {
    const flare = (cls: string) => ({ date: "", cls, region: 0, link: "" });
    expect(flarePower(flare("X2.0"))).toBeCloseTo(flarePower(flare("M2.0")) * 10, 6);
    expect(damageChance(flare("X9.0"))).toBeGreaterThan(damageChance(flare("M5.0")));
    expect(damageChance(flare("X50"))).toBeLessThanOrEqual(0.9);
  });

  test("шууд татсан дэлбэрэлт тоглолтод ашиглагдана, үгүй бол архив", () => {
    const live = strongest(records)!;
    expect(createGame(1, live).solarFlare).toBe(live);
    expect(createGame(1).solarFlare.live).toBeUndefined();
  });
});
