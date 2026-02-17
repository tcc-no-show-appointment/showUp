/**
 * @file Service for the Model History endpoints (no-show-training-api).
 *
 * Routes mapped:
 *   GET /model-history/ → list all trained models with metrics
 */
import { trainingApi } from "./api";

/**
 * Get every model registered in the database.
 *
 * @returns {Promise<import('../types/models').ModelHistoryResponse[]>}
 */
export const getAllModels = async () => {
  const response = await trainingApi.get("/model-history/");
  return response.data;
};

export const modelHistoryService = {
  getAllModels,
};

export default modelHistoryService;
