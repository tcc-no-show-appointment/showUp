/**
 * @file Type definitions for the ShowUp application.
 * 
 * All API models and data structures for Prediction and Training APIs.
 */

// ============================================================================
// PREDICTION API — Prediction Models
// ============================================================================

export interface PredictionRequest {
  id?: number;
  Marcacao: string; // Scheduled date/time (ISO)
  DataHoraConsulta: string; // Appointment date/time (ISO)
  Idade: number; // Patient age (0–120)
  Sexo: "M" | "F"; // Patient gender
  CidadePaciente: string; // Patient city
  BairroPaciente: string; // Patient neighborhood
  TipoConvenio: string; // Insurance type
  idUnicoPaciente?: string; // Unique patient ID
  UnidadeAtendimento: string; // Healthcare unit name
  EnderecoUnidadeAtendimento: string; // Healthcare unit address
  CEPUnidadeAtendimento: string; // Healthcare unit postal code
  Especialidade: string; // Medical specialty
}

export interface PredictionResponse {
  prediction: 0 | 1; // 0 = Show, 1 = No-Show
  prediction_label: "Show" | "No-Show";
  probability_show: number;
  probability_no_show: number;
}

export interface BatchPredictionRequest {
  appointments: PredictionRequest[]; // Max 1000
}

export interface AppointmentPredictionResult {
  appointment: PredictionRequest;
  prediction: 0 | 1;
  prediction_label: "Show" | "No-Show";
  probability_show: number;
  probability_no_show: number;
}

export interface BatchPredictionResponse {
  total: number;
  predicted_show: number;
  predicted_no_show: number;
  results: AppointmentPredictionResult[];
}

export interface RangePredictionRequest {
  appointment: PredictionRequest;
  range_days: number; // 3–5
}

export interface DatePrediction {
  date: string; // YYYY-MM-DD
  prediction: 0 | 1;
  prediction_label: "Show" | "No-Show";
  probability_no_show: number;
  probability_show: number;
}

export interface RangePredictionSummary {
  avg_probability_no_show: number;
  min_probability_no_show: number;
  max_probability_no_show: number;
  best_date: string;
  worst_date: string;
}

export interface RangePredictionResponse {
  original_appointment_date: string;
  original_appointment_time: string;
  patient_id: string | null;
  predictions: DatePrediction[];
  range_days: number;
  summary: RangePredictionSummary;
}

// ============================================================================
// PREDICTION API — Appointment Models
// ============================================================================

export interface AppointmentCreate {
  model_name?: string;
  patient_id?: string;
  appointment_status?: "Realizado" | "Falta" | "Cancelado";
  scheduled_at?: string; // ISO
  appointment_at?: string; // ISO
  patient_age?: number; // 0–120
  patient_sex?: "M" | "F";
  patient_city?: string;
  patient_neighborhood?: string;
  insurance_type?: string;
  unit_name?: string;
  unit_address?: string;
  unit_zipcode?: string;
  specialty?: string;
  prediction_class?: 0 | 1;
  prediction_label?: "Show" | "No-Show";
  probability_show?: number;
  probability_no_show?: number;
}

export interface AppointmentStatusUpdate {
  appointment_status: "Realizado" | "Falta" | "Cancelado";
}

export interface AppointmentResponse {
  appointment_prediction_id: number;
  model_name: string | null;
  patient_id: string | null;
  appointment_status: string | null;
  scheduled_at: string | null;
  appointment_at: string | null;
  patient_age: number | null;
  patient_sex: string | null;
  patient_city: string | null;
  patient_neighborhood: string | null;
  insurance_type: string | null;
  unit_name: string | null;
  unit_address: string | null;
  unit_zipcode: string | null;
  specialty: string | null;
  prediction_class: number | null;
  prediction_label: string | null;
  probability_show: number | null;
  probability_no_show: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface AppointmentListResponse {
  total: number;
  page: number;
  page_size: number;
  appointments: AppointmentResponse[];
}

// ============================================================================
// TRAINING API — Training Models
// ============================================================================

export interface TrainingResponse {
  status: "success";
  message: string;
  model_filename: string | null;
  blob_url: string | null;
  metrics: Record<string, any> | null; // Training metrics dict
  training_time_seconds: number | null;
  timestamp: string; // ISO datetime
}

export interface ValidationResponse {
  is_valid: boolean;
  file_format: string | null;
  file_size_mb: number | null;
  rows: number | null;
  columns: number | null;
  missing_columns: string[] | null;
  errors: string[] | null;
  warnings: string[] | null;
}

// ============================================================================
// TRAINING API — Health & Model History
// ============================================================================

export interface HealthResponse {
  status: "healthy";
  version: string;
  timestamp: string; // ISO datetime
}

export interface ModelHistoryResponse {
  id: number;
  model_name: string;
  model_version: string | null;
  blob_url: string | null;
  environment: string | null;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  roc_auc: number | null;
  training_time_seconds: number | null;
  dataset_rows: number | null;
  dataset_columns: number | null;
  created_at: string;
}

// ============================================================================
// COMMON
// ============================================================================

export interface ErrorResponse {
  detail: string;
}

// ============================================================================
// CEP Service (ViaCEP)
// ============================================================================

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}
