import { TabularFeatures } from '../utils/api';

interface Props {
  value: TabularFeatures;
  onChange: (v: TabularFeatures) => void;
}

const FIELDS: {
  key: keyof TabularFeatures;
  label: string;
  min: number;
  max: number;
  step: number;
  placeholder: string;
}[] = [
  { key: 'age', label: 'Age (years)', min: 18, max: 100, step: 1, placeholder: '65' },
  { key: 'hr', label: 'Heart Rate (bpm)', min: 30, max: 200, step: 1, placeholder: '80' },
  { key: 'sbp', label: 'Systolic BP (mmHg)', min: 60, max: 250, step: 1, placeholder: '120' },
  { key: 'dbp', label: 'Diastolic BP (mmHg)', min: 40, max: 150, step: 1, placeholder: '80' },
  { key: 'rr', label: 'Resp. Rate (/min)', min: 8, max: 50, step: 1, placeholder: '16' },
  { key: 'spo2', label: 'SpO₂ (%)', min: 70, max: 100, step: 1, placeholder: '98' },
  { key: 'temp', label: 'Temperature (°F)', min: 95, max: 108, step: 0.1, placeholder: '98.6' },
  { key: 'n_comorbidities', label: 'Comorbidities', min: 0, max: 15, step: 1, placeholder: '2' },
  { key: 'n_meds', label: 'Medications', min: 0, max: 30, step: 1, placeholder: '4' },
  { key: 'prior_admissions', label: 'Prior Admissions', min: 0, max: 20, step: 1, placeholder: '0' },
];

export function TabularInputs({ value, onChange }: Props) {
  const update = (key: keyof TabularFeatures, val: string) => {
    const num = parseFloat(val);
    onChange({ ...value, [key]: isNaN(num) ? undefined : num });
  };

  return (
    <div className="pt-4">
      <p className="text-muted text-xs mb-2.5" id="patient-sex-label">Patient Sex</p>
      <div className="flex gap-2 mb-5" role="radiogroup" aria-labelledby="patient-sex-label">
        {[{ label: 'Male', val: 0 }, { label: 'Female', val: 1 }].map(opt => (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={value.gender === opt.val}
            onClick={() => onChange({ ...value, gender: opt.val })}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${value.gender === opt.val ? 'bg-brand-pale border-brand text-brand' : 'bg-white border-border text-muted'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-muted text-xs mb-2.5">Vitals & Clinical Data</p>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label htmlFor={`tabular-${f.key}`} className="text-gray-700 text-xs font-medium block mb-1">
              {f.label}
            </label>
            <input
              id={`tabular-${f.key}`}
              type="number"
              min={f.min}
              max={f.max}
              step={f.step}
              placeholder={f.placeholder}
              value={value[f.key] ?? ''}
              onChange={e => update(f.key, e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13px] outline-none transition-all duration-150 bg-surface border border-border text-gray-700 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}