import { ModelType } from '../../utils/api';

interface Props {
  value: ModelType;
  onChange: (v: ModelType) => void;
}

const OPTIONS: { id: ModelType; label: string }[] = [
  { id: 'baseline', label: 'TF-IDF' },
  { id: 'groq', label: 'Groq LLM' },
  { id: 'hybrid', label: 'Hybrid' },
];

export function ModelSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Model selection">
      {OPTIONS.map(o => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${value === o.id ? 'bg-brand text-white border-brand' : 'bg-surface text-muted border-border hover:border-clinical-300'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}