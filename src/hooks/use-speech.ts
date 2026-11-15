import { useCallback, useEffect, useRef, useState } from "react";
import { hasVoice, onVoicesChanged, speak, stopSpeaking } from "../audio/speech";
import { useT } from "../i18n/context";

// Чангаар уншуулах: сонгосон хэлний хоолой байгаа эсэх, одоо уншиж байгаа эсэх.
// Хэл нь толиос (useT().speech.lang) ирнэ. Хэл солигдох, компонент хаагдахад өөрийн яриагаа зогсооно.
export function useSpeech() {
  const lang = useT().speech.lang;
  const [available, setAvailable] = useState(() => hasVoice(lang));
  const [speaking, setSpeaking] = useState(false);
  const mine = useRef(0); // энэ товчны эхлүүлсэн ярианы дугаар

  // Хоолойнууд хожуу ачаалагддаг тул "voiceschanged" бүрд дахин шалгана
  useEffect(() => {
    const check = () => setAvailable(hasVoice(lang));
    check();
    return onVoicesChanged(check);
  }, [lang]);

  useEffect(() => () => stopSpeaking(mine.current), [lang]);

  const say = useCallback((texts: string[]) => {
    const id = speak(texts, lang, () => setSpeaking(false));
    mine.current = id;
    setSpeaking(id > 0);
  }, [lang]);

  const stop = useCallback(() => {
    stopSpeaking(mine.current);
    setSpeaking(false);
  }, []);

  return { available, speaking, say, stop };
}
