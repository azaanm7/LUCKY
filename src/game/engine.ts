import { DEPOSITS, HEARTS, PROBLEM_IDS, SITE_SAMPLES, START, START_PARTS, START_STORE } from "./config";
import { updateSuit } from "./crew";
import { FLARES } from "./donki";
import { checkEnd, fact, weather } from "./events";
import { addDeposit, gather } from "./gather";
import { produce } from "./machines";
import { progressProblem, startProblem } from "./missions";
import { irradiate } from "./radiation";
import { explore } from "./science";
import { workTask } from "./tasks";
import { train } from "./training";
import type { Flare, GameState, Input, Material } from "./types";
import { movePlayer, nearMachine, random, shuffle } from "./world";

// live = NASA DONKI-оос дөнгөж татсан дэлбэрэлт. Байхгүй бол архиваас seed-ээр сонгоно.
export function createGame(seed = Math.floor(Math.random() * 1e9), live: Flare | null = null): GameState {
  // Тоглолт бүр өөр: асуудлын дараалал, аль бодит дэлбэрэлт тохиохыг seed шийднэ
  const [deck, afterDeck] = shuffle(PROBLEM_IDS, seed);
  const [flare, afterFlare] = random(afterDeck);
  let s: GameState = {
    status: "playing", time: 0, hearts: HEARTS,
    res: { ...START },
    on: { o2: true, recycler: true, greenhouse: true }, load: 1, broken: null, weak: [], safeMode: 0,
    dust: 0.1, player: { x: 0, z: 6, angle: Math.PI, moving: false },
    suitO2: 100, dose: 0,
    pack: [], store: { ...START_STORE }, parts: START_PARTS, built: [], job: null,
    melt: 0, filter: 1, crop: 0, // эхний ургац аль хэдийн тариастай
    carrying: null, task: null,
    deck, problem: null, plan: null, earthAt: 0, advice: null, solarFlare: live ?? FLARES[Math.floor(flare * FLARES.length)], solved: [], modal: null,
    science: 0, samples: [], drill: 0, siteLeft: { soil: SITE_SAMPLES, delta: SITE_SAMPLES, crater: SITE_SAMPLES },
    deposits: [], nextDepositId: 0, storm: 0, stormSol: 0, flareWarn: 0, flare: 0, flareHit: false,
    emptyTimer: 0, collected: 0, trained: [], losses: [], seen: ["start"],
    toast: { msg: { kind: "fact", id: "start" }, until: 8 }, seed: afterFlare,
  };
  for (const kind of Object.keys(DEPOSITS) as Material[]) for (let i = 0; i < DEPOSITS[kind].count; i++) s = addDeposit(s, kind);
  return s;
}

// ===== Гол функц: 1 frame (dt секунд) урагшлуулна =====
export function tick(prev: GameState, input: Input, dt: number): GameState {
  if (prev.status !== "playing" || prev.modal) return prev; // цонх нээлттэй бол түр зогсоно
  const busy = !!prev.task; // гараар ажил хийж байх үед алхахгүй
  let s: GameState = { ...prev, time: prev.time + dt, player: busy ? { ...prev.player, moving: false } : movePlayer(prev, input, dt) };

  // 1) Товч дарвал ойрын машиныг асаах / унтраах. Хүлэмжийн ургац бэлэн бол товч нь ургац хураана (tasks.ts).
  const near = nearMachine(s.player);
  const harvest = near === "greenhouse" && s.crop !== null && s.crop >= 1;
  if (input.action && near && !busy && !harvest) s = { ...s, on: { ...s.on, [near]: !s.on[near] } };
  if (near === "o2") s = fact(s, "moxie");

  // 2) Эрчим хүчний төсөв, гурван машин, 3D принтер, багийн хэрэглээ
  s = produce(s, dt);

  // 3) Шороо хуримтлагдана (шуургатай үед хурдан). Арчих нь гараар хийдэг ажил: tasks.ts
  s = { ...s, dust: Math.min(1, s.dust + (s.storm > 0 ? 0.05 : 0.004) * dt) };

  // 4) Материал цуглуулах, суурьт буулгах, хэвлэх · гараар хийдэг ажил · шинжлэх ухааны экспедиц
  s = explore(workTask(gather(s, input), input), dt);

  // 5) Скафандрын хүчилтөрөгч, цацрагийн тун
  s = irradiate(updateSuit(s, dt), dt);

  // 6) Аюул, асуудал
  s = weather(s, dt);
  s = progressProblem(startProblem(s));
  return train(prev, checkEnd(s, dt));
}
