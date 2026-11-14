import type { Machine, Vec2 } from "./types";

export const SOL_SECONDS = 45; // 1 sol (Ангарагийн өдөр) = 45 секунд
export const DAY_PART = 0.7; // 70% нь өдөр, 30% нь шөнө
export const DUSK_WARN = 0.12; // шөнө болохоос өмнөх sol-ын энэ хэсэгт "батарейгаа хэмнэ" гэж сануулна
export const WIN_SOL = 6;
export const HEARTS = 3;
export const WORLD_RADIUS = 30;
export const PLAYER_SPEED = 8;

export const START = { oxygen: 70, water: 60, food: 60, battery: 60 };
export const SOLAR_POWER = 15; // нар бүтэн тусахад секундэд
export const MACHINE_POWER = 4; // машин бүр секундэд зарцуулна
export const STORM_SUN = 0.35; // шуурганы үед нарны гэрлийн үлдэх хэсэг
export const DUST_BLOCK = 0.8; // бүрэн шороотой панель эрчим хүчнийхээ 80%-ийг алдана
export const CREW_USE = { oxygen: 1.2, water: 0.7, food: 0.6 }; // секундэд
export const EMPTY_SECONDS = 4; // нөөц дууссанаас хойш хэдэн секундэд 1 зүрх алдах

export const ICE_COUNT = 5; // газар дээр зэрэг байх мөсний тоо
export const ICE_WATER = 4; // 1 мөс хэдэн ус болох

export const SHELTER: Vec2 & { r: number } = { x: 0, z: 0, r: 4.2 };
export const SOLAR_FIELD: Vec2 & { r: number } = { x: -13, z: -11, r: 4.5 };

export const MACHINES: Machine[] = [
  { id: "o2", name: "Агаар үйлдвэр", icon: "🫧", pos: { x: -9, z: 2 }, effect: "+хүчилтөрөгч", makes: "oxygen" },
  { id: "recycler", name: "Ус цэвэршүүлэгч", icon: "🚰", pos: { x: 9, z: 2 }, effect: "+ус", makes: "water" },
  { id: "greenhouse", name: "Хүлэмж", icon: "🌱", pos: { x: 0, z: -8 }, effect: "+хүнс, −ус", makes: "food" },
];

export const MAKES = {
  o2: { oxygen: 2.0 },
  recycler: { water: 1.5 },
  greenhouse: { food: 1.6, water: -0.5 },
} as const;

export const NEED_NAME = { oxygen: "Хүчилтөрөгч", water: "Ус", food: "Хүнс" };

export const FACTS = {
  start: "Ангараг дээрх 1 өдрийг sol гэдэг. Энэ нь Дэлхийн өдрөөс 40 орчим минутаар урт.",
  ice: "Ангарагийн хөрсөн доор болон туйлд нь мөс бий. Хайлуулбал ус болно!",
  storm: "Ангараг дээр заримдаа бүх гаригийг бүрхэх шороон шуурга болдог.",
  dust: "Spirit, Opportunity роверуудын нарны панелийг заримдаа салхи цэвэрлэж, эрчим хүч нь гэнэт нэмэгддэг байсан.",
  flare: "Ангараг Дэлхий шиг соронзон хамгаалалтгүй тул нарны цацраг шууд хүрдэг. Хоргодох байр руу гүй!",
  night: "Шөнө нар байхгүй тул нарны панель ажиллахгүй. Батарейн цахилгаанаа хэмнээрэй!",
  moxie: "Perseverance ровер дээрх MOXIE төхөөрөмж 2021 онд Ангарагийн агаараас хүчилтөрөгч гаргаж авсан: хамгийн ихдээ цагт 12 грамм.",
  opportunity: "2018 онд Ангарагийг бүхэлд нь бүрхсэн шороон шуурга Opportunity роверын нарны панелийг халхалсан. Ровер түүнээс хойш дахин холбогдоогүй.",
};
export type FactId = keyof typeof FACTS;
