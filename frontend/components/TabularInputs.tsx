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
      <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 10 }}>Patient Sex</p>
      <div className="flex gap-2 mb-5">
        {[{ label: 'Male', val: 0 }, { label: 'Female', val: 1 }].map(opt => (
          <button
            key={opt.label}
            onClick={() => onChange({ ...value, gender: opt.val })}
            className="px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150"
            style={{
              background: value.gender === opt.val ? '#eff4ff' : 'white',
              borderColor: value.gender === opt.val ? '#1a56db' : '#e2e6ec',
              color: value.gender === opt.val ? '#1a56db' : '#6b7280',
              fontSize: 13,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 10 }}>Vitals & Clinical Data</p>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label style={{ color: '#374151', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>
              {f.label}
            </label>
            <input
              type="number"
              min={f.min}
              max={f.max}
              step={f.step}
              placeholder={f.placeholder}
              value={value[f.key] ?? ''}
              onChange={e => update(f.key, e.target.value)}
              className="w-full rounded-lg px-3 py-2 outline-none transition-all duration-150"
              style={{
                background: '#f8f9fb',
                border: '1px solid #e2e6ec',
                color: '#374151',
                fontSize: 13,
              }}
              onFocus={e => { e.target.style.borderColor = '#1a56db'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e6ec'; e.target.style.background = '#f8f9fb'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}