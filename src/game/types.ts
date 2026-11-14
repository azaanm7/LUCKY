// Тоглоомын бүх төрөл. Эндээс эхэлж уншвал бүтэц нь ойлгомжтой.

export type MachineId = "o2" | "recycler" | "greenhouse";

// Сансрын нисэгчдийн бодитоор тулгардаг асуудлууд
export type ProblemId = "filter" | "storm" | "flare" | "leak" | "pump";

// Агуулахаас авч очих сэлбэг
export type ItemId = "filter" | "patch" | "pump";

export type Status = "playing" | "won" | "lost";

export interface Vec2 {
  x: number;
  z: number;
}

export interface Machine {
  id: MachineId;
  name: string;
  icon: string;
  pos: Vec2; // дэвсгэр (pad) хаана байх
}

export interface Ice extends Vec2 {
  id: number;
}

export interface Resources {
  oxygen: number; // 0-100, суурийн агаар
  water: number;
  food: number;
  battery: number;
}

export interface Modal {
  kind: "brief" | "debrief"; // асуудал эхлэх / шийдэгдсэн
  id: ProblemId;
}

export interface GameState {
  status: Status;
  time: number; // нийт секунд
  hearts: number;
  res: Resources;
  on: Record<MachineId, boolean>;
  broken: MachineId | null; // эвдэрсэн машин
  dust: number; // нарны панель дээрх шороо 0-1
  player: Vec2 & { angle: number; moving: boolean };
  suitO2: number; // скафандрын хүчилтөрөгч 0-100
  fitness: number; // булчингийн хүч 0-100
  exercisedSol: number; // хамгийн сүүлд дасгал хийсэн sol
  gymTimer: number;
  carrying: ItemId | null;
  problem: ProblemId | null; // одоо шийдэж буй асуудал
  solved: ProblemId[];
  modal: Modal | null; // нээлттэй бол тоглоом түр зогсоно
  ice: Ice[];
  nextIceId: number;
  storm: number; // шуурга дуусах хүртэлх секунд
  flareWarn: number; // дэлбэрэлт эхлэх хүртэлх секунд
  flare: number; // дэлбэрэлт дуусах хүртэлх секунд
  flareHit: boolean;
  emptyTimer: number;
  collected: number;
  toast: { text: string; until: number } | null;
  seed: number;
}

export interface Input {
  dx: number; // -1..1
  dz: number;
  action: boolean; // энэ frame-д товч дарсан уу
}
