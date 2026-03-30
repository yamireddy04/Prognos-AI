import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score
)
from typing import List, Optional


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_proba: Optional[np.ndarray] = None,
                    labels: Optional[List[str]] = None) -> dict:
    is_binary = len(np.unique(y_true)) == 2
    avg = "binary" if is_binary else "weighted"

    metrics = {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, average=avg, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, average=avg, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, average=avg, zero_division=0)), 4),
    }

    if y_proba is not None and is_binary:
        try:
            proba = y_proba[:, 1] if y_proba.ndim == 2 else y_proba
            metrics["roc_auc"] = round(float(roc_auc_score(y_true, proba)), 4)
        except Exception:
            pass

    cm = confusion_matrix(y_true, y_pred)
    metrics["confusion_matrix"] = cm.tolist()

    if labels:
        metrics["class_labels"] = labels

    per_class = {}
    for cls in np.unique(y_true):
        label = labels[cls] if labels and cls < len(labels) else str(cls)
        mask = y_true == cls
        per_class[label] = {
            "support": int(mask.sum()),
            "precision": round(float(precision_score(y_true == cls, y_pred == cls, zero_division=0)), 4),
            "recall": round(float(recall_score(y_true == cls, y_pred == cls, zero_division=0)), 4),
            "f1": round(float(f1_score(y_true == cls, y_pred == cls, zero_division=0)), 4),
        }
    metrics["per_class"] = per_class

    return metrics