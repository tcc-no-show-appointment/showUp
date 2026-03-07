/**
 * @file Service for the Model History endpoints (no-show-training-api).
 *
 * Routes mapped:
 *   GET /model-history/ → list all trained models with metrics
 */
import { trainingApi } from "./api";
import type { ModelHistoryResponse } from "../types/models";

/**
 * Get every model registered in the database.
 */
export const getAllModels = async (): Promise<ModelHistoryResponse[]> => {
  const response = await trainingApi.get<ModelHistoryResponse[]>("/model-history/");
  return response.data;
};

export const modelHistoryService = {
  getAllModels,
};

export default modelHistoryService;
