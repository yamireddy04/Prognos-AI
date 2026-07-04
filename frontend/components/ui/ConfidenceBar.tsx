interface Props { confidence: number; }

export function ConfidenceBar({ confidence }: Props) {
  const pct = Math.round(confidence * 100);
  const colorClass = pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400';
  const barColorClass = pct >= 75 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted">Confidence</span>
        <span className={`text-sm font-semibold ${colorClass}`}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-clinical-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${barColorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}