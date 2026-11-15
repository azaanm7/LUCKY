import { audioOut } from "./synth";

// Дэвсгэр хөгжим: кодоор үүсгэдэг тайван "сансрын" ая (дууны файлгүй, интернэтгүй ажиллана).
// Өдөр: зөөлөн аккорд + басс + аялгуу. Шөнө: нам, сийрэг. Шуурга, дэлбэрэлт: түгшүүртэй, басс цохилно.
export type Mood = "day" | "night" | "danger";

const BPM = 76;
const STEP = 60 / BPM / 2; // найм дахь нот (секунд)
const LOOKAHEAD = 0.4; // хэдэн секундийн нотыг урьдчилж төлөвлөх
// Аккордууд (MIDI дугаар). Нэг аккорд = 8 алхам (1 такт).
const CALM = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; // Am F C G
const TENSE = [[57, 60, 64], [58, 62, 65], [57, 60, 64], [52, 56, 59]]; // Am Bb Am E
const MELODY = [69, 72, 74, 76, 79, 81, 84]; // A минор пентатоник
const BUS: Record<Mood, number> = { day: 0.9, night: 0.6, danger: 0.95 }; // дууны эффектүүдээс нам байна

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

let bus: GainNode | null = null;
let timer = 0;
let next = 0; // дараагийн алхмын цаг (AudioContext-ийн цагаар)
let step = 0;
let mood: Mood = "day";

// Нэг нот: зөөлөн эхэлж, аажим унтарна. filter өгвөл өндөр давтамжийг зөөлрүүлнэ.
function note(freq: number, at: number, length: number, type: OscillatorType, volume: number, attack: number, filter = 0) {
  const out = audioOut();
  if (!out || !bus) return;
  const { ctx } = out;
  const osc = ctx.createOscillator(), env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0.0001, at);
  env.gain.linearRampToValueAtTime(volume, at + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  let tail: AudioNode = env;
  if (filter) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filter; env.connect(f); tail = f; }
  osc.connect(env);
  tail.connect(bus);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

// Нэг алхамд (найм дахь нот) юу тоглох вэ
function play(i: number, at: number) {
  const beat = i % 8, bar = Math.floor(i / 8) % 4;
  const chord = (mood === "danger" ? TENSE : CALM)[bar];
  if (beat === 0) { // такт бүрийн эхэнд: зөөлөн аккорд (хоёр бага зэрэг өөр давтамжтай чичиргээ = өргөн дуу)
    for (const n of chord) for (const detune of [0.997, 1.003]) note(hz(n) * detune, at, STEP * 9, "triangle", mood === "night" ? 0.018 : 0.026, 1.2, 1100);
  }
  const bass = hz(chord[0] - 12);
  if (mood === "danger") { // түгшүүр: басс найм дахь нот бүрт цохилно
    note(bass, at, STEP * 0.9, "sawtooth", 0.035, 0.01, 420);
    if (beat % 2 === 0) note(hz(chord[(beat / 2) % 3] + 12), at, STEP * 0.8, "square", 0.012, 0.005, 1600);
    return;
  }
  if (beat === 0 || beat === 4) note(beat === 0 ? bass : hz(chord[2] - 12), at, STEP * 3.5, "sine", 0.07, 0.03);
  if (mood === "night") { // шөнө: хааяа нэг гялсхийх өндөр нот
    if (beat === 6 && Math.random() < 0.4) note(hz(MELODY[4 + Math.floor(Math.random() * 3)]), at, STEP * 6, "sine", 0.03, 0.02);
    return;
  }
  if (beat % 2 === 0) note(hz(chord[[0, 1, 2, 1][beat / 2]] + 12), at, STEP * 1.8, "triangle", 0.028, 0.01, 2400); // арпеджио
  else if (Math.random() < 0.3) note(hz(MELODY[Math.floor(Math.random() * MELODY.length)]), at, STEP * 3, "sine", 0.035, 0.02); // аялгуу
}

function schedule() {
  const out = audioOut();
  if (!out) return;
  const now = out.ctx.currentTime;
  if (next < now - 0.2) next = now + 0.05; // таб нуугдаж байгаад буцаж ирвэл хоцорсон нотуудыг алгасна
  while (next < now + LOOKAHEAD) { play(step++, next); next += STEP; }
}

// startAudio()-ын дараа дуудна. Дахин дуудвал юу ч хийхгүй.
export function startMusic() {
  const out = audioOut();
  if (!out || timer) return;
  bus = out.ctx.createGain();
  bus.gain.value = BUS[mood];
  bus.connect(out.master); // master-аар дамжина: дуу хаах товч хөгжмийг ч хаана
  next = out.ctx.currentTime + 0.3;
  timer = window.setInterval(schedule, 100);
}

// cues.ts тоглоомын байдлаас (өдөр, шөнө, аюул) дуудна
export function setMood(value: Mood) {
  const out = audioOut();
  if (value === mood || !out || !bus) { mood = value; return; }
  mood = value;
  bus.gain.setTargetAtTime(BUS[value], out.ctx.currentTime, 1.5);
}
