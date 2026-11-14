import type { ItemId, Machine, MachineId, ProblemId, Site, TaskKind, TrainingId, Vec2 } from "./types";

export const SOL_SECONDS = 45; // 1 sol (Ангарагийн өдөр) = 45 секунд
export const DAY_PART = 0.7; // 70% нь өдөр, 30% нь шөнө
export const DUSK_WARN = 0.12; // шөнө болохоос өмнөх sol-ын энэ хэсэгт "батарейгаа хэмнэ" гэж сануулна
export const WIN_SOL = 6;
export const HEARTS = 3;
export const WORLD_RADIUS = 46;
export const PLAYER_SPEED = 8;

export const START = { oxygen: 70, water: 60, food: 60, battery: 60 };
export const SOLAR_POWER = 14; // нар бүтэн тусахад секундэд
export const MACHINE_POWER = 4; // машин бүр секундэд зарцуулна
export const STORM_SUN = 0.35; // шуурганы үед нарны гэрлийн үлдэх хэсэг
export const DUST_BLOCK = 0.8; // бүрэн шороотой панель эрчим хүчнийхээ 80%-ийг алдана
export const CREW_USE = { oxygen: 1.2, water: 0.7, food: 0.6 }; // секундэд
export const LEAK_RATE = 0.9; // агаар гоожих үед нэмэлт алдагдал
export const EMPTY_SECONDS = 4; // нөөц дууссанаас хойш хэдэн секундэд 1 зүрх алдах
export const WEAK_OUTPUT = 0.5; // түр зассан машин хэдэн хувийн хүчээр ажиллах

export const SUIT_USE = 1.5; // гадаа байхад скафандрын O2 секундэд буурна (~65 сек)
export const SUIT_REFILL = 30; // байранд орвол хурдан цэнэглэнэ

export const ICE_COUNT = 5; // газар дээр зэрэг байх мөсний тоо
export const ICE_WATER = 3.5; // 1 мөс хэдэн ус болох

// Асуудал: шуурга, дэлбэрэлт, Дэлхийтэй холбоо
export const STORM_SECONDS = 18;
export const FLARE_WARN = 10; // дэлбэрэлт эхлэхээс өмнө сануулах секунд
export const FLARE_SECONDS = 6;
export const FLARE_DAMAGE = { base: 0.2, perX: 0.08, max: 0.9 }; // машин гэмтэх магадлал = base + X-зэрэглэл × perX
export const EARTH_SECONDS_PER_MINUTE = 0.75; // Дэлхийн хариу хүлээх: бодит 1 минут = тоглоомын 0.75 секунд
export const STUDY_SCIENCE = 4; // шуургыг судалбал авах оноо
export const STUDY_POWER = 35; // шуургыг судлахад багажууд зарах батарей
// Дэлхий зөвлөгөө өгөхдөө харах босгууд: хүчтэй дэлбэрэлт, судлахад хүрэлцэх батарей, "бага" нөөц
export const ADVISE = { strongFlare: 0.5, studyBattery: 60, lowNeed: 45 };

// Гараар хийдэг ажил бүр хэдэн алхамтай
export const TASK_STEPS: Record<TaskKind, number> = { wipe: 6, filter: 3, patch: 3, pump: 6 };
export const WIPE_DUST = 0.2; // арчих нэг алхам хэдэн шороо арилгах

// Шинжлэх ухааны экспедиц
export const DRILL_SECONDS = 4; // нэг дээж өрөмдөх хугацаа
export const DRILL_O2 = 5; // өрөмдөх үед скафандрын O2 секундэд нэмж буурна (хүнд ажил)
export const SAMPLES_MAX = 3; // нэг удаад авч явах дээжийн тоо
export const SITE_SAMPLES = 4; // талбай бүрт байх дээжийн тоо
export const STARS = [8, 18]; // 2 ба 3 одонд хүрэх оноо (1 од = амьд үлдсэн)

export const MAKES = {
  o2: { oxygen: 2.0 },
  recycler: { water: 1.5 },
  greenhouse: { food: 1.6, water: -0.5 },
} as const;

type Zone = Vec2 & { r: number };
export const SHELTER: Zone = { x: 0, z: 0, r: 4.2 };
export const SOLAR_FIELD: Zone = { x: -13, z: -11, r: 4.5 };
export const DEPOT: Zone = { x: 5, z: -5, r: 1.8 }; // сэлбэгийн агуулах

export const MACHINES: Machine[] = [
  { id: "o2", name: "Агаар үйлдвэр", icon: "🫧", pos: { x: -9, z: 2 }, makes: "oxygen", item: "filter" },
  { id: "recycler", name: "Ус цэвэршүүлэгч", icon: "🚰", pos: { x: 9, z: 2 }, makes: "water", item: "pump" },
  { id: "greenhouse", name: "Хүлэмж", icon: "🌱", pos: { x: 0, z: -8 }, makes: "food", item: "patch" },
];

