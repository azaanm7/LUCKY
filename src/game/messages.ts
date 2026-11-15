import type { MachineId, Need, RecipeId, SiteId } from "./types";

// Тоглогчид харагдах бүх бичвэр src/i18n/-д байна. Engine зөвхөн кодыг нь буцаана.
export type FactId = "trip" | "red" | "landing" | "start" | "ice" | "night" | "moxie" | "suit" | "soil" | "delta" | "crater" | "rad" | "print" | "veggie" | "dustFilter";

// Дэлгэцийн доод хэсэгт түр гарах мэдэгдэл
export type Msg =
  | { kind: "fact"; id: FactId }
  | { kind: "luckyFlare" | "radiation" | "doseLimit" | "shieldOn" | "suitOut" | "trained" | "packFull" | "newFilter" | "noFilter" | "planted" | "cropReady" }
  | { kind: "stored"; n: number }
  | { kind: "crafted"; recipe: RecipeId }
  | { kind: "harvested"; food: number }
  | { kind: "flareHit" | "fixed"; machine: MachineId }
  | { kind: "needOut"; need: Need }
  | { kind: "banked" | "stormStudy"; points: number }
  | { kind: "sampled"; site: SiteId };

// Төгсгөлийн тайлангийн нэг алхам (шалтгаан → ... → үр дагавар)
export type Step =
  | { id: "outsideFlare" | "radiationHit" | "drillO2" | "oneMore" | "suitEmpty" | "tooLong" | "noPart" | "halfPower" | "leak" | "slowPatch" | "noPower" | "night" | "storm" | "allOn" | "fewIce" | "flareNoShield" | "outsideDose" | "doseLimit" | "noIce" | "noSeed" | "noFilter" }
  | { id: "out"; need: Need }
  | { id: "broken" | "weakFix" | "off" | "slowed" | "late"; machine: MachineId }
  | { id: "dusty"; pct: number }
  | { id: "stormSol"; sol: number };

// Тайлангийн "дараагийн удаа юу хийх вэ" зөвлөгөө
export type TipId = "shelter" | "returnEarly" | "refill" | "fetchPart" | "fullFix" | "turnBackOn" | "patch" | "dusk" | "stormOff" | "wipe" | "spare" | "ice" | "early" | "shield" | "shortTrips" | "seed" | "craftPart";
