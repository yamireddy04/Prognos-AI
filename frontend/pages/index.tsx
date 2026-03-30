import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Activity, ArrowRight, Brain, BarChart2, Shield, Layers, ChevronRight, Zap, FileText, TrendingUp, Users } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { api, ModelStatus } from '../utils/api';

const STATS = [
  { value: '3', label: 'Prediction Tasks', icon: BarChart2 },
  { value: '3', label: 'Model Architectures', icon: Brain },
  { value: '100%', label: 'Explainable Output', icon: Shield },
  { value: 'Real-time', label: 'Groq-Powered', icon: Zap },
];

const TASKS = [
  { id: 'readmission', label: 'Readmission Risk', desc: 'Predict 30-day hospital readmission probability from discharge notes with risk factor extraction.', color: '#e11d48', paleBg: '#fff1f2', borderColor: '#fecdd3', icon: TrendingUp },
  { id: 'los_band', label: 'Length of Stay', desc: 'Classify expected hospital stay into short, medium, or long bands based on clinical complexity.', color: '#d97706', paleBg: '#fffbeb', borderColor: '#fde68a', icon: BarChart2 },
  { id: 'specialty', label: 'Medical Specialty', desc: 'Automatically identify the clinical specialty from free-text discharge summaries.', color: '#0d9488', paleBg: '#f0fdfa', borderColor: '#99f6e4', icon: Users },
];

