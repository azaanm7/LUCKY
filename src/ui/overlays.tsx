import { STARS, TRAINING, WIN_SOL } from "../game/config";
import { starsOf } from "../game/science";
import type { GameState } from "../game/types";
import { solOf } from "../game/world";
import { useT } from "../i18n/context";
import { plain } from "../i18n/plain";
import { PROBLEM_ICON, RECIPE_ICON } from "./icons";
import { Pix } from "./pix";
import { FailureReport } from "./report";

// Үнэлгээ: 1 од = амьд үлдсэн, 2-3 од = шинжлэх ухааны оноо
function Stars({ s }: { s: GameState }) {
  const t = useT().end;
  const stars = starsOf(s);
  const next = STARS.find((n) => s.science < n);
  return (
    <div className="rounded-2xl bg-panel p-3">
      <div className="flex justify-center gap-1">{[0, 1, 2].map((i) => <Pix key={i} name="star" size={44} className={i < stars ? "" : "opacity-25 grayscale"} />)}</div>
      <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold"><Pix name="flask" size={18} />{plain(t.science(s.science))}</p>
      <p className="mt-1 flex items-center justify-center gap-2 text-sm font-extrabold">
        <Pix name="pack" size={18} />{s.collected}
        <Pix name="part" size={18} className="ml-1" />{s.parts}
        {s.built.map((id, i) => <Pix key={i} name={RECIPE_ICON[id]} size={18} />)}
      </p>
      {s.status === "won" && next && <p className="text-xs text-orange-100/70">{plain(t.nextStar(next))}</p>}
    </div>
  );
}

export function EndOverlay({ s, onRestart }: { s: GameState; onRestart: () => void }) {
  const all = useT(), t = all.end;
  const won = s.status === "won";
  const flare = s.solarFlare;
  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <div className="grid w-full max-w-md gap-3 rounded-3xl bg-space/95 p-5 text-center shadow-2xl">
        <Pix name={won ? "rocket" : "heart"} size={64} className={`mx-auto ${won ? "" : "grayscale"}`} />
        <h1 className="font-display text-2xl">{won ? t.won : t.lost}</h1>
        <p className="text-orange-100/85">{won ? t.wonText(WIN_SOL, s.collected) : t.lostText(Math.min(WIN_SOL, solOf(s.time)))}</p>
        <Stars s={s} />
        <FailureReport s={s} />
        <div className="grid gap-2 rounded-2xl bg-panel p-4 text-left">
          <b>{plain(t.badges(s.solved.length, s.deck.length))}</b>
          <p className="text-sm">{plain(t.training(s.trained.length, TRAINING.length))}</p>
          {s.solved.length === 0 && <p className="text-sm text-orange-100/70">{t.noBadges}</p>}
          {s.solved.map((id) => (
            <p key={id} className="flex items-center gap-1.5 text-sm"><Pix name={PROBLEM_ICON[id]} size={18} /><span><b>{all.problems[id].badge}</b> · {all.problems[id].realTitle}</span></p>
          ))}
        </div>
        <div className="rounded-2xl bg-panel p-4 text-left text-sm">
          <b>{plain(t.learnedTitle)}</b> {t.learned}
        </div>
        <div className="rounded-2xl bg-panel p-3 text-left text-sm">
          <b>{t.dose(Math.round(s.dose))}</b>
          <p className="text-xs text-orange-100/70">{t.doseSource}</p>
        </div>
        <p className="text-xs text-orange-100/60">
          {plain(t.donki(flare.date, flare.cls, !!flare.live))}
        </p>
        <button onClick={onRestart} className="rounded-2xl bg-mars py-4 font-display text-xl text-[#1b0f0a] active:scale-95">{t.again}</button>
      </div>
    </div>
  );
}
