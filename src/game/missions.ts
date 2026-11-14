import { ADVISE, DEPOT, EARTH_SECONDS_PER_MINUTE, FLARE_WARN, MACHINES, PROBLEM_TIMES, REPAIRS, SHIELD_POWER, STORM_SECONDS, STUDY_POWER, STUDY_SCIENCE } from "./config";
import { toast } from "./events";
import { PROBLEMS } from "./problems";
import { shelteredFlareDose } from "./radiation";
import type { GameState, ItemId, Machine, MachineId, PlanId, ProblemId } from "./types";
import { dist, inZone, solOf } from "./world";

// Дараагийн асуудлыг эхлүүлнэ. Дараалал нь тоглолт бүрд өөр (state.deck).
export function startProblem(s: GameState): GameState {
  if (s.problem || s.modal) return s;
  const i = s.solved.length;
  if (i >= s.deck.length || s.time < PROBLEM_TIMES[i]) return s;
  const id = s.deck[i];
  const repair = REPAIRS[id];
  return {
    ...s,
    problem: id, plan: null, advice: null, earthAt: 0, task: null, carrying: null,
    modal: { kind: "brief", id },
    broken: repair ? repair.target : s.broken,
    storm: id === "storm" ? STORM_SECONDS : s.storm,
    stormSol: id === "storm" ? solOf(s.time) : s.stormSol,
    flareWarn: id === "flare" ? FLARE_WARN : s.flareWarn,
  };
}

// Тоглогч хоёр төлөвлөгөөний нэгийг сонгоно. Аль аль нь үнэтэй (problems.ts).
export function choose(s: GameState, plan: PlanId): GameState {
  const id = s.problem;
  if (!id || s.plan) return acknowledge(s);
  s = { ...s, plan, modal: null, earthAt: 0 };
  const repair = REPAIRS[id];
  if (repair && plan === "b") return solve({ ...s, weak: weaken(s, repair.target) }, id); // түр засвар: одоо ажиллана, гэхдээ хагас хүчээр
  if (id === "storm" && plan === "b") {
    const battery = Math.max(0, s.res.battery - STUDY_POWER);
    return toast({ ...s, science: s.science + STUDY_SCIENCE, res: { ...s.res, battery } }, { kind: "stormStudy", points: STUDY_SCIENCE });
  }
  if (id === "flare" && plan === "a") { // бамбай: батарей зарна, багийн тун бараг нэмэгдэхгүй
    return toast({ ...s, shield: true, res: { ...s.res, battery: Math.max(0, s.res.battery - SHIELD_POWER) } }, { kind: "shieldOn" });
  }
  return s;
}

// Дэлхийгээс асуувал хариу хожуу ирнэ. Тэр хооронд асуудал үргэлжилсээр байна.
export function askEarth(s: GameState): GameState {
  if (!s.problem || s.plan) return acknowledge(s);
  return { ...s, modal: null, earthAt: s.time + PROBLEMS[s.problem].delay * EARTH_SECONDS_PER_MINUTE };
}

// Дэлхий одоогийн нөхцөлийг хараад аль төлөвлөгөөг зөвлөх вэ
export function advise(s: GameState): PlanId {
  if (s.problem === "flare") return s.dose + shelteredFlareDose(s.solarFlare, false) >= ADVISE.doseRisk ? "a" : "b"; // бамбайгүй бол тун хэт өсөх үү
  if (s.problem === "storm") return s.res.battery >= ADVISE.studyBattery ? "b" : "a";
  const need = s.problem === "pump" ? "water" : "oxygen"; // шүүлтүүр, нүх хоёул агаарт нөлөөлнө
  return s.res[need] < ADVISE.lowNeed ? "b" : "a";
}

export const weaken = (s: GameState, id: MachineId): MachineId[] => [...s.weak.filter((m) => m !== id), id];

// Одоо сэлбэг аваачиж засах машин: A төлөвлөгөөтэй эвдрэл, эсвэл тайван үед түр зассан машин
export function repairTarget(s: GameState): Machine | undefined {
  const repair = s.problem && s.plan === "a" ? REPAIRS[s.problem] : undefined;
  return MACHINES.find((m) => m.id === (repair ? repair.target : s.problem ? undefined : s.weak[0]));
}

// Асуудал шийдэгдсэн эсэхийг шалгана
export function progressProblem(s: GameState): GameState {
  if (s.modal) return s;
  if (s.earthAt > 0 && s.time >= s.earthAt) { // Дэлхийн хариу ирлээ
    if (!s.problem) return { ...s, earthAt: 0 };
    return { ...s, earthAt: 0, advice: advise(s), modal: { kind: "answer", id: s.problem } };
  }
  if (s.task) return s;
  const fix = repairTarget(s); // тайван үед түр зассан машинаа бүрэн засаж болно
  if (fix) return fetchPart(s, fix.item, fix.id);
  const id = s.problem;
  if (id === "storm" && s.storm <= 0 && s.dust < 0.25) return solve(s, id);
  if (id === "flare" && s.flareWarn <= 0 && s.flare <= 0) return solve(s, id);
  return s;
}

// Агуулахад очвол сэлбэгээ авна. Сэлбэгтэйгээ машины дугуй дээр очвол гараараа суулгаж эхэлнэ (tasks.ts).
function fetchPart(s: GameState, item: ItemId, target: MachineId): GameState {
  if (!s.carrying && inZone(s.player, DEPOT)) return { ...s, carrying: item };
  const pad = MACHINES.find((m) => m.id === target)!.pos;
  if (s.carrying === item && dist(s.player, pad) < 2.2) return { ...s, task: { kind: item, done: 0 } };
  return s;
}

// Сэлбэгээ суулгаж дуусахад дуудагдана
export function installed(s: GameState, item: ItemId): GameState {
  const machine = MACHINES.find((m) => m.item === item)!;
  s = { ...s, carrying: null, weak: s.weak.filter((m) => m !== machine.id) };
  if (s.problem && REPAIRS[s.problem]) return solve(s, s.problem);
  return toast(s, { kind: "fixed", machine: machine.id });
}

function solve(s: GameState, id: ProblemId): GameState {
  return { ...s, problem: null, plan: null, broken: null, carrying: null, shield: false, solved: [...s.solved, id], modal: { kind: "debrief", id } };
}

// Цонхыг хаахад тоглоом үргэлжилнэ
export const acknowledge = (s: GameState): GameState => ({ ...s, modal: null });
