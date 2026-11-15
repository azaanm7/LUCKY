import { CLOGGED_OUTPUT, CREW_USE, CROP_SECONDS, CROP_WATER, FILTER_SECONDS, LEAK_RATE, MELT_SECONDS, MELT_WATER, O2_RATE, RECIPES, RECYCLE_WATER, WEAK_OUTPUT } from "./config";
import { fact, toast } from "./events";
import type { GameState, MachineId, Msg } from "./types";
import { powerDemand, solarInput, works } from "./world";

const clamp = (v: number) => Math.max(0, Math.min(100, v));

// Нэг эрчим хүчний төсөв (нар + батарей) ба гурван машин. Машин бүр эрчим хүчээс гадна материал шаардана:
//   агаар үйлдвэр ← тоосны шүүлтүүр (сэлбэг) · ус цэвэршүүлэгч ← мөс · хүлэмж ← үр + ус
// Эрчим хүч хүрэхгүй бол ажиллаж буй бүх машин, 3D принтер ижил хувиар удааширна (load).
export function produce(s: GameState, dt: number): GameState {
  const res = { ...s.res };
  const demand = powerDemand(s) * dt;
  const available = res.battery + solarInput(s) * dt;
  const load = demand > 0 ? Math.min(1, available / demand) : 1;
  res.battery = available - demand * load;
  const power = (id: MachineId) => (works(s, id) ? load * (s.weak.includes(id) ? WEAK_OUTPUT : 1) : 0); // түр зассан машин хагас хүчээр

  let { filter, parts, melt, crop, job, store, built } = s;
  let msg: Msg | null = null;

  // Агаар үйлдвэр: ажиллах тусам шүүлтүүр тоосонд бөглөрнө. Бэлэн сэлбэг байвал өөрөө солигдоно, үгүй бол хагас хүчээр.
  const o2 = power("o2");
  if (o2 > 0) {
    filter = Math.max(0, filter - (o2 * dt) / FILTER_SECONDS);
    if (filter <= 0 && parts > 0) { parts--; filter = 1; msg = { kind: "newFilter" }; }
    else if (filter <= 0 && s.filter > 0) msg = { kind: "noFilter" };
    res.oxygen += O2_RATE * o2 * (filter > 0 ? 1 : CLOGGED_OUTPUT) * dt;
  }

  // Ус цэвэршүүлэгч: хэрэглэсэн усаа бага зэрэг дахин боловсруулна, агуулахын мөсийг хайлуулж их ус гаргана
  const recycler = power("recycler");
  if (recycler > 0) {
    if (melt <= 0 && store.ice > 0) { store = { ...store, ice: store.ice - 1 }; melt = 1; }
    const melting = melt > 0;
    if (melting) melt = Math.max(0, melt - (recycler * dt) / MELT_SECONDS);
    res.water += (RECYCLE_WATER + (melting ? MELT_WATER : 0)) * recycler * dt;
  }

  // Хүлэмж: үр байвал тарина. Ус, эрчим хүчтэй бол ургана. Гүйцсэн ургацыг гараар хураана (tasks.ts).
  if (crop === null && store.seed > 0) { store = { ...store, seed: store.seed - 1 }; crop = 0; msg ??= { kind: "planted" }; }
  const farm = power("greenhouse");
  if (crop !== null && crop < 1 && farm > 0 && res.water > 0) {
    crop = Math.min(1, crop + (farm * dt) / CROP_SECONDS);
    res.water -= CROP_WATER * farm * dt;
    if (crop >= 1) msg = { kind: "cropReady" };
  }

  // 3D принтер: хэвлэж дуусвал сэлбэг нэмэгдэнэ эсвэл сайжруулалт суурилна
  if (job) {
    const recipe = RECIPES.find((r) => r.id === job!.recipe)!;
    const done = job.done + (load * dt) / recipe.seconds;
    if (done < 1) job = { ...job, done };
    else {
      if (recipe.id === "part") parts++;
      else built = [...built, recipe.id];
      msg = { kind: "crafted", recipe: recipe.id };
      job = null;
    }
  }

  // Баг хэрэглэнэ. Хүлэмж цоорсон бол агаар гоожно.
  res.oxygen -= (CREW_USE.oxygen + (s.problem === "leak" ? LEAK_RATE : 0)) * dt;
  res.water -= CREW_USE.water * dt;
  res.food -= CREW_USE.food * dt;

  const next: GameState = { ...s, load, filter, parts, melt, crop, job, store, built, res: { oxygen: clamp(res.oxygen), water: clamp(res.water), food: clamp(res.food), battery: clamp(res.battery) } };
  if (!msg) return next;
  const shown = toast(next, msg);
  return msg.kind === "cropReady" ? fact(shown, "veggie") : msg.kind === "newFilter" ? fact(shown, "dustFilter") : shown;
}
