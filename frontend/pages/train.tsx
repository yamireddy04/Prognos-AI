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
      await api.train({ n_samples: nSamples });
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
      <div style={{ background: '#f8f9fb', minHeight: '100vh' }}>
        <Navbar />

        <div className="page-container py-6">
          <div className="mb-6">
            <h1 style={{ color: '#111827', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Model Training
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
              Train the TF-IDF baseline and hybrid models on synthetic clinical data
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">

              {/* Alerts */}
              {error && (
                <div className="rounded-xl px-4 py-3.5 flex items-start gap-3" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#e11d48' }} />
                  <p style={{ color: '#9f1239', fontSize: 13 }}>{error}</p>
                </div>
              )}
              {message && (
                <div className="rounded-xl px-4 py-3.5 flex items-start gap-3" style={{ background: '#f0fdf4', border: '1px solid #a7f3d0' }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                  <p style={{ color: '#065f46', fontSize: 13 }}>{message}</p>
                </div>
              )}

              {/* Model status */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="section-label mb-1">Current Status</p>
                    <p style={{ color: '#111827', fontWeight: 700, fontSize: 16 }}>Model Availability</p>
                  </div>
                  <button onClick={fetchStatus} className="btn-secondary flex items-center gap-1.5" style={{ fontSize: 12, padding: '6px 12px' }}>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>
                </div>

                {status ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(status).map(([task, s]) => (
                      <div key={task} className="rounded-xl p-4" style={{ background: '#f8f9fb', border: '1px solid #e2e6ec' }}>
                        <p style={{ color: '#374151', fontWeight: 600, fontSize: 13, marginBottom: 10, textTransform: 'capitalize' }}>
                          {TASK_LABELS[task] || task}
                        </p>
                        <div className="space-y-2">
                          {Object.entries(s).map(([model, ready]) => (
                            <div key={model} className="flex items-center justify-between">
                              <span style={{ color: '#6b7280', fontSize: 12.5, textTransform: 'capitalize' }}>{model}</span>
                              <div className="flex items-center gap-1.5">
                                {ready
                                  ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#059669' }} />
                                  : <Circle className="w-3.5 h-3.5" style={{ color: '#d1d5db' }} />}
                                <span style={{ fontSize: 12, color: ready ? '#059669' : '#9aa3b0', fontWeight: 500 }}>
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
                  <div className="flex items-center gap-2 py-4" style={{ color: '#9aa3b0' }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span style={{ fontSize: 13 }}>Checking status...</span>
                  </div>
                )}

                {allTrained && (
                  <div className="mt-4 flex items-center justify-between p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #a7f3d0' }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" style={{ color: '#059669' }} />
                      <span style={{ color: '#065f46', fontSize: 13, fontWeight: 600 }}>All models trained and ready</span>
                    </div>
                    <button onClick={() => router.push('/predict')} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>
                      Go to Predict <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Training config */}
              <div className="card p-5">
                <p className="section-label mb-1">Training Configuration</p>
                <p style={{ color: '#111827', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Train All Models</p>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label style={{ color: '#374151', fontSize: 13, fontWeight: 600 }}>
                      Synthetic samples to generate
                    </label>
                    <span className="tag tag-blue" style={{ fontSize: 12 }}>{nSamples.toLocaleString()} notes</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={5000}
                    step={100}
                    value={nSamples}
                    onChange={e => setNSamples(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: '#1a56db' }}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span style={{ color: '#9aa3b0', fontSize: 11 }}>200 — fast training</span>
                    <span style={{ color: '#9aa3b0', fontSize: 11 }}>5,000 — better accuracy</span>
                  </div>
                </div>

                <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
                  Generates realistic synthetic clinical notes across 5 specialties, then trains baseline (TF-IDF + Logistic Regression) and hybrid (text + vitals fusion) models for all 3 prediction tasks.
                </p>

                <button
                  onClick={handleTrain}
                  disabled={training}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ padding: '10px 24px' }}
                >
                  {training ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Starting training...</>
                  ) : (
                    <>Train All Models (6 total)</>
                  )}
                </button>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <div className="card p-5">
                <p className="section-label mb-4">What Gets Trained</p>
                <div className="space-y-4">
                  {MODEL_DESCRIPTIONS.map(m => (
                    <div key={m.name} className="pb-4" style={{ borderBottom: '1px solid #f0f2f5' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p style={{ color: '#111827', fontWeight: 600, fontSize: 13 }}>{m.name}</p>
                        <span className="tag tag-gray" style={{ fontSize: 11 }}>{m.time}</span>
                      </div>
                      <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.6 }}>{m.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5" style={{ background: '#eff4ff', border: '1px solid #c3d5fc' }}>
                <p style={{ color: '#1a56db', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  💡 Quick Start Tip
                </p>
                <p style={{ color: '#3b5bdb', fontSize: 12.5, lineHeight: 1.6 }}>
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