/**
 * @file Service for the Training endpoints (no-show-training-api).
 *
 * Routes mapped:
 *   POST /training/validate         → validate a CSV/Excel/Parquet file
 *   POST /training/upload-and-train → upload file and trigger full training pipeline
 */
import { trainingApi } from "./api";

/**
 * Validate an uploaded data file without triggering training.
 *
 * @param   {File} file - The file to validate (CSV, Excel, or Parquet)
 * @returns {Promise<import('../types/models').ValidationResponse>}
 */
export const validateFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await trainingApi.post("/training/validate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Upload a data file and run the full training pipeline.
 * This is a long-running operation — the training API has a longer timeout.
 *
 * @param   {File} file - The file to upload and train on
 * @returns {Promise<import('../types/models').TrainingResponse>}
 */
export const uploadAndTrain = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await trainingApi.post(
    "/training/upload-and-train",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const trainingService = {
  validateFile,
  uploadAndTrain,
};

export default trainingService;
