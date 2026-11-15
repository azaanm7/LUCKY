import { DEPOT, MACHINES, RECIPES, SHELTER, SITES, SOLAR_FIELD, TRAINING } from "./config";
import { toast } from "./events";
import { canCraft } from "./gather";
import type { GameState, TrainingId, Vec2 } from "./types";
import { dist } from "./world";

// Эхний өдрийн сургалт: тоглогч тоглоомын гол тойргийг нэг удаа хийж үзнэ:
// цуглуулах → суурьт буулгах → хэвлэх, мөн машин унтраах, панель арчих, дээж авчрах. Алхам бүр хийгдмэгц тэмдэглэгдэнэ.
export function train(prev: GameState, next: GameState): GameState {
  if (next.trained.length >= TRAINING.length) return next;
  const did: Record<TrainingId, boolean> = {
    collect: next.collected > prev.collected,
    store: next.pack.length < prev.pack.length && next.hearts === prev.hearts,
    craft: !prev.job && !!next.job,
    switch: MACHINES.some((m) => prev.on[m.id] !== next.on[m.id]),
    wipe: prev.task?.kind === "wipe" && next.dust < prev.dust,
    sample: next.science > prev.science && next.samples.length < prev.samples.length,
  };
  const fresh = TRAINING.filter((t) => did[t.id] && !next.trained.includes(t.id)).map((t) => t.id);
  if (!fresh.length) return next;
  const trained = [...next.trained, ...fresh];
  if (trained.length < TRAINING.length) return { ...next, trained };
  return toast({ ...next, trained }, { kind: "trained" }, 8);
}

// Дараагийн хийх сургалтын алхам (бүгдийг хийсэн бол undefined)
export const nextTraining = (s: GameState) => TRAINING.find((t) => !s.trained.includes(t.id));

// Сум хаашаа заах вэ: дараагийн алхмыг хийх газар
export function trainingTarget(s: GameState): Vec2 | null {
  const nearest = (list: Vec2[]) => [...list].sort((a, b) => dist(a, s.player) - dist(b, s.player))[0] ?? null;
  const ore = s.deposits.filter((d) => d.kind === "ore");
  switch (nextTraining(s)?.id) {
    case "collect": return nearest(s.deposits);
    case "store": return s.pack.length ? nearest([SHELTER, DEPOT]) : nearest(s.deposits);
    case "craft": // сэлбэг хэвлэхэд хүдэр хэрэгтэй: байхгүй бол эхлээд цуглуулна
      if (RECIPES.some((r) => canCraft(s, r))) return DEPOT;
      return s.pack.includes("ore") ? DEPOT : nearest(ore);
    case "switch": return nearest(MACHINES.map((m) => m.pos));
    case "wipe": return SOLAR_FIELD;
    case "sample": return s.samples.length ? SHELTER : nearest(SITES.filter((x) => s.siteLeft[x.id] > 0));
    default: return null;
  }
}
