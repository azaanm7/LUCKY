import { CREW_USE, FACTS, HEARTS, ICE_COUNT, ICE_WATER, LEAK_RATE, MACHINES, MAKES, SOLAR_FIELD, START } from "./config";
import { updateFitness, updateSuit } from "./crew";
import { checkEnd, fact, weather } from "./events";
import { progressProblem, startProblem } from "./missions";
import type { GameState, Input, Resources } from "./types";
import { dist, inZone, movePlayer, nearMachine, powerDemand, solarInput, spawnIce, works } from "./world";

export function createGame(seed = Math.floor(Math.random() * 1e9)): GameState {
  let s: GameState = {
    status: "playing", time: 0, hearts: HEARTS,
    res: { ...START },
    on: { o2: true, recycler: true, greenhouse: true }, load: 1, broken: null,
    dust: 0.1, player: { x: 0, z: 6, angle: Math.PI, moving: false },
    suitO2: 100, fitness: 100, exercisedSol: 0, gymTimer: 0,
    carrying: null, problem: null, solved: [], modal: null,
    ice: [], nextIceId: 0, storm: 0, stormSol: 0, flareWarn: 0, flare: 0, flareHit: false,
    emptyTimer: 0, collected: 0, losses: [], seen: ["start"],
    toast: { text: FACTS.start, until: 8 }, seed,
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
  let s: GameState = { ...prev, time: prev.time + dt, player: movePlayer(prev, input, dt) };
  const res: Resources = { ...s.res };

  // 1) Товч дарвал ойрын машиныг асаах / унтраах
  const near = nearMachine(s.player);
  if (input.action && near) s = { ...s, on: { ...s.on, [near]: !s.on[near] } };
  if (near === "o2") s = fact(s, "moxie");

  // 2) Нэг эрчим хүчний төсөв: нар + батарей. Хүрэхгүй бол ажиллаж буй бүх машин ижил хувиар удааширна.
  const demand = powerDemand(s) * dt;
  const available = res.battery + solarInput(s) * dt;
  const load = demand > 0 ? Math.min(1, available / demand) : 1;
  res.battery = available - demand * load;
  for (const m of MACHINES) {
    if (!works(s, m.id)) continue; // унтраалттай эсвэл эвдэрсэн
    for (const [k, v] of Object.entries(MAKES[m.id])) res[k as keyof Resources] += v * load * dt;
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

  // 5) Шороо: шуургатай үед хурдан хуримтлагдана, панель дээр зогсвол арчина
  let dust = s.dust + (s.storm > 0 ? 0.05 : 0.004) * dt;
  if (inZone(s.player, SOLAR_FIELD)) dust -= 0.45 * dt;
  s = { ...s, dust: Math.max(0, Math.min(1, dust)) };
  s = { ...s, res: { oxygen: clamp(res.oxygen), water: clamp(res.water), food: clamp(res.food), battery: clamp(res.battery) } };

  // 6) Сансрын нисэгчийн бие: скафандр, дасгал
  s = updateFitness(updateSuit(s, dt), dt);

  // 7) Аюул, асуудал
  s = weather(s, dt);
  s = progressProblem(startProblem(s));
  return checkEnd(s, dt);
}