const MODELS = [
  { name: 'Groq LLM', sub: 'LLaMA-3 70B', desc: 'State-of-the-art language model analyzes clinical text with deep medical reasoning and structured JSON output.', badge: 'Recommended', badgeStyle: { background: '#eff4ff', color: '#1a56db', border: '1px solid #c3d5fc' } },
  { name: 'TF-IDF Baseline', sub: 'Logistic Regression', desc: 'Fast, interpretable model using 20k TF-IDF features with trigrams. Trains in under 60 seconds on synthetic data.', badge: 'Offline', badgeStyle: { background: '#f0fdf4', color: '#059669', border: '1px solid #a7f3d0' } },
  { name: 'Hybrid Model', sub: 'Text + Vitals Fusion', desc: 'Combines TF-IDF text embeddings with 18 engineered clinical features for maximum predictive accuracy.', badge: 'Best Accuracy', badgeStyle: { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' } },
];

const FEATURES = [
  { icon: Brain, title: 'Clinical NLP', desc: 'Purpose-built prompts extract structured predictions from unstructured discharge summaries.' },
  { icon: Shield, title: 'Explainable AI', desc: 'Every prediction surfaces key phrases, risk factors, and confidence scores — not black-box outputs.' },
  { icon: Layers, title: 'Multi-Model', desc: 'Switch between Groq LLM, TF-IDF baseline, and hybrid fusion to compare architectures.' },
  { icon: FileText, title: 'Synthetic Data', desc: 'Realistic clinical note generator covers 5 specialties with templated discharge summaries.' },
];

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<ModelStatus | null>(null);

  useEffect(() => {
    api.health().then(r => setStatus(r.model_status)).catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>Prognos AI — Clinical Outcome Prediction System</title>
        <meta name="description" content="ML-powered clinical note analysis for readmission, length of stay, and specialty prediction." />
      </Head>
      <div style={{ background: '#f8f9fb', minHeight: '100vh' }}>
        <Navbar />

        <section style={{ background: 'white', borderBottom: '1px solid #e2e6ec' }}>
          <div className="page-container py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 style={{ fontFamily: 'Instrument Serif', fontWeight: 400, fontSize: 'clamp(34px,4.5vw,54px)', color: '#111827', lineHeight: 1.15, letterSpacing: '-0.02em' }} className="mb-5">
                  Clinical Intelligence<br /><em style={{ color: '#1a56db' }}>at the Speed of Thought</em>
                </h1>
                <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.75, maxWidth: 480 }} className="mb-8">
                  Paste a discharge summary. Get instant readmission risk, length-of-stay predictions, or specialty classification — with explainable AI highlighting the clinical phrases that matter.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => router.push('/predict')} className="btn-primary px-6 py-3 text-base">
                    Open Prediction Console <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div style={{
                  width: '100%', aspectRatio: '4/3', borderRadius: 20, overflow: 'hidden',
                  border: '1px solid #e2e6ec', boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg,#eff4ff 0%,#f0fdf4 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                }}>
                  {/* ↓ swap this block for your <img> tag once you have an image */}
                  <img src="/clinical.jpeg"
                  alt="Clinical NLP Dashboard"
                  style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
            />
                </div>
              </div>

            </div>
          </div>
        </section>
        <section style={{ background: '#1a56db' }}>
          <div className="page-container py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <s.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <div>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: 20, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="page-container py-14">
          <p className="section-label mb-2">Prediction Tasks</p>
          <h2 style={{ color: '#111827', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Three clinical outcomes, one interface</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TASKS.map(t => (
              <button key={t.id} onClick={() => router.push(`/predict?task=${t.id}`)} className="card p-6 text-left hover:shadow-md transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: t.paleBg, border: `1px solid ${t.borderColor}` }}>
                  <t.icon className="w-5 h-5" style={{ color: t.color }} />
                </div>
                <h3 style={{ color: '#111827', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{t.label}</h3>
                <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>{t.desc}</p>
                <div className="flex items-center gap-1 mt-4" style={{ color: '#1a56db', fontSize: 13, fontWeight: 500 }}>
                  <span>Try this task</span><ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>
        <section style={{ background: 'white', borderTop: '1px solid #e2e6ec', borderBottom: '1px solid #e2e6ec' }}>
          <div className="page-container py-14">
            <p className="section-label mb-2">Model Architectures</p>
            <h2 style={{ color: '#111827', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Choose the right model for every scenario</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {MODELS.map(m => (
                <div key={m.name} className="card-flat p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p style={{ color: '#111827', fontWeight: 700, fontSize: 15 }}>{m.name}</p>
                      <p style={{ color: '#9aa3b0', fontSize: 12, marginTop: 2 }}>{m.sub}</p>
                    </div>
                    <span className="tag" style={m.badgeStyle}>{m.badge}</span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="page-container py-14">
          <p className="section-label mb-2">Platform Capabilities</p>
          <h2 style={{ color: '#111827', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>Built for clinical-grade analysis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: '#eff4ff' }}>
                  <f.icon style={{ color: '#1a56db', width: 18, height: 18 }} />
                </div>
                <p style={{ color: '#111827', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{f.title}</p>
                <p style={{ color: '#6b7280', fontSize: 12.5, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
        {status && (
          <section style={{ background: 'white', borderTop: '1px solid #e2e6ec', borderBottom: '1px solid #e2e6ec' }}>
            <div className="page-container py-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="section-label mb-1">Live Status</p>
                  <h2 style={{ color: '#111827', fontSize: 20, fontWeight: 700 }}>Model Availability</h2>
                </div>
                <button onClick={() => router.push('/train')} className="btn-secondary text-sm">Manage Models</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(status).map(([task, s]) => (
                  <div key={task} className="card-flat p-5">
                    <p style={{ color: '#374151', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', marginBottom: 12 }}>{task.replace('_', ' ')}</p>
                    <div className="space-y-2">
                      {Object.entries(s).map(([model, ready]) => (
                        <div key={model} className="flex items-center justify-between">
                          <span style={{ color: '#6b7280', fontSize: 13, textTransform: 'capitalize' }}>{model}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: ready ? '#059669' : '#d1d5db' }} />
                            <span style={{ fontSize: 12, color: ready ? '#059669' : '#9aa3b0', fontWeight: 500 }}>{ready ? 'Ready' : 'Untrained'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        <section style={{ background: '#111827' }}>
          <div className="page-container py-14 text-center">
            <h2 style={{ fontFamily: 'Instrument Serif', color: 'white', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, marginBottom: 12 }}>Ready to analyze clinical notes?</h2>
            <button onClick={() => router.push('/predict')} className="btn-primary px-8 py-3.5 text-base">
              Open Prediction Console <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}