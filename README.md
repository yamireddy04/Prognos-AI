# 🩺 PrognosAI — Clinical Intelligence Platform

![Stack](https://img.shields.io/badge/Stack-Python%20%7C%20FastAPI%20%7C%20Next.js%20%7C%20TypeScript-1a56db?style=flat-square)
![Models](https://img.shields.io/badge/Models-TF--IDF%20%7C%20Hybrid%20%7C%20Groq%20LLaMA--3-0d9488?style=flat-square)
![LLM](https://img.shields.io/badge/LLM-Groq%20LLaMA--3.3%2070B-d97706?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.11%2B-3776ab?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-059669?style=flat-square)

An end-to-end clinical NLP system that analyzes free-text hospital discharge summaries and predicts clinical outcomes using three model architectures — a TF-IDF baseline, a text + vitals hybrid model, and a Groq LLaMA-3 70B large language model.

Built with **FastAPI** for the backend, **Next.js + Tailwind CSS** for the frontend, and **scikit-learn + Groq API** for machine learning inference.

🌐 **Live Demo**: `[paste your deployed link here]`

---

## 1️⃣ Problem Statement

Hospital discharge summaries contain rich clinical information that is rarely utilized for predictive analytics at scale. Manually reviewing notes for triage decisions, readmission screening, or specialty routing is time-consuming and inconsistent across clinical teams.

This project builds a system that:

- Predicts **30-day readmission risk** from free-text discharge notes
- Classifies **length of stay** into short (<3 days), medium (3–7 days), and long (>7 days) bands
- Identifies the **medical specialty** from unstructured clinical text
- Returns **explainable AI outputs** — highlighted phrases, confidence scores, and clinical risk factors — for every prediction

---

## 2️⃣ Why It Matters

Clinical NLP applied to discharge notes has measurable real-world value:

- **Readmission prevention** — Early identification of high-risk patients enables targeted follow-up care before discharge
- **Resource planning** — Length-of-stay prediction improves bed management, staffing, and operational efficiency
- **Workflow automation** — Specialty classification routes notes to the right clinical team without manual triage
- **Clinical trust** — Phrase-level explainability allows clinicians to audit predictions rather than accept black-box outputs

This project demonstrates how modern LLMs and classical ML models can be unified into a single inference platform with a production-quality interface.

---

## 3️⃣ Dataset

**Training Data**

| Source | Format | Detail |
|---|---|---|
| Synthetic generator | Generated at runtime | 1,200 realistic discharge notes across 5 specialties |
| Structured features | DataFrame columns | Age, gender, vitals, comorbidity count, prior admissions |

The synthetic generator (`backend/data/synthetic_generator.py`) produces realistic discharge summaries using specialty-specific templates covering Cardiology, Neurology, Orthopedics, Oncology, and General Medicine. Labels are assigned probabilistically based on clinical realism — not deterministically.

**Prediction Tasks**

| Task | Type | Classes |
|---|---|---|
| Readmission Risk | Binary | No Readmission / 30-Day Readmission |
| Length of Stay | 3-class | Short (<3d) / Medium (3–7d) / Long (>7d) |
| Medical Specialty | 5-class | Cardiology / Neurology / Orthopedics / Oncology / General Medicine |

---

## 4️⃣ Methodology

Three inference pipelines operate independently on the same clinical note input:

```
User Input (clinical note + optional vitals)
        │
        ├─► [Baseline Pipeline]
        │   Preprocessing → TF-IDF (20k features, trigrams)
        │   → Logistic Regression → Prediction + Token Highlights
        │
        ├─► [Hybrid Pipeline]
        │   Preprocessing → TF-IDF (15k features)
        │   + 18 engineered vitals features (sparse hstack)
        │   → Logistic Regression → Prediction
        │
        └─► [Groq LLM Pipeline]
            Structured system prompt → LLaMA-3.3 70B
            → JSON response → Prediction + Reasoning + Risk Factors
                    │
                    ▼
        FastAPI /predict → Explainability payload → Next.js frontend
```

**Vitals Feature Engineering (Hybrid model)**

Raw vitals are augmented into 18 derived features including pulse pressure, shock index, elderly age flag, tachycardia, hypotension, hypoxia, and tachypnea indicators — all scaled with StandardScaler before sparse fusion.

---

## 5️⃣ Model Architecture

**Baseline Model**

| Component | Detail |
|---|---|
| Vectorizer | TF-IDF, 20,000 features, 1–3 ngrams, sublinear TF scaling |
| Classifier | Logistic Regression, C=1.0, balanced class weights |
| Explainability | Per-token TF-IDF × logistic regression coefficient score |

**Hybrid Model**

| Component | Detail |
|---|---|
| Text features | TF-IDF, 15,000 features, 1–2 ngrams |
| Tabular features | 18 engineered vitals and demographic features |
| Fusion | scipy sparse hstack (text matrix + scaled tabular) |
| Classifier | Logistic Regression, C=0.8, balanced class weights |

**Groq LLM — LLaMA-3.3 70B**

| Component | Detail |
|---|---|
| Model ID | llama-3.3-70b-versatile via Groq API |
| Prompting | Task-specific system prompts with JSON-only response enforcement |
| Primary output | Prediction class + confidence float + clinical reasoning string |
| Explanation call | Secondary API call extracts key phrase importance scores |
| Risk output | Structured risk factor and protective factor lists |

---

## 6️⃣ Results

| Task | Baseline Accuracy | Hybrid Accuracy | Groq Output |
|---|---|---|---|
| Readmission Risk | ~54% | ~60% | Qualitative reasoning + confidence |
| Length of Stay | ~41% | ~37% | Qualitative reasoning + confidence |
| Medical Specialty | ~100% | ~100% | Correct on synthetic and real notes |

> Specialty classification achieves near-perfect accuracy due to distinct vocabulary per specialty in the synthetic data. Readmission and LOS tasks reflect realistic difficulty — synthetic labels are probabilistic. Groq outputs are consistently clinically coherent and correctly identify specialty and readmission signals on real discharge notes.

---

## 🔍 Explainability 

All three models return phrase-level explanations rendered in the UI:

- **Baseline / Hybrid** — TF-IDF × coefficient scores highlight tokens by importance tier (high / medium / low) with color-coded annotation
- **Groq LLM** — A secondary inference call extracts clinically significant phrases with natural language explanations for each
- **ResultsPanel** — Confidence ring visualization, probability bar chart, annotated note, key phrase chips, and structured risk/protective factor cards

---

## 7️⃣ Limitations ⚠️

- **Synthetic training data** — Models trained on generated notes; performance on real MIMIC or hospital EHR data will differ significantly
- **Baseline model accuracy** — TF-IDF + Logistic Regression is not competitive with transformer-based models on complex clinical NLP tasks
- **Groq rate limits** — Free API tier has per-minute request limits that may slow responses under concurrent load
- **No authentication** — The API has no auth layer; not suitable for production clinical use without security hardening
- **Ephemeral model storage** — On Render's free tier, trained .pkl files are lost on redeploy; persistent disk storage is required for production

---

## 8️⃣ Future Work

- Train on MIMIC-III or real de-identified clinical notes for accurate benchmarking
- Fine-tune ClinicalBERT for improved accuracy on complex clinical NLP tasks
- Add user authentication and session management for production deployment
- Implement SHAP values for rigorous ML explainability alongside token highlights
- Containerize with Docker Compose for consistent local and cloud deployment
- Add batch prediction endpoint for processing multiple notes simultaneously

---

## 9️⃣ How to Run Locally 🚀

**Prerequisites**
- Python 3.11 or higher
- Node.js 20+
- Groq API key — free at [console.groq.com](https://console.groq.com)

**1. Clone the repository**

```bash
git clone https://github.com/yamireddy04/Prognos-AI.git
cd Prognos-AI
```

**2. Set up the backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Mac/Linux
# .venv\Scripts\activate         # Windows

pip install -r requirements.txt
```

**3. Add your Groq API key**

Create `backend/.env`:

```
GROQ_API_KEY=gsk_your_key_here
MODEL_DIR=./saved_models
DATA_DIR=./data
ENV=development
```

**4. Train the baseline and hybrid models**

```bash
python3 -m training.train
```

Accuracy scores will print for all 3 tasks. Takes approximately 60 seconds.

**5. Start the backend server**

```bash
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Verify at: [http://localhost:8000](http://localhost:8000) — should return `{"status":"ok"}`

**6. Set up and start the frontend**

Open a new terminal:

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
Prognos-AI/
├── backend/
│   ├── data/
│   │   └── synthetic_generator.py     # Generates synthetic clinical notes
│   ├── models/
│   │   ├── __init__.py                # Model registry
│   │   ├── baseline_model.py          # TF-IDF + Logistic Regression
│   │   ├── groq_model.py              # LLaMA-3.3 70B via Groq API
│   │   └── hybrid_model.py            # TF-IDF + tabular feature fusion
│   ├── training/
│   │   └── train.py                   # Training pipeline CLI
│   ├── utils/
│   │   ├── text_processing.py         # Tokenization, lemmatization
│   │   ├── feature_engineering.py     # Vitals feature engineering
│   │   ├── explainability.py          # Token highlighting, phrase extraction
│   │   └── metrics.py                 # Accuracy, F1, confusion matrix
│   ├── saved_models/                  # .pkl files — generated after training
│   ├── .python-version                # Pins Python 3.11.9 for Render
│   ├── config.py
│   ├── main.py                        # FastAPI — /predict /explain /train
│   └── requirements.txt
│
├── frontend/
│   ├── components/
│   │   ├── charts/ProbabilityChart.tsx
│   │   ├── ui/ResultsPanel.tsx
│   │   ├── Navbar.tsx
│   │   ├── HighlightedNote.tsx
│   │   └── TabularInputs.tsx
│   ├── pages/
│   │   ├── index.tsx                  # Landing page
│   │   ├── predict.tsx                # Prediction console
│   │   └── train.tsx                  # Training dashboard
│   ├── styles/globals.css
│   ├── utils/api.ts
│   └── package.json
│
├── data/
├── notebooks/
├── .gitignore
└── README.md
```

---

## 🔟 Conclusion

PrognosAI demonstrates how unstructured clinical text can be transformed into actionable insights using a unified ML and LLM-driven pipeline. By combining baseline, hybrid, and large language models, the platform balances interpretability, performance, and clinical reasoning. Its explainability-first design ensures that predictions are transparent and auditable, fostering trust in AI-assisted healthcare decisions. While current results are limited by synthetic data, the architecture is scalable to real-world clinical datasets and production environments. Overall, PrognosAI serves as a strong foundation for next-generation clinical intelligence systems that bridge data, models, and meaningful impact.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python) |
| ML — Text | scikit-learn TF-IDF + Logistic Regression |
| ML — Hybrid | TF-IDF + engineered vitals features (sparse hstack) |
| LLM | Groq API — LLaMA-3.3 70B Versatile |
| NLP Preprocessing | NLTK (tokenization, stopwords, lemmatization) |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Deployment | Render (backend) + Vercel (frontend) |
