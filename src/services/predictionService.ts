/**
 * @file Service for the Prediction endpoints (no-show-predicton-api).
 *
 * Routes mapped:
 *   POST /predict        → single prediction
 *   POST /predict/batch  → batch prediction (up to 1 000)
 *   POST /predict/range  → date-range prediction (3–5 days)
 */
import { predictionApi } from "./api";
import type {
  PredictionRequest,
  PredictionResponse,
  BatchPredictionResponse,
  RangePredictionResponse,
} from "../types/models";

/**
 * Get a single no-show prediction for one appointment.
 */
export const predict = async (
  appointmentData: PredictionRequest
): Promise<PredictionResponse> => {
  const response = await predictionApi.post<PredictionResponse>(
    "/predict",
    appointmentData
  );
  return response.data;
};

/**
 * Get predictions for multiple appointments in a single request.
 *
 * @param appointments - Max 1 000
 */
export const predictBatch = async (
  appointments: PredictionRequest[]
): Promise<BatchPredictionResponse> => {
  const response = await predictionApi.post<BatchPredictionResponse>(
    "/predict/batch",
    { appointments }
  );
  return response.data;
};

/**
 * Get predictions across a range of dates for one appointment.
 *
 * @param appointmentData - The appointment to predict
 * @param rangeDays - 3 to 5
 */
export const predictRange = async (
  appointmentData: PredictionRequest,
  rangeDays: number
): Promise<RangePredictionResponse> => {
  const response = await predictionApi.post<RangePredictionResponse>(
    "/predict/range",
    {
      appointment: appointmentData,
      range_days: rangeDays,
    }
  );
  return response.data;
};

export const predictionService = {
  predict,
  predictBatch,
  predictRange,
};

export default predictionService;
