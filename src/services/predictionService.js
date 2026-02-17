/**
 * @file Service for the Prediction endpoints (no-show-predicton-api).
 *
 * Routes mapped:
 *   POST /predict        → single prediction
 *   POST /predict/batch  → batch prediction (up to 1 000)
 *   POST /predict/range  → date-range prediction (3–5 days)
 */
import { predictionApi } from "./api";

/**
 * Get a single no-show prediction for one appointment.
 *
 * @param   {import('../types/models').PredictionRequest} appointmentData
 * @returns {Promise<import('../types/models').PredictionResponse>}
 */
export const predict = async (appointmentData) => {
  const response = await predictionApi.post("/predict", appointmentData);
  return response.data;
};

/**
 * Get predictions for multiple appointments in a single request.
 *
 * @param   {import('../types/models').PredictionRequest[]} appointments - Max 1 000
 * @returns {Promise<import('../types/models').BatchPredictionResponse>}
 */
export const predictBatch = async (appointments) => {
  const response = await predictionApi.post("/predict/batch", { appointments });
  return response.data;
};

/**
 * Get predictions across a range of dates for one appointment.
 *
 * @param   {import('../types/models').PredictionRequest} appointmentData
 * @param   {number} rangeDays - 3 to 5
 * @returns {Promise<import('../types/models').RangePredictionResponse>}
 */
export const predictRange = async (appointmentData, rangeDays) => {
  const response = await predictionApi.post("/predict/range", {
    appointment: appointmentData,
    range_days: rangeDays,
  });
  return response.data;
};

export const predictionService = {
  predict,
  predictBatch,
  predictRange,
};

export default predictionService;
