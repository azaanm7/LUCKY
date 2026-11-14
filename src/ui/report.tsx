import { report } from "../game/report";
import type { GameState } from "../game/types";

// Тоглоомын төгсгөлд: алдсан зүрх бүрийн шалтгааны гинжийг харуулна
export function FailureReport({ s }: { s: GameState }) {
  const findings = report(s);
  if (!findings.length) {
    return <div className="rounded-2xl bg-panel p-3 text-sm font-bold">🏅 Нэг ч зүрх алдсангүй. Төгс удирдлаа!</div>;
  }
  return (
    <div className="grid gap-2 text-left">
      <b className="text-sm">🔎 Юу болсон бэ?</b>
      {findings.map((f, i) => (
        <div key={i} className="rounded-2xl bg-panel p-3 text-sm">
          <div className="mb-1 text-xs font-extrabold text-mars">
            Sol {f.sol} · {"💔".repeat(f.count)}
          </div>
          <ol className="grid gap-0.5">
            {f.steps.map((step, j) => (
              <li key={step} className="flex gap-1.5">
                <span className="text-white/40">{j === 0 ? "•" : "↓"}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-1.5 font-bold text-emerald-300">👉 {f.tip}</div>
        </div>
      ))}
    </div>
  );
}
