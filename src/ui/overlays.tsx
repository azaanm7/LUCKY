import { WIN_SOL } from "../game/config";
import type { GameState } from "../game/types";
import { solOf } from "../game/world";

const STEPS = [
  ["🕹️", "WASD / сумаар эсвэл джойстикоор алх"],
  ["🧊", "Цэнхэр мөс түүвэл ус болно"],
  ["⭕", "Машины дугуй дээр зогсоод товч дарж асаа/унтраа"],
  ["☢️", "Дэлбэрэлт болохоор хоргодох байр руу гүй!"],
];

export function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/35 p-4">
      <div className="grid w-full max-w-sm gap-4 rounded-3xl bg-space/90 p-6 text-center shadow-2xl backdrop-blur">
        <div className="text-6xl">👩‍🚀</div>
        <h1 className="font-display text-2xl leading-tight">Бяцхан сансрын нисэгч</h1>
        <p className="text-orange-100/85">Ангараг дээрх суурийг {WIN_SOL} өдөр хамгаалж, пуужин иртэл багаа авраарай!</p>
        <ul className="grid gap-2 text-left text-sm font-bold">
          {STEPS.map(([icon, text]) => (
            <li key={text} className="flex items-center gap-3 rounded-xl bg-panel p-2.5"><span className="text-2xl">{icon}</span>{text}</li>
          ))}
        </ul>
        <button onClick={onStart} className="rounded-2xl bg-mars py-4 font-display text-xl text-[#1b0f0a] active:scale-95">Эхлэх! 🚀</button>
      </div>
    </div>
  );
}

export function EndOverlay({ s, onRestart }: { s: GameState; onRestart: () => void }) {
  const won = s.status === "won";
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/50 p-4">
      <div className="grid w-full max-w-sm gap-4 rounded-3xl bg-space/95 p-6 text-center shadow-2xl">
        <div className="text-6xl">{won ? "🚀" : "💔"}</div>
        <h1 className="font-display text-2xl">{won ? "Баяр хүргэе! Багаа авралаа!" : "Энэ удаад бүтсэнгүй"}</h1>
        <p className="text-orange-100/85">{won ? `Чи ${s.collected} мөс түүж, суурийг ${WIN_SOL} өдөр хамгааллаа.` : `Чи ${Math.min(WIN_SOL, solOf(s.time))}-р өдөр хүртэл тэслээ. Дахиад оролдоорой!`}</p>
        <div className="rounded-2xl bg-panel p-4 text-left text-sm">
          <b>🎓 Чи юу сурсан бэ?</b> Эрчим хүч хязгаартай тул бүгдийг зэрэг асааж чадахгүй. Юуг нь түрүүлж хийхээ сонгохыг инженерүүд <b>trade-off</b> гэдэг.
        </div>
        <button onClick={onRestart} className="rounded-2xl bg-mars py-4 font-display text-xl text-[#1b0f0a] active:scale-95">Дахин тоглох</button>
      </div>
    </div>
  );
}
