import type { ItemId, Machine, MachineId, ProblemId, Vec2 } from "./types";

export const SOL_SECONDS = 45; // 1 sol (Ангарагийн өдөр) = 45 секунд
export const DAY_PART = 0.7; // 70% нь өдөр, 30% нь шөнө
export const WIN_SOL = 6;
export const HEARTS = 3;
export const WORLD_RADIUS = 30;
export const PLAYER_SPEED = 8;

export const SOLAR_POWER = 12; // нар бүтэн тусахад секундэд
export const MACHINE_POWER = 4; // машин бүр секундэд зарцуулна
export const CREW_USE = { oxygen: 1.2, water: 0.7, food: 0.6 }; // секундэд
export const LEAK_RATE = 0.9; // агаар гоожих үед нэмэлт алдагдал

export const SUIT_USE = 1.5; // гадаа байхад скафандрын O2 секундэд буурна (~65 сек)
export const SUIT_REFILL = 30; // байранд орвол хурдан цэнэглэнэ
export const GYM_SECONDS = 3; // өдөрт нэг удаа дасгал хийх хугацаа
export const FITNESS_LOSS = 30; // дасгал алгасвал булчин сулрах хэмжээ

export const MAKES = {
  o2: { oxygen: 2.0 },
  recycler: { water: 1.5 },
  greenhouse: { food: 1.6, water: -0.5 },
} as const;

type Zone = Vec2 & { r: number };
export const SHELTER: Zone = { x: 0, z: 0, r: 4.2 };
export const SOLAR_FIELD: Zone = { x: -13, z: -11, r: 4.5 };
export const DEPOT: Zone = { x: 5, z: -5, r: 1.8 }; // сэлбэгийн агуулах
export const GYM: Zone = { x: -5, z: -5, r: 1.8 }; // гүйлтийн зам

export const MACHINES: Machine[] = [
  { id: "o2", name: "Агаар үйлдвэр", icon: "🫧", pos: { x: -9, z: 2 } },
  { id: "recycler", name: "Ус цэвэршүүлэгч", icon: "🚰", pos: { x: 9, z: 2 } },
  { id: "greenhouse", name: "Хүлэмж", icon: "🌱", pos: { x: 0, z: -8 } },
];

// Асуудал бүр хэзээ эхлэх (секунд). Sol 2-оос эхлэн өдөр бүр нэг.
export const SCHEDULE: { id: ProblemId; at: number }[] = [
  { id: "filter", at: SOL_SECONDS * 1 + 6 },
  { id: "storm", at: SOL_SECONDS * 2 + 4 },
  { id: "flare", at: SOL_SECONDS * 3 + 6 },
  { id: "leak", at: SOL_SECONDS * 4 + 6 },
  { id: "pump", at: SOL_SECONDS * 5 + 4 },
];

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
  start: "Ангараг дээрх 1 өдрийг sol гэдэг. Энэ нь Дэлхийн өдрөөс 40 орчим минутаар урт.",
  ice: "Ангарагийн хөрсөн доор болон туйлд нь мөс бий. Хайлуулбал ус болно!",
  night: "Шөнө нар байхгүй тул нарны панель ажиллахгүй. Батарейн цахилгаанаа хэмнээрэй!",
  suit: "Скафандр доторх хүчилтөрөгч хязгаартай. Сансрын нисэгчид гадаа ажиллах цагаа нарийн төлөвлөдөг.",
  gym: "Ангарагийн таталцал Дэлхийнхийн дөнгөж 38% орчим. Сул таталцалд булчин, яс сулардаг тул ОУСС дээрх сансрын нисэгчид булчин, ясаа хамгаалахын тулд өдөрт 2 орчим цаг дасгал хийдэг.",
};
