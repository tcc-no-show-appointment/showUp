/**
 * @file Barrel export — import any service from a single entry point.
 *
 * Usage:
 *   import { predictionService, appointmentService } from '../services';
 */
export { default as predictionService } from "./predictionService";
export { default as appointmentService } from "./appointmentService";
export { default as trainingService } from "./trainingService";
export { default as modelHistoryService } from "./modelHistoryService";
export { default as healthService } from "./healthService";

// Re-export axios instances for advanced use-cases
export { predictionApi, trainingApi } from "./api";
