import { CREW_USE, FACTS, HEARTS, MACHINE_POWER, MAKES, SOLAR_POWER, SOL_SECONDS, WIN_SOL } from "./config";
import type { GameState, Input, MachineId, Resources } from "./types";
import { dist, inShelter, isDay, movePlayer, nearMachine, onSolarField, random, spawnIce, sunlight } from "./world";

export function createGame(seed = Math.floor(Math.random() * 1e9)): GameState {
  let s: GameState = {
    status: "playing", time: 0, hearts: HEARTS,
    res: { oxygen: 70, water: 60, food: 60, battery: 60 },
    on: { o2: true, recycler: true, greenhouse: true },
    dust: 0.1, player: { x: 0, z: 6, angle: Math.PI, moving: false },
    ice: [], nextIceId: 0, storm: 0, flareWarn: 0, flare: 0, flareHit: false,
    nextEventAt: 35, emptyTimer: 0, collected: 0,
    toast: { text: FACTS.start, until: 8 }, seed,
  };
  for (let i = 0; i < 6; i++) s = addIce(s);
  return s;
}

function addIce(s: GameState): GameState {
  const { ice, seed } = spawnIce(s);
  return { ...s, ice: [...s.ice, ice], nextIceId: s.nextIceId + 1, seed };
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const toast = (s: GameState, text: string, sec = 6) => ({ ...s, toast: { text, until: s.time + sec } });

// ===== Гол функц: 1 frame (dt секунд) урагшлуулна =====
export function tick(prev: GameState, input: Input, dt: number): GameState {
  if (prev.status !== "playing") return prev;
  let s: GameState = { ...prev, time: prev.time + dt, player: movePlayer(prev, input, dt) };
  const res: Resources = { ...s.res };

  // 1) Товч дарвал ойрын машиныг асаах / унтраах
  const near = nearMachine(s.player);
  if (input.action && near) s = { ...s, on: { ...s.on, [near]: !s.on[near] } };

  // 2) Эрчим хүч: нар × (1 − шороо), шуургатай бол 35%
  const sun = sunlight(s.time) * (s.storm > 0 ? 0.35 : 1) * (1 - s.dust * 0.8);
  res.battery += SOLAR_POWER * sun * dt;

  // 3) Асаалттай машинууд: батарей хүрвэл ажиллана
  for (const id of Object.keys(MAKES) as MachineId[]) {
    if (!s.on[id] || res.battery <= 0) continue;
    res.battery -= MACHINE_POWER * dt;
    for (const [k, v] of Object.entries(MAKES[id])) res[k as keyof Resources] += v * dt;
  }

  // 4) Баг хэрэглэнэ
  res.oxygen -= CREW_USE.oxygen * dt;
  res.water -= CREW_USE.water * dt;
  res.food -= CREW_USE.food * dt;

  // 5) Мөс түүх
  const picked = s.ice.filter((i) => dist(i, s.player) < 1.6);
  if (picked.length) {
    res.water += 12 * picked.length;
    s = { ...s, ice: s.ice.filter((i) => !picked.includes(i)), collected: s.collected + picked.length };
    if (s.collected === 1) s = toast(s, FACTS.ice);
    s = addIce(s);
  }

  // 6) Шороо: шуургатай үед хурдан хуримтлагдана, панель дээр зогсвол арчина
  let dust = s.dust + (s.storm > 0 ? 0.05 : 0.004) * dt;
  if (onSolarField(s.player)) dust -= 0.45 * dt;
  s = { ...s, dust: Math.max(0, Math.min(1, dust)) };

  s = { ...s, res: { oxygen: clamp(res.oxygen), water: clamp(res.water), food: clamp(res.food), battery: clamp(res.battery) } };
  s = events(s, dt);
  return checkEnd(s, dt);
}

// Шуурга, нарны дэлбэрэлт
function events(s: GameState, dt: number): GameState {
  let { storm, flareWarn, flare, flareHit } = s;
  storm = Math.max(0, storm - dt);
  if (flareWarn > 0) { flareWarn -= dt; if (flareWarn <= 0) { flare = 6; flareHit = false; } }
  if (flare > 0) {
    flare -= dt;
    if (!inShelter(s.player) && !flareHit) { flareHit = true; s = { ...s, hearts: s.hearts - 1 }; s = toast(s, "Цацрагт өртлөө! −1 ❤️ Дараагийн удаа хоргодох байр руу эрт гүй!"); }
  }
  s = { ...s, storm, flareWarn, flare, flareHit };
  if (s.time < s.nextEventAt) return s;
  const [r, seed] = random(s.seed);
  s = { ...s, seed, nextEventAt: s.time + 30 + r * 20 };
  if (r < 0.5) return toast({ ...s, storm: 18 }, FACTS.storm + " Дараа нь нарны панелийн шороог арчаарай!", 8);
  return toast({ ...s, flareWarn: 10 }, FACTS.flare, 8);
}

function checkEnd(s: GameState, dt: number): GameState {
  const empty = s.res.oxygen <= 0 || s.res.water <= 0 || s.res.food <= 0;
  let emptyTimer = empty ? s.emptyTimer + dt : 0;
  if (emptyTimer > 4) { emptyTimer = 0; s = toast({ ...s, hearts: s.hearts - 1 }, "Нөөц дууссан тул баг өвдлөө. −1 ❤️"); }
  s = { ...s, emptyTimer };
  if (s.hearts <= 0) return { ...s, status: "lost" };
  if (s.time >= WIN_SOL * SOL_SECONDS) return { ...s, status: "won" };
  const night = !isDay(s.time) && isDay(s.time - dt);
  return night ? toast(s, FACTS.night) : s;
}
