// Бүх дуу кодоор үүснэ (Web Audio API). Дууны файл байхгүй.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wind: GainNode | null = null;
let drone: OscillatorNode | null = null;
let muted = false;

const VOLUME = 0.5;

// Тоглогч "Эхлэх" дарсны дараа л дуу асаах боломжтой (хөтчийн дүрэм)
export function startAudio() {
  if (ctx) { void ctx.resume(); return; }
  try {
    ctx = new AudioContext();
  } catch {
    return; // дуугүй ч тоглоом ажиллана
  }
  master = ctx.createGain();
  master.gain.value = muted ? 0 : VOLUME;
  master.connect(ctx.destination);

  // Салхи: шүүсэн шуугиан. Шуурганы үед чангарна.
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 420;
  wind = ctx.createGain();
  wind.gain.value = 0.02;
  source.connect(filter).connect(wind).connect(master);
  source.start();

  // Намуухан дэвсгэр ая: шөнө нам болно
  drone = ctx.createOscillator();
  drone.type = "sine";
  drone.frequency.value = 110;
  const hum = ctx.createGain();
  hum.gain.value = 0.035;
  drone.connect(hum).connect(master);
  drone.start();
}

export function setMuted(value: boolean) {
  muted = value;
  if (ctx && master) master.gain.setTargetAtTime(value ? 0 : VOLUME, ctx.currentTime, 0.05);
}

// Нэг нот. slideTo өгвөл давтамж нь гулсана (дохио, амжилтын ая)
export function tone(freq: number, seconds: number, type: OscillatorType = "sine", volume = 0.2, slideTo = freq, delay = 0) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + seconds);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + seconds + 0.02);
}

// Орчны дуу: storm, night нь 0-1
export function ambient(storm: number, night: number) {
  if (!ctx || !wind || !drone) return;
  wind.gain.setTargetAtTime(0.02 + storm * 0.3, ctx.currentTime, 0.4);
  drone.frequency.setTargetAtTime(night > 0.5 ? 82 : 110, ctx.currentTime, 1.5);
}
