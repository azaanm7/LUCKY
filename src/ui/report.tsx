import { report } from "../game/report";
import type { GameState } from "../game/types";
import { plain } from "../i18n/plain";
import { Pix } from "./pix";
import { useT } from "../i18n/context";
import { stepText } from "../i18n/index";

// Тоглоомын төгсгөлд: алдсан зүрх бүрийн шалтгааны гинжийг харуулна
export function FailureReport({ s }: { s: GameState }) {
  const t = useT();
  const findings = report(s);
  if (!findings.length) {
    return <div className="flex items-center gap-2 rounded-2xl bg-panel p-3 text-sm font-bold"><Pix name="star" size={22} />{plain(t.report.perfect)}</div>;
  }
  return (
    <div className="grid gap-2 text-left">
      <b className="text-sm">{plain(t.report.title)}</b>
      {findings.map((f, i) => (
        <div key={i} className="rounded-2xl bg-panel p-3 text-sm">
          <div className="mb-1 text-xs font-extrabold text-mars">
            Sol {f.sol} {Array.from({ length: f.count }, (_, k) => <Pix key={k} name="heart" size={14} className="ml-0.5 grayscale" />)}
          </div>
          <ol className="grid gap-0.5">
            {f.steps.map((step, j) => (
              <li key={j} className="flex gap-1.5">
                <span className="text-white/40">{j === 0 ? "•" : "↓"}</span>
                <span>{plain(stepText(t, step))}</span>
              </li>
            ))}
          </ol>
          <div className="mt-1.5 flex gap-1.5 font-bold text-emerald-300"><Pix name="check" size={16} className="mt-0.5" /><span>{t.report.tips[f.tip]}</span></div>
        </div>
      ))}
    </div>
  );
}
