// Чангаар уншуулах: хөтчийн өөрийн speechSynthesis (нэмэлт сан, файл хэрэггүй). React-гүй.
// Зөвхөн тоглогч 🔊 дарахад ярина. Тоглоомын дуу хаасан (synth.ts) ч энэ ажиллана.
export type VoiceLang = "en" | "mn";

type VoiceLike = Pick<SpeechSynthesisVoice, "lang" | "default" | "localService">;

const RATE = 0.9; // хүүхдэд арай удаан
const LONG = 180; // үүнээс урт өгүүлбэрийг таслалаар нь хуваана (Chrome урт хэсгийг тасалдаг)
const SUB = "₀₁₂₃₄₅₆₇₈₉";

// Дэлгэцийн бичвэрийг уншихад бэлдэнэ: эможи, товчны тэмдэг ([1]) хасна, O₂ → O2, зай шахна
export function speechText(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}|️|‍/gu, "")
    .replace(/\[[^\]\s]{1,5}\]/g, "")
    .replace(/[₀-₉]/g, (d) => String(SUB.indexOf(d)))
    .replace(/\s+·\s+/g, ", ") // "Real data · NASA DONKI" дунд цэгийг "цэг" гэж уншуулахгүй
    .replace(/\s+/g, " ")
    .replace(/ ([.,!?…:;])/g, "$1") // эможи хассаны дараах "star ." → "star."
    .trim();
}

// Өгүүлбэр бүрийг тусад нь (0.64 гэх мэт аравтын бутархайг таслахгүй)
export function sentences(text: string): string[] {
  const parts = text.split(/([.!?…]+)\s+/);
  const out: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const sentence = (parts[i] + (parts[i + 1] ?? "")).trim();
    if (sentence.length <= LONG) { if (sentence) out.push(sentence); continue; }
    let chunk = "";
    for (const piece of sentence.split(/,\s+/)) {
      chunk = chunk ? `${chunk}, ${piece}` : piece;
      if (chunk.length > LONG / 2) { out.push(chunk); chunk = ""; }
    }
    if (chunk) out.push(chunk);
  }
  return out;
}

// Тухайн хэлний хоолой. Байхгүй бол null: монгол бичвэрийг англи хоолойгоор хэзээ ч уншуулахгүй.
// Офлайн ажилладаг (localService), дараа нь анхдагч хоолойг илүүд үзнэ.
export function pickVoice<V extends VoiceLike>(voices: readonly V[], lang: VoiceLang): V | null {
  const own = voices.filter((v) => v.lang.toLowerCase().split(/[-_]/)[0] === lang);
  const score = (v: V) => (v.localService ? 2 : 0) + (v.default ? 1 : 0);
  return own.sort((a, b) => score(b) - score(a))[0] ?? null;
}

const synth = (): SpeechSynthesis | null =>
  typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined" ? window.speechSynthesis : null;

export function hasVoice(lang: VoiceLang): boolean {
  const s = synth();
  return !!s && !!pickVoice(s.getVoices(), lang);
}

// Хоолойнууд хожуу ачаалагдана. Буцаах функц нь сонсохоо болино.
export function onVoicesChanged(listener: () => void): () => void {
  const s = synth();
  if (!s) return () => {};
  s.addEventListener("voiceschanged", listener);
  return () => s.removeEventListener("voiceschanged", listener);
}

let counter = 0;
let current = 0; // одоо уншиж буй ярианы дугаар (0 = чимээгүй)
let finish: (() => void) | null = null;
let queue: SpeechSynthesisUtterance[] = []; // Chrome дуусаагүй utterance-ийг устгачихгүйн тулд барина

function end(id: number) {
  if (id !== current || id === 0) return;
  const done = finish;
  current = 0; finish = null; queue = [];
  done?.();
}

// Өмнөх яриаг зогсоогоод өгүүлбэр бүрийг дараалалд оруулна. Буцаах дугаараар нь зогсооно (0 = ярьж чадсангүй).
export function speak(texts: string[], lang: VoiceLang, onEnd?: () => void): number {
  const s = synth();
  const voice = s && pickVoice(s.getVoices(), lang);
  const parts = texts.flatMap((text) => sentences(speechText(text)));
  if (!s || !voice || !parts.length) return 0;
  stopSpeaking();
  const id = ++counter;
  current = id; finish = onEnd ?? null;
  queue = parts.map((part, i) => {
    const u = new SpeechSynthesisUtterance(part);
    u.voice = voice; u.lang = voice.lang; u.rate = RATE;
    if (i === parts.length - 1) u.onend = u.onerror = () => end(id);
    return u;
  });
  for (const u of queue) s.speak(u);
  s.resume(); // Chrome заримдаа "paused" төлөвт гацдаг
  return id;
}

// id өгвөл зөвхөн тэр яриа одоо явж байвал зогсооно (өөр товчны яриаг таслахгүй). id-гүй бол бүгдийг.
export function stopSpeaking(id?: number): void {
  if (id !== undefined && (id === 0 || id !== current)) return;
  end(current);
  synth()?.cancel();
}
