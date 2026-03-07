/**
 * @file Service for Health-check endpoints on both APIs.
 *
 * Routes mapped:
 *   Prediction API:
 *     GET /        → root check
 *     GET /health  → detailed health (model loaded, config loaded)
 *
 *   Training API:
 *     GET /        → root check (returns HealthResponse)
 *     GET /health/ → health check (returns HealthResponse)
 */
import { predictionApi, trainingApi } from "./api";
import type { HealthResponse } from "../types/models";

// ---------------------------------------------------------------------------
// Prediction API health
// ---------------------------------------------------------------------------

interface PredictionApiRootResponse {
  status: string;
  message: string;
}

interface PredictionApiHealthResponse {
  status: string;
  model_loaded: boolean;
  config_loaded: boolean;
  model_type: string | null;
}

/**
 * Root health check on the Prediction API.
 */
export const getPredictionApiRoot = async (): Promise<PredictionApiRootResponse> => {
  const response = await predictionApi.get<PredictionApiRootResponse>("/");
  return response.data;
};

/**
 * Detailed health check on the Prediction API (model & config status).
 */
export const getPredictionApiHealth = async (): Promise<PredictionApiHealthResponse> => {
  const response = await predictionApi.get<PredictionApiHealthResponse>("/health");
  return response.data;
};

// ---------------------------------------------------------------------------
// Training API health
// ---------------------------------------------------------------------------

/**
 * Root health check on the Training API.
 */
export const getTrainingApiRoot = async (): Promise<HealthResponse> => {
  const response = await trainingApi.get<HealthResponse>("/");
  return response.data;
};

/**
 * Health check on the Training API.
 */
export const getTrainingApiHealth = async (): Promise<HealthResponse> => {
  const response = await trainingApi.get<HealthResponse>("/health/");
  return response.data;
};

export const healthService = {
  getPredictionApiRoot,
  getPredictionApiHealth,
  getTrainingApiRoot,
  getTrainingApiHealth,
};

export default healthService;
