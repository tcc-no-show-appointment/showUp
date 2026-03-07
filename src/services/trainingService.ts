/**
 * @file Service for the Training endpoints (no-show-training-api).
 *
 * Routes mapped:
 *   POST /training/validate         → validate a CSV/Excel/Parquet file
 *   POST /training/upload-and-train → upload file and trigger full training pipeline
 */
import { trainingApi } from "./api";
import type { ValidationResponse, TrainingResponse } from "../types/models";

/**
 * Validate an uploaded data file without triggering training.
 *
 * @param file - The file to validate (CSV, Excel, or Parquet)
 */
export const validateFile = async (file: File): Promise<ValidationResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await trainingApi.post<ValidationResponse>(
    "/training/validate",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

/**
 * Upload a data file and run the full training pipeline.
 * This is a long-running operation — the training API has a longer timeout.
 *
 * @param file - The file to upload and train on
 */
export const uploadAndTrain = async (file: File): Promise<TrainingResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await trainingApi.post<TrainingResponse>(
    "/training/upload-and-train",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

export const trainingService = {
  validateFile,
  uploadAndTrain,
};

export default trainingService;
