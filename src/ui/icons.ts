import type { ItemId, Material, PlanId, ProblemId, RecipeId, TrainingId } from "../game/types";
import type { SpriteName } from "../pixel/pix";

// Тоглоомын зүйл бүрийн пиксел дүрс (src/pixel/sprites-*.ts). Бүх дэлгэц эндээс авна.
export const ITEM_ICON: Record<ItemId, SpriteName> = { filter: "filter", patch: "patch", pump: "gear" };
export const MATERIAL_ICON: Record<Material, SpriteName> = { ice: "ice", ore: "ore", seed: "seed" };
export const RECIPE_ICON: Record<RecipeId, SpriteName> = { part: "part", panel: "panel", tank: "oxygen" };
export const LESSON_ICON: Record<TrainingId, SpriteName> = { collect: "ice", store: "shelter", craft: "printer", switch: "power", wipe: "wipe", sample: "flask" };
export const PROBLEM_ICON: Record<ProblemId, SpriteName> = { filter: "filter", storm: "storm", flare: "rad", leak: "patch", pump: "gear" };
// Төлөвлөгөө бүрийн дүрс: a = болгоомжтой, b = хурдан
export const PLAN_ICON: Record<ProblemId, Record<PlanId, SpriteName>> = {
  filter: { a: "part", b: "patch" },
  storm: { a: "battery", b: "flask" },
  flare: { a: "power", b: "gear" },
  leak: { a: "part", b: "patch" },
  pump: { a: "part", b: "wipe" },
};
// Эхлэх дэлгэцийн дөрвөн зураг: цуглуул → авчир, хэвл → үйлдвэрлэ → шийд
export const START_ICONS: SpriteName[] = ["ore", "printer", "oxygen", "warn"];
