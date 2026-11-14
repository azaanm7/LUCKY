import { useT } from "../i18n/context";
import type { Dict } from "../i18n/mn";

// Түр зогсоох цэс ба эх сурвалжийн жагсаалт.
// Нэр нь эх сурвалжийн өөрийнх нь гарчиг (англиар), тайлбар нь i18n-ийн menu.about-д.
const SOURCES: { id: keyof Dict["menu"]["about"]; name: string; url: string }[] = [
  { id: "donki", name: "NASA DONKI", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/" },
  { id: "mars", name: "NASA: Mars facts", url: "https://science.nasa.gov/mars/facts/" },
  { id: "moxie", name: "NASA: Perseverance, MOXIE", url: "https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/" },
  { id: "perseverance", name: "NASA: Perseverance rover", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" },
  { id: "curiosity", name: "NASA: Curiosity rover", url: "https://science.nasa.gov/mission/msl-curiosity/" },
  { id: "rad", name: "Hassler et al., Science 2014: Curiosity RAD", url: "https://doi.org/10.1126/science.1244797" },
  { id: "opportunity", name: "NASA: Opportunity rover", url: "https://science.nasa.gov/mission/mer-opportunity/" },
  { id: "orion", name: "NASA: Orion radiation plan", url: "https://www.nasa.gov/missions/artemis/orion/scientists-and-engineers-evaluate-orion-radiation-protection-plan/" },
  { id: "delay", name: "NASA NTRS: Communication delay", url: "https://ntrs.nasa.gov/citations/20250000703" },
  { id: "water", name: "Space.com: ISS water recycling", url: "https://www.space.com/astronaut-pee-iss-water-recycling-98-percent-milestone" },
];

const CARD = "grid w-full max-w-md gap-3 rounded-3xl bg-space/95 p-5 shadow-2xl";
const BIG = "rounded-2xl bg-mars py-3.5 font-display text-lg text-[#1b0f0a] active:scale-95";
const SMALL = "rounded-2xl bg-panel py-3 font-bold active:scale-95";

// Тоглоомд ашигласан бодит мэдээллийн эх сурвалжууд (эхлэх дэлгэцээс ч нээгддэг тул z-30)
export function Sources({ onClose }: { onClose: () => void }) {
  const t = useT().menu;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-black/60 p-4">
      <div className={CARD}>
        <h2 className="font-display text-xl">{t.sourcesTitle}</h2>
        <p className="text-sm text-orange-100/80">{t.sourcesIntro}</p>
        <ul className="grid gap-2">
          {SOURCES.map(({ id, name, url }) => (
            <li key={url} className="rounded-xl bg-panel p-2.5 text-sm">
              <a href={url} target="_blank" rel="noopener noreferrer" className="font-extrabold text-sky-300 underline">{name} ↗</a>
              <span className="block text-orange-100/80">{t.about[id]}</span>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className={BIG}>{t.close}</button>
      </div>
    </div>
  );
}

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onSources: () => void;
}

export function PauseMenu({ onResume, onRestart, onSources }: PauseMenuProps) {
  const t = useT().menu;
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/55 p-4">
      <div className={`${CARD} text-center`}>
        <div className="text-5xl">⏸️</div>
        <h2 className="font-display text-2xl">{t.paused}</h2>
        <button onClick={onResume} className={BIG}>{t.resume} <span className="text-sm opacity-60">[P]</span></button>
        <button onClick={onSources} className={SMALL}>{t.sourcesTitle}</button>
        <button onClick={onRestart} className={SMALL}>{t.restart}</button>
      </div>
    </div>
  );
}
