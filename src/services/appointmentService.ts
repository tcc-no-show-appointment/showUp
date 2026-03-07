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
import type {
  AppointmentListResponse,
  AppointmentResponse,
  AppointmentCreate,
} from "../types/models";

interface GetAppointmentsParams {
  page?: number;
  pageSize?: number;
  patientId?: string;
}

/**
 * List appointments with pagination and optional patient filter.
 */
export const getAppointments = async ({
  page = 1,
  pageSize = 50,
  patientId,
}: GetAppointmentsParams = {}): Promise<AppointmentListResponse> => {
  const params: Record<string, any> = {
    page,
    page_size: pageSize,
  };

  if (patientId) {
    params.patient_id = patientId;
  }

  const response = await predictionApi.get<AppointmentListResponse>(
    "/appointments",
    { params }
  );
  return response.data;
};

/**
 * Get a single appointment by ID.
 */
export const getAppointmentById = async (
  appointmentId: number
): Promise<AppointmentResponse> => {
  const response = await predictionApi.get<AppointmentResponse>(
    `/appointments/${appointmentId}`
  );
  return response.data;
};

/**
 * Create a new appointment with prediction data.
 */
export const createAppointment = async (
  appointmentData: AppointmentCreate
): Promise<AppointmentResponse> => {
  const response = await predictionApi.post<AppointmentResponse>(
    "/appointments",
    appointmentData
  );
  return response.data;
};

/**
 * Update the actual outcome status of an appointment.
 *
 * @param appointmentId - The appointment ID
 * @param appointmentStatus - "Realizado" | "Falta" | "Cancelado"
 */
export const updateAppointmentStatus = async (
  appointmentId: number,
  appointmentStatus: "Realizado" | "Falta" | "Cancelado"
): Promise<AppointmentResponse> => {
  const response = await predictionApi.patch<AppointmentResponse>(
    `/appointments/${appointmentId}`,
    {
      appointment_status: appointmentStatus,
    }
  );
  return response.data;
};

export const appointmentService = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
};

export default appointmentService;
