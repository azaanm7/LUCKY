import { afterEach, describe, expect, test } from "bun:test";
import { pickVoice, sentences, speak, speechText, stopSpeaking } from "./speech";

const voice = (lang: string, more: Partial<{ default: boolean; localService: boolean }> = {}) => ({ lang, default: false, localService: true, ...more });

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
  test("англи бичвэрт англи хоолой, монгол хоолой байхгүй бол null", () => {
    const voices = [voice("en-US"), voice("en-GB", { default: true })];
    expect(pickVoice(voices, "en")?.lang.startsWith("en")).toBe(true);
    expect(pickVoice(voices, "mn")).toBeNull();
  });

  test("Манипури (mni) хоолойг монгол гэж андуурахгүй, жинхэнэ mn хоолойг олно", () => {
    expect(pickVoice([voice("mni-IN")], "mn")).toBeNull();
    expect(pickVoice([voice("en-US"), voice("mn-MN")], "mn")?.lang).toBe("mn-MN");
  });
});

describe("ярих", () => {
  const g = globalThis as Record<string, unknown>;
  afterEach(() => { delete g.window; delete g.SpeechSynthesisUtterance; });

  // Хөтчийн speechSynthesis-ийг дуурайна: юу дараалалд орсныг тэмдэглэнэ
  function fakeBrowser(voices: ReturnType<typeof voice>[]) {
    const log: string[] = [];
    const queued: { text: string; rate: number; onend?: () => void }[] = [];
    g.SpeechSynthesisUtterance = class { rate = 1; voice = null; lang = ""; onend?: () => void; onerror?: () => void; constructor(public text: string) {} };
    g.window = { speechSynthesis: {
      getVoices: () => voices,
      speak: (u: { text: string; rate: number }) => { log.push(`speak:${u.text}`); queued.push(u); },
      cancel: () => log.push("cancel"),
      resume: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
    } };
    return { log, queued };
  }

  test("speechSynthesis байхгүй орчинд (bun, хуучин хөтөч) унахгүй", () => {
    expect(speak(["Hello"], "en")).toBe(0);
    expect(() => stopSpeaking()).not.toThrow();
  });

  test("эхлээд cancel, дараа нь өгүүлбэр бүрийг 0.9 хурдаар дараалалд оруулна", () => {
    const { log, queued } = fakeBrowser([voice("en-US")]);
    let done = false;
    const id = speak(["🚨 A dust storm is here! Dust is hiding the Sun."], "en", () => { done = true; });
    expect(id).toBeGreaterThan(0);
    expect(log).toEqual(["cancel", "speak:A dust storm is here!", "speak:Dust is hiding the Sun."]);
    expect(queued.every((u) => u.rate === 0.9)).toBe(true);
    queued.at(-1)!.onend!(); // сүүлийн өгүүлбэр дуусахад товч 🔊 руу буцна
    expect(done).toBe(true);
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
