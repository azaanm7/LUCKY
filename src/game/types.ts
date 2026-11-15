// Тоглоомын бүх төрөл. Эндээс эхэлж уншвал бүтэц нь ойлгомжтой.

export type MachineId = "o2" | "recycler" | "greenhouse";

// Сансрын нисэгчдийн бодитоор тулгардаг асуудлууд
export type ProblemId = "filter" | "storm" | "flare" | "leak" | "pump";

// Асуудал бүрд хоёр төлөвлөгөө бий: a = болгоомжтой / удаан, b = хурдан / эрсдэлтэй
export type PlanId = "a" | "b";

// Агуулахаас авч очих сэлбэг
export type ItemId = "filter" | "patch" | "pump";

// Гараараа хийдэг ажил (ui/task-overlay.tsx): панель арчих, сэлбэг суулгах, ургац хураах
export type TaskKind = "wipe" | "harvest" | ItemId;

// Ангарагаас цуглуулдаг материал: мөс → ус, хүдэр → сэлбэг, үр → хүнс
export type Material = "ice" | "ore" | "seed";

// Урлангийн 3D принтерээр хийдэг зүйлс
export type RecipeId = "part" | "panel" | "tank";

export type SiteId = "soil" | "delta" | "crater";

// Эхний өдрийн сургалтын алхмууд
export type TrainingId = "collect" | "store" | "craft" | "switch" | "wipe" | "sample";

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
  starved: boolean; // тэр машинд материал дутсан уу (мөсгүй, үргүй, шүүлтүүр бөглөрсөн)
  flare: boolean; // нарны дэлбэрэлт болж байсан уу
  load: number; // машинууд хүссэн эрчим хүчнийхээ хэдэн хувийг авч байсан 0-1
  dust: number;
  storm: boolean;
  night: boolean;
  stormSol: number; // сүүлийн шуурга хэддүгээр sol-д болсон (0 = болоогүй)
}

// Газар дээрх цуглуулах зүйл: мөс, хүдэртэй чулуу, үртэй ачааны хайрцаг
export interface Deposit extends Vec2 {
  id: number;
  kind: Material;
}

export interface Recipe {
  id: RecipeId;
  cost: Partial<Record<Material, number>>; // ямар материал хэдийг зарах
  seconds: number; // хэвлэх хугацаа
  max: number; // хэдийг хийж болох (0 = хязгааргүй)
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
  dose: number; // хуримтлагдсан цацрагийн тун 0-100 (буурдаггүй, 100 хүрвэл 1 зүрх алдана)
  pack: Material[]; // үүргэвчинд яваа материал (суурьт хүргээгүй)
  store: Record<Material, number>; // суурийн агуулахад байгаа материал
  parts: number; // бэлэн сэлбэг: шүүлтүүр солих, эвдрэл засахад зарна
  built: RecipeId[]; // хийсэн сайжруулалтууд (нэмэлт панель, том сав)
  job: { recipe: RecipeId; done: number } | null; // 3D принтер одоо юу хэвлэж байна, done 0-1
  melt: number; // ус цэвэршүүлэгчид хайлж буй мөсний үлдэгдэл 0-1
  filter: number; // агаар үйлдвэрийн тоосны шүүлтүүр 0-1 (0 = бөглөрсөн)
  crop: number | null; // хүлэмжийн ургац: null = тариагүй, 0-1 = ургаж байна, 1 = хураахад бэлэн
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
  deposits: Deposit[];
  nextDepositId: number;
  storm: number; // шуурга дуусах хүртэлх секунд
  stormSol: number; // сүүлийн шуурга эхэлсэн sol (0 = болоогүй)
  flareWarn: number; // дэлбэрэлт эхлэх хүртэлх секунд
  flare: number; // дэлбэрэлт дуусах хүртэлх секунд
  flareHit: boolean; // энэ дэлбэрэлтийн үеэр "тун өсөж байна" гэж сануулсан уу
  emptyTimer: number; // нөөц дууссанаас хойш хэдэн секунд
  collected: number;
  trained: TrainingId[]; // сургалтын хийсэн алхмууд
  losses: HeartLoss[]; // алдсан зүрх бүрийн шалтгаан
  seen: string[]; // аль баримтуудыг (FACTS) аль хэдийн үзүүлсэн
  toast: { msg: Msg; until: number } | null; // текстийг биш кодыг хадгална, UI сонгосон хэлээр орчуулна
  seed: number;
}

// Мэдэгдэл, баримт, тайлангийн кодууд messages.ts-д
export type { FactId, Msg, Step, TipId } from "./messages";
import type { Msg } from "./messages";

export interface Input {
  dx: number; // -1..1
  dz: number;
  action: boolean; // энэ frame-д товч дарсан уу
  step?: boolean; // гараар хийдэг ажлын нэг алхам хийсэн үү
  cancel?: boolean; // гараар хийдэг ажлаа орхисон уу
  craft?: RecipeId; // урлан дээр энэ зүйлийг хэвлэж эхлэх
}
