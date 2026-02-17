/**
 * @file Data models / type definitions for the ShowUp application.
 *
 * Since the project uses plain JavaScript (not TypeScript), these serve as
 * JSDoc-based documentation for the data shapes used across services.
 * Import nothing — just reference the @typedef names in your code.
 */

// ============================================================================
// PREDICTION API — Prediction Models
// ============================================================================

/**
 * @typedef {Object} PredictionRequest
 * @property {number}  [id]                          - Appointment ID
 * @property {string}  Marcacao                       - Scheduled date/time (ISO)
 * @property {string}  DataHoraConsulta               - Appointment date/time (ISO)
 * @property {number}  Idade                          - Patient age (0–120)
 * @property {string}  Sexo                           - Patient gender ("M" | "F")
 * @property {string}  CidadePaciente                 - Patient city
 * @property {string}  BairroPaciente                 - Patient neighborhood
 * @property {string}  TipoConvenio                   - Insurance type
 * @property {string}  [idUnicoPaciente]              - Unique patient ID
 * @property {string}  UnidadeAtendimento             - Healthcare unit name
 * @property {string}  EnderecoUnidadeAtendimento     - Healthcare unit address
 * @property {string}  CEPUnidadeAtendimento          - Healthcare unit postal code
 * @property {string}  Especialidade                  - Medical specialty
 */

/**
 * @typedef {Object} PredictionResponse
 * @property {number} prediction          - 0 = Show, 1 = No-Show
 * @property {string} prediction_label    - "Show" | "No-Show"
 * @property {number} probability_show    - Probability of showing up
 * @property {number} probability_no_show - Probability of not showing up
 */

/**
 * @typedef {Object} BatchPredictionRequest
 * @property {PredictionRequest[]} appointments - List of appointments (max 1000)
 */

/**
 * @typedef {Object} AppointmentPredictionResult
 * @property {Object} appointment         - Original appointment data
 * @property {number} prediction          - 0 = Show, 1 = No-Show
 * @property {string} prediction_label    - "Show" | "No-Show"
 * @property {number} probability_show    - Probability of showing up
 * @property {number} probability_no_show - Probability of not showing up
 */

/**
 * @typedef {Object} BatchPredictionResponse
 * @property {number} total                              - Total predictions
 * @property {number} predicted_show                     - Count of "Show" predictions
 * @property {number} predicted_no_show                  - Count of "No-Show" predictions
 * @property {AppointmentPredictionResult[]} results     - Individual results
 */

/**
 * @typedef {Object} RangePredictionRequest
 * @property {PredictionRequest} appointment - Appointment data
 * @property {number} range_days             - Number of days to predict (3–5)
 */

/**
 * @typedef {Object} DatePrediction
 * @property {string} date               - Date (YYYY-MM-DD)
 * @property {number} prediction         - 0 = Show, 1 = No-Show
 * @property {string} prediction_label   - "Show" | "No-Show"
 * @property {number} probability_no_show
 * @property {number} probability_show
 */

/**
 * @typedef {Object} RangePredictionSummary
 * @property {number} avg_probability_no_show
 * @property {number} min_probability_no_show
 * @property {number} max_probability_no_show
 * @property {string} best_date
 * @property {string} worst_date
 */

/**
 * @typedef {Object} RangePredictionResponse
 * @property {string}              original_appointment_date
 * @property {string}              original_appointment_time
 * @property {string|null}         patient_id
 * @property {DatePrediction[]}    predictions
 * @property {number}              range_days
 * @property {RangePredictionSummary} summary
 */

// ============================================================================
// PREDICTION API — Appointment Models
// ============================================================================

/**
 * @typedef {Object} AppointmentCreate
 * @property {string}  [model_name]          - Model blob name that generated the prediction
 * @property {string}  [patient_id]          - Unique patient ID
 * @property {string}  [appointment_status]  - "Realizado" | "Falta" | "Cancelado"
 * @property {string}  [scheduled_at]        - When appointment was scheduled (ISO)
 * @property {string}  [appointment_at]      - When appointment is scheduled for (ISO)
 * @property {number}  [patient_age]         - Patient age (0–120)
 * @property {string}  [patient_sex]         - "M" | "F"
 * @property {string}  [patient_city]
 * @property {string}  [patient_neighborhood]
 * @property {string}  [insurance_type]
 * @property {string}  [unit_name]
 * @property {string}  [unit_address]
 * @property {string}  [unit_zipcode]
 * @property {string}  [specialty]
 * @property {number}  [prediction_class]    - 0 = Show, 1 = No-Show
 * @property {string}  [prediction_label]    - "Show" | "No-Show"
 * @property {number}  [probability_show]
 * @property {number}  [probability_no_show]
 */

/**
 * @typedef {Object} AppointmentStatusUpdate
 * @property {string} appointment_status - "Realizado" | "Falta" | "Cancelado"
 */

/**
 * @typedef {Object} AppointmentResponse
 * @property {number}      appointment_prediction_id
 * @property {string|null} model_name
 * @property {string|null} patient_id
 * @property {string|null} appointment_status
 * @property {string|null} scheduled_at
 * @property {string|null} appointment_at
 * @property {number|null} patient_age
 * @property {string|null} patient_sex
 * @property {string|null} patient_city
 * @property {string|null} patient_neighborhood
 * @property {string|null} insurance_type
 * @property {string|null} unit_name
 * @property {string|null} unit_address
 * @property {string|null} unit_zipcode
 * @property {string|null} specialty
 * @property {number|null} prediction_class
 * @property {string|null} prediction_label
 * @property {number|null} probability_show
 * @property {number|null} probability_no_show
 * @property {string}      created_at
 * @property {string|null} updated_at
 */

/**
 * @typedef {Object} AppointmentListResponse
 * @property {number}                total
 * @property {number}                page
 * @property {number}                page_size
 * @property {AppointmentResponse[]} appointments
 */

// ============================================================================
// TRAINING API — Training Models
// ============================================================================

/**
 * @typedef {Object} TrainingResponse
 * @property {string}      status                  - "success"
 * @property {string}      message
 * @property {string|null} model_filename
 * @property {string|null} blob_url
 * @property {Object|null} metrics                 - Training metrics dict
 * @property {number|null} training_time_seconds
 * @property {string}      timestamp               - ISO datetime
 */

/**
 * @typedef {Object} ValidationResponse
 * @property {boolean}      is_valid
 * @property {string|null}  file_format
 * @property {number|null}  file_size_mb
 * @property {number|null}  rows
 * @property {number|null}  columns
 * @property {string[]|null} missing_columns
 * @property {string[]|null} errors
 * @property {string[]|null} warnings
 */

// ============================================================================
// TRAINING API — Health & Model History
// ============================================================================

/**
 * @typedef {Object} HealthResponse
 * @property {string} status    - "healthy"
 * @property {string} version   - API version
 * @property {string} timestamp - ISO datetime
 */

/**
 * @typedef {Object} ModelHistoryResponse
 * @property {number}      id
 * @property {string}      model_name
 * @property {string|null} model_version
 * @property {string|null} blob_url
 * @property {string|null} environment
 * @property {number|null} accuracy
 * @property {number|null} precision
 * @property {number|null} recall
 * @property {number|null} f1_score
 * @property {number|null} roc_auc
 * @property {number|null} training_time_seconds
 * @property {number|null} dataset_rows
 * @property {number|null} dataset_columns
 * @property {string}      created_at
 */

// ============================================================================
// COMMON
// ============================================================================

/**
 * @typedef {Object} ErrorResponse
 * @property {string} detail - Error message
 */
