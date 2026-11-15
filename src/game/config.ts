import type { ItemId, Machine, MachineId, Material, ProblemId, Recipe, Site, TaskKind, TrainingId, Vec2 } from "./types";

// Тоглогчид харагдах бичвэр (нэр, баримт) энд биш, src/i18n/mn.ts, en.ts-д байна.

export const SOL_SECONDS = 45; // 1 sol (Ангарагийн өдөр) = 45 секунд
export const DAY_PART = 0.7; // 70% нь өдөр, 30% нь шөнө
export const DUSK_WARN = 0.12; // шөнө болохоос өмнөх sol-ын энэ хэсэгт "батарейгаа хэмнэ" гэж сануулна
export const WIN_SOL = 6;
export const HEARTS = 3;
export const WORLD_RADIUS = 46;
export const PLAYER_SPEED = 8;

export const START = { oxygen: 70, water: 60, food: 60, battery: 60 };
export const SOLAR_POWER = 13.5; // нар бүтэн тусахад секундэд (аюулгүй горимыг бамбайгаар солиход 14-өөс буулгаж, тэнцвэрийг хэвээр барьсан)
export const MACHINE_POWER = 4; // машин бүр секундэд зарцуулна
export const STORM_SUN = 0.35; // шуурганы үед нарны гэрлийн үлдэх хэсэг
export const DUST_BLOCK = 0.8; // бүрэн шороотой панель эрчим хүчнийхээ 80%-ийг алдана
export const CREW_USE = { oxygen: 1.2, water: 0.7, food: 0.6 }; // секундэд
export const LEAK_RATE = 0.9; // агаар гоожих үед нэмэлт алдагдал
export const EMPTY_SECONDS = 4; // нөөц дууссанаас хойш хэдэн секундэд 1 зүрх алдах
export const WEAK_OUTPUT = 0.5; // түр зассан машин хэдэн хувийн хүчээр ажиллах

export const SUIT_USE = 1.5; // гадаа байхад скафандрын O2 секундэд буурна (~65 сек)
export const SUIT_REFILL = 30; // байранд орвол хурдан цэнэглэнэ

// ===== Материал цуглуулах =====
// Газар дээр зэрэг байх тоо ба сууриас хэр хол гарах (хамгийн ойр, хамгийн хол). Үр нь урьдчилж буулгасан ачааны хайрцагт байна.
export const DEPOSITS: Record<Material, { count: number; near: number; far: number }> = {
  ice: { count: 4, near: 15, far: 27 },
  ore: { count: 4, near: 16, far: 34 },
  seed: { count: 2, near: 20, far: 38 },
};
export const PACK_MAX = 6; // үүргэвчинд багтах зүйл (материал + дээж)
export const START_STORE: Record<Material, number> = { ice: 2, ore: 0, seed: 1 };
export const START_PARTS = 1;

// ===== Машин бүр материал + эрчим хүч шаардана =====
export const RECYCLE_WATER = 0.45; // ус цэвэршүүлэгч мөсгүй үед дахин боловсруулж гаргах ус (секундэд)
export const MELT_WATER = 1.4; // мөс хайлуулж байх үед нэмж гарах ус (секундэд)
export const MELT_SECONDS = 10; // нэг мөс хайлж дуусах хугацаа
export const FILTER_SECONDS = 80; // агаар үйлдвэрийн нэг шүүлтүүр ажиллах хугацаа
export const CLOGGED_OUTPUT = 0.5; // шүүлтүүр бөглөрсөн үед агаар үйлдвэрийн хүч
export const CROP_SECONDS = 30; // ургац ургаж гүйцэх хугацаа (хүлэмж бүрэн хүчээр ажиллавал)
export const CROP_WATER = 0.5; // ургаж байх үед секундэд уух ус
export const HARVEST_FOOD = 45; // нэг ургац хэдэн хүнс болох

// ===== Урлан: 3D принтерээр хийх зүйлс. Хэвлэж байх үед эрчим хүч зарна. =====
export const CRAFT_POWER = 3;
export const RECIPES: Recipe[] = [
  { id: "part", cost: { ore: 2 }, seconds: 6, max: 0 }, // сэлбэг: шүүлтүүр, засвар
  { id: "panel", cost: { ore: 4 }, seconds: 10, max: 2 }, // нэмэлт нарны панель
  { id: "tank", cost: { ore: 3, ice: 1 }, seconds: 8, max: 1 }, // скафандрын том сав
];
export const PANEL_BOOST = 0.2; // нэмэлт панель бүр нарны эрчим хүчийг 20% нэмнэ
export const TANK_SAVING = 0.7; // том савтай бол скафандрын O2 30% удаан буурна

