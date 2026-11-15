import { afterEach, describe, expect, test } from "bun:test";
import { pickVoice, sentences, speak, speechText, stopSpeaking } from "./speech";

type More = Partial<{ default: boolean; localService: boolean }>;
const voice = (lang: string, name = `Voice ${lang}`, more: More = {}) => ({ name, lang, default: false, localService: true, ...more });
const google = voice("en-US", "Google US English", { localService: false }); // Chrome-ийн онлайн хоолой
const zira = voice("en-US", "Microsoft Zira - English (United States)"); // хуучин Windows хоолой

describe("уншуулах бичвэр", () => {
  test("эможи, товчны тэмдэг [1]-ийг хасаж, O₂-ийг O2 болгоно", () => {
    expect(speechText("🛡️ Turn on the shelter shield [1]")).toBe("Turn on the shelter shield");
    expect(speechText("👩‍🚀 Suit O₂ is low!   ☢️")).toBe("Suit O2 is low!");
    expect(speechText("📡 Ask Earth [3]")).toBe("Ask Earth");
    expect(speechText("Earth advises the plan with a star ⭐. Yours!")).toBe("Earth advises the plan with a star. Yours!");
  });

  test("өгүүлбэр бүрийг тусад нь, 0.64 гэх мэт тоог таслахгүй", () => {
    expect(sentences("RAD measured 0.64 mSv per day. It never goes down!")).toEqual(["RAD measured 0.64 mSv per day.", "It never goes down!"]);
  });
});

describe("хоолой сонгох", () => {
  test("Google US English нь төхөөрөмжийн Microsoft Zira-г ялна", () => {
    expect(pickVoice([zira, google], "en")?.name).toBe("Google US English");
  });

  test("Natural хоолой хамгийн сайн, хуучин Windows хоолой хамгийн сүүлд", () => {
    const aria = voice("en-US", "Microsoft Aria Online (Natural) - English (United States)", { localService: false });
    const other = voice("en-GB", "Daniel");
    expect(pickVoice([zira, google, aria, other], "en")?.name).toBe(aria.name);
    expect(pickVoice([zira, other], "en")?.name).toBe("Daniel");
  });

  test("интернэтгүй бол зөвхөн төхөөрөмжийн хоолой", () => {
    expect(pickVoice([zira, google], "en", false)?.name).toBe(zira.name);
    expect(pickVoice([google], "en", false)).toBeNull();
  });

  test("англи хоолой л байвал монгол бичвэрт null (онлайн, офлайн аль алинд)", () => {
    expect(pickVoice([zira, google], "mn")).toBeNull();
    expect(pickVoice([zira, google], "mn", false)).toBeNull();
  });

  test("Манипури (mni) хоолойг монгол гэж андуурахгүй, жинхэнэ mn хоолойг олно", () => {
    expect(pickVoice([voice("mni-IN")], "mn")).toBeNull();
    expect(pickVoice([voice("en-US"), voice("mn-MN")], "mn")?.lang).toBe("mn-MN");
  });
});

describe("ярих", () => {
  const g = globalThis as Record<string, unknown>;
  afterEach(() => { delete g.window; delete g.SpeechSynthesisUtterance; });

  type Utterance = { text: string; rate: number; pitch: number; voice: { name: string } | null; onend?: () => void; onerror?: (e: { error: string }) => void };
  // Хөтчийн speechSynthesis-ийг дуурайна: юу дараалалд орсныг тэмдэглэнэ
  function fakeBrowser(voices: ReturnType<typeof voice>[]) {
    const log: string[] = [];
    const queued: Utterance[] = [];
    g.SpeechSynthesisUtterance = class { rate = 1; pitch = 1; voice = null; lang = ""; constructor(public text: string) {} };
    const noop = () => {};
    g.window = { addEventListener: noop, removeEventListener: noop, speechSynthesis: {
      getVoices: () => voices,
      speak: (u: Utterance) => { log.push(`speak:${u.text}`); queued.push(u); },
      cancel: () => log.push("cancel"),
      resume: noop, addEventListener: noop, removeEventListener: noop,
    } };
    return { log, queued };
  }

  test("speechSynthesis байхгүй орчинд (bun, хуучин хөтөч) унахгүй", () => {
    expect(speak(["Hello"], "en")).toBe(0);
    expect(() => stopSpeaking()).not.toThrow();
  });

  test("эхлээд cancel, дараа нь өгүүлбэр бүрийг pitch 1, rate 0.9-өөр дараалалд оруулна", () => {
    const { log, queued } = fakeBrowser([voice("en-US")]);
    let done = false;
    const id = speak(["🚨 A dust storm is here! Dust is hiding the Sun."], "en", () => { done = true; });
    expect(id).toBeGreaterThan(0);
    expect(log).toEqual(["cancel", "speak:A dust storm is here!", "speak:Dust is hiding the Sun."]);
    expect(queued.every((u) => u.rate === 0.9 && u.pitch === 1)).toBe(true);
    queued.at(-1)!.onend!(); // сүүлийн өгүүлбэр дуусахад товч 🔊 руу буцна
    expect(done).toBe(true);
  });

  test("онлайн хоолой алдаа гаргавал бүх бичвэрийг төхөөрөмжийн хоолойгоор нэг л удаа дахин уншина", () => {
    const { log, queued } = fakeBrowser([zira, google]);
    let done = false;
    speak(["One. Two."], "en", () => { done = true; });
    expect(queued.map((u) => u.voice?.name)).toEqual(["Google US English", "Google US English"]);
    log.length = 0;
    queued[0].onerror!({ error: "network" });
    expect(log).toEqual(["cancel", "speak:One.", "speak:Two."]);
    expect(queued.slice(2).map((u) => u.voice?.name)).toEqual([zira.name, zira.name]);
    queued[1].onerror!({ error: "interrupted" }); // хуучин дарааллын үйл явдлыг тоохгүй
    expect(done).toBe(false);
    log.length = 0;
    queued[3].onerror!({ error: "synthesis-failed" }); // төхөөрөмжийн хоолой ч алдвал дахин оролдохгүй, дуусгана
    expect(log).toEqual([]);
    expect(done).toBe(true);
  });

  test("бид өөрсдөө зогсооход гарах алдаагаар дахин уншихгүй", () => {
    const { log, queued } = fakeBrowser([zira, google]);
    const id = speak(["One."], "en");
    stopSpeaking(id);
    log.length = 0;
    queued[0].onerror!({ error: "canceled" });
    expect(log).toEqual([]);
  });

  test("монгол хоолойгүй бол монгол бичвэрийг огт уншихгүй", () => {
    const { log } = fakeBrowser([voice("en-US")]);
    expect(speak(["Шороон шуурга ирлээ!"], "mn")).toBe(0);
    expect(log).toEqual([]);
  });

  test("өөр товчны яриаг зогсоохгүй, өөрийнхийгөө л зогсооно", () => {
    const { log } = fakeBrowser([voice("en-US")]);
    const first = speak(["One."], "en");
    const second = speak(["Two."], "en");
    log.length = 0;
    stopSpeaking(first); // хуучин дугаар: юу ч хийхгүй
    expect(log).toEqual([]);
    stopSpeaking(second);
    expect(log).toEqual(["cancel"]);
  });
});