export const SITES: Site[] = [
  { id: "soil", name: "Хөрсний дээж", icon: "🧪", x: 13, z: 14, r: 2.6, worth: 1 },
  { id: "delta", name: "Голын бэлчир", icon: "🏞️", x: -25, z: 17, r: 2.8, worth: 2 },
  { id: "crater", name: "Том тогоо", icon: "🌋", x: 30, z: -30, r: 3.2, worth: 3 },
];

// Эхний өдрийн сургалт: үндсэн үйлдэл бүрийг нэг удаа хийж үзнэ (training.ts)
export const TRAINING: { id: TrainingId; text: string }[] = [
  { id: "ice", text: "🧊 Цэнхэр мөс түү" },
  { id: "switch", text: "🔌 Машины дугуй дээр зогсоод унтраа эсвэл асаа" },
  { id: "wipe", text: "🧹 Нарны панель дээр очоод арч" },
  { id: "refill", text: "🏠 Хоргодох байранд орж скафандраа цэнэглэ" },
  { id: "sample", text: "🔬 Шинжлэх ухааны талбайгаас дээж авчир" },
];

export const NEED_NAME = { oxygen: "Хүчилтөрөгч", water: "Ус", food: "Хүнс" };

// Асуудлууд хэзээ эхлэх (секунд): Sol 2-оос эхлэн өдөр бүр нэг. Дарааллыг нь тоглолт бүрд холино (state.deck).
export const PROBLEM_TIMES = [SOL_SECONDS * 1 + 6, SOL_SECONDS * 2 + 4, SOL_SECONDS * 3 + 6, SOL_SECONDS * 4 + 6, SOL_SECONDS * 5 + 4];
export const PROBLEM_IDS: ProblemId[] = ["filter", "storm", "flare", "leak", "pump"];

// Засвар шаарддаг асуудал: ямар сэлбэг аваад аль машин руу очих вэ
export const REPAIRS: Partial<Record<ProblemId, { item: ItemId; target: MachineId }>> = {
  filter: { item: "filter", target: "o2" },
  leak: { item: "patch", target: "greenhouse" },
  pump: { item: "pump", target: "recycler" },
};

export const ITEMS: Record<ItemId, { name: string; icon: string; color: string }> = {
  filter: { name: "CO₂ шүүлтүүр", icon: "🧽", color: "#f2d45c" },
  patch: { name: "Нөхөөсний иж бүрдэл", icon: "🩹", color: "#f28c5c" },
  pump: { name: "Шинэ насос", icon: "⚙️", color: "#8fd0ff" },
};

export const FACTS = {
  trip: "Дэлхийгээс Ангараг хүртэл хөлөг 7 орчим сар нисдэг. Бараг ирлээ!",
  red: "Ангараг улаан харагддаг нь хөрсөнд нь төмрийн исэл буюу зэв их байдгаас болдог.",
  landing: "Агаар мандалд орлоо! Хөлөг маш их халдаг тул дулааны бамбай хамгаална. Газардах хүртэл ердөө 7 орчим минут.",
  start: "Ангараг дээрх 1 өдрийг sol гэдэг. Энэ нь Дэлхийн өдрөөс 40 орчим минутаар урт.",
  ice: "Ангарагийн хөрсөн доор болон туйлд нь мөс бий. Хайлуулбал ус болно!",
  night: "Шөнө нар байхгүй тул нарны панель ажиллахгүй. Батарейн цахилгаанаа хэмнээрэй!",
  moxie: "Perseverance ровер дээрх MOXIE төхөөрөмж 2021 онд Ангарагийн агаараас хүчилтөрөгч гаргаж авсан: хамгийн ихдээ цагт 12 грамм.",
  suit: "Скафандр доторх хүчилтөрөгч хязгаартай. Сансрын нисэгчид гадаа ажиллах цагаа нарийн төлөвлөдөг.",
  soil: "Perseverance ровер Ангарагийн чулуу, хөрсний дээжийг жижиг хоолойд хийж цуглуулдаг. Эрдэмтэд хожим нь Дэлхийд авчирч судлахыг хүсдэг.",
  delta: "Perseverance роверын буусан Jezero тогоо олон тэрбум жилийн өмнө нуур байжээ. Түүн рүү цутгаж байсан голын бэлчир одоо ч харагддаг.",
  crater: "Curiosity ровер Gale тогооны эртний чулуунаас органик молекул олсон. Органик молекул бол амьдралын барилгын материал юм.",
};
export type FactId = keyof typeof FACTS;
