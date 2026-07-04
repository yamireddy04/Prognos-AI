import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Loader2, CheckCircle2, Circle, RefreshCw, Info, ArrowRight } from 'lucide-react';
import { api, ModelStatus } from '../utils/api';
import { Navbar } from '../components/Navbar';

const TASK_LABELS: Record<string, string> = {
  readmission: 'Readmission Risk',
  los_band: 'Length of Stay',
  specialty: 'Medical Specialty',
};

const MODEL_DESCRIPTIONS = [
  {
    name: 'Baseline (×3 tasks)',
    detail: 'TF-IDF (20k features, trigrams) + Logistic Regression with class balancing',
    time: '~20 sec',
  },
  {
    name: 'Hybrid (×3 tasks)',
    detail: 'TF-IDF (15k features) fused with 18 engineered vitals/demographic features via sparse hstack',
    time: '~30 sec',
  },
  {
    name: 'Groq LLM',
    detail: 'LLaMA-3 70B via Groq API — no training required, ready immediately',
    time: 'Always ready',
  },
];

export default function TrainPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [training, setTraining] = useState(false);
  const [nSamples, setNSamples] = useState(1200);
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await api.health();
      setStatus(data.model_status);
    } catch {
      setError('Cannot reach backend. Make sure uvicorn is running on port 8000.');
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(() => {
      fetchStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [polling]);

  const handleTrain = async () => {
    setTraining(true);
    setMessage('');
    setError('');
    try {
      await api.train({ n_samples: nSamples, force_regenerate: forceRegenerate });
      setMessage('Training started in background. This page auto-updates every 3 seconds.');
      setPolling(true);
    } catch (e: any) {
      setError(e.message || 'Training request failed.');
    } finally {
      setTraining(false);
    }
  };

  const allTrained = status && Object.values(status).every(s => s.baseline && s.hybrid);

  return (
    <>
      <Head><title>Train Models · Prognos AI</title></Head>
      <div className="bg-surface min-h-screen">
        <Navbar />

        <div className="page-container py-6">
          <div className="mb-6">
            <h1 className="page-title">
              Model Training
            </h1>
            <p className="page-subtitle">
              Train the TF-IDF baseline and hybrid models on synthetic clinical data
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">

              {error && (
                <div className="rounded-xl px-4 py-3.5 flex items-start gap-3 bg-danger-pale border border-rose-200" role="alert">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
                  <p className="text-rose-800 text-[13px]">{error}</p>
                </div>
              )}
              {message && (
                <div className="rounded-xl px-4 py-3.5 flex items-start gap-3 bg-success-pale border border-emerald-200" role="status">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
                  <p className="text-emerald-800 text-[13px]">{message}</p>
                </div>
              )}

              <div className="card p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="section-label mb-1">Current Status</p>
                    <p className="card-heading">Model Availability</p>
                  </div>
                  <button onClick={fetchStatus} className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>
                </div>

                {status ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(status).map(([task, s]) => (
                      <div key={task} className="rounded-xl p-4 bg-surface border border-border">
                        <p className="text-gray-700 font-semibold text-[13px] mb-2.5 capitalize">
                          {TASK_LABELS[task] || task}
                        </p>
                        <div className="space-y-2">
                          {Object.entries(s).map(([model, ready]) => (
                            <div key={model} className="flex items-center justify-between">
                              <span className="text-muted text-[12.5px] capitalize">{model}</span>
                              <div className="status-badge" role="status" aria-label={ready ? `${model} model is ready` : `${model} model is untrained`}>
                                {ready
                                  ? <CheckCircle2 className="w-3.5 h-3.5 text-success" aria-hidden="true" />
                                  : <Circle className="w-3.5 h-3.5 text-gray-300" aria-hidden="true" />}
                                <span className={ready ? 'status-text-ready' : 'status-text-pending'}>
                                  {ready ? 'Ready' : 'Untrained'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-4 text-clinical-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[13px]">Checking status...</span>
                  </div>
                )}

                {allTrained && (
                  <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-success-pale border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-emerald-800 text-[13px] font-semibold">All models trained and ready</span>
                    </div>
                    <button onClick={() => router.push('/predict')} className="btn-primary text-xs px-3.5 py-1.5">
                      Go to Predict <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="card p-5">
                <p className="section-label mb-1">Training Configuration</p>
                <p className="card-heading mb-4">Train All Models</p>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="n-samples-slider" className="text-gray-700 text-[13px] font-semibold">
                      Synthetic samples to generate
                    </label>
                    <span className="tag tag-blue text-xs">{nSamples.toLocaleString()} notes</span>
                  </div>
                  <input
                    id="n-samples-slider"
                    type="range"
                    min={200}
                    max={5000}
                    step={100}
                    value={nSamples}
                    onChange={e => setNSamples(Number(e.target.value))}
                    className="w-full accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-lg"
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-clinical-400 text-[11px]">200 — fast training</span>
                    <span className="text-clinical-400 text-[11px]">5,000 — better accuracy</span>
                  </div>
                </div>

                <div className="mb-5 flex items-center gap-2">
                  <input
                    id="force-regenerate"
                    type="checkbox"
                    checked={forceRegenerate}
                    onChange={e => setForceRegenerate(e.target.checked)}
                    className="accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
                  />
                  <label htmlFor="force-regenerate" className="text-gray-700 text-[13px]">
                    Regenerate dataset even if a cached one exists
                  </label>
                </div>

                <p className="text-muted text-[13px] leading-relaxed mb-4">
                  Generates realistic synthetic clinical notes across 5 specialties, then trains baseline (TF-IDF + Logistic Regression) and hybrid (text + vitals fusion) models for all 3 prediction tasks. If a dataset already exists with a different sample count, it will be regenerated automatically. Use the checkbox to force regeneration even when the count matches.
                </p>

                <button
                  onClick={handleTrain}
                  disabled={training}
                  className="btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {training ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Starting training...</>
                  ) : (
                    <>Train All Models (6 total)</>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card p-5">
                <p className="section-label mb-4">What Gets Trained</p>
                <div className="space-y-4">
                  {MODEL_DESCRIPTIONS.map(m => (
                    <div key={m.name} className="pb-4 border-b border-clinical-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-ink font-semibold text-[13px]">{m.name}</p>
                        <span className="tag tag-gray text-[11px]">{m.time}</span>
                      </div>
                      <p className="text-muted text-xs leading-relaxed">{m.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 bg-brand-pale border border-brand-border">
                <p className="text-brand font-bold text-[13px] mb-1.5">
                  <span aria-hidden="true">💡</span> Quick Start Tip
                </p>
                <p className="text-brand-light text-[12.5px] leading-relaxed">
                  The Groq model works immediately without any training. Use Baseline or Hybrid only if you want to compare offline ML models or need faster predictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}