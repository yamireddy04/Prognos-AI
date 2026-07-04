import pandas as pd
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from data.synthetic_generator import generate_dataset
from models.baseline_model import BaselineModel
from models.hybrid_model import HybridModel
from config import DATA_DIR, TASKS


def load_or_generate_data(n_samples: int = 1200, force_regenerate: bool = False) -> pd.DataFrame:
    csv_path = DATA_DIR / "clinical_notes.csv"
    if csv_path.exists() and not force_regenerate:
        df = pd.read_csv(csv_path)
        if len(df) == n_samples:
            print(f"Loaded {len(df)} records from {csv_path}")
            return df
        print(f"Cached dataset has {len(df)} records but {n_samples} were requested — regenerating...")

    print(f"Generating {n_samples} synthetic clinical notes...")
    df = generate_dataset(n_samples)
    DATA_DIR.mkdir(exist_ok=True)
    df.to_csv(csv_path, index=False)
    print(f"Saved to {csv_path}")
    return df


def get_label_column(task: str) -> str:
    return {
        "readmission": "readmission_30d",
        "los_band": "los_band",
        "specialty": "specialty_id",
    }[task]


def train_all_models(tasks=None, n_samples: int = 1200, force_regenerate: bool = False) -> dict:
    if tasks is None:
        tasks = TASKS

    df = load_or_generate_data(n_samples, force_regenerate=force_regenerate)
    print("Labels and note-embedded vitals are now derived from a shared per-patient severity signal")
    results = {}

    for task in tasks:
        print(f"\n{'='*50}")
        print(f"Training models for task: {task}")
        print(f"{'='*50}")

        label_col = get_label_column(task)
        texts = df["note"].tolist()
        labels = df[label_col].values

        print("\n[Baseline] Training TF-IDF + Logistic Regression...")
        baseline = BaselineModel(task, classifier="logreg")
        baseline_metrics = baseline.train(texts, labels)
        print(f"  Accuracy: {baseline_metrics['accuracy']:.4f} | F1: {baseline_metrics['f1']:.4f}")

        print("\n[Hybrid] Training TF-IDF + Tabular features...")
        hybrid = HybridModel(task)
        tabular_cols = ["age", "gender", "hr", "sbp", "dbp", "rr", "spo2", "temp",
                        "n_comorbidities", "n_meds", "prior_admissions"]
        hybrid_metrics = hybrid.train(texts, df[tabular_cols], labels)
        print(f"  Accuracy: {hybrid_metrics['accuracy']:.4f} | F1: {hybrid_metrics['f1']:.4f}")

        results[task] = {"baseline": baseline_metrics, "hybrid": hybrid_metrics}

    print(f"\n{'='*50}")
    print("Training complete. Models saved to saved_models/")
    return results


if __name__ == "__main__":
    import json
    results = train_all_models()
    print("\nFinal Results:")
    print(json.dumps({
        task: {
            model: {k: v for k, v in m.items() if k in ["accuracy", "f1"]}
            for model, m in task_results.items()
        }
        for task, task_results in results.items()
    }, indent=2))