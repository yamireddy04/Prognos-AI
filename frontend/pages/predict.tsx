import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Loader2, Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { api, Task, ModelType, PredictionResponse, TabularFeatures } from '../utils/api';
import { ResultsPanel } from '../components/ui/ResultsPanel';
import { TabularInputs } from '../components/TabularInputs';
import { Navbar } from '../components/Navbar';

const TASKS: { id: Task; label: string; desc: string }[] = [
  { id: 'readmission', label: 'Readmission Risk', desc: '30-day readmission' },
  { id: 'los_band', label: 'Length of Stay', desc: 'Short / Medium / Long' },
  { id: 'specialty', label: 'Medical Specialty', desc: '5-class classification' },
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
  const [explainMethod, setExplainMethod] = useState<'tfidf' | 'shap'>('tfidf');
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
        explain_method: explainMethod,
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Prediction failed. Check the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [note, task, modelType, tabular, explainMethod]);

  return (
    <>
      <Head><title>Prediction Console · Prognos AI</title></Head>
      <div className="bg-surface min-h-screen">
        <Navbar />

        <div className="page-container py-6">
          <div className="mb-6">
            <h1 className="page-title">
              Prediction Console
            </h1>
            <p className="page-subtitle">
              Analyze clinical discharge notes using AI-powered models
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 space-y-4">

              <div className="card p-5">
                <p className="section-label mb-4" id="task-selector-label">Prediction Task</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-labelledby="task-selector-label">
                  {TASKS.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={task === t.id}
                      onClick={() => { setTask(t.id); setResult(null); }}
                      className={`selectable-card ${task === t.id ? 'selectable-card-active' : 'selectable-card-inactive'}`}
                    >
                      <p className={`font-semibold text-[13px] ${task === t.id ? 'text-brand' : 'text-ink'}`}>
                        {t.label}
                      </p>
                      <p className={`text-[11.5px] mt-0.5 ${task === t.id ? 'text-brand-light' : 'text-clinical-400'}`}>
                        {t.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <p className="section-label mb-4" id="model-selector-label">Model Selection</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-labelledby="model-selector-label">
                  {MODELS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={modelType === m.id}
                      onClick={() => { setModelType(m.id); setResult(null); }}
                      className={`selectable-card ${modelType === m.id ? 'selectable-card-active' : 'selectable-card-inactive'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold text-[13px] ${modelType === m.id ? 'text-brand' : 'text-ink'}`}>
                          {m.label}
                        </p>
                        <span className={`tag !px-1.5 !py-0.5 text-[10px] rounded-full border-none ${modelType === m.id ? 'bg-brand text-white' : 'bg-clinical-100 text-muted'}`}>
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-clinical-400 text-[11.5px]">{m.note}</p>
                    </button>
                  ))}
                </div>
                {(modelType === 'baseline' || modelType === 'hybrid') && (
                  <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-warning-pale border border-amber-200">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 text-warning" />
                    <p className="text-amber-800 text-xs">
                      This model requires training. Go to the <button onClick={() => router.push('/train')} className="text-warning font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm">Train page</button> first.
                    </p>
                  </div>
                )}
                {(modelType === 'baseline' || modelType === 'hybrid') && (
                  <div className="mt-3">
                    <p className="text-muted text-xs mb-2" id="explain-method-label">Explanation method</p>
                    <div className="flex rounded-xl overflow-hidden border-[1.5px] border-border" role="radiogroup" aria-labelledby="explain-method-label">
                      {([
                        { id: 'tfidf', label: 'TF-IDF weights' },
                        { id: 'shap', label: 'SHAP values' },
                      ] as { id: 'tfidf' | 'shap'; label: string }[]).map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={explainMethod === opt.id}
                          onClick={() => { setExplainMethod(opt.id); setResult(null); }}
                          className={`flex-1 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${explainMethod === opt.id ? 'bg-brand text-white' : 'bg-white text-muted'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="section-label">Clinical Note</p>
                  <span className="text-clinical-400 text-xs">{note.length} characters</span>
                </div>

                <div className="mb-4">
                  <p className="text-muted text-xs mb-2">Load a sample note:</p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(s => (
                      <button
                        key={s}
                        onClick={() => loadSample(s)}
                        disabled={loadingSample !== null}
                        className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
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
                  className="w-full h-[220px] rounded-xl px-4 py-3.5 text-[12.5px] leading-relaxed font-mono outline-none transition-all duration-150 resize-none bg-surface border-[1.5px] border-border text-gray-700 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                />
              </div>

              <div className="card overflow-hidden">
                <button
                  onClick={() => setShowTabular(!showTabular)}
                  aria-expanded={showTabular}
                  className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors bg-white hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <div>
                    <p className="text-gray-700 font-semibold text-[13px]">Structured Inputs</p>
                    <p className="text-clinical-400 text-xs mt-0.5">
                      Optional vitals & demographics — used by the Hybrid model
                    </p>
                  </div>
                  {showTabular
                    ? <ChevronUp className="w-4 h-4 text-clinical-400" />
                    : <ChevronDown className="w-4 h-4 text-clinical-400" />}
                </button>
                {showTabular && (
                  <div className="px-5 pb-5 border-t border-border">
                    <TabularInputs value={tabular} onChange={setTabular} />
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 flex items-start gap-2 bg-danger-pale border border-rose-200" role="alert">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
                  <p className="text-rose-800 text-[13px]">{error}</p>
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={loading || !note.trim()}
                className="btn-primary w-full py-3.5 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Analyzing clinical note...</>
                ) : (
                  <><Sparkles className="w-4 h-4" />Run Prediction</>
                )}
              </button>
            </div>

            <div className="lg:col-span-2">
              {result ? (
                <ResultsPanel result={result} note={note} />
              ) : (
                <div className="card p-8 flex flex-col items-center justify-center text-center min-h-72">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-clinical-100">
                    <Sparkles className="w-6 h-6 text-clinical-400" />
                  </div>
                  <p className="text-gray-700 font-semibold text-sm mb-1.5">No prediction yet</p>
                  <p className="text-clinical-400 text-[13px] leading-relaxed">
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