/**
 * @file Service for the Appointment endpoints (no-show-predicton-api).
 *
 * Routes mapped:
 *   GET    /appointments              → list (paginated, filterable)
 *   GET    /appointments/:id          → get by ID
 *   POST   /appointments              → create with prediction data
 *   PATCH  /appointments/:id          → update status (Realizado / Falta / Cancelado)
 */
import { predictionApi } from "./api";

/**
 * List appointments with pagination and optional patient filter.
 *
 * @param   {Object}  [params]
 * @param   {number}  [params.page=1]        - Page number (starts at 1)
 * @param   {number}  [params.pageSize=50]   - Items per page (max 100)
 * @param   {string}  [params.patientId]     - Filter by patient ID
 * @returns {Promise<import('../types/models').AppointmentListResponse>}
 */
export const getAppointments = async ({
  page = 1,
  pageSize = 50,
  patientId,
} = {}) => {
  const params = {
    page,
    page_size: pageSize,
    ...(patientId && { patient_id: patientId }),
  };
  const response = await predictionApi.get("/appointments", { params });
  return response.data;
};

/**
 * Get a single appointment by ID.
 *
 * @param   {number} appointmentId
 * @returns {Promise<import('../types/models').AppointmentResponse>}
 */
export const getAppointmentById = async (appointmentId) => {
  const response = await predictionApi.get(`/appointments/${appointmentId}`);
  return response.data;
};

/**
 * Create a new appointment with prediction data.
 *
 * @param   {import('../types/models').AppointmentCreate} appointmentData
 * @returns {Promise<import('../types/models').AppointmentResponse>}
 */
export const createAppointment = async (appointmentData) => {
  const response = await predictionApi.post("/appointments", appointmentData);
  return response.data;
};

/**
 * Update the actual outcome status of an appointment.
 *
 * @param   {number} appointmentId
 * @param   {string} appointmentStatus - "Realizado" | "Falta" | "Cancelado"
 * @returns {Promise<import('../types/models').AppointmentResponse>}
 */
export const updateAppointmentStatus = async (
  appointmentId,
  appointmentStatus,
) => {
  const response = await predictionApi.patch(`/appointments/${appointmentId}`, {
    appointment_status: appointmentStatus,
  });
  return response.data;
};

export const appointmentService = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
};

export default appointmentService;
