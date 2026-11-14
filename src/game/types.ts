// Тоглоомын бүх төрөл. Эндээс эхэлж уншвал бүтэц нь ойлгомжтой.

export type MachineId = "o2" | "recycler" | "greenhouse";

// Сансрын нисэгчдийн бодитоор тулгардаг асуудлууд
export type ProblemId = "filter" | "storm" | "flare" | "leak" | "pump";

// Асуудал бүрд хоёр төлөвлөгөө бий: a = болгоомжтой / удаан, b = хурдан / эрсдэлтэй
export type PlanId = "a" | "b";

// Агуулахаас авч очих сэлбэг
export type ItemId = "filter" | "patch" | "pump";

// Гараараа хийдэг ажил (ui/task-overlay.tsx): панель арчих, сэлбэг суулгах
export type TaskKind = "wipe" | ItemId;

export type SiteId = "soil" | "delta" | "crater";

// Эхний өдрийн сургалтын алхмууд
export type TrainingId = "ice" | "switch" | "wipe" | "refill" | "sample";

// Нарны дэлбэрэлтийн бодит бүртгэл (NASA DONKI)
export interface Flare {
  date: string; // оргил үеийн огноо (UTC)
  cls: string; // рентген зэрэглэл: C < M < X, тоо нь их байх тусам хүчтэй
  region: number; // Нарны идэвхтэй бүсийн дугаар
  link: string;
  live?: boolean; // true = тоглоом эхлэхэд шууд татсан, үгүй бол архив
}

export type Status = "playing" | "won" | "lost";

export interface Vec2 {
  x: number;
  z: number;
}

export type Need = "oxygen" | "water" | "food";
export type Cause = Need | "radiation" | "suit";

export interface Machine {
  id: MachineId;
  icon: string;
  pos: Vec2; // дэвсгэр (pad) хаана байх
  makes: Need; // аль нөөцийг үйлдвэрлэдэг
  item: ItemId; // эвдэрвэл ямар сэлбэгээр засах
}

// Шинжлэх ухааны талбай: хол байх тусам дээж нь үнэтэй
export interface Site extends Vec2 {
  id: SiteId;
  icon: string;
  r: number;
  worth: number; // нэг дээж хэдэн оноо
}

// Зүрх алдах үеийн нөхцөл. Тоглоомын төгсгөлийн тайлан үүнээс шалтгааныг гаргана.
export interface HeartLoss {
  sol: number;
  cause: Cause;
  machineOn: boolean; // тэр нөөцийг хийдэг машин асаалттай байсан уу
  broken: boolean; // тэр машин эвдэрсэн байсан уу
  weak: boolean; // тэр машин түр засвартай, хагас хүчээр ажиллаж байсан уу
  leak: boolean; // хүлэмжээс агаар гоожиж байсан уу
  drilling: boolean; // дээж өрөмдөж байсан уу (скафандрын O2 хурдан буурдаг)
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
  oxygen: number; // 0-100, суурийн агаар
  water: number;
  food: number;
  battery: number;
}

export interface Modal {
  kind: "brief" | "answer" | "debrief"; // асуудал эхлэх / Дэлхийн хариу ирэх / шийдэгдсэн
  id: ProblemId;
}

