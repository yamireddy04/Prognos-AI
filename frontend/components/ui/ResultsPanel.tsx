import { PredictionResponse } from '../../utils/api';
import { ProbabilityChart } from '../charts/ProbabilityChart';
import { HighlightedNote } from '../HighlightedNote';
import { TrendingUp, ShieldCheck, Info } from 'lucide-react';

interface Props {
  result: PredictionResponse;
  note: string;
}

function ConfidenceRing({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#e11d48';
  const paleBg = pct >= 75 ? '#f0fdf4' : pct >= 50 ? '#fffbeb' : '#fff1f2';
  const borderColor = pct >= 75 ? '#a7f3d0' : pct >= 50 ? '#fde68a' : '#fecdd3';
  const label = pct >= 75 ? 'High' : pct >= 50 ? 'Moderate' : 'Low';

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#f0f2f5" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="26"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 26}`}
            strokeDashoffset={`${2 * Math.PI * 26 * (1 - confidence)}`}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color, fontWeight: 700, fontSize: 14 }}>{pct}%</span>
        </div>
      </div>
      <div>
        <p style={{ color: '#374151', fontWeight: 600, fontSize: 13 }}>Confidence</p>
        <span className="tag" style={{
          background: paleBg,
          color,
          border: `1px solid ${borderColor}`,
          fontSize: 11,
          marginTop: 4,
          display: 'inline-flex',
        }}>
          {label} confidence
        </span>
      </div>
    </div>
  );
}

export function ResultsPanel({ result, note }: Props) {
  const { explanation, metadata } = result;

  return (
    <div className="space-y-4 animate-in">
      {/* Main prediction card */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="section-label mb-1.5">Prediction Result</p>
            <h2 style={{ color: '#111827', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {result.prediction_label}
            </h2>
            <p style={{ color: '#9aa3b0', fontSize: 12.5, marginTop: 4, textTransform: 'capitalize' }}>
              {result.task.replace('_', ' ')} · {result.model_type}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#eff4ff' }}>
            <ShieldCheck className="w-5 h-5" style={{ color: '#1a56db' }} />
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f0f2f5', paddingTop: 16 }}>
          <ConfidenceRing confidence={result.confidence} />
        </div>
      </div>

      {/* Probabilities */}
      <div className="card p-5">
        <p className="section-label mb-4">Class Probabilities</p>
        <ProbabilityChart
          labels={result.class_labels}
          probabilities={result.probabilities}
          predictionIndex={result.prediction_index}
        />
      </div>

      {/* Reasoning */}
      {explanation?.summary && (
        <div className="card p-5">
          <p className="section-label mb-2.5">Clinical Reasoning</p>
          <p style={{ color: '#374151', fontSize: 13.5, lineHeight: 1.7 }}>{explanation.summary}</p>
        </div>
      )}

      {/* Risk factors */}
      {(explanation?.risk_factors?.length ?? 0) > 0 && (
        <div className="card p-5">
          <p className="section-label mb-3">Risk & Protective Factors</p>
          <div className="space-y-2">
            {explanation!.risk_factors.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ background: '#fff1f2' }}>
                <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#e11d48' }} />
                <span style={{ color: '#374151', fontSize: 12.5 }}>{f}</span>
              </div>
            ))}
          </div>
          {(explanation?.protective_factors?.length ?? 0) > 0 && (
            <div className="mt-2.5 space-y-2">
              {explanation!.protective_factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ background: '#f0fdf4' }}>
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                  <span style={{ color: '#374151', fontSize: 12.5 }}>{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Key phrases */}
      {(explanation?.key_phrases?.length ?? 0) > 0 && (
        <div className="card p-5">
          <p className="section-label mb-3">Key Clinical Phrases</p>
          <div className="flex flex-wrap gap-2">
            {explanation!.key_phrases.slice(0, 8).map((p, i) => {
              const pct = Math.round(p.score * 100);
              const bg = pct > 70 ? '#fff1f2' : pct > 40 ? '#fffbeb' : '#eff4ff';
              const color = pct > 70 ? '#e11d48' : pct > 40 ? '#d97706' : '#1a56db';
              const border = pct > 70 ? '#fecdd3' : pct > 40 ? '#fde68a' : '#c3d5fc';
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: bg, border: `1px solid ${border}` }}
                  title={p.explanation}
                >
                  <span style={{ color: '#374151', fontSize: 12 }}>{p.phrase}</span>
                  <span style={{ color, fontSize: 11, fontWeight: 600 }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Highlighted note */}
      {(explanation?.token_spans?.length ?? 0) > 0 && (
        <div className="card p-5">
          <p className="section-label mb-3">Annotated Clinical Note</p>
          <div className="flex gap-4 mb-3 flex-wrap">
            {[
              { cls: 'highlight-high', label: 'High importance', dot: '#e11d48' },
              { cls: 'highlight-medium', label: 'Medium', dot: '#d97706' },
              { cls: 'highlight-low', label: 'Low', dot: '#1a56db' },
            ].map(({ cls, label, dot }) => (
              <div key={cls} className="flex items-center gap-1.5">
                <span className={`highlight-word ${cls} text-xs px-2`} style={{ fontSize: 11 }}>term</span>
                <span style={{ color: '#9aa3b0', fontSize: 11 }}>{label}</span>
              </div>
            ))}
          </div>
          <div
            className="rounded-xl p-4 max-h-52 overflow-y-auto"
            style={{ background: '#f8f9fb', border: '1px solid #e2e6ec' }}
          >
            <HighlightedNote spans={explanation!.token_spans} />
          </div>
        </div>
      )}
    </div>
  );
}