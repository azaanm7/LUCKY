import { DEPOT, PACK_MAX, RECIPES } from "./config";
import { fact, toast } from "./events";
import type { GameState, Input, Material, Recipe, RecipeId } from "./types";
import { dist, inShelter, inZone, spawnDeposit } from "./world";

const MATERIALS: Material[] = ["ice", "ore", "seed"];

// Үүргэвчинд хэдэн зүйлийн зай үлдсэн бэ (материал ба шинжлэх ухааны дээж нэг үүргэвчинд явна)
export const packRoom = (s: GameState) => PACK_MAX - s.pack.length - s.samples.length;

// Суурь дээр байна уу: хоргодох байр эсвэл урлан. Энд үүргэвчээ буулгана.
export const atBase = (s: GameState) => inShelter(s.player) || inZone(s.player, DEPOT);

// Энэ зүйлийг одоо хэвлэж болох уу: материал хүрэлцэнэ, принтер сул, дээд тоондоо хүрээгүй
export function canCraft(s: GameState, recipe: Recipe): boolean {
  if (s.job) return false;
  if (recipe.max > 0 && s.built.filter((id) => id === recipe.id).length >= recipe.max) return false;
  return MATERIALS.every((m) => s.store[m] >= (recipe.cost[m] ?? 0));
}

// Цуглуулах → суурьт хүргэх → урлан дээр хэвлэх
export function gather(s: GameState, input: Input): GameState {
  // 1) Дээгүүр нь алхвал цуглуулна (үүргэвч дүүрсэн бол үгүй)
  const near = s.deposits.filter((d) => dist(d, s.player) < 1.6);
  if (near.length) {
    const taken = near.slice(0, Math.max(0, packRoom(s)));
    if (!taken.length) {
      if (!s.toast || s.toast.msg.kind !== "packFull" || s.time > s.toast.until) s = toast(s, { kind: "packFull" }, 3);
    } else {
      s = { ...s, deposits: s.deposits.filter((d) => !taken.includes(d)), pack: [...s.pack, ...taken.map((d) => d.kind)], collected: s.collected + taken.length };
      if (taken.some((d) => d.kind === "ice")) s = fact(s, "ice");
      for (const d of taken) s = addDeposit(s, d.kind); // өөр газар шинээр гарч ирнэ
    }
  }

  // 2) Суурьт ирвэл үүргэвчээ агуулахад буулгана
  if (s.pack.length && atBase(s)) {
    const store = { ...s.store };
    for (const m of s.pack) store[m]++;
    s = toast({ ...s, store, pack: [] }, { kind: "stored", n: s.pack.length }, 3);
  }

  // 3) Урлан дээр 3D принтерээр хэвлэж эхлэх
  if (input.craft && inZone(s.player, DEPOT)) s = startCraft(s, input.craft);
  return s;
}

function startCraft(s: GameState, id: RecipeId): GameState {
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe || !canCraft(s, recipe)) return s;
  const store = { ...s.store };
  for (const m of MATERIALS) store[m] -= recipe.cost[m] ?? 0;
  return fact({ ...s, store, job: { recipe: id, done: 0 } }, "print");
}

export function addDeposit(s: GameState, kind: Material): GameState {
  const { deposit, seed } = spawnDeposit(s, kind);
  return { ...s, deposits: [...s.deposits, deposit], nextDepositId: s.nextDepositId + 1, seed };
}