export interface GameState {
  status: Status;
  time: number; // нийт секунд
  hearts: number;
  res: Resources;
  on: Record<MachineId, boolean>;
  load: number; // ажиллаж буй машинууд хүссэн эрчим хүчнийхээ хэдэн хувийг авч байна 0-1
  broken: MachineId | null; // эвдэрсэн машин
  weak: MachineId[]; // түр зассан эсвэл цацрагт гэмтсэн: хагас хүчээр ажиллана
  safeMode: number; // аюулгүй горим дуусах хүртэлх секунд (машинууд унтарна)
  dust: number; // нарны панель дээрх шороо 0-1
  player: Vec2 & { angle: number; moving: boolean };
  suitO2: number; // скафандрын хүчилтөрөгч 0-100
  carrying: ItemId | null;
  task: { kind: TaskKind; done: number } | null; // гараар хийж буй ажил, done 0-1
  deck: ProblemId[]; // энэ тоглолтын асуудлуудын дараалал (seed-ээр холино)
  problem: ProblemId | null; // одоо шийдэж буй асуудал
  plan: PlanId | null; // одоогийн асуудалд сонгосон төлөвлөгөө (null = шийдээгүй)
  earthAt: number; // Дэлхийн хариу ирэх цаг (0 = асуугаагүй)
  advice: PlanId | null; // Дэлхийн зөвлөсөн төлөвлөгөө
  solarFlare: Flare; // энэ тоглолтын нарны дэлбэрэлт: NASA DONKI-ийн бодит бүртгэл
  solved: ProblemId[];
  modal: Modal | null; // нээлттэй бол тоглоом түр зогсоно
  science: number; // лабораторид хүргэсэн шинжлэх ухааны оноо
  samples: number[]; // гартаа яваа, хүргээгүй дээжүүдийн оноо
  drill: number; // одоогийн дээжийг хэдэн секунд өрөмдсөн
  siteLeft: Record<SiteId, number>; // талбай бүрт үлдсэн дээж
  ice: Ice[];
  nextIceId: number;
  storm: number; // шуурга дуусах хүртэлх секунд
  stormSol: number; // сүүлийн шуурга эхэлсэн sol (0 = болоогүй)
  flareWarn: number; // дэлбэрэлт эхлэх хүртэлх секунд
  flare: number; // дэлбэрэлт дуусах хүртэлх секунд
  flareHit: boolean; // энэ дэлбэрэлтэд өртсөн үү
  emptyTimer: number; // нөөц дууссанаас хойш хэдэн секунд
  collected: number;
  trained: TrainingId[]; // сургалтын хийсэн алхмууд
  losses: HeartLoss[]; // алдсан зүрх бүрийн шалтгаан
  seen: string[]; // аль баримтуудыг (FACTS) аль хэдийн үзүүлсэн
  toast: { msg: Msg; until: number } | null; // текстийг биш кодыг хадгална, UI сонгосон хэлээр орчуулна
  seed: number;
}

// Тоглогчид харагдах бүх бичвэр src/i18n/-д байна. Engine зөвхөн кодыг нь буцаана.
export type FactId = "trip" | "red" | "landing" | "start" | "ice" | "night" | "moxie" | "suit" | "soil" | "delta" | "crater";

// Дэлгэцийн доод хэсэгт түр гарах мэдэгдэл
export type Msg =
  | { kind: "fact"; id: FactId }
  | { kind: "luckyFlare" | "radiation" | "suitOut" | "trained" }
  | { kind: "flareHit" | "fixed"; machine: MachineId }
  | { kind: "needOut"; need: Need }
  | { kind: "banked" | "stormStudy"; points: number }
  | { kind: "sampled"; site: SiteId };

// Төгсгөлийн тайлангийн нэг алхам (шалтгаан → ... → үр дагавар)
export type Step =
  | { id: "outsideFlare" | "radiationHit" | "drillO2" | "oneMore" | "suitEmpty" | "tooLong" | "noPart" | "halfPower" | "leak" | "slowPatch" | "noPower" | "night" | "storm" | "allOn" | "fewIce" }
  | { id: "out"; need: Need }
  | { id: "broken" | "weakFix" | "off" | "slowed" | "late"; machine: MachineId }
  | { id: "dusty"; pct: number }
  | { id: "stormSol"; sol: number };

// Тайлангийн "дараагийн удаа юу хийх вэ" зөвлөгөө
export type TipId = "shelter" | "returnEarly" | "refill" | "fetchPart" | "fullFix" | "turnBackOn" | "patch" | "dusk" | "stormOff" | "wipe" | "spare" | "ice" | "early";

export interface Input {
  dx: number; // -1..1
  dz: number;
  action: boolean; // энэ frame-д товч дарсан уу
  step?: boolean; // гараар хийдэг ажлын нэг алхам хийсэн үү
  cancel?: boolean; // гараар хийдэг ажлаа орхисон уу
}
