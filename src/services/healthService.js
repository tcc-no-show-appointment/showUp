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

// ---------------------------------------------------------------------------
// Prediction API health
// ---------------------------------------------------------------------------

/**
 * Root health check on the Prediction API.
 *
 * @returns {Promise<{ status: string, message: string }>}
 */
export const getPredictionApiRoot = async () => {
  const response = await predictionApi.get("/");
  return response.data;
};

/**
 * Detailed health check on the Prediction API (model & config status).
 *
 * @returns {Promise<{ status: string, model_loaded: boolean, config_loaded: boolean, model_type: string|null }>}
 */
export const getPredictionApiHealth = async () => {
  const response = await predictionApi.get("/health");
  return response.data;
};

// ---------------------------------------------------------------------------
// Training API health
// ---------------------------------------------------------------------------

/**
 * Root health check on the Training API.
 *
 * @returns {Promise<import('../types/models').HealthResponse>}
 */
export const getTrainingApiRoot = async () => {
  const response = await trainingApi.get("/");
  return response.data;
};

/**
 * Health check on the Training API.
 *
 * @returns {Promise<import('../types/models').HealthResponse>}
 */
export const getTrainingApiHealth = async () => {
  const response = await trainingApi.get("/health/");
  return response.data;
};

export const healthService = {
  getPredictionApiRoot,
  getPredictionApiHealth,
  getTrainingApiRoot,
  getTrainingApiHealth,
};

export default healthService;
