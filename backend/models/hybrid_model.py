import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from scipy.sparse import hstack
from typing import List, Optional, Tuple

from utils.text_processing import preprocess_batch
from utils.feature_engineering import build_tabular_matrix, build_single_tabular
from utils.metrics import compute_metrics
from config import MODEL_DIR, TASK_LABELS


class HybridModel:
    def __init__(self, task: str):
        self.task = task
        self.labels = TASK_LABELS.get(task, [])
        self.tfidf: Optional[TfidfVectorizer] = None
        self.scaler: Optional[StandardScaler] = None
        self.clf: Optional[LogisticRegression] = None
        self._model_path = MODEL_DIR / f"hybrid_{task}.pkl"

    def train(self, texts: List[str], tabular_df, labels: np.ndarray) -> dict:
        processed = preprocess_batch(texts, lemmatize=True)
        X_tab, self.scaler = build_tabular_matrix(tabular_df, fit=True)

        self.tfidf = TfidfVectorizer(
            max_features=15000,
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=2,
            max_df=0.95,
        )
        X_text = self.tfidf.fit_transform(processed)
        X = hstack([X_text, X_tab])

        X_train, X_val, y_train, y_val = train_test_split(
            X, labels, test_size=0.2, random_state=42, stratify=labels
        )

        self.clf = LogisticRegression(
            C=0.8, max_iter=1000, class_weight="balanced",
            solver="lbfgs", multi_class="auto",
        )
        self.clf.fit(X_train, y_train)

        y_pred = self.clf.predict(X_val)
        y_proba = self.clf.predict_proba(X_val)
        metrics = compute_metrics(y_val, y_pred, y_proba, labels=self.labels)
        self.save()
        return metrics

    def predict(self, text: str, tabular: Optional[dict] = None) -> Tuple[int, List[float]]:
        if self.clf is None:
            self.load()
        processed = preprocess_batch([text], lemmatize=True)
        X_text = self.tfidf.transform(processed)

        if tabular is not None:
            X_tab = build_single_tabular(tabular, scaler=self.scaler)
        else:
            X_tab = np.zeros((1, self.scaler.n_features_in_))
            X_tab = self.scaler.transform(X_tab)

        X = hstack([X_text, X_tab])
        pred = int(self.clf.predict(X)[0])
        proba = self.clf.predict_proba(X)[0].tolist()
        return pred, proba

    def get_feature_importances(self, text: str, n: int = 12) -> List[Tuple[str, float]]:
        if self.clf is None:
            self.load()
        processed = preprocess_batch([text], lemmatize=True)
        feature_names = list(self.tfidf.get_feature_names_out())
        X_text = self.tfidf.transform(processed)
        pred_class = int(self.clf.predict(X_text)[0])

        if self.clf.coef_.ndim == 1:
            coefs = self.clf.coef_
        else:
            coefs = self.clf.coef_[pred_class][:len(feature_names)]

        tfidf_vals = X_text.toarray()[0]
        scores = tfidf_vals * coefs[:len(tfidf_vals)]
        top_idx = np.argsort(np.abs(scores))[-n:][::-1]
        return [(feature_names[i], float(scores[i])) for i in top_idx if tfidf_vals[i] > 0]

    def save(self):
        MODEL_DIR.mkdir(exist_ok=True)
        joblib.dump({"tfidf": self.tfidf, "scaler": self.scaler, "clf": self.clf}, self._model_path)

    def load(self):
        if self._model_path.exists():
            bundle = joblib.load(self._model_path)
            self.tfidf = bundle["tfidf"]
            self.scaler = bundle["scaler"]
            self.clf = bundle["clf"]
        else:
            raise FileNotFoundError("No saved hybrid model. Run /train first.")

    @property
    def is_trained(self) -> bool:
        return self._model_path.exists()