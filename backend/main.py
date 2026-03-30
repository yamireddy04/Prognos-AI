from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
import traceback
import threading

from config import TASK_LABELS, TASKS
from models import get_baseline, get_groq_model, get_hybrid, model_status
from utils.explainability import build_explanation_payload, extract_tfidf_highlights

app = FastAPI(
    title="Clinical NLP API",
    description="Readmission, length of stay, and specialty prediction from clinical notes.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    note: str = Field(..., min_length=20)
    task: Literal["readmission", "los_band", "specialty"] = "readmission"
    model_type: Literal["baseline", "groq", "hybrid"] = "baseline"
    tabular: Optional[dict] = None


class ExplainRequest(BaseModel):
    note: str
    task: Literal["readmission", "los_band", "specialty"] = "readmission"
    model_type: Literal["baseline", "groq", "hybrid"] = "baseline"


class TrainRequest(BaseModel):
    tasks: Optional[List[str]] = None
    n_samples: int = Field(default=1200, ge=200, le=5000)


class PredictionResponse(BaseModel):
    task: str
    model_type: str
    prediction_index: int
    prediction_label: str
    confidence: float
    probabilities: List[float]
    class_labels: List[str]
    explanation: Optional[dict] = None
    metadata: Optional[dict] = None


def _auto_train():
    try:
        from config import MODEL_DIR, TASKS
        from training.train import train_all_models
        missing = any(
            not (MODEL_DIR / f"{kind}_{task}.pkl").exists()
            for task in TASKS
            for kind in ["baseline", "hybrid"]
        )
        if missing:
            print("Auto-training: no saved models found, starting training...")
            train_all_models()
            print("Auto-training complete.")
    except Exception:
        traceback.print_exc()


@app.on_event("startup")
async def startup_event():
    thread = threading.Thread(target=_auto_train, daemon=True)
    thread.start()


@app.get("/")
def root():
    return {"status": "ok", "service": "Clinical NLP API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy", "model_status": model_status()}


@app.post("/predict", response_model=PredictionResponse)
async def predict(req: PredictRequest):
    task = req.task
    labels = TASK_LABELS.get(task, [])

    try:
        if req.model_type == "baseline":
            model = get_baseline(task)
            if not model.is_trained:
                raise HTTPException(status_code=400, detail="Baseline model not trained yet. Please wait or POST /train first.")
            pred, proba = model.predict(req.note)
            top_features = model.get_top_features(req.note, n=15)
            explanation = build_explanation_payload(req.note, "baseline", top_features=top_features)
            metadata = None

        elif req.model_type == "groq":
            model = get_groq_model(task)
            pred, proba, metadata = model.predict(req.note)
            groq_explanation = model.explain(req.note)
            groq_phrases = groq_explanation.get("important_phrases", [])
            explanation = build_explanation_payload(req.note, "groq", groq_phrases=groq_phrases, metadata=metadata)
            explanation["summary"] = groq_explanation.get("overall_summary", metadata.get("reasoning", ""))

        elif req.model_type == "hybrid":
            model = get_hybrid(task)
            if not model.is_trained:
                raise HTTPException(status_code=400, detail="Hybrid model not trained yet. Please wait or POST /train first.")
            pred, proba = model.predict(req.note, tabular=req.tabular)
            top_features = model.get_feature_importances(req.note)
            explanation = build_explanation_payload(req.note, "hybrid", top_features=top_features)
            metadata = None

        else:
            raise HTTPException(status_code=400, detail=f"Unknown model_type: {req.model_type}")

        confidence = float(max(proba))
        label = labels[pred] if pred < len(labels) else str(pred)

        return PredictionResponse(
            task=task,
            model_type=req.model_type,
            prediction_index=pred,
            prediction_label=label,
            confidence=round(confidence, 4),
            probabilities=[round(p, 4) for p in proba],
            class_labels=labels,
            explanation=explanation,
            metadata=metadata,
        )

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain")
async def explain(req: ExplainRequest):
    try:
        if req.model_type == "groq":
            model = get_groq_model(req.task)
            result = model.explain(req.note)
            return {"task": req.task, "model_type": req.model_type, **result}

        elif req.model_type == "baseline":
            model = get_baseline(req.task)
            if not model.is_trained:
                raise HTTPException(status_code=400, detail="Model not trained.")
            top_features = model.get_top_features(req.note, n=20)
            spans = extract_tfidf_highlights(req.note, top_features)
            return {"task": req.task, "model_type": req.model_type, "token_spans": spans,
                    "top_features": [{"feature": f, "score": s} for f, s in top_features]}

        elif req.model_type == "hybrid":
            model = get_hybrid(req.task)
            if not model.is_trained:
                raise HTTPException(status_code=400, detail="Model not trained.")
            top_features = model.get_feature_importances(req.note)
            spans = extract_tfidf_highlights(req.note, top_features)
            return {"task": req.task, "model_type": req.model_type, "token_spans": spans,
                    "top_features": [{"feature": f, "score": s} for f, s in top_features]}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train")
async def train_models(req: TrainRequest, background_tasks: BackgroundTasks):
    from training.train import train_all_models

    def _run():
        try:
            train_all_models(tasks=req.tasks, n_samples=req.n_samples)
        except Exception:
            traceback.print_exc()

    background_tasks.add_task(_run)
    return {
        "status": "training_started",
        "message": "Training running in background. Check /health for model status.",
        "tasks": req.tasks or TASKS,
        "n_samples": req.n_samples,
    }


@app.get("/models/status")
def get_model_status():
    return model_status()


@app.get("/tasks")
def get_tasks():
    return {
        task: {"labels": labels, "n_classes": len(labels)}
        for task, labels in TASK_LABELS.items()
    }


@app.get("/sample-note")
def get_sample_note(specialty: str = "Cardiology"):
    from data.synthetic_generator import generate_note, SPECIALTY_MAP
    if specialty not in SPECIALTY_MAP:
        specialty = "Cardiology"
    note = generate_note(specialty)
    return {"note": note, "specialty": specialty}