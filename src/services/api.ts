import axios, { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Base URLs — change these when deploying to other environments
// ---------------------------------------------------------------------------
const PREDICTION_API_BASE_URL =
  import.meta.env.VITE_PREDICTION_API_URL || "http://localhost:8000";

const TRAINING_API_BASE_URL =
  import.meta.env.VITE_TRAINING_API_URL || "http://localhost:8001";

// ---------------------------------------------------------------------------
// Axios instances — one per backend API
// ---------------------------------------------------------------------------

/**
 * Axios instance for the **Prediction API** (no-show-predicton-api).
 * Handles: predictions, appointments, health.
 */
export const predictionApi = axios.create({
  baseURL: PREDICTION_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30 s
});

/**
 * Axios instance for the **Training API** (no-show-training-api).
 * Handles: file validation, model training, model history, health.
 */
export const trainingApi = axios.create({
  baseURL: TRAINING_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 120000, // 2 min (training can be slow)
});

// ---------------------------------------------------------------------------
// Response interceptor — unwrap errors consistently
// ---------------------------------------------------------------------------
const errorInterceptor = (error: AxiosError<{ detail?: string; message?: string }>) => {
  if (error.response) {
    // Server responded with a status outside 2xx
    const message =
      error.response.data?.detail ||
      error.response.data?.message ||
      error.response.statusText;
    console.error(`[API Error] ${error.response.status}: ${message}`);
  } else if (error.request) {
    // Request was sent but no response received
    console.error("[API Error] No response received from server");
  } else {
    console.error(`[API Error] ${error.message}`);
  }
  return Promise.reject(error);
};

predictionApi.interceptors.response.use((res) => res, errorInterceptor);
trainingApi.interceptors.response.use((res) => res, errorInterceptor);
