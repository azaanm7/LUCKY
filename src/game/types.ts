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
  makes: Need; // аль нөөцийг үйлдвэрлэдэг
}

export type Need = "oxygen" | "water" | "food";
export type Cause = Need | "radiation";

// Зүрх алдах үеийн нөхцөл. Тоглоомын төгсгөлийн тайлан үүнээс шалтгааныг гаргана.
export interface HeartLoss {
  sol: number;
  cause: Cause;
  machineOn: boolean; // тэр нөөцийг хийдэг машин асаалттай байсан уу
  load: number; // машинууд хүссэн эрчим хүчнийхээ хэдэн хувийг авч байсан 0-1
  dust: number;
  storm: boolean;
  night: boolean;
  stormSol: number; // сүүлийн шуурга хэддүгээр sol-д болсон (0 = болоогүй)
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
  load: number; // асаалттай машинууд хүссэн эрчим хүчнийхээ хэдэн хувийг авч байна 0-1
  dust: number; // нарны панель дээрх шороо 0-1
  player: Vec2 & { angle: number; moving: boolean };
  ice: Ice[];
  nextIceId: number;
  storm: number; // шуурга дуусах хүртэлх секунд
  stormSol: number; // сүүлийн шуурга эхэлсэн sol (0 = болоогүй)
  flareWarn: number; // дэлбэрэлт эхлэх хүртэлх секунд
  flare: number; // дэлбэрэлт дуусах хүртэлх секунд
  flareHit: boolean; // энэ дэлбэрэлтэд өртсөн үү
  nextEventAt: number;
  emptyTimer: number; // нөөц дууссанаас хойш хэдэн секунд
  collected: number;
  losses: HeartLoss[]; // алдсан зүрх бүрийн шалтгаан
  seen: string[]; // аль баримтуудыг (FACTS) аль хэдийн үзүүлсэн
  toast: { text: string; until: number } | null;
  seed: number;
}

export interface Input {
  dx: number; // -1..1
  dz: number;
  action: boolean; // энэ frame-д товч дарсан уу
}
