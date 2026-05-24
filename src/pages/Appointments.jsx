import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Search,
  X,
  ArrowUpDown,
  Ban,
  Info,
} from "lucide-react";
import { useResizableColumns } from "../hooks/useResizableColumns";
import NormalizedRiskHelp from "../components/NormalizedRiskHelp";
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

  // ── sort / filter ──
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");

  // ── resizable columns: checkbox | ID | Data | Unidade | Risco | Status | Feedback ──
  const { widths: colWidths, startResize } = useResizableColumns([
    48, 100, 160, 140, 230, 130, 120, 280,
  ]);

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
      // Remove from selection — row is no longer pending so checkbox will disappear
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(appointmentId);
        return next;
      });
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

  const toggleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const sortIcon = (col) => {
    if (sortConfig.key !== col)
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortConfig.dir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-500" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-500" />
    );
  };

  const displayAppointments = useMemo(() => {
    let data = [...appointments];
    if (filterText) {
      const q = filterText.toLowerCase();
      data = data.filter(
        (a) =>
          String(a.appointment_prediction_id).includes(q) ||
          (a.patient_id ?? "").toLowerCase().includes(q) ||
          (a.unit_name ?? "").toLowerCase().includes(q) ||
          (a.specialty ?? "").toLowerCase().includes(q),
      );
    }
    if (filterStatus !== "all") {
      if (filterStatus === "pending")
        data = data.filter((a) => !a.appointment_status);
      else data = data.filter((a) => a.appointment_status === filterStatus);
    }
    if (filterRisk !== "all") {
      data = data.filter(
        (a) => getRiskLevel(a.probability_no_show_normalized) === filterRisk,
      );
    }
    if (sortConfig.key) {
      data.sort((a, b) => {
        let av = a[sortConfig.key],
          bv = b[sortConfig.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "string") {
          av = av.toLowerCase();
          bv = bv.toLowerCase();
        }
        if (av < bv) return sortConfig.dir === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [appointments, sortConfig, filterText, filterStatus, filterRisk]);

  const stats = {
    total,
    high: appointments.filter(
      (a) => getRiskLevel(a.probability_no_show_normalized) === "High",
    ).length,
    medium: appointments.filter(
      (a) => getRiskLevel(a.probability_no_show_normalized) === "Medium",
    ).length,
    low: appointments.filter(
      (a) => getRiskLevel(a.probability_no_show_normalized) === "Low",
    ).length,
  };

  const getRiskBadge = (probabilityNoShow, threshold, probabilityRaw) => {
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
        <div className="relative group/badge inline-flex">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border cursor-help ${cls}`}
          >
            {icon}
            {label}
          </span>
          <div className="invisible group-hover/badge:visible opacity-0 group-hover/badge:opacity-100 transition-opacity absolute bottom-full left-0 mb-1.5 w-44 bg-slate-800 text-white text-xs rounded-lg p-2.5 z-30 pointer-events-none">
            <p className="font-semibold mb-1.5">Risco normalizado</p>
            <div className="flex flex-col gap-0.5 text-slate-300">
              <span>
                <span className="text-green-400 font-medium">Baixo</span> —
                abaixo de 40%
              </span>
              <span>
                <span className="text-yellow-400 font-medium">Médio</span> —
                entre 40% e 70%
              </span>
              <span>
                <span className="text-red-400 font-medium">Alto</span> — acima
                de 70%
              </span>
            </div>
          </div>
        </div>
        {probabilityNoShow != null && (
          <div className="relative group inline-flex items-center gap-0.5">
            <span className="text-xs text-slate-500">
              {(probabilityNoShow * 100).toFixed(1)}%
            </span>
            <Info className="w-3 h-3 text-slate-400 cursor-help" />
            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-0 mb-1.5 w-56 bg-slate-800 text-white text-xs rounded-lg p-2.5 z-30 pointer-events-none">
              <p className="font-semibold mb-1.5">Valor normalizado</p>
              <p className="text-slate-400">
                Limiar da especialidade:{" "}
                <span className="text-white font-medium">
                  {threshold != null ? `${(threshold * 100).toFixed(1)}%` : "—"}
                </span>
              </p>
              <p className="mt-0.5 text-slate-400">
                Probabilidade bruta:{" "}
                <span className="text-white font-medium">
                  {probabilityRaw != null
                    ? `${(probabilityRaw * 100).toFixed(1)}%`
                    : "—"}
                </span>
              </p>
            </div>
          </div>
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
    if (status === "Cancelado")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <Ban className="w-3 h-3" />
          Cancelado
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
        <div className="flex items-center gap-2">
          <NormalizedRiskHelp />
          <button
            onClick={() => fetchAppointments(page)}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
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
          <button
            onClick={() => handleBulkFeedback("Cancelado")}
            disabled={bulkState?.loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {bulkState?.loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Ban className="w-3 h-3" />
            )}
            Marcar como Cancelado
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

      {/* Filter / Sort Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID, paciente, unidade ou especialidade…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {filterText && (
            <button
              onClick={() => setFilterText("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="Realizado">Compareceu</option>
          <option value="Falta">Faltou</option>
          <option value="Cancelado">Cancelado</option>
        </select>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os riscos</option>
          <option value="High">Alto risco</option>
          <option value="Medium">Médio risco</option>
          <option value="Low">Baixo risco</option>
        </select>
        {(filterText || filterStatus !== "all" || filterRisk !== "all") && (
          <button
            onClick={() => {
              setFilterText("");
              setFilterStatus("all");
              setFilterRisk("all");
            }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}
        {(filterText || filterStatus !== "all" || filterRisk !== "all") && (
          <span className="text-xs text-slate-400 ml-auto">
            {displayAppointments.length} de {appointments.length} na página
          </span>
        )}
      </div>

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
            <table
              className="w-full text-sm"
              style={{
                tableLayout: "fixed",
                minWidth: colWidths.reduce((a, b) => a + b, 0),
              }}
            >
              <colgroup>
                {colWidths.map((w, i) => (
                  <col key={i} style={{ width: w }} />
                ))}
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {/* Checkbox — not resizable */}
                  <th
                    className="px-4 py-4 text-center"
                    style={{ position: "relative" }}
                  >
                    <input
                      type="checkbox"
                      checked={allPendingSelected}
                      onChange={toggleAllPending}
                      title="Selecionar todas as pendentes"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                    style={{ position: "relative" }}
                    onClick={() => toggleSort("appointment_prediction_id")}
                  >
                    <span className="flex items-center gap-1 pr-2">
                      ID {sortIcon("appointment_prediction_id")}
                    </span>
                    <div
                      onMouseDown={startResize(1)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                    style={{ position: "relative" }}
                    onClick={() => toggleSort("patient_id")}
                  >
                    <span className="flex items-center gap-1 pr-2">
                      Paciente {sortIcon("patient_id")}
                    </span>
                    <div
                      onMouseDown={startResize(2)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                    style={{ position: "relative" }}
                    onClick={() => toggleSort("appointment_at")}
                  >
                    <span className="flex items-center gap-1 pr-2">
                      Data Consulta {sortIcon("appointment_at")}
                    </span>
                    <div
                      onMouseDown={startResize(3)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                    style={{ position: "relative" }}
                    onClick={() => toggleSort("specialty")}
                  >
                    <span className="flex items-center gap-1 pr-2">
                      Unidade / Especialidade {sortIcon("specialty")}
                    </span>
                    <div
                      onMouseDown={startResize(4)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                    style={{ position: "relative" }}
                    onClick={() => toggleSort("probability_no_show_normalized")}
                  >
                    <span className="flex items-center gap-1 pr-2">
                      Risco previsto{" "}
                      {sortIcon("probability_no_show_normalized")}
                    </span>
                    <div
                      onMouseDown={startResize(5)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                    style={{ position: "relative" }}
                    onClick={() => toggleSort("appointment_status")}
                  >
                    <span className="flex items-center gap-1 pr-2">
                      Status {sortIcon("appointment_status")}
                    </span>
                    <div
                      onMouseDown={startResize(6)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    style={{ position: "relative" }}
                  >
                    Feedback
                    <div
                      onMouseDown={startResize(7)}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayAppointments.map((apt) => {
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
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">
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
                        {getRiskBadge(
                          apt.probability_no_show_normalized ??
                            apt.probability_no_show,
                          apt.threshold,
                          apt.probability_no_show,
                        )}
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
                              <button
                                onClick={() => handleFeedback(id, "Cancelado")}
                                disabled={feedbackLoading[id]}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-500 text-white hover:bg-slate-600 transition-colors disabled:opacity-50"
                              >
                                {feedbackLoading[id] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Ban className="w-3 h-3" />
                                )}
                                Cancelado
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
