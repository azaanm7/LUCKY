import { CREW_USE, FACTS, HEARTS, ICE_COUNT, ICE_WATER, MACHINES, MAKES, START } from "./config";
import { checkEnd, events, fact } from "./events";
import type { GameState, Input, Resources } from "./types";
import { dist, movePlayer, nearMachine, onSolarField, powerDemand, solarInput, spawnIce } from "./world";

export function createGame(seed = Math.floor(Math.random() * 1e9)): GameState {
  let s: GameState = {
    status: "playing", time: 0, hearts: HEARTS,
    res: { ...START },
    on: { o2: true, recycler: true, greenhouse: true }, load: 1,
    dust: 0.1, player: { x: 0, z: 6, angle: Math.PI, moving: false },
    ice: [], nextIceId: 0, storm: 0, stormSol: 0, flareWarn: 0, flare: 0, flareHit: false,
    nextEventAt: 35, emptyTimer: 0, collected: 0, losses: [], seen: ["start"],
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
  if (prev.status !== "playing") return prev;
  let s: GameState = { ...prev, time: prev.time + dt, player: movePlayer(prev, input, dt) };
  const res: Resources = { ...s.res };

  // 1) Товч дарвал ойрын машиныг асаах / унтраах
  const near = nearMachine(s.player);
  if (input.action && near) s = { ...s, on: { ...s.on, [near]: !s.on[near] } };
  if (near === "o2") s = fact(s, "moxie");

  // 2) Нэг эрчим хүчний төсөв: нар + батарей. Хүрэхгүй бол асаалттай бүх машин ижил хувиар удааширна.
  const demand = powerDemand(s) * dt;
  const available = res.battery + solarInput(s) * dt;
  const load = demand > 0 ? Math.min(1, available / demand) : 1;
  res.battery = available - demand * load;
  for (const m of MACHINES) {
    if (!s.on[m.id]) continue;
    for (const [k, v] of Object.entries(MAKES[m.id])) res[k as keyof Resources] += v * load * dt;
  }
  s = { ...s, load };

  // 3) Баг хэрэглэнэ
  res.oxygen -= CREW_USE.oxygen * dt;
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
  if (onSolarField(s.player)) {
    if (s.dust > 0.3) s = fact(s, "dust");
    dust -= 0.45 * dt;
  }
  s = { ...s, dust: Math.max(0, Math.min(1, dust)) };

  s = { ...s, res: { oxygen: clamp(res.oxygen), water: clamp(res.water), food: clamp(res.food), battery: clamp(res.battery) } };
  s = events(s, dt);
  return checkEnd(s, dt);
}
