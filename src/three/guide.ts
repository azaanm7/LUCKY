import { DEPOT, MACHINES, RECIPES, SHELTER, SITES, SOLAR_FIELD } from "../game/config";
import { canCraft, packRoom } from "../game/gather";
import { repairTarget } from "../game/missions";
import { trainingTarget } from "../game/training";
import type { GameState, Material, Need, Vec2 } from "../game/types";
import { dist, isDay } from "../game/world";

type Target = { to: Vec2; color: string } | null;
const NEEDS: Need[] = ["oxygen", "water", "food"];

// Сум: одоо хамгийн яаралтай очих газрыг заана (ui/mission.tsx-ийн дараалалтай ижил)
export function guideTarget(s: GameState): Target {
  const nearest = (list: Vec2[]) => [...list].sort((a, b) => dist(a, s.player) - dist(b, s.player))[0] ?? null;
  const deposit = (kind: Material, color: string): Target => {
    const to = nearest(s.deposits.filter((d) => d.kind === kind));
    return to && { to, color };
  };
  const home = nearest([SHELTER, DEPOT]);
  // Сэлбэг хэвлэх зам: хүдэр байвал урлан руу, үгүй бол хамгийн ойрын хүдэр рүү
  const part = RECIPES.find((r) => r.id === "part")!;
  const makePart = (): Target => canCraft(s, part) || s.pack.includes("ore") ? { to: DEPOT, color: "#ffd84a" } : deposit("ore", "#ff9a5a");

  if (s.flareWarn > 0 || s.flare > 0) return { to: SHELTER, color: "#ff5a4a" };
  if (s.suitO2 < 30) return { to: SHELTER, color: "#7fe0ff" };
  const fix = repairTarget(s);
  if (fix && s.problem) return s.carrying ? { to: fix.pos, color: "#ffd84a" } : s.parts > 0 ? { to: DEPOT, color: "#ffd84a" } : makePart();
  if (s.dust > 0.5 && s.storm <= 0) return { to: SOLAR_FIELD, color: "#ffd84a" };
  if (s.crop !== null && s.crop >= 1) return { to: MACHINES.find((m) => m.id === "greenhouse")!.pos, color: "#a7f070" };
  if (packRoom(s) <= 0) return { to: s.samples.length ? SHELTER : home, color: "#7fe0ff" };

  const low = NEEDS.filter((k) => s.res[k] < 35).sort((a, b) => s.res[a] - s.res[b])[0];
  if (low === "water" && s.store.ice < 1 && s.melt <= 0) return s.pack.includes("ice") ? { to: home, color: "#7fe0ff" } : deposit("ice", "#6fd0ff");
  if (low === "food" && s.crop === null) return s.pack.includes("seed") ? { to: home, color: "#a7f070" } : deposit("seed", "#a7f070");
  if (low === "oxygen" && s.filter <= 0) return makePart();

  if (s.samples.length) return { to: SHELTER, color: "#7fe0ff" }; // дээжээ лабораторид хүргэ
  if (fix) return s.carrying ? { to: fix.pos, color: "#ffd84a" } : s.parts > 0 ? { to: DEPOT, color: "#ffd84a" } : makePart();
  if (s.filter <= 0.15 && s.parts < 1 && !s.job) return makePart();
  const lesson = s.problem ? null : trainingTarget(s); // сургалтын дараагийн алхмыг хийх газар
  if (lesson) return { to: lesson, color: "#5fe08a" };
  if (s.problem || s.drill) return null;
  // Тайван өдөр: дээж үлдсэн хамгийн ойрын шинжлэх ухааны талбай
  const open = nearest(SITES.filter((x) => s.siteLeft[x.id] > 0));
  return open && isDay(s.time) && s.pack.length === 0 ? { to: open, color: "#c9a0ff" } : null;
}
