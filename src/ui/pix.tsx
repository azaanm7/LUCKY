import { spriteUrl } from "../pixel/pix";
import type { SpriteName } from "../pixel/pix";

interface PixProps {
  name: SpriteName;
  size?: number; // дэлгэц дээрх хэмжээ (пиксел)
  className?: string;
}

// Пиксел дүрс. Тоглоомын бүх дүрс үүгээр гарна (src/pixel/sprites-*.ts).
export function Pix({ name, size = 24, className = "" }: PixProps) {
  return <img src={spriteUrl(name)} width={size} height={size} alt="" draggable={false} className={`inline-block shrink-0 [image-rendering:pixelated] ${className}`} />;
}

// Нарийн зураас: 0-100. danger үед улаан болж анивчина.
export function Meter({ value, color, danger = false, className = "w-16" }: { value: number; color: string; danger?: boolean; className?: string }) {
  return (
    <div className={`h-2.5 overflow-hidden rounded-sm bg-black/55 ring-1 ring-black/60 ${className}`}>
      <div className={`h-full ${danger ? "animate-pulse bg-red-500" : color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
