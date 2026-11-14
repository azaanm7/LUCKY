import { DEPOT, MACHINES, REPAIRS, SCHEDULE } from "./config";
import type { GameState, ProblemId } from "./types";
import { dist, inZone, solOf } from "./world";

// Хуваарийн дагуу дараагийн асуудлыг эхлүүлнэ
export function startProblem(s: GameState): GameState {
  if (s.problem || s.modal) return s;
  const next = SCHEDULE.find((p) => !s.solved.includes(p.id) && s.time >= p.at);
  if (!next) return s;
  const repair = REPAIRS[next.id];
  return {
    ...s,
    problem: next.id,
    modal: { kind: "brief", id: next.id },
    broken: repair ? repair.target : s.broken,
    storm: next.id === "storm" ? 18 : s.storm,
    stormSol: next.id === "storm" ? solOf(s.time) : s.stormSol,
    flareWarn: next.id === "flare" ? 10 : s.flareWarn,
  };
}

// Асуудал шийдэгдсэн эсэхийг шалгана
export function progressProblem(s: GameState): GameState {
  const id = s.problem;
  if (!id || s.modal) return s;
  const repair = REPAIRS[id];

  if (repair) {
    // Агуулахад очвол хэрэгтэй сэлбэгийг автоматаар авна
    if (!s.carrying && inZone(s.player, DEPOT)) s = { ...s, carrying: repair.item };
    // Сэлбэгтэйгээ машины дугуй дээр очвол засна
    const target = MACHINES.find((m) => m.id === repair.target)!;
    if (s.carrying === repair.item && dist(s.player, target.pos) < 2.2) return solve(s, id);
    return s;
  }
  if (id === "storm" && s.storm <= 0 && s.dust < 0.25) return solve(s, id);
  if (id === "flare" && s.flareWarn <= 0 && s.flare <= 0) return solve(s, id);
  return s;
}

function solve(s: GameState, id: ProblemId): GameState {
  return {
    ...s,
    problem: null,
    broken: null,
    carrying: null,
    solved: [...s.solved, id],
    modal: { kind: "debrief", id },
  };
}

// Цонхыг хаахад тоглоом үргэлжилнэ
export const acknowledge = (s: GameState): GameState => ({ ...s, modal: null });
