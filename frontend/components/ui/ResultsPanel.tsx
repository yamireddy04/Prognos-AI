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
  const level = pct >= 75 ? 'high' : pct >= 50 ? 'moderate' : 'low';
  const strokeColorClass = level === 'high' ? 'stroke-success' : level === 'moderate' ? 'stroke-warning' : 'stroke-danger';
  const textColorClass = level === 'high' ? 'text-success' : level === 'moderate' ? 'text-warning' : 'text-danger';
  const tagClass = level === 'high' ? 'bg-success-pale text-success border border-emerald-200' : level === 'moderate' ? 'bg-warning-pale text-warning border border-amber-200' : 'bg-danger-pale text-danger border border-rose-200';
  const label = level === 'high' ? 'High' : level === 'moderate' ? 'Moderate' : 'Low';

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" className="stroke-clinical-100" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="26"
            fill="none"
            className={`${strokeColorClass} transition-[stroke-dashoffset] duration-700 ease-out`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 26}`}
            strokeDashoffset={`${2 * Math.PI * 26 * (1 - confidence)}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-sm ${textColorClass}`}>{pct}%</span>
        </div>
      </div>
      <div>
        <p className="text-gray-700 font-semibold text-[13px]">Confidence</p>
        <span className={`tag mt-1 inline-flex text-[11px] ${tagClass}`}>
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
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="section-label mb-1.5">Prediction Result</p>
            <h2 className="text-ink font-bold text-[22px] tracking-tight leading-tight">
              {result.prediction_label}
            </h2>
            <p className="text-clinical-400 text-[12.5px] mt-1 capitalize">
              {result.task.replace('_', ' ')} · {result.model_type}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-pale">
            <ShieldCheck className="w-5 h-5 text-brand" />
          </div>
        </div>
        <div className="border-t border-clinical-100 pt-4">
          <ConfidenceRing confidence={result.confidence} />
        </div>
      </div>

      <div className="card p-5">
        <p className="section-label mb-4">Class Probabilities</p>
        <ProbabilityChart
          labels={result.class_labels}
          probabilities={result.probabilities}
          predictionIndex={result.prediction_index}
        />
      </div>

      {explanation?.summary && (
        <div className="card p-5">
          <p className="section-label mb-2.5">Clinical Reasoning</p>
          <p className="text-gray-700 text-[13.5px] leading-relaxed">{explanation.summary}</p>
        </div>
      )}

      {(explanation?.risk_factors?.length ?? 0) > 0 && (
        <div className="card p-5">
          <p className="section-label mb-3">Risk & Protective Factors</p>
          <div className="space-y-2">
            {explanation!.risk_factors.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-danger-pale">
                <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-danger" aria-hidden="true" />
                <span className="sr-only">Risk factor:</span>
                <span className="text-gray-700 text-[12.5px]">{f}</span>
              </div>
            ))}
          </div>
          {(explanation?.protective_factors?.length ?? 0) > 0 && (
            <div className="mt-2.5 space-y-2">
              {explanation!.protective_factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-success-pale">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-success" aria-hidden="true" />
                  <span className="sr-only">Protective factor:</span>
                  <span className="text-gray-700 text-[12.5px]">{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(explanation?.key_phrases?.length ?? 0) > 0 && (
        <div className="card p-5">
          <p className="section-label mb-3">Key Clinical Phrases</p>
          <div className="flex flex-wrap gap-2">
            {explanation!.key_phrases.slice(0, 8).map((p, i) => {
              const pct = Math.round(p.score * 100);
              const wrapperClass = pct > 70 ? 'bg-danger-pale border-rose-200' : pct > 40 ? 'bg-warning-pale border-amber-200' : 'bg-brand-pale border-brand-border';
              const scoreColorClass = pct > 70 ? 'text-danger' : pct > 40 ? 'text-warning' : 'text-brand';
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${wrapperClass}`}
                  title={p.explanation}
                >
                  <span className="text-gray-700 text-xs">{p.phrase}</span>
                  <span className={`text-[11px] font-semibold ${scoreColorClass}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(explanation?.token_spans?.length ?? 0) > 0 && (
        <div className="card p-5">
          <p className="section-label mb-3">Annotated Clinical Note</p>
          <div className="flex gap-4 mb-3 flex-wrap">
            {[
              { cls: 'highlight-high', label: 'High importance' },
              { cls: 'highlight-medium', label: 'Medium' },
              { cls: 'highlight-low', label: 'Low' },
            ].map(({ cls, label }) => (
              <div key={cls} className="flex items-center gap-1.5">
                <span className={`highlight-word ${cls} text-[11px] px-2`}>term</span>
                <span className="text-clinical-400 text-[11px]">{label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 max-h-52 overflow-y-auto bg-surface border border-border">
            <HighlightedNote spans={explanation!.token_spans} />
          </div>
        </div>
      )}
    </div>
  );
}