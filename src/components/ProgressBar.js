import { useId } from "react";

export default function ProgressBar({ percentage = 0, label = "Progression" }) {
  const labelId = useId();
  const numericPercentage = Number(percentage);
  const safeValue = Number.isFinite(numericPercentage)
    ? Math.min(100, Math.max(0, Math.round(numericPercentage)))
    : 0;

  return (
    <div className="w-full" aria-label={label}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span id={labelId} className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
          {label}
        </span>
        <span className="text-sm font-bold text-lime-300">{safeValue}%</span>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={labelId}
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-lime-300 to-emerald-400 transition-[width] duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
