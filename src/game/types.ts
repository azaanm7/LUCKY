// Тоглоомын бүх төрөл. Эндээс эхэлж уншвал бүтэц нь ойлгомжтой.

export type MachineId = "o2" | "recycler" | "greenhouse";

export type Status = "intro" | "playing" | "won" | "lost";

export interface Vec2 {
  x: number;
  z: number;
}

export interface Machine {
  id: MachineId;
  name: string;
  icon: string;
  pos: Vec2; // дэвсгэр (pad) хаана байх
  effect: string;
}

export interface Ice extends Vec2 {
  id: number;
}

export interface Resources {
  oxygen: number; // 0-100
  water: number;
  food: number;
  battery: number;
}

export interface GameState {
  status: Status;
  time: number; // нийт секунд
  hearts: number;
  res: Resources;
  on: Record<MachineId, boolean>;
  dust: number; // нарны панель дээрх шороо 0-1
  player: Vec2 & { angle: number; moving: boolean };
  ice: Ice[];
  nextIceId: number;
  storm: number; // шуурга дуусах хүртэлх секунд
  flareWarn: number; // дэлбэрэлт эхлэх хүртэлх секунд
  flare: number; // дэлбэрэлт дуусах хүртэлх секунд
  flareHit: boolean; // энэ дэлбэрэлтэд өртсөн үү
  nextEventAt: number;
  emptyTimer: number; // нөөц дууссанаас хойш хэдэн секунд
  collected: number;
  toast: { text: string; until: number } | null;
  seed: number;
}

export interface Input {
  dx: number; // -1..1
  dz: number;
  action: boolean; // энэ frame-д товч дарсан уу
}
