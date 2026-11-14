// Түр зогсоох цэс ба эх сурвалжийн жагсаалт
const SOURCES: [string, string, string][] = [
  ["NASA DONKI", "Нарны дэлбэрэлтийн бодит бүртгэл. Тоглоомын дэлбэрэлт эндээс авагдсан.", "https://ccmc.gsfc.nasa.gov/tools/DONKI/"],
  ["NASA: Mars facts", "Sol-ын урт, мөс, шороон шуурга, соронзон орон.", "https://science.nasa.gov/mars/facts/"],
  ["NASA: Perseverance, MOXIE", "Ангарагийн агаараас хүчилтөрөгч гаргасан туршилт.", "https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/"],
  ["NASA: Perseverance rover", "Дээж цуглуулах, Jezero тогооны эртний нуур ба голын бэлчир.", "https://science.nasa.gov/mission/mars-2020-perseverance/"],
  ["NASA: Curiosity rover", "Gale тогооноос олдсон органик молекул, цацрагийн хэмжилт.", "https://science.nasa.gov/mission/msl-curiosity/"],
  ["NASA: Opportunity rover", "2018 оны шороон шуурга, салхи панелийг цэвэрлэсэн тохиолдлууд.", "https://science.nasa.gov/mission/mer-opportunity/"],
  ["NASA: Orion radiation plan", "Дэлбэрэлтийн үед ачааны цүнхээр хоргодох газар барих.", "https://www.nasa.gov/missions/artemis/orion/scientists-and-engineers-evaluate-orion-radiation-protection-plan/"],
  ["NASA: Astronaut exercise", "Сансрын нисэгчид өдөр бүр дасгал хийдэг шалтгаан.", "https://www.nasa.gov/missions/station/iss-research/astronaut-exercise"],
  ["NASA NTRS: Communication delay", "Дэлхий, Ангарагийн хоорондох холбооны саатал.", "https://ntrs.nasa.gov/citations/20250000703"],
  ["Space.com: ISS water recycling", "Сансрын станц усныхаа 98%-ийг дахин ашигладаг.", "https://www.space.com/astronaut-pee-iss-water-recycling-98-percent-milestone"],
];

const CARD = "grid w-full max-w-md gap-3 rounded-3xl bg-space/95 p-5 shadow-2xl";
const BIG = "rounded-2xl bg-mars py-3.5 font-display text-lg text-[#1b0f0a] active:scale-95";
const SMALL = "rounded-2xl bg-panel py-3 font-bold active:scale-95";

// Тоглоомд ашигласан бодит мэдээллийн эх сурвалжууд
export function Sources({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center overflow-y-auto bg-black/60 p-4">
      <div className={CARD}>
        <h2 className="font-display text-xl">📚 Шинжлэх ухаан ба эх сурвалж</h2>
        <p className="text-sm text-orange-100/80">Тоглоомын баримт, асуудал бүр бодит эх сурвалжтай. Харин зарцуулалт, үйлдвэрлэлийн тоонуудыг тоглоход зориулж тохируулсан: бодит хэмжээ биш.</p>
        <ul className="grid gap-2">
          {SOURCES.map(([name, about, url]) => (
            <li key={url} className="rounded-xl bg-panel p-2.5 text-sm">
              <a href={url} target="_blank" rel="noopener noreferrer" className="font-extrabold text-sky-300 underline">{name} ↗</a>
              <span className="block text-orange-100/80">{about}</span>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className={BIG}>Хаах</button>
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
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/55 p-4">
      <div className={`${CARD} text-center`}>
        <div className="text-5xl">⏸️</div>
        <h2 className="font-display text-2xl">Түр зогслоо</h2>
        <button onClick={onResume} className={BIG}>Үргэлжлүүлэх ▶ <span className="text-sm opacity-60">[P]</span></button>
        <button onClick={onSources} className={SMALL}>📚 Шинжлэх ухаан ба эх сурвалж</button>
        <button onClick={onRestart} className={SMALL}>🔄 Эхнээс нь эхлэх</button>
      </div>
    </div>
  );
}
