import { Task } from '../../utils/api';

interface Props {
  value: Task;
  onChange: (v: Task) => void;
}

const OPTIONS: { id: Task; label: string }[] = [
  { id: 'readmission', label: 'Readmission' },
  { id: 'los_band', label: 'Length of Stay' },
  { id: 'specialty', label: 'Specialty' },
];

export function TaskSelector({ value, onChange }: Props) {
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