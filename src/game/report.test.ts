import { describe, expect, test } from "bun:test";
import { createGame } from "./engine";
import { stepText } from "../i18n/index";
import { mn } from "../i18n/mn";
import { explain, report } from "./report";
import type { HeartLoss } from "./types";

// Алхмуудыг монгол бичвэр болгож шалгана (тайлан өөрөө код буцаадаг)
const say = (l: HeartLoss) => {
  const f = explain(l);
  return { steps: f.steps.map((st) => stepText(mn, st)), tip: mn.report.tips[f.tip] };
};

const loss = (over: Partial<HeartLoss>): HeartLoss => ({
  sol: 3, cause: "oxygen", machineOn: true, broken: false, weak: false, leak: false, drilling: false, starved: false, flare: false, load: 1, dust: 0.1, storm: false, night: false, stormSol: 0, ...over,
});

describe("төгсгөлийн тайлан", () => {
  test("цацраг: дэлбэрэлтийн үеэр гадаа байсан уу, тун аажим хуримтлагдсан уу", () => {
    expect(say(loss({ cause: "radiation", flare: true })).steps[0]).toContain("дэлбэрэлтийн үеэр");
    expect(explain(loss({ cause: "radiation" })).steps[0]).toEqual({ id: "doseSlow" });
    expect(explain(loss({ cause: "radiation" })).tip).toBe("lessOutside");
  });

  test("материал дутсан: мөс, үр, шүүлтүүр тус бүр өөрийн тайлбартай", () => {
    expect(explain(loss({ cause: "water", starved: true })).steps[0]).toEqual({ id: "noIce" });
    expect(explain(loss({ cause: "food", starved: true })).tip).toBe("seed");
    expect(explain(loss({ cause: "oxygen", starved: true })).tip).toBe("craftPart");
  });

  test("машин унтраалттай байсан бол түүнийг шалтгаан гэнэ", () => {
    const f = say(loss({ cause: "food", machineOn: false }));
    expect(f.steps[0]).toContain("Хүлэмж унтраалттай");
    expect(f.steps.at(-1)).toContain("Хүнс дууссан");
  });

  test("шороотой панель: шуурганаас эхэлсэн гинжийг гаргана", () => {
    const f = say(loss({ load: 0.2, dust: 0.9, stormSol: 2 }));
    expect(f.steps).toHaveLength(5);
    expect(f.steps[0]).toContain("Sol 2");
    expect(f.steps[1]).toContain("90%");
    expect(f.tip).toContain("арч");
  });

  test("эвдэрсэн машин, гоожсон агаар, скафандр тус бүр өөрийн тайлбартай", () => {
    expect(say(loss({ broken: true })).steps[0]).toContain("Агаар үйлдвэр эвдэрсэн");
    expect(say(loss({ leak: true })).steps[0]).toContain("гоожсон");
    expect(say(loss({ cause: "suit" })).steps[1]).toContain("Скафандр");
  });

  test("шөнө батарей дууссан бол шөнийг шалтгаан гэнэ", () => {
    expect(say(loss({ load: 0, night: true })).steps[0]).toContain("Шөнө");
  });

  test("дараалсан ижил шалтгааныг нэгтгэнэ", () => {
    const night = loss({ load: 0, night: true });
    const s = { ...createGame(1), losses: [night, night, loss({ cause: "radiation" })] };
    expect(report(s).map((f) => f.count)).toEqual([2, 1]);
  });
});
