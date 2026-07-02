import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import TASK_LABELS


def test_root_returns_status_payload(client):
    response = client.get("/")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "Clinical NLP API"
    assert body["version"] == "1.0.0"


def test_health_returns_200(client):
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert "model_status" in body


def test_tasks_returns_all_three_tasks_with_correct_label_counts(client):
    response = client.get("/tasks")

    assert response.status_code == 200
    body = response.json()

    assert set(body.keys()) == {"readmission", "los_band", "specialty"}
    assert body["readmission"]["n_classes"] == 2
    assert body["los_band"]["n_classes"] == 3
    assert body["specialty"]["n_classes"] == 5
    assert body["readmission"]["labels"] == TASK_LABELS["readmission"]
    assert body["los_band"]["labels"] == TASK_LABELS["los_band"]
    assert body["specialty"]["labels"] == TASK_LABELS["specialty"]


def test_predict_baseline_returns_valid_prediction_for_each_task(client, trained_models):
    dataframe = trained_models["dataframe"]
    note = dataframe["note"].iloc[0]

    for task, labels in TASK_LABELS.items():
        response = client.post("/predict", json={
            "note": note,
            "task": task,
            "model_type": "baseline",
        })

        assert response.status_code == 200
        body = response.json()
        assert body["task"] == task
        assert body["model_type"] == "baseline"
        assert body["prediction_label"] in labels
        assert body["class_labels"] == labels
        assert abs(sum(body["probabilities"]) - 1.0) < 1e-2


def test_predict_rejects_note_shorter_than_20_characters(client):
    response = client.post("/predict", json={
        "note": "too short",
        "task": "readmission",
        "model_type": "baseline",
    })

    assert response.status_code == 422


def test_predict_groq_without_api_key_returns_500_mentioning_missing_key(client):
    response = client.post("/predict", json={
        "note": "Patient presents with chest pain and shortness of breath for evaluation.",
        "task": "readmission",
        "model_type": "groq",
    })

    assert response.status_code == 500
    body = response.json()
    assert "GROQ_API_KEY" in body["detail"]


def test_sample_note_returns_note_and_echoes_specialty(client):
    response = client.get("/sample-note", params={"specialty": "Neurology"})

    assert response.status_code == 200
    body = response.json()
    assert body["specialty"] == "Neurology"
    assert isinstance(body["note"], str)
    assert len(body["note"]) > 0


def test_sample_note_falls_back_to_cardiology_for_unknown_specialty(client):
    response = client.get("/sample-note", params={"specialty": "Not A Real Specialty"})

    assert response.status_code == 200
    body = response.json()
    assert body["specialty"] == "Cardiology"