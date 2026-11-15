/** Barra de progreso con su porcentaje al lado. `value` va de 0 a 100. */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
        className="h-3 w-full min-w-24 overflow-hidden rounded-full bg-ink-100"
      >
        <div className="h-full rounded-full bg-spike-500" style={{ width: `${safe}%` }} />
      </div>
      <span className="w-11 shrink-0 text-right text-sm font-extrabold tabular-nums text-ink-800">
        {safe}%
      </span>
    </div>
  );
}
