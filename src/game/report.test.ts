import { describe, expect, test } from "bun:test";
import { createGame } from "./engine";
import { explain, report } from "./report";
import type { HeartLoss } from "./types";

const loss = (over: Partial<HeartLoss>): HeartLoss => ({
  sol: 3, cause: "oxygen", machineOn: true, broken: false, leak: false, load: 1, dust: 0.1, storm: false, night: false, stormSol: 0, ...over,
});

describe("төгсгөлийн тайлан", () => {
  test("цацраг: гадаа байсан гэж тайлбарлана", () => {
    expect(explain(loss({ cause: "radiation" })).steps).toHaveLength(2);
  });

  test("машин унтраалттай байсан бол түүнийг шалтгаан гэнэ", () => {
    const f = explain(loss({ cause: "food", machineOn: false }));
    expect(f.steps[0]).toContain("Хүлэмж унтраалттай");
    expect(f.steps.at(-1)).toContain("Хүнс дууссан");
  });

  test("шороотой панель: шуурганаас эхэлсэн гинжийг гаргана", () => {
    const f = explain(loss({ load: 0.2, dust: 0.9, stormSol: 2 }));
    expect(f.steps).toHaveLength(5);
    expect(f.steps[0]).toContain("Sol 2");
    expect(f.steps[1]).toContain("90%");
    expect(f.tip).toContain("арч");
  });

  test("эвдэрсэн машин, гоожсон агаар, скафандр тус бүр өөрийн тайлбартай", () => {
    expect(explain(loss({ broken: true })).steps[0]).toContain("Агаар үйлдвэр эвдэрсэн");
    expect(explain(loss({ leak: true })).steps[0]).toContain("гоожсон");
    expect(explain(loss({ cause: "suit" })).steps[1]).toContain("Скафандр");
  });

  test("шөнө батарей дууссан бол шөнийг шалтгаан гэнэ", () => {
    expect(explain(loss({ load: 0, night: true })).steps[0]).toContain("Шөнө");
  });

  test("дараалсан ижил шалтгааныг нэгтгэнэ", () => {
    const night = loss({ load: 0, night: true });
    const s = { ...createGame(1), losses: [night, night, loss({ cause: "radiation" })] };
    expect(report(s).map((f) => f.count)).toEqual([2, 1]);
  });
});
