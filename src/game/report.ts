import { MACHINES } from "./config";
import type { GameState, HeartLoss, Step, TipId } from "./types";

// Төгсгөлийн тайлан: зүрх бүрийг яагаад алдсаныг шалтгаанаас үр дагавар руу нь тайлбарлана.
// Алхам, зөвлөгөө бүр код хэлбэртэй. Бичвэрийг нь i18n (mn.ts, en.ts) гаргана.
export interface Finding {
  sol: number;
  steps: Step[]; // шалтгаан → ... → үр дагавар
  tip: TipId; // дараагийн удаа юу хийх вэ
  count: number; // ижил шалтгаанаар дараалан хэдэн зүрх алдсан
}

const SHORT = 0.5; // машинууд хэрэгцээнийхээ 50%-аас бага эрчим хүч авбал "эрчим хүч дутсан" гэж үзнэ

export function explain(l: HeartLoss): Omit<Finding, "count"> {
  const sol = l.sol;
  if (l.cause === "radiation") return { sol, steps: [{ id: "outsideFlare" }, { id: "radiationHit" }], tip: "shelter" };
  if (l.cause === "suit" && l.drilling) return { sol, steps: [{ id: "drillO2" }, { id: "oneMore" }, { id: "suitEmpty" }], tip: "returnEarly" };
  if (l.cause === "suit") return { sol, steps: [{ id: "tooLong" }, { id: "suitEmpty" }], tip: "refill" };

  const machine = MACHINES.find((m) => m.makes === l.cause)!.id;
  const end: Step = { id: "out", need: l.cause };
  if (l.broken) return { sol, steps: [{ id: "broken", machine }, { id: "noPart" }, end], tip: "fetchPart" };
  if (l.weak) return { sol, steps: [{ id: "weakFix", machine }, { id: "halfPower" }, end], tip: "fullFix" };
  if (!l.machineOn) return { sol, steps: [{ id: "off", machine }, end], tip: "turnBackOn" };
  if (l.cause === "oxygen" && l.leak) return { sol, steps: [{ id: "leak" }, { id: "slowPatch" }, end], tip: "patch" };
  if (l.load < SHORT) {
    const chain: Step[] = [{ id: "noPower" }, { id: "slowed", machine }, end];
    if (l.night) return { sol, steps: [{ id: "night" }, ...chain], tip: "dusk" };
    if (l.storm) return { sol, steps: [{ id: "storm" }, ...chain], tip: "stormOff" };
    if (l.dust > 0.5) {
      const dirty: Step = { id: "dusty", pct: Math.round(l.dust * 100) };
      const steps: Step[] = l.stormSol ? [{ id: "stormSol", sol: l.stormSol }, dirty, ...chain] : [dirty, ...chain];
      return { sol, steps, tip: "wipe" };
    }
    return { sol, steps: [{ id: "allOn" }, ...chain], tip: "spare" };
  }
  if (l.cause === "water") return { sol, steps: [{ id: "fewIce" }, end], tip: "ice" };
  return { sol, steps: [{ id: "late", machine }, end], tip: "early" };
}

// Дараалсан ижил шалтгааныг нэгтгэнэ (жишээ нь 3 зүрхээ бүгдийг нь хүчилтөрөгчгүй алдсан бол нэг мөр)
export function report(s: GameState): Finding[] {
  const out: Finding[] = [];
  for (const l of s.losses) {
    const f = explain(l);
    const last = out[out.length - 1];
    if (last && JSON.stringify(last.steps) === JSON.stringify(f.steps)) last.count++;
    else out.push({ ...f, count: 1 });
  }
  return out;
}
