/**
 * @file Service for the Training endpoints (no-show-training-api).
 *
 * Routes mapped (relative to TRAINING_API_BASE_URL which ends in /training):
 *   POST /validate         → validate a CSV/Excel/Parquet file
 *   POST /upload-and-train → upload file and trigger full training pipeline
 *   POST /retrain          → retrain using existing Blob data + feedback (no file)
 *   GET  /status/{job_id}  → poll training job status
 */
import { trainingApi } from "./api";
import type {
  ValidationResponse,
  TrainingJobAccepted,
  TrainingJobStatus,
} from "../types/models";

/**
 * Validate an uploaded data file without triggering training.
 *
 * @param file - The file to validate (CSV, Excel, or Parquet)
 */
export const validateFile = async (file: File): Promise<ValidationResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await trainingApi.post<ValidationResponse>(
    "/validate",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

/**
 * Upload a data file and queue a training job.
 * Returns immediately with a job_id — poll getJobStatus to track progress.
 *
 * @param file - The file to upload and train on
 */
export const uploadAndTrain = async (file: File): Promise<TrainingJobAccepted> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await trainingApi.post<TrainingJobAccepted>(
    "/upload-and-train",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

/**
 * Trigger a retraining job using only existing Blob data and prediction feedback.
 * No file upload required. Returns immediately with a job_id to poll.
 */
export const retrainExisting = async (): Promise<TrainingJobAccepted> => {
  const response = await trainingApi.post<TrainingJobAccepted>("/retrain");
  return response.data;
};

/**
 * Poll the status of a training job by job_id.
 *
 * @param jobId - UUID returned by uploadAndTrain or retrainExisting
 */
export const getJobStatus = async (jobId: string): Promise<TrainingJobStatus> => {
  const response = await trainingApi.get<TrainingJobStatus>(
    `/status/${jobId}`
  );
  return response.data;
};

export const trainingService = {
  validateFile,
  uploadAndTrain,
  retrainExisting,
  getJobStatus,
};

export default trainingService;
