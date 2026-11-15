import { HARVEST_FOOD, SOLAR_FIELD, TASK_STEPS, WIPE_DUST } from "./config";
import { toast } from "./events";
import { installed } from "./missions";
import type { GameState, Input } from "./types";
import { inZone, nearMachine } from "./world";

// Гараар хийдэг ажил: тоглогч дэлгэц дээр арчиж, товшиж алхам бүрийг хийнэ (ui/task-overlay.tsx).
// Ажиллаж байх хооронд цаг зогсохгүй, скафандрын O2 буурсаар байна.
export function workTask(s: GameState, input: Input): GameState {
  const task = s.task;
  if (!task) {
    if (!input.action) return s;
    // Хүлэмжийн дугуй дээр ургац бэлэн бол хурааж эхэлнэ
    if (nearMachine(s.player) === "greenhouse" && s.crop !== null && s.crop >= 1) return { ...s, task: { kind: "harvest", done: 0 } };
    // Нарны панелийн талбайд товч дарвал арчиж эхэлнэ
    const canWipe = inZone(s.player, SOLAR_FIELD) && !nearMachine(s.player) && s.dust > 0.05;
    return canWipe ? { ...s, task: { kind: "wipe", done: 0 } } : s;
  }
  if (input.cancel) return { ...s, task: null };
  if (!input.step) return s;
  const done = task.done + 1 / TASK_STEPS[task.kind];
  const finished = done > 0.999;
  if (task.kind === "wipe") {
    const dust = Math.max(0, s.dust - WIPE_DUST);
    return { ...s, dust, task: finished || dust <= 0.01 ? null : { ...task, done } };
  }
  if (!finished) return { ...s, task: { ...task, done } };
  if (task.kind === "harvest") { // хураасан ургац хүнс болно. Үр байвал дараагийн frame-д дахин тарина.
    const food = Math.min(100, s.res.food + HARVEST_FOOD);
    return toast({ ...s, task: null, crop: null, res: { ...s.res, food } }, { kind: "harvested", food: HARVEST_FOOD });
  }
  return installed({ ...s, task: null }, task.kind);
}
