import type { MouseEvent } from "react";
import { useSpeech } from "../hooks/use-speech";
import { useT } from "../i18n/context";

interface ReadAloudProps {
  texts: string[]; // уншуулах бичвэрүүд (толиос, дарах үеийнх)
  small?: boolean; // HUD-ийн мөрөнд жижиг
  className?: string;
}

// 🔊 товч: дарвал чангаар уншина, уншиж байхад ⏹ болж дахин дарвал зогсоно.
// Төхөөрөмж тухайн хэлний хоолойгүй бол юу ч харуулахгүй. Хэзээ ч өөрөө ярьж эхлэхгүй.
export function ReadAloud({ texts, small = false, className = "" }: ReadAloudProps) {
  const t = useT().speech;
  const { available, speaking, say, stop } = useSpeech();
  if (!available) return null;

  const tap = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.currentTarget.blur(); // Space товч тоглоомын үйлдэл хэвээр үлдэнэ, энэ товчийг дахин дарахгүй
    if (speaking) stop();
    else say(texts);
  };

  return (
    <button type="button" onClick={tap} aria-label={speaking ? t.stop : t.read} title={speaking ? t.stop : t.read} aria-pressed={speaking}
      className={`pointer-events-auto grid shrink-0 place-items-center rounded-full active:scale-90 ${small ? "h-8 w-8 text-sm" : "h-9 w-9 text-base"} ${speaking ? "bg-mars text-[#1b0f0a]" : "bg-black/40"} ${className}`}>
      {speaking ? "⏹" : "🔊"}
    </button>
  );
}
