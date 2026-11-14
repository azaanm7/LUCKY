import { MACHINES, NEED_NAME } from "./config";
import type { GameState, HeartLoss } from "./types";

// Төгсгөлийн тайлан: зүрх бүрийг яагаад алдсаныг шалтгаанаас үр дагавар руу нь тайлбарлана.
export interface Finding {
  sol: number;
  steps: string[]; // шалтгаан → ... → үр дагавар
  tip: string; // дараагийн удаа юу хийх вэ
  count: number; // ижил шалтгаанаар дараалан хэдэн зүрх алдсан
}

const SHORT = 0.5; // машинууд хэрэгцээнийхээ 50%-аас бага эрчим хүч авбал "эрчим хүч дутсан" гэж үзнэ

export function explain(l: HeartLoss): Omit<Finding, "count"> {
  if (l.cause === "radiation") {
    return { sol: l.sol, steps: ["☢️ Нарны дэлбэрэлтийн үеэр гадаа байсан", "💔 Цацрагт өртсөн"], tip: "Тэнгэр улайвал шууд хоргодох байр руу гүй." };
  }
  if (l.cause === "suit" && l.drilling) {
    return { sol: l.sol, steps: ["⛏️ Дээж өрөмдөх хүнд ажилд O₂ хурдан буурсан", "🧪 Дахиад нэг дээж авах гэж үлдсэн", "💔 Скафандрын хүчилтөрөгч дууссан"], tip: "Буцах замдаа хүрэх O₂ үлдээ. Хол талбайд цөөн дээж аваад буц." };
  }
  if (l.cause === "suit") {
    return { sol: l.sol, steps: ["👩‍🚀 Гадаа хэт удаан байсан", "💔 Скафандрын хүчилтөрөгч дууссан"], tip: "Скафандрын O₂ 30%-аас буувал хоргодох байранд орж цэнэглэ." };
  }
  const machine = MACHINES.find((m) => m.makes === l.cause)!;
  const end = `💔 ${NEED_NAME[l.cause]} дууссан`;
  if (l.broken) {
    return { sol: l.sol, steps: [`🔧 ${machine.name} эвдэрсэн`, "📦 Сэлбэгийг нь удаан аваачаагүй", end], tip: "Асуудал гармагц агуулахаас сэлбэг аваад машин руу аваач." };
  }
  if (l.weak) {
    return { sol: l.sol, steps: [`🩹 ${machine.name} түр засвартай байсан`, "🐢 Хагас хүчээр ажилласан", end], tip: "Тайван үед агуулахаас сэлбэг аваачиж бүрэн зас." };
  }
  if (!l.machineOn) {
    return { sol: l.sol, steps: [`⛔ ${machine.name} унтраалттай байсан`, end], tip: "Унтраасан машинаа нөөц нь багасахаас өмнө эргүүлж асаа." };
  }
  if (l.cause === "oxygen" && l.leak) {
    return { sol: l.sol, steps: ["💨 Хүлэмжийн нүхээр агаар гоожсон", "🩹 Нүхийг удаан нөхөөгүй", end], tip: "Агаар гоожиж эхэлмэгц нөхөөс аваад хүлэмж рүү аваач." };
  }
  if (l.load < SHORT) {
    const chain = [`🔋 Эрчим хүч хүрээгүй`, `🐢 ${machine.name} удааширсан`, end];
    if (l.night) return { sol: l.sol, steps: ["🌙 Шөнө нарны панель ажиллаагүй", ...chain], tip: "Орой болохоос өмнө нэг машинаа унтрааж, батарейгаа цэнэглэ." };
    if (l.storm) return { sol: l.sol, steps: ["🌪️ Шороон шуурга нарыг халхалсан", ...chain], tip: "Шуурганы үеэр нөөц нь дүүрэн машинаа унтраа." };
    if (l.dust > 0.5) {
      const dirty = `🧹 Нарны панель ${Math.round(l.dust * 100)}% шороотой байсан`;
      const steps = l.stormSol ? [`🌪️ Sol ${l.stormSol}-д шороон шуурга болсон`, dirty, ...chain] : [dirty, ...chain];
      return { sol: l.sol, steps, tip: "Шуурганы дараа нарны панель дээр зогсож шороог нь арч." };
    }
    return { sol: l.sol, steps: ["⚙️ Бүх машин зэрэг ассан", ...chain], tip: "Нар бүх машинд хүрэхгүй. Нөөц нь дүүрэн машинаа унтраа." };
  }
  if (l.cause === "water") return { sol: l.sol, steps: ["🧊 Мөс цөөн түүсэн", end], tip: "Ус багасмагц цэнхэр мөс түү, ус цэвэршүүлэгчээ асаалттай байлга." };
  return { sol: l.sol, steps: [`⏰ ${machine.name} нөөцөө нөхөж амжаагүй`, end], tip: "Нөөц улайхаас өмнө машинаа асааж, эрчим хүчийг нь бусдаас чөлөөл." };
}

// Дараалсан ижил шалтгааныг нэгтгэнэ (жишээ нь 3 зүрхээ бүгдийг нь хүчилтөрөгчгүй алдсан бол нэг мөр)
export function report(s: GameState): Finding[] {
  const out: Finding[] = [];
  for (const l of s.losses) {
    const f = explain(l);
    const last = out[out.length - 1];
    if (last && last.steps.join() === f.steps.join()) last.count++;
    else out.push({ ...f, count: 1 });
  }
  return out;
}
