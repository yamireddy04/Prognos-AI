import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Loader2, Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { api, Task, ModelType, PredictionResponse, TabularFeatures } from '../utils/api';
import { ResultsPanel } from '../components/ui/ResultsPanel';
import { TabularInputs } from '../components/TabularInputs';
import { Navbar } from '../components/Navbar';

const TASKS: { id: Task; label: string; desc: string; color: string }[] = [
  { id: 'readmission', label: 'Readmission Risk', desc: '30-day readmission', color: '#e11d48' },
  { id: 'los_band', label: 'Length of Stay', desc: 'Short / Medium / Long', color: '#d97706' },
  { id: 'specialty', label: 'Medical Specialty', desc: '5-class classification', color: '#0d9488' },
];

const MODELS: { id: ModelType; label: string; badge: string; note: string }[] = [
  { id: 'groq', label: 'Groq LLM', badge: 'Recommended', note: 'No training needed' },
  { id: 'baseline', label: 'TF-IDF Baseline', badge: 'Fast', note: 'Requires training' },
  { id: 'hybrid', label: 'Hybrid', badge: 'Best Accuracy', note: 'Requires training' },
];

const SPECIALTIES = ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'General Medicine'];

export default function PredictPage() {
  const router = useRouter();
  const [task, setTask] = useState<Task>('readmission');
  const [modelType, setModelType] = useState<ModelType>('groq');
  const [note, setNote] = useState('');
  const [tabular, setTabular] = useState<TabularFeatures>({});
  const [showTabular, setShowTabular] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (router.query.task) setTask(router.query.task as Task);
  }, [router.query.task]);

  const loadSample = async (specialty: string) => {
    setLoadingSample(specialty);
    try {
      const data = await api.sampleNote(specialty);
      setNote(data.note);
      setResult(null);
      setError('');
    } catch {
      setError('Could not load sample. Is the backend running on port 8000?');
    } finally {
      setLoadingSample(null);
    }
  };

  const handlePredict = useCallback(async () => {
    if (!note.trim() || note.trim().length < 20) {
      setError('Please enter a clinical note (minimum 20 characters).');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.predict({
        note,
        task,
        model_type: modelType,
        tabular: Object.keys(tabular).length ? tabular : undefined,
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Prediction failed. Check the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [note, task, modelType, tabular]);

  return (
    <>
      <Head><title>Prediction Console · Prognos AI</title></Head>
      <div style={{ background: '#f8f9fb', minHeight: '100vh' }}>
        <Navbar />

        <div className="page-container py-6">
          {/* Page header */}
          <div className="mb-6">
            <h1 style={{ color: '#111827', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Prediction Console
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
              Analyze clinical discharge notes using AI-powered models
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Left panel */}
            <div className="lg:col-span-3 space-y-4">

              {/* Task selector */}
              <div className="card p-5">
                <p className="section-label mb-4">Prediction Task</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {TASKS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTask(t.id); setResult(null); }}
                      className="p-3.5 rounded-xl border text-left transition-all duration-150"
                      style={{
                        background: task === t.id ? '#eff4ff' : 'white',
                        borderColor: task === t.id ? '#1a56db' : '#e2e6ec',
                        boxShadow: task === t.id ? '0 0 0 2px rgba(26,86,219,0.12)' : 'none',
                      }}
                    >
                      <p style={{ color: task === t.id ? '#1a56db' : '#111827', fontWeight: 600, fontSize: 13 }}>
                        {t.label}
                      </p>
                      <p style={{ color: task === t.id ? '#3b72f6' : '#9aa3b0', fontSize: 11.5, marginTop: 2 }}>
                        {t.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model selector */}
              <div className="card p-5">
                <p className="section-label mb-4">Model Selection</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setModelType(m.id); setResult(null); }}
                      className="p-3.5 rounded-xl border text-left transition-all duration-150"
                      style={{
                        background: modelType === m.id ? '#eff4ff' : 'white',
                        borderColor: modelType === m.id ? '#1a56db' : '#e2e6ec',
                        boxShadow: modelType === m.id ? '0 0 0 2px rgba(26,86,219,0.12)' : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p style={{ color: modelType === m.id ? '#1a56db' : '#111827', fontWeight: 600, fontSize: 13 }}>
                          {m.label}
                        </p>
                        <span className="tag" style={{
                          fontSize: 10,
                          padding: '2px 7px',
                          background: modelType === m.id ? '#1a56db' : '#f0f2f5',
                          color: modelType === m.id ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: 999,
                        }}>
                          {m.badge}
                        </span>
                      </div>
                      <p style={{ color: '#9aa3b0', fontSize: 11.5 }}>{m.note}</p>
                    </button>
                  ))}
                </div>
                {(modelType === 'baseline' || modelType === 'hybrid') && (
                  <div className="flex items-center gap-2 mt-3 p-3 rounded-lg" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#d97706' }} />
                    <p style={{ color: '#92400e', fontSize: 12 }}>
                      This model requires training. Go to the <button onClick={() => router.push('/train')} style={{ color: '#d97706', fontWeight: 600, textDecoration: 'underline' }}>Train page</button> first.
                    </p>
                  </div>
                )}
              </div>

              {/* Note input */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="section-label">Clinical Note</p>
                  <span style={{ color: '#9aa3b0', fontSize: 12 }}>{note.length} characters</span>
                </div>

                <div className="mb-4">
                  <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Load a sample note:</p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(s => (
                      <button
                        key={s}
                        onClick={() => loadSample(s)}
                        disabled={loadingSample !== null}
                        className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
                        style={{ fontSize: 12 }}
                      >
                        {loadingSample === s ? (
                          <><Loader2 className="w-3 h-3 animate-spin" />{s}</>
                        ) : s}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={note}
                  onChange={e => { setNote(e.target.value); setResult(null); setError(''); }}
                  placeholder="Paste a clinical discharge note here, or click a specialty button above to load a realistic synthetic example..."
                  className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-150 resize-none"
                  style={{
                    height: 220,
                    background: '#f8f9fb',
                    border: '1.5px solid #e2e6ec',
                    color: '#374151',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12.5,
                    lineHeight: 1.7,
                  }}
                  onFocus={e => { e.target.style.borderColor = '#1a56db'; e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,0.08)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e6ec'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8f9fb'; }}
                />
              </div>

              {/* Structured inputs */}
              <div className="card overflow-hidden">
                <button
                  onClick={() => setShowTabular(!showTabular)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors"
                  style={{ background: 'white' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  <div>
                    <p style={{ color: '#374151', fontWeight: 600, fontSize: 13 }}>Structured Inputs</p>
                    <p style={{ color: '#9aa3b0', fontSize: 12, marginTop: 1 }}>
                      Optional vitals & demographics — used by the Hybrid model
                    </p>
                  </div>
                  {showTabular
                    ? <ChevronUp className="w-4 h-4" style={{ color: '#9aa3b0' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: '#9aa3b0' }} />}
                </button>
                {showTabular && (
                  <div className="px-5 pb-5" style={{ borderTop: '1px solid #e2e6ec' }}>
                    <TabularInputs value={tabular} onChange={setTabular} />
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#e11d48' }} />
                  <p style={{ color: '#9f1239', fontSize: 13 }}>{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handlePredict}
                disabled={loading || !note.trim()}
                className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: 12 }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Analyzing clinical note...</>
                ) : (
                  <><Sparkles className="w-4 h-4" />Run Prediction</>
                )}
              </button>
            </div>

            {/* Right panel — results */}
            <div className="lg:col-span-2">
              {result ? (
                <ResultsPanel result={result} note={note} />
              ) : (
                <div className="card p-8 flex flex-col items-center justify-center text-center min-h-72">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f0f2f5' }}>
                    <Sparkles className="w-6 h-6" style={{ color: '#9aa3b0' }} />
                  </div>
                  <p style={{ color: '#374151', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>No prediction yet</p>
                  <p style={{ color: '#9aa3b0', fontSize: 13, lineHeight: 1.6 }}>
                    Load a sample note or paste your own, then click Run Prediction
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}