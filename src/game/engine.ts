import { CREW_USE, FACTS, HEARTS, ICE_COUNT, ICE_WATER, LEAK_RATE, MACHINES, MAKES, PROBLEM_IDS, SITE_SAMPLES, START, WEAK_OUTPUT } from "./config";
import { updateFitness, updateSuit } from "./crew";
import { FLARES } from "./donki";
import { checkEnd, fact, weather } from "./events";
import { progressProblem, startProblem } from "./missions";
import { explore } from "./science";
import { workTask } from "./tasks";
import { train } from "./training";
import type { Flare, GameState, Input, Resources } from "./types";
import { dist, movePlayer, nearMachine, powerDemand, random, shuffle, solarInput, spawnIce, works } from "./world";

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
    suitO2: 100, fitness: 100, exercisedSol: 0, gymTimer: 0,
    carrying: null, task: null,
    deck, problem: null, plan: null, earthAt: 0, advice: null, solarFlare: live ?? FLARES[Math.floor(flare * FLARES.length)], solved: [], modal: null,
    science: 0, samples: [], drill: 0, siteLeft: { soil: SITE_SAMPLES, delta: SITE_SAMPLES, crater: SITE_SAMPLES },
    ice: [], nextIceId: 0, storm: 0, stormSol: 0, flareWarn: 0, flare: 0, flareHit: false,
    emptyTimer: 0, collected: 0, trained: [], losses: [], seen: ["start"],
    toast: { text: FACTS.start, until: 8 }, seed: afterFlare,
  };
  for (let i = 0; i < ICE_COUNT; i++) s = addIce(s);
  return s;
}

function addIce(s: GameState): GameState {
  const { ice, seed } = spawnIce(s);
  return { ...s, ice: [...s.ice, ice], nextIceId: s.nextIceId + 1, seed };
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

// ===== Гол функц: 1 frame (dt секунд) урагшлуулна =====
export function tick(prev: GameState, input: Input, dt: number): GameState {
  if (prev.status !== "playing" || prev.modal) return prev; // цонх нээлттэй бол түр зогсоно
  const busy = !!prev.task; // гараар ажил хийж байх үед алхахгүй
  let s: GameState = { ...prev, time: prev.time + dt, player: busy ? { ...prev.player, moving: false } : movePlayer(prev, input, dt) };
  const res: Resources = { ...s.res };

  // 1) Товч дарвал ойрын машиныг асаах / унтраах
  const near = nearMachine(s.player);
  if (input.action && near && !busy) s = { ...s, on: { ...s.on, [near]: !s.on[near] } };
  if (near === "o2") s = fact(s, "moxie");

  // 2) Нэг эрчим хүчний төсөв: нар + батарей. Хүрэхгүй бол ажиллаж буй бүх машин ижил хувиар удааширна.
  const demand = powerDemand(s) * dt;
  const available = res.battery + solarInput(s) * dt;
  const load = demand > 0 ? Math.min(1, available / demand) : 1;
  res.battery = available - demand * load;
  for (const m of MACHINES) {
    if (!works(s, m.id)) continue; // унтраалттай, эвдэрсэн эсвэл аюулгүй горимд
    const output = load * (s.weak.includes(m.id) ? WEAK_OUTPUT : 1); // түр зассан машин хагас хүчээр
    for (const [k, v] of Object.entries(MAKES[m.id])) res[k as keyof Resources] += v * output * dt;
  }
  s = { ...s, load };

  // 3) Баг хэрэглэнэ. Хүлэмж цоорсон бол агаар гоожно.
  res.oxygen -= (CREW_USE.oxygen + (s.problem === "leak" ? LEAK_RATE : 0)) * dt;
  res.water -= CREW_USE.water * dt;
  res.food -= CREW_USE.food * dt;

  // 4) Мөс түүх
  const picked = s.ice.filter((i) => dist(i, s.player) < 1.6);
  if (picked.length) {
    res.water += ICE_WATER * picked.length;
    s = { ...s, ice: s.ice.filter((i) => !picked.includes(i)), collected: s.collected + picked.length };
    s = fact(s, "ice");
    for (let i = 0; i < picked.length; i++) s = addIce(s);
  }

  // 5) Шороо хуримтлагдана (шуургатай үед хурдан). Арчих нь гараар хийдэг ажил: tasks.ts
  s = { ...s, dust: Math.min(1, s.dust + (s.storm > 0 ? 0.05 : 0.004) * dt) };
  s = { ...s, res: { oxygen: clamp(res.oxygen), water: clamp(res.water), food: clamp(res.food), battery: clamp(res.battery) } };

  // 6) Гараар хийдэг ажил, шинжлэх ухааны экспедиц
  s = explore(workTask(s, input), dt);

  // 7) Сансрын нисэгчийн бие: скафандр, дасгал
  s = updateFitness(updateSuit(s, dt), dt);

  // 8) Аюул, асуудал
  s = weather(s, dt);
  s = progressProblem(startProblem(s));
  return train(prev, checkEnd(s, dt));
}
