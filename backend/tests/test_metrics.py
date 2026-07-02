import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np

from utils.metrics import compute_metrics


def test_compute_metrics_binary_case():
    y_true = np.array([0, 0, 1, 1])
    y_pred = np.array([0, 1, 1, 1])

    metrics = compute_metrics(y_true, y_pred, labels=["No", "Yes"])

    assert metrics["accuracy"] == 0.75
    assert metrics["precision"] == 0.6667
    assert metrics["recall"] == 1.0
    assert metrics["f1"] == 0.8
    assert metrics["confusion_matrix"] == [[1, 1], [0, 2]]
    assert metrics["class_labels"] == ["No", "Yes"]
    assert metrics["per_class"]["No"]["support"] == 2
    assert metrics["per_class"]["No"]["precision"] == 1.0
    assert metrics["per_class"]["No"]["recall"] == 0.5
    assert metrics["per_class"]["No"]["f1"] == 0.6667
    assert metrics["per_class"]["Yes"]["support"] == 2
    assert metrics["per_class"]["Yes"]["precision"] == 0.6667
    assert metrics["per_class"]["Yes"]["recall"] == 1.0
    assert metrics["per_class"]["Yes"]["f1"] == 0.8


def test_compute_metrics_multiclass_case():
    y_true = np.array([0, 1, 2, 1, 0])
    y_pred = np.array([0, 2, 2, 1, 0])

    metrics = compute_metrics(y_true, y_pred, labels=["A", "B", "C"])

    assert metrics["accuracy"] == 0.8
    assert metrics["precision"] == 0.9
    assert metrics["recall"] == 0.8
    assert metrics["f1"] == 0.8
    assert metrics["confusion_matrix"] == [[2, 0, 0], [0, 1, 1], [0, 0, 1]]
    assert metrics["class_labels"] == ["A", "B", "C"]
    assert metrics["per_class"]["A"] == {"support": 2, "precision": 1.0, "recall": 1.0, "f1": 1.0}
    assert metrics["per_class"]["B"] == {"support": 2, "precision": 1.0, "recall": 0.5, "f1": 0.6667}
    assert metrics["per_class"]["C"] == {"support": 1, "precision": 0.5, "recall": 1.0, "f1": 0.6667}


def test_compute_metrics_without_labels_uses_class_index_as_key():
    y_true = np.array([0, 0, 1, 1])
    y_pred = np.array([0, 1, 1, 1])

    metrics = compute_metrics(y_true, y_pred)

    assert "class_labels" not in metrics
    assert "0" in metrics["per_class"]
    assert "1" in metrics["per_class"]


def test_compute_metrics_includes_roc_auc_for_binary_with_probabilities():
    y_true = np.array([0, 0, 1, 1])
    y_pred = np.array([0, 1, 1, 1])
    y_proba = np.array([
        [0.9, 0.1],
        [0.4, 0.6],
        [0.2, 0.8],
        [0.1, 0.9],
    ])

    metrics = compute_metrics(y_true, y_pred, y_proba=y_proba)

    assert "roc_auc" in metrics
    assert 0.0 <= metrics["roc_auc"] <= 1.0