interface Props { confidence: number; }

export function ConfidenceBar({ confidence }: Props) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#fb7185';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-muted">Confidence</span>
        <span className="text-sm font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}