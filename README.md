# 🏥 Prognos AI

Clinical outcome prediction from discharge notes — a full-stack system that predicts 30-day readmission risk, length-of-stay band, and medical specialty from unstructured clinical text, comparing three model architectures (TF-IDF baseline, hybrid text+vitals fusion, and a prompted LLM) with built-in explainability for every prediction.

**Live Demo:** https://prognos-ai-five.vercel.app

**Repository:** https://github.com/yamini-nlp/Prognos-AI

[![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20Next.js-blue?style=flat-square)](https://github.com/yamini-nlp/Prognos-AI)
[![Models](https://img.shields.io/badge/Models-TF--IDF%20%7C%20Hybrid%20%7C%20Groq%20LLM-orange?style=flat-square)](https://github.com/yamini-nlp/Prognos-AI)
[![CI](https://github.com/yamini-nlp/Prognos-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/yamini-nlp/Prognos-AI/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.11-green?style=flat-square)](https://github.com/yamini-nlp/Prognos-AI)
[![Status](https://img.shields.io/badge/Status-Deployed-brightgreen?style=flat-square)](https://prognos-ai-five.vercel.app)

---

### 💡 Motivation

Discharge notes contain most of the signal clinicians use to judge how a patient will fare after leaving hospital, but that signal is locked in free text. Structured EHR fields (vitals, comorbidity counts, prior admissions) capture only part of the picture. This project tests whether combining note text with structured features improves prediction over either alone, and whether a general-purpose LLM prompted directly on the note can compete with models trained specifically for the task — while keeping every prediction traceable back to the phrases and features that produced it.

---

### 🧭 Overview

A user pastes a clinical discharge note (or loads a synthetic sample) and selects one of three prediction tasks and one of three models. The system returns a class prediction, a confidence score, and an explanation — either TF-IDF/SHAP-derived feature weights with the source text highlighted, or an LLM-generated rationale with extracted risk and protective factors.

**Tasks**
- **Readmission Risk** — binary, 30-day readmission
- **Length of Stay** — 3-class band (short / medium / long)
- **Medical Specialty** — 5-class classification (Cardiology, Neurology, Orthopedics, Oncology, General Medicine)

**Models**
- **Baseline** — TF-IDF + Logistic Regression, text only
- **Hybrid** — TF-IDF + 18 engineered vitals/demographic features, fused via sparse matrix concatenation
- **Groq LLM** — Llama 3.3 70B (`llama-3.3-70b-versatile`), prompted directly on the note, no training required

---

### 🎯 Problem Statement

Clinical NLP systems are usually evaluated on a single model and a single data type. This project instead runs the same three tasks through three architecturally different approaches on the same input, to surface where text-only models plateau, where structured features add value, and where a prompted LLM's zero-shot reasoning either matches or fails to match a model trained on task-specific data — with explainability treated as a requirement for every model, not an afterthought for the interpretable ones.

---

### 🏗️ Architecture

**Pipeline A — Baseline (TF-IDF)**
```
Clinical note
    │
    ├─► Preprocessing: lowercase → tokenize → stopword removal → lemmatize
    ├─► TF-IDF vectorizer (20k features, trigrams, min_df=2, max_df=0.95)
    ├─► Logistic Regression (class-balanced, lbfgs)
    └─► Prediction + coefficient-weighted or SHAP LinearExplainer feature importances
```

**Pipeline B — Hybrid (Text + Vitals Fusion)**
```
Clinical note + structured vitals/demographics
    │
    ├─► Text branch: same preprocessing → TF-IDF (15k features, bigrams)
    ├─► Tabular branch: 18 engineered features → StandardScaler
    ├─► Sparse hstack fusion of both feature sets
    ├─► Logistic Regression (class-balanced, lbfgs)
    └─► Prediction + coefficient-weighted or SHAP LinearExplainer feature importances
```

**Pipeline C — Groq LLM**
```
Clinical note
    │
    ├─► Task-specific system prompt (JSON-structured output contract)
    ├─► Groq API call (Llama 3.3 70B)
    ├─► Parse prediction, confidence, reasoning, risk/protective factors
    └─► Separate explain() call → key phrases with importance scores, text-span highlighting
```

---

### ⚙️ Model Architecture

| Component | Baseline | Hybrid |
|---|---|---|
| Text features | TF-IDF, 20k features, trigrams | TF-IDF, 15k features, bigrams |
| Structured features | None | 18 features: 11 raw (age, gender, HR, SBP, DBP, RR, SpO₂, temp, comorbidity count, medication count, prior admissions) + 7 derived (pulse pressure, shock index, elderly flag, tachycardic/hypotensive/hypoxic/tachypneic flags) |
| Classifier | Logistic Regression, class-balanced | Logistic Regression, class-balanced |
| Explainability | TF-IDF × coefficient weighting or SHAP `LinearExplainer` | Same, restricted to the text-feature coefficient slice |

**Groq LLM:** no training step; inference via prompted JSON output, parsed and validated at the API layer. Confidence is self-reported by the model and redistributed across classes to form a probability vector.

---

### 📋 Dataset

Synthetic clinical notes are generated per-request via a templated generator covering 5 specialties. Labels (readmission, length-of-stay band, specialty) and note-embedded vitals are derived from a shared per-patient severity score, so note content and structured features stay internally consistent for a given synthetic patient. Dataset size is configurable at training time (200–5,000 samples); the training endpoint regenerates the dataset automatically if the cached CSV's row count doesn't match the requested size.

**Preprocessing (all models):** lowercase → tokenize → stopword removal → lemmatization (NLTK: `punkt`, `stopwords`, `wordnet`).

---

### 📊 Findings

Training run on 1,200 synthetic samples (80/20 split):

| Task | Baseline Accuracy | Baseline F1 | Hybrid Accuracy | Hybrid F1 |
|---|---|---|---|---|
| Readmission (binary) | 0.533 | 0.541 | 0.554 | 0.537 |
| Length of Stay (3-class) | 0.383 | 0.399 | 0.383 | 0.401 |
| Specialty (5-class) | 1.000 | 1.000 | 1.000 | 1.000 |

Readmission and length-of-stay accuracy sit close to chance (0.50 and 0.33 respectively), and the hybrid model's structured features produce only a marginal improvement over text alone. Specialty classification is solved perfectly by both models — the most likely explanation is that the synthetic note generator embeds specialty-identifying vocabulary directly in the templated text (each specialty uses one fixed template), making it a near-trivial classification task rather than evidence that the pipeline generalizes to hard cases. These results reflect the synthetic dataset's structure, not real clinical note performance, and are reported here rather than a stronger cherry-picked number.

**Scope:** these are the numbers from one training configuration on synthetic data; no evaluation against real clinical notes or an external benchmark has been performed.

---

### ⚙️ Key Design Decisions

| Component | Choice | Rationale |
|---|---|---|
| Text model | TF-IDF + Logistic Regression | Fast to train, coefficients are directly interpretable, no GPU required |
| Feature fusion | Sparse `hstack` of TF-IDF and scaled tabular features | Keeps both feature types in one linear model without a separate fusion architecture |
| Explainability | SHAP `LinearExplainer` as an alternative to raw coefficient weighting | Coefficient × TF-IDF weighting is fast but conflates rarity with importance; SHAP gives an alternative, theoretically grounded attribution the user can toggle to |
| Zero-shot comparison | Groq Llama 3.3 70B via structured JSON prompting | Tests whether a general-purpose model can compete with trained models without task-specific data, at zero training cost |
| Model registry | In-memory cache cleared on retrain | Avoids reloading a `.pkl` from disk on every request while still picking up freshly trained models |
| Containerization | Multi-stage Docker builds, non-root users, Compose orchestration | Reproducible local environment separate from the Render/Vercel production path |
| CI | GitHub Actions: ruff + mypy + pytest (backend), ESLint + tsc + Jest + build (frontend) | Catches lint, type, and regression errors on every push without manual verification |

---

### 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Python 3.11 |
| ML | scikit-learn (TF-IDF, Logistic Regression), SHAP, NLTK |
| LLM | Groq API (Llama 3.3 70B) |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Testing | pytest + pytest-cov (backend, 39 tests, all passing); Jest + Testing Library (frontend, 16 tests, all passing) |
| Linting/Types | ruff, mypy (backend); ESLint, tsc (frontend) |
| CI/CD | GitHub Actions (lint, type-check, test on every push) |
| Containerization | Docker (multi-stage), Docker Compose |
| Deployment | Render (backend), Vercel (frontend) |

---

### 🔒 Security

- CORS restricted to an explicit allowed-origins list, not wildcarded, in production.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) applied via middleware on every response.
- Groq API key loaded from environment variables (`.env`, not committed); a startup check warns if it's missing.
- Docker images run as non-root users in both backend and frontend containers.
- No patient data is used or stored — all clinical notes are synthetically generated at runtime.

---

### ⚠️ Limitations

- **Synthetic data only** — no validation against real clinical notes or an external clinical dataset; reported accuracy reflects the synthetic generator's structure, not real-world performance.
- **Readmission and length-of-stay accuracy are near chance** — the linear models are not extracting a strong signal for these two tasks on the current synthetic dataset.
- **Specialty classification is likely trivial** — near-certain vocabulary leakage in the note generator (one fixed template per specialty), not a validated hard-classification result.
- **Groq LLM confidence is self-reported** — the model's stated confidence is not calibrated against actual accuracy.
- **SHAP explainability is linear-only** — `LinearExplainer` is exact for the logistic regression models used here but wouldn't extend to a non-linear model without re-implementation.
- **No persistent database** — trained models are `.pkl` files on disk; there is no experiment tracking or versioning beyond the current saved model per task/type.
- **Render free-tier cold starts** — the backend spins down when idle, adding latency to the first request after inactivity.

---

### 🔭 Future Work

- Validate against a real or de-identified clinical dataset instead of synthetic notes only
- Calibrate Groq LLM confidence scores against measured accuracy
- Add cross-validation and hyperparameter search instead of a single train/validation split
- Track experiments and model versions instead of overwriting the saved `.pkl` per task
- Extend SHAP support to non-linear models if a tree-based or neural classifier is added
- Add authentication and rate-limiting before any multi-user deployment

---

### 🚀 Local Setup

**Prerequisites:** Python 3.11.9, Node.js 20, a Groq API key

**1. Clone**
```bash
git clone https://github.com/yamini-nlp/Prognos-AI.git
cd Prognos-AI
```

**2. Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # add your GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

---

### 🐳 Run with Docker

```bash
cp backend/.env.example backend/.env   # add your GROQ_API_KEY
docker compose up --build
```

Frontend at `http://localhost:3000`, API at `http://localhost:8000`.

---

### 📁 Repository Structure

```
Prognos-AI/
├── backend/
│   ├── main.py                     # FastAPI app, routes, CORS, security headers
│   ├── config.py                   # Settings, task labels, model directory config
│   ├── models/
│   │   ├── baseline_model.py       # TF-IDF + Logistic Regression
│   │   ├── hybrid_model.py         # TF-IDF + tabular fusion
│   │   └── groq_model.py           # Groq LLM prompting and parsing
│   ├── training/
│   │   └── train.py                # Trains baseline + hybrid for all tasks
│   ├── data/
│   │   └── synthetic_generator.py  # Synthetic clinical note + vitals generator
│   ├── utils/
│   │   ├── text_processing.py      # Preprocessing, NLTK pipeline
│   │   ├── feature_engineering.py  # Tabular feature construction
│   │   ├── metrics.py              # Accuracy, F1, per-class metrics
│   │   └── explainability.py       # Token highlighting, explanation payloads
│   ├── tests/                      # pytest suite (39 tests)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── render.yaml
├── frontend/
│   ├── pages/
│   │   ├── index.tsx                # Dashboard
│   │   ├── predict.tsx              # Prediction console
│   │   └── train.tsx                # Model training UI
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── HighlightedNote.tsx      # Token-highlighted note rendering
│   │   ├── TabularInputs.tsx        # Vitals/demographics form
│   │   ├── charts/ProbabilityChart.tsx
│   │   └── ui/                      # ModelSelector, TaskSelector, ConfidenceBar, ResultsPanel
│   ├── styles/globals.css
│   ├── utils/api.ts
│   ├── Dockerfile
│   └── tailwind.config.js
├── .github/workflows/ci.yml         # Lint, type-check, test on every push
├── docker-compose.yml
└── README.md
```

---
<div align="center">

*Built by [Yamini G](https://github.com/yamini-nlp)*

</div>
