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
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${value === o.id ? 'bg-accent-blue text-white border-accent-blue' : 'bg-surface-3 text-text-secondary border-border hover:border-border-strong'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}