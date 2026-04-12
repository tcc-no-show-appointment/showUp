import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { appointmentService } from "../services";

const PAGE_SIZE = 20;

const getRiskLevel = (probabilityNoShow) => {
  if (probabilityNoShow == null) return null;
  if (probabilityNoShow > 0.7) return "High";
  if (probabilityNoShow > 0.4) return "Medium";
  return "Low";
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState({});
  const [feedbackError, setFeedbackError] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkState, setBulkState] = useState(null); // null | { loading, done, failed, total }

  const fetchAppointments = useCallback(async (currentPage) => {
    setLoading(true);
    setError("");
    setSelectedIds(new Set());
    setBulkState(null);
    try {
      const data = await appointmentService.getAppointments({
        page: currentPage,
        pageSize: PAGE_SIZE,
      });
      setAppointments(data.appointments);
      setTotal(data.total);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Erro ao carregar consultas. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(page);
  }, [page, fetchAppointments]);

  const handleFeedback = async (appointmentId, status) => {
    setFeedbackLoading((prev) => ({ ...prev, [appointmentId]: true }));
    setFeedbackError((prev) => ({ ...prev, [appointmentId]: "" }));
    try {
      const updated = await appointmentService.updateAppointmentFeedback(
        appointmentId,
        status,
      );
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.appointment_prediction_id === appointmentId
            ? { ...apt, appointment_status: updated.appointment_status }
            : apt,
        ),
      );
    } catch (err) {
      setFeedbackError((prev) => ({
        ...prev,
        [appointmentId]:
          err.response?.data?.detail ||
          err.message ||
          "Erro ao registrar feedback.",
      }));
    } finally {
      setFeedbackLoading((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pendingAppointments = appointments.filter((a) => !a.appointment_status);
  const allPendingSelected =
    pendingAppointments.length > 0 &&
    pendingAppointments.every((a) =>
      selectedIds.has(a.appointment_prediction_id),
    );

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllPending = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(pendingAppointments.map((a) => a.appointment_prediction_id)),
      );
    }
  };

  const handleBulkFeedback = async (status) => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    setBulkState({ loading: true, done: 0, failed: 0, total: ids.length });
    try {
      const feedbacks = ids.map((id) => ({
        appointment_id: id,
        appointment_status: status,
      }));
      const result =
        await appointmentService.updateAppointmentsFeedbackBatch(feedbacks);
      setAppointments((prev) =>
        prev.map((apt) => {
          const updated = result.appointments.find(
            (u) =>
              u.appointment_prediction_id === apt.appointment_prediction_id,
          );
          return updated
            ? { ...apt, appointment_status: updated.appointment_status }
            : apt;
        }),
      );
      setBulkState({
        loading: false,
        done: result.updated,
        failed: result.failed,
        total: ids.length,
      });
    } catch {
      setBulkState({
        loading: false,
        done: 0,
        failed: ids.length,
        total: ids.length,
      });
    }
    setSelectedIds(new Set());
  };

  const stats = {
    total,
    high: appointments.filter(
      (a) => getRiskLevel(a.probability_no_show) === "High",
    ).length,
    medium: appointments.filter(
      (a) => getRiskLevel(a.probability_no_show) === "Medium",
    ).length,
    low: appointments.filter(
      (a) => getRiskLevel(a.probability_no_show) === "Low",
    ).length,
  };

  const getRiskBadge = (probabilityNoShow) => {
    const risk = getRiskLevel(probabilityNoShow);
    if (!risk) return <span className="text-xs text-slate-400">—</span>;

    const configs = {
      High: {
        cls: "bg-red-100 text-red-700 border-red-200",
        icon: <AlertTriangle className="w-3 h-3" />,
        label: "Alto",
      },
      Medium: {
        cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock className="w-3 h-3" />,
        label: "Médio",
      },
      Low: {
        cls: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Baixo",
      },
    };
    const { cls, icon, label } = configs[risk];
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${cls}`}
        >
          {icon}
          {label}
        </span>
        {probabilityNoShow != null && (
          <span className="text-xs text-slate-500">
            {(probabilityNoShow * 100).toFixed(1)}%
          </span>
        )}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    if (!status)
      return <span className="text-xs text-slate-400">Pendente</span>;
    if (status === "Realizado")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
          <CheckCircle className="w-3 h-3" />
          Compareceu
        </span>
      );
    if (status === "Falta")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
          <XCircle className="w-3 h-3" />
          Faltou
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        {status}
      </span>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Consultas Salvas
          </h1>
          <p className="text-slate-500">
            Gerencie consultas e forneça feedback para melhorar a IA
          </p>
        </div>
        <button
          onClick={() => fetchAppointments(page)}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total de Consultas</p>
          <p className="text-2xl font-bold text-slate-800">{total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-red-200">
          <p className="text-sm text-slate-500 mb-1">Risco Alto (pág.)</p>
          <p className="text-2xl font-bold text-red-600">{stats.high}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-200">
          <p className="text-sm text-slate-500 mb-1">Risco Médio (pág.)</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-green-200">
          <p className="text-sm text-slate-500 mb-1">Risco Baixo (pág.)</p>
          <p className="text-2xl font-bold text-green-600">{stats.low}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} selecionada{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => handleBulkFeedback("Realizado")}
            disabled={bulkState?.loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {bulkState?.loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            Marcar como Compareceu
          </button>
          <button
            onClick={() => handleBulkFeedback("Falta")}
            disabled={bulkState?.loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {bulkState?.loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            Marcar como Faltou
          </button>
          {bulkState && !bulkState.loading && (
            <span
              className={`text-xs font-medium ml-auto ${
                bulkState.failed === 0 ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {bulkState.failed === 0
                ? `${bulkState.done} marcada${bulkState.done !== 1 ? "s" : ""} com sucesso`
                : `${bulkState.done} ok, ${bulkState.failed} com falha`}
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              Nenhuma consulta salva ainda.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Salve consultas na tela de Predição para acompanhá-las aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={allPendingSelected}
                      onChange={toggleAllPending}
                      title="Selecionar todas as pendentes"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID / Paciente
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Data Consulta
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Unidade / Especialidade
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Risco IA
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {appointments.map((apt) => {
                  const id = apt.appointment_prediction_id;
                  const isPending = !apt.appointment_status;
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr
                      key={id}
                      className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-4 py-4 text-center">
                        {isPending ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                          />
                        ) : (
                          <span className="w-4 h-4 inline-block" />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800 text-sm">
                          #{id}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {apt.patient_id || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">
                          {apt.appointment_at
                            ? new Date(apt.appointment_at).toLocaleDateString(
                                "pt-BR",
                              )
                            : "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {apt.appointment_at
                            ? new Date(apt.appointment_at).toLocaleTimeString(
                                "pt-BR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : ""}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700 font-medium">
                          {apt.unit_name || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {apt.specialty || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {getRiskBadge(apt.probability_no_show)}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(apt.appointment_status)}
                      </td>
                      <td className="px-4 py-4">
                        {isPending ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleFeedback(id, "Realizado")}
                                disabled={feedbackLoading[id]}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {feedbackLoading[id] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                Compareceu
                              </button>
                              <button
                                onClick={() => handleFeedback(id, "Falta")}
                                disabled={feedbackLoading[id]}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                {feedbackLoading[id] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                Faltou
                              </button>
                            </div>
                            {feedbackError[id] && (
                              <p className="text-xs text-red-600 mt-1 text-center">
                                {feedbackError[id]}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 text-center block">
                            Registrado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Página {page} de {totalPages} &mdash; {total} consulta
            {total !== 1 ? "s" : ""} no total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
