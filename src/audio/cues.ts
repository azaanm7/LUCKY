import { MACHINES } from "../game/config";
import type { GameState } from "../game/types";
import { isDay } from "../game/world";
import { ambient, tone } from "./synth";

const notes = (list: number[], gap = 0.11, type: OscillatorType = "triangle") => list.forEach((f, i) => tone(f, 0.22, type, 0.18, f, i * gap));

// Өмнөх ба шинэ state-ийг харьцуулж, юу болсныг дуугаар мэдэгдэнэ. Тоглоомын логик дуу гаргадаггүй.
export function playCues(a: GameState, b: GameState) {
  if (b.hearts < a.hearts) tone(240, 0.5, "sawtooth", 0.25, 90); // зүрх алдлаа
  if (b.collected > a.collected) tone(880, 0.12, "triangle", 0.15, 1320); // мөс
  if (b.samples.length > a.samples.length) notes([520, 780]); // дээж авлаа
  if (b.science > a.science) notes([660, 880, 1100, 1320], 0.08); // оноо
  if (MACHINES.some((m) => a.on[m.id] !== b.on[m.id])) tone(420, 0.07, "square", 0.1);
  if (b.weak.length > a.weak.length && !b.modal) tone(900, 0.3, "sawtooth", 0.2, 120); // цацраг машин гэмтээлээ
  if (b.task && a.task && b.task.done > a.task.done) tone(500 + b.task.done * 500, 0.07, "square", 0.12); // ажлын алхам
  if (a.task && !b.task && !b.modal) notes([600, 900]);
  if (a.flareWarn <= 0 && b.flareWarn > 0) tone(500, 0.9, "sawtooth", 0.2, 1100); // дэлбэрэлтийн дохио
  if (b.flare > 0 && Math.floor(b.time * 2) !== Math.floor(a.time * 2)) tone(950, 0.08, "square", 0.08);
  if (b.suitO2 < 30 && b.suitO2 > 0 && Math.floor(b.time) !== Math.floor(a.time)) tone(1400, 0.06, "sine", 0.12); // O2 бага
  if (b.drill > 0 && Math.floor(b.time * 6) !== Math.floor(a.time * 6)) tone(140 + Math.random() * 40, 0.06, "sawtooth", 0.06); // өрөм
  if (b.player.moving && Math.floor(b.time / 0.3) !== Math.floor(a.time / 0.3)) tone(90, 0.05, "sine", 0.1, 60); // алхам
  if (a.status === "playing" && b.status === "won") notes([523, 659, 784, 1047, 1319], 0.14);
  if (a.status === "playing" && b.status === "lost") notes([392, 330, 262, 196], 0.22, "sine");
  ambient(b.storm > 0 ? 1 : 0, isDay(b.time) ? 0 : 1);
}

// Цонх нээгдэх, хаагдах (tick-ээс гадуур өөрчлөгддөг тул тусад нь)
export function playModalCue(a: GameState, b: GameState) {
  if (a.modal === b.modal) return;
  if (b.modal?.kind === "brief") { tone(660, 0.18, "square", 0.16); tone(440, 0.18, "square", 0.16, 440, 0.2); tone(660, 0.18, "square", 0.16, 660, 0.4); }
  else if (b.modal?.kind === "answer") notes([1200, 900, 1200], 0.07, "square"); // радио дохио
  else if (b.modal?.kind === "debrief") notes([523, 659, 784, 1047]);
  else tone(700, 0.06, "sine", 0.1);
}
