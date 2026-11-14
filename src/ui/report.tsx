import { report } from "../game/report";
import type { GameState } from "../game/types";
import { useT } from "../i18n/context";
import { stepText } from "../i18n/index";

// Тоглоомын төгсгөлд: алдсан зүрх бүрийн шалтгааны гинжийг харуулна
export function FailureReport({ s }: { s: GameState }) {
  const t = useT();
  const findings = report(s);
  if (!findings.length) {
    return <div className="rounded-2xl bg-panel p-3 text-sm font-bold">{t.report.perfect}</div>;
  }
  return (
    <div className="grid gap-2 text-left">
      <b className="text-sm">{t.report.title}</b>
      {findings.map((f, i) => (
        <div key={i} className="rounded-2xl bg-panel p-3 text-sm">
          <div className="mb-1 text-xs font-extrabold text-mars">
            Sol {f.sol} · {"💔".repeat(f.count)}
          </div>
          <ol className="grid gap-0.5">
            {f.steps.map((step, j) => (
              <li key={j} className="flex gap-1.5">
                <span className="text-white/40">{j === 0 ? "•" : "↓"}</span>
                <span>{stepText(t, step)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-1.5 font-bold text-emerald-300">👉 {t.report.tips[f.tip]}</div>
        </div>
      ))}
    </div>
  );
}
