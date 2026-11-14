import { useMemo } from "react";
import "./landing.css";

export type LandingPhase = "title" | "approach" | "entry" | "close" | "dark" | "open";

// Ангарагийн гадаргуугийн бараан толбо (SVG noise). Зураг файл хэрэггүй.
const MARS_TEXTURE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.011 0.02' numOctaves='5' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.12 0 0 0 0 0.05 0 0 0 1.6 -0.55'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

// Од бүр тогтмол байрлалтай (дахин render хийхэд үсрэхгүй)
function makeStars(n: number) {
  let seed = 42;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length: n }, (_, i) => ({ id: i, x: rnd() * 100, y: rnd() * 100, size: rnd() < 0.15 ? 3 : 1.5, delay: rnd() * 4 }));
}

const BOLTS = [8, 25, 42, 58, 75, 92];

interface CockpitProps {
  phase: LandingPhase;
}

// Хөлгийн цонх: од, Ангараг, шил, агаар мандалд орох галын туяа
export function Cockpit({ phase }: CockpitProps) {
  const stars = useMemo(() => makeStars(90), []);
  const flying = phase === "approach" || phase === "entry" || phase === "close";

  return (
    <div className={`cockpit-wall absolute inset-0 grid place-items-center ${phase === "entry" ? "cockpit-shake" : ""}`}>
      {/* Хананы анивчих гэрлүүд */}
      {["left-[3%] top-[20%]", "left-[3%] top-[70%]", "right-[3%] top-[30%]", "right-[3%] top-[62%]"].map((pos, i) => (
        <span key={pos} className={`panel-light absolute hidden h-10 w-2.5 rounded-full sm:block ${pos}`} style={{ animationDelay: `${i * 0.7}s` }} />
      ))}

      <div className="relative aspect-[3/4] w-[min(88vw,60vh)] sm:aspect-[16/10] sm:w-[min(90vw,1000px,120vh)]">
        {/* Цонхны хүрээ ба боолтууд */}
        <div className="window-frame absolute -inset-4 rounded-[3.2rem] sm:-inset-5" />
        {BOLTS.map((p) => (
          <span key={`t${p}`} className="bolt" style={{ left: `${p}%`, top: "-0.75rem" }} />
        ))}
        {BOLTS.map((p) => (
          <span key={`b${p}`} className="bolt" style={{ left: `${p}%`, bottom: "-0.75rem" }} />
        ))}

        <div className="absolute inset-0 overflow-hidden rounded-[2.6rem] bg-[#02030a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(80,90,180,0.18),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(160,60,90,0.12),transparent_40%)]" />
          <div className={`absolute inset-0 ${flying ? "stars-rush" : ""}`}>
            {stars.map((s) => (
              <span
                key={s.id}
                className="star absolute rounded-full bg-white"
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
              />
            ))}
          </div>

          {/* Ангараг: ойртох тусам томорно */}
          <div className={`mars mars-${phase}`}>
            <div className="mars-spin" style={{ backgroundImage: MARS_TEXTURE }} />
            <div className="mars-cap" />
            <div className="mars-shade" />
          </div>

          {/* Агаар мандалд орох үеийн халалт */}
          <div className={`plasma absolute inset-0 transition-opacity duration-700 ${phase === "entry" || phase === "close" ? "opacity-100" : "opacity-0"}`} />
          <div className="glass absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
