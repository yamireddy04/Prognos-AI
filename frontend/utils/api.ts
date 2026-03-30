const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type Task = 'readmission' | 'los_band' | 'specialty';
export type ModelType = 'baseline' | 'groq' | 'hybrid';

export interface TabularFeatures {
  age?: number; gender?: number; hr?: number; sbp?: number; dbp?: number;
  rr?: number; spo2?: number; temp?: number; n_comorbidities?: number;
  n_meds?: number; prior_admissions?: number;
}

export interface PredictRequest {
  note: string; task: Task; model_type: ModelType; tabular?: TabularFeatures;
}

export interface TokenSpan {
  token: string; score: number; highlighted: boolean; direction?: string;
}

export interface KeyPhrase {
  phrase: string; score: number; explanation: string;
}

export interface Explanation {
  token_spans: TokenSpan[]; key_phrases: KeyPhrase[];
  summary: string; risk_factors: string[]; protective_factors: string[];
}

export interface PredictionResponse {
  task: string; model_type: string; prediction_index: number;
  prediction_label: string; confidence: number; probabilities: number[];
  class_labels: string[]; explanation: Explanation | null;
  metadata: { reasoning: string; risk_factors: string[]; protective_factors: string[]; raw_confidence: number; } | null;
}

export interface ModelStatus {
  [task: string]: { baseline: boolean; groq: boolean; hybrid: boolean; };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' }, ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  predict: (body: PredictRequest) =>
    request<PredictionResponse>('/predict', { method: 'POST', body: JSON.stringify(body) }),
  explain: (body: { note: string; task: Task; model_type: ModelType }) =>
    request('/explain', { method: 'POST', body: JSON.stringify(body) }),
  train: (body: { tasks?: string[]; n_samples?: number }) =>
    request('/train', { method: 'POST', body: JSON.stringify(body) }),
  health: () => request<{ status: string; model_status: ModelStatus }>('/health'),
  sampleNote: (specialty?: string) =>
    request<{ note: string; specialty: string }>(`/sample-note${specialty ? `?specialty=${specialty}` : ''}`),
  modelStatus: () => request<ModelStatus>('/models/status'),
};