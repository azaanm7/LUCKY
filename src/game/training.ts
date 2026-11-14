import { MACHINES, SHELTER, SITES, SOLAR_FIELD, TRAINING } from "./config";
import { toast } from "./events";
import type { GameState, TrainingId, Vec2 } from "./types";
import { dist, inShelter } from "./world";

// Эхний өдрийн сургалт: тоглогч үндсэн 5 үйлдлийг нэг нэг удаа хийж үзнэ. Алхам бүр хийгдмэгц тэмдэглэгдэнэ.
export function train(prev: GameState, next: GameState): GameState {
  if (next.trained.length >= TRAINING.length) return next;
  const did: Record<TrainingId, boolean> = {
    ice: next.collected > prev.collected,
    switch: MACHINES.some((m) => prev.on[m.id] !== next.on[m.id]),
    wipe: prev.task?.kind === "wipe" && next.dust < prev.dust,
    refill: inShelter(next.player) && next.suitO2 > prev.suitO2,
    sample: next.science > prev.science && next.samples.length < prev.samples.length,
  };
  const fresh = TRAINING.filter((t) => did[t.id] && !next.trained.includes(t.id)).map((t) => t.id);
  if (!fresh.length) return next;
  const trained = [...next.trained, ...fresh];
  if (trained.length < TRAINING.length) return { ...next, trained };
  return toast({ ...next, trained }, "🎓 Сургалтаа дүүргэлээ! Чи одоо жинхэнэ бяцхан сансрын нисэгч боллоо.", 8);
}

// Дараагийн хийх сургалтын алхам (бүгдийг хийсэн бол undefined)
export const nextTraining = (s: GameState) => TRAINING.find((t) => !s.trained.includes(t.id));

// Сум хаашаа заах вэ: дараагийн алхмыг хийх газар
export function trainingTarget(s: GameState): Vec2 | null {
  const nearest = (list: Vec2[]) => [...list].sort((a, b) => dist(a, s.player) - dist(b, s.player))[0] ?? null;
  switch (nextTraining(s)?.id) {
    case "ice": return nearest(s.ice);
    case "switch": return nearest(MACHINES.map((m) => m.pos));
    case "wipe": return SOLAR_FIELD;
    case "refill": return SHELTER;
    case "sample": return s.samples.length ? SHELTER : nearest(SITES.filter((x) => s.siteLeft[x.id] > 0));
    default: return null;
  }
}