// Асуудал: шуурга, дэлбэрэлт, Дэлхийтэй холбоо
export const STORM_SECONDS = 18;
export const FLARE_WARN = 10; // дэлбэрэлт эхлэхээс өмнө сануулах секунд
export const FLARE_SECONDS = 6;
export const FLARE_DAMAGE = { base: 0.2, perX: 0.08, max: 0.9 }; // машин гэмтэх магадлал = base + X-зэрэглэл × perX
export const EARTH_SECONDS_PER_MINUTE = 0.75; // Дэлхийн хариу хүлээх: бодит 1 минут = тоглоомын 0.75 секунд
// Багийн цацрагийн тун (0-100), radiation.ts. Цорын ганц бодит тоо: Curiosity роверын RAD багаж Ангарагийн гадаргуу дээр
// өдөрт 0.64 mSv хэмжсэн (Hassler et al., Science 343, 2014, doi:10.1126/science.1244797). Тоглоомд 1 mSv = perMsv оноо
// болгож масштабласан. Хоргодох байр, бамбай, дэлбэрэлтийн тоо нь тоглоомын дүрэм, бодит хэмжилт биш.
export const RAD_MSV_PER_SOL = 0.64;
export const DOSE = {
  perMsv: 12, // 1 mSv = 12 оноо: гадаа бүтэн sol байвал ~7.7 оноо
  shelter: 0.4, // хоргодох байранд тун 40%-ийн хурдаар нэмэгдэнэ
  shield: 0.05, // бамбай асаалттай үед дэлбэрэлтийн тун 5% л нэвтэрнэ
  flareBase: 40, flarePerX: 18, // дэлбэрэлт гадаа өгөх нийт тун = flareBase + X-зэрэглэл × flarePerX
  limit: 100, // хүрвэл 1 зүрх алдана (ганц удаа)
  factAt: 40, // энэ хэмжээнд хүрэхэд RAD-ийн баримтыг үзүүлнэ
  reportFlare: 30, // тайланд: тунгийн ихэнх нь дэлбэрэлтээс ирсэн гэж үзэх хэмжээ
};
export const SHIELD_POWER = 30; // хоргодох байрны бамбайг асаахад зарах батарей (%)
export const STUDY_SCIENCE = 4; // шуургыг судалбал авах оноо
export const STUDY_POWER = 35; // шуургыг судлахад багажууд зарах батарей
// Дэлхий зөвлөгөө өгөхдөө харах босгууд: бамбайгүй бол хүрэх тун, судлахад хүрэлцэх батарей, "бага" нөөц
export const ADVISE = { doseRisk: 80, studyBattery: 60, lowNeed: 45 };

// Гараар хийдэг ажил бүр хэдэн алхамтай
export const TASK_STEPS: Record<TaskKind, number> = { wipe: 6, filter: 3, patch: 3, pump: 6, harvest: 4 };
export const WIPE_DUST = 0.2; // арчих нэг алхам хэдэн шороо арилгах

// Шинжлэх ухааны экспедиц
export const DRILL_SECONDS = 4; // нэг дээж өрөмдөх хугацаа
export const DRILL_O2 = 5; // өрөмдөх үед скафандрын O2 секундэд нэмж буурна (хүнд ажил)
export const SAMPLES_MAX = 3; // нэг удаад авч явах дээжийн тоо
export const SITE_SAMPLES = 4; // талбай бүрт байх дээжийн тоо
export const STARS = [6, 14]; // 2 ба 3 одонд хүрэх оноо (1 од = амьд үлдсэн)

export const O2_RATE = 2.0; // агаар үйлдвэр секундэд гаргах хүчилтөрөгч (шүүлтүүр цэвэр үед)

type Zone = Vec2 & { r: number };
export const SHELTER: Zone = { x: 0, z: 0, r: 4.2 };
export const SOLAR_FIELD: Zone = { x: -13, z: -11, r: 4.5 };
export const DEPOT: Zone = { x: 5, z: -5, r: 1.8 }; // урлан ба агуулах: материал буулгана, 3D принтер ажиллуулна

export const MACHINES: Machine[] = [
  { id: "o2", icon: "🫧", pos: { x: -9, z: 2 }, makes: "oxygen", item: "filter" },
  { id: "recycler", icon: "🚰", pos: { x: 9, z: 2 }, makes: "water", item: "pump" },
  { id: "greenhouse", icon: "🌱", pos: { x: 0, z: -8 }, makes: "food", item: "patch" },
];

export const SITES: Site[] = [
  { id: "soil", icon: "🧪", x: 13, z: 14, r: 2.6, worth: 1 },
  { id: "delta", icon: "🏞️", x: -25, z: 17, r: 2.8, worth: 2 },
  { id: "crater", icon: "🌋", x: 30, z: -30, r: 3.2, worth: 3 },
];

// Эхний өдрийн сургалт: үндсэн үйлдэл бүрийг нэг удаа хийж үзнэ (training.ts). Бичвэр нь i18n-ийн `training`-д.
export const TRAINING: { id: TrainingId }[] = [{ id: "collect" }, { id: "store" }, { id: "craft" }, { id: "switch" }, { id: "wipe" }, { id: "sample" }];

// Асуудлууд хэзээ эхлэх (секунд): Sol 2-оос эхлэн өдөр бүр нэг. Дарааллыг нь тоглолт бүрд холино (state.deck).
export const PROBLEM_TIMES = [SOL_SECONDS * 1 + 6, SOL_SECONDS * 2 + 4, SOL_SECONDS * 3 + 6, SOL_SECONDS * 4 + 6, SOL_SECONDS * 5 + 4];
export const PROBLEM_IDS: ProblemId[] = ["filter", "storm", "flare", "leak", "pump"];

// Засвар шаарддаг асуудал: ямар сэлбэг аваад аль машин руу очих вэ
export const REPAIRS: Partial<Record<ProblemId, { item: ItemId; target: MachineId }>> = {
  filter: { item: "filter", target: "o2" },
  leak: { item: "patch", target: "greenhouse" },
  pump: { item: "pump", target: "recycler" },
};

export const ITEMS: Record<ItemId, { icon: string; color: string }> = {
  filter: { icon: "🧽", color: "#f2d45c" },
  patch: { icon: "🩹", color: "#f28c5c" },
  pump: { icon: "⚙️", color: "#8fd0ff" },
};
