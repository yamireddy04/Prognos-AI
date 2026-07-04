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
  { id: 'readmission', label: 'Readmission Risk', desc: 'Predict 30-day hospital readmission probability from discharge notes with risk factor extraction.', iconClass: 'text-danger', paleBgClass: 'bg-danger-pale', borderClass: 'border-rose-200', icon: TrendingUp },
  { id: 'los_band', label: 'Length of Stay', desc: 'Classify expected hospital stay into short, medium, or long bands based on clinical complexity.', iconClass: 'text-warning', paleBgClass: 'bg-warning-pale', borderClass: 'border-amber-200', icon: BarChart2 },
  { id: 'specialty', label: 'Medical Specialty', desc: 'Automatically identify the clinical specialty from free-text discharge summaries.', iconClass: 'text-teal', paleBgClass: 'bg-teal-pale', borderClass: 'border-teal-200', icon: Users },
];

const MODELS = [
  { name: 'Groq LLM', sub: 'LLaMA-3 70B', desc: 'State-of-the-art language model analyzes clinical text with deep medical reasoning and structured JSON output.', badge: 'Recommended', badgeClass: 'bg-brand-pale text-brand border border-brand-border' },
  { name: 'TF-IDF Baseline', sub: 'Logistic Regression', desc: 'Fast, interpretable model using 20k TF-IDF features with trigrams. Trains in under 60 seconds on synthetic data.', badge: 'Offline', badgeClass: 'bg-success-pale text-success border border-emerald-200' },
  { name: 'Hybrid Model', sub: 'Text + Vitals Fusion', desc: 'Combines TF-IDF text embeddings with 18 engineered clinical features for maximum predictive accuracy.', badge: 'Best Accuracy', badgeClass: 'bg-warning-pale text-warning border border-amber-200' },
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
      <div className="bg-surface min-h-screen">
        <Navbar />

        <section className="bg-white border-b border-border">
          <div className="page-container py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="hero-title mb-5">
                  Clinical Intelligence<br /><em className="text-brand not-italic">at the Speed of Thought</em>
                </h1>
                <p className="text-muted text-base leading-relaxed max-w-[480px] mb-8">
                  Paste a discharge summary. Get instant readmission risk, length-of-stay predictions, or specialty classification — with explainable AI highlighting the clinical phrases that matter.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => router.push('/predict')} className="btn-primary px-6 py-3 text-base">
                    Open Prediction Console <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-full aspect-[4/3] rounded-[20px] overflow-hidden border border-border shadow-xl bg-gradient-to-br from-brand-pale to-success-pale flex items-center justify-center relative">
                  <img
                    src="/clinical.jpeg"
                    alt="Clinical NLP Dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
        <section className="bg-brand">
          <div className="page-container py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <s.icon className="w-5 h-5 flex-shrink-0 text-white/70" />
                  <div>
                    <p className="text-white font-bold text-xl leading-none">{s.value}</p>
                    <p className="text-white/65 text-xs mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="page-container py-14">
          <p className="section-label mb-2">Prediction Tasks</p>
          <h2 className="section-heading">Three clinical outcomes, one interface</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TASKS.map(t => (
              <button
                key={t.id}
                onClick={() => router.push(`/predict?task=${t.id}`)}
                className="card p-6 text-left hover:shadow-md transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${t.paleBgClass} ${t.borderClass}`}>
                  <t.icon className={`w-5 h-5 ${t.iconClass}`} />
                </div>
                <h3 className="text-ink font-semibold text-sm mb-2">{t.label}</h3>
                <p className="text-muted text-[13px] leading-relaxed">{t.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-brand text-[13px] font-medium">
                  <span>Try this task</span><ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="bg-white border-t border-b border-border">
          <div className="page-container py-14">
            <p className="section-label mb-2">Model Architectures</p>
            <h2 className="section-heading">Choose the right model for every scenario</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {MODELS.map(m => (
                <div key={m.name} className="card-flat p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-ink font-bold text-sm">{m.name}</p>
                      <p className="text-clinical-400 text-xs mt-0.5">{m.sub}</p>
                    </div>
                    <span className={`tag ${m.badgeClass}`}>{m.badge}</span>
                  </div>
                  <p className="text-muted text-[13px] leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="page-container py-14">
          <p className="section-label mb-2">Platform Capabilities</p>
          <h2 className="section-heading">Built for clinical-grade analysis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-brand-pale">
                  <f.icon className="text-brand w-[18px] h-[18px]" />
                </div>
                <p className="text-ink font-semibold text-sm mb-1.5">{f.title}</p>
                <p className="text-muted text-[12.5px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
        {status && (
          <section className="bg-white border-t border-b border-border">
            <div className="page-container py-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="section-label mb-1">Live Status</p>
                  <h2 className="subsection-heading">Model Availability</h2>
                </div>
                <button onClick={() => router.push('/train')} className="btn-secondary text-sm">Manage Models</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(status).map(([task, s]) => (
                  <div key={task} className="card-flat p-5">
                    <p className="text-gray-700 font-semibold text-[13px] capitalize mb-3">{task.replace('_', ' ')}</p>
                    <div className="space-y-2">
                      {Object.entries(s).map(([model, ready]) => (
                        <div key={model} className="flex items-center justify-between">
                          <span className="text-muted text-[13px] capitalize">{model}</span>
                          <div className="status-badge" role="status" aria-label={ready ? `${model} is ready` : `${model} is untrained`}>
                            <span className={`status-dot ${ready ? 'status-dot-ready' : 'status-dot-pending'}`} aria-hidden="true" />
                            <span className={ready ? 'status-text-ready' : 'status-text-pending'}>{ready ? 'Ready' : 'Untrained'}</span>
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
        <section className="bg-ink">
          <div className="page-container py-14 text-center">
            <h2 className="cta-title mb-3">Ready to analyze clinical notes?</h2>
            <button onClick={() => router.push('/predict')} className="btn-primary px-8 py-3.5 text-base">
              Open Prediction Console <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}