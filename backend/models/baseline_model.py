import numpy as np
import joblib
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from typing import List, Tuple, Optional

from utils.text_processing import preprocess_batch
from utils.metrics import compute_metrics
from config import MODEL_DIR, TASK_LABELS


class BaselineModel:
    def __init__(self, task: str, classifier: str = "logreg"):
        self.task = task
        self.classifier_type = classifier
        self.pipeline: Optional[Pipeline] = None
        self.labels = TASK_LABELS.get(task, [])
        self._model_path = MODEL_DIR / f"baseline_{task}.pkl"

    def _build_pipeline(self) -> Pipeline:
        vectorizer = TfidfVectorizer(
            max_features=20000,
            ngram_range=(1, 3),
            sublinear_tf=True,
            min_df=2,
            max_df=0.95,
            analyzer="word",
            token_pattern=r"\b[a-zA-Z][a-zA-Z0-9_]*\b",
        )
        clf = LogisticRegression(
            C=1.0,
            max_iter=1000,
            class_weight="balanced",
            solver="lbfgs",
            multi_class="auto",
        )
        return Pipeline([("tfidf", vectorizer), ("clf", clf)])

    def train(self, texts: List[str], labels: np.ndarray) -> dict:
        processed = preprocess_batch(texts, lemmatize=True)
        X_train, X_val, y_train, y_val = train_test_split(
            processed, labels, test_size=0.2, random_state=42, stratify=labels
        )
        self.pipeline = self._build_pipeline()
        self.pipeline.fit(X_train, y_train)

        y_pred = self.pipeline.predict(X_val)
        y_proba = self.pipeline.predict_proba(X_val)
        metrics = compute_metrics(y_val, y_pred, y_proba, labels=self.labels)
        self.save()
        return metrics

    def predict(self, text: str) -> Tuple[int, np.ndarray]:
        if self.pipeline is None:
            self.load()
        processed = preprocess_batch([text], lemmatize=True)
        pred = self.pipeline.predict(processed)[0]
        proba = self.pipeline.predict_proba(processed)[0]
        return int(pred), proba.tolist()

    def get_top_features(self, text: str, n: int = 15) -> List[Tuple[str, float]]:
        if self.pipeline is None:
            self.load()
        processed = preprocess_batch([text], lemmatize=True)
        tfidf = self.pipeline.named_steps["tfidf"]
        clf = self.pipeline.named_steps["clf"]
        vec = tfidf.transform(processed)
        feature_names = np.array(tfidf.get_feature_names_out())

        pred_class = int(self.pipeline.predict(processed)[0])
        if clf.coef_.ndim == 1:
            coefs = clf.coef_
        else:
            coefs = clf.coef_[pred_class]
        tfidf_scores = vec.toarray()[0]
        scores = tfidf_scores * coefs
        top_idx = np.argsort(np.abs(scores))[-n:][::-1]
        return [(feature_names[i], float(scores[i])) for i in top_idx if tfidf_scores[i] > 0]

    def save(self):
        MODEL_DIR.mkdir(exist_ok=True)
        joblib.dump(self.pipeline, self._model_path)

    def load(self):
        if self._model_path.exists():
            self.pipeline = joblib.load(self._model_path)
        else:
            raise FileNotFoundError(f"No saved baseline model. Run /train first.")

    @property
    def is_trained(self) -> bool:
        return self._model_path.exists()