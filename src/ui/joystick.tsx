import { useRef, useState } from "react";

// Утсан дээр хуруугаараа чирж хөдөлгөх джойстик
export function Joystick({ onMove }: { onMove: (x: number, z: number) => void }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const move = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    setKnob({ x, y });
    onMove(x, y);
  };
  const stop = () => { setKnob({ x: 0, y: 0 }); onMove(0, 0); };

  return (
    <div
      ref={base}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e); }}
      onPointerMove={(e) => e.buttons && move(e)}
      onPointerUp={stop}
      onPointerCancel={stop}
      className="relative h-32 w-32 touch-none rounded-full border-2 border-white/30 bg-black/30 backdrop-blur-sm"
      aria-label="Хөдөлгөх джойстик"
    >
      <div
        className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full bg-white/80 shadow-lg"
        style={{ transform: `translate(calc(-50% + ${knob.x * 36}px), calc(-50% + ${knob.y * 36}px))` }}
      />
    </div>
  );
}
