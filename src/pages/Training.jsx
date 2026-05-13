import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  RefreshCw,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Cpu,
  Activity,
  BarChart2,
  Award,
  Target,
  TrendingUp,
  FileText,
  History,
  Wrench,
  Search,
  X,
  ArrowUpDown,
} from "lucide-react";
import { trainingService } from "../services/trainingService";
import { modelHistoryService } from "../services/modelHistoryService";
import { useResizableColumns } from "../hooks/useResizableColumns";

const POLL_INTERVAL_MS = 60000;

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt = (val, decimals = 1) =>
  val == null ? "—" : `${(val * 100).toFixed(decimals)}%`;

const fmtRaw = (val, decimals = 3) =>
  val == null ? "—" : val.toFixed(decimals);

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtSeconds = (s) => {
  if (s == null) return "—";
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}min ${Math.round(s % 60)}s`;
};

/** Convert raw specialty key (e.g. "general_group" or "cardio_vascular") to readable label */
const fmtSpecialty = (key) => {
  if (!key) return "—";
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const STATUS_CONFIG = {
  pending: {
    label: "Aguardando",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    icon: Clock,
  },
  running: {
    label: "Treinando",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    icon: Loader2,
  },
  success: {
    label: "Concluído",
    color: "text-green-700 bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  failed: {
    label: "Falhou",
    color: "text-red-700 bg-red-50 border-red-200",
    icon: XCircle,
  },
};

// ── sub-components ────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
      <p className="text-lg font-bold text-slate-800 mt-0.5">{value}</p>
    </div>
  </div>
);

const SpecialtyMetricsSection = ({ specialty, metrics, threshold }) => {
  const [expanded, setExpanded] = useState(true);

  const cards = [
    {
      label: "Acurácia",
      value: fmt(metrics?.accuracy),
      icon: Target,
      color: "bg-violet-100 text-violet-600",
    },
    {
      label: "Precisão",
      value: fmt(metrics?.precision),
      icon: Activity,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Recall",
      value: fmt(metrics?.recall),
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "F1-Score",
      value: fmt(metrics?.f1_score),
      icon: BarChart2,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "ROC-AUC",
      value: fmtRaw(metrics?.roc_auc),
      icon: Award,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "PR-AUC",
      value: fmtRaw(metrics?.pr_auc),
      icon: Award,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Threshold",
      value: threshold != null ? fmtRaw(threshold, 4) : "—",
      icon: Target,
      color: "bg-slate-100 text-slate-600",
    },
    {
      label: "Tempo de treino",
      value: fmtSeconds(metrics?.training_time_seconds),
      icon: Clock,
      color: "bg-sky-100 text-sky-600",
    },
  ];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700">
            {fmtSpecialty(specialty)}
          </span>
          <span className="text-xs text-slate-400 font-normal">
            — Grupo de Especialidade
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white">
          {cards.map((c) => (
            <MetricCard key={c.label} {...c} />
          ))}
        </div>
      )}
    </div>
  );
};

const JobStatusSection = ({ job }) => {
  if (!job) return null;

  const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const isActive = job.status === "pending" || job.status === "running";

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-base font-semibold text-slate-800">
          Status do Treinamento
        </h3>
        <span
          className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-1.5 rounded-full ${cfg.color}`}
        >
          <Icon
            className={`w-4 h-4 ${isActive && job.status === "running" ? "animate-spin" : ""}`}
          />
          {cfg.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">
            Criado em
          </p>
          <p className="text-slate-700">{fmtDate(job.created_at)}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">
            Iniciado em
          </p>
          <p className="text-slate-700">{fmtDate(job.started_at)}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">
            Concluído em
          </p>
          <p className="text-slate-700">{fmtDate(job.finished_at)}</p>
        </div>
      </div>

      {isActive && (
        <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 rounded-lg px-4 py-3">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processando… atualizando a cada 1 minuto</span>
        </div>
      )}

      {job.status === "failed" && job.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-semibold text-sm">
                Erro no treinamento
              </p>
              <p className="text-red-600 text-sm mt-1 break-words">
                {job.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {job.status === "success" && job.result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{job.result.message}</span>
            {job.result.training_time_seconds != null && (
              <span className="ml-auto text-green-600 font-medium">
                {fmtSeconds(job.result.training_time_seconds)} total
              </span>
            )}
          </div>

          <div className="space-y-3">
            {Object.entries(job.result.metrics ?? {}).map(
              ([specialty, metrics]) => (
                <SpecialtyMetricsSection
                  key={specialty}
                  specialty={specialty}
                  metrics={metrics}
                  threshold={job.result.thresholds?.[specialty]}
                />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ValidationResultCard = ({ result }) => {
  if (!result) return null;

  // Network / service errors: skip the file-analysis banner and stats grid
  if (result.network_error) {
    return (
      <div className="rounded-xl border p-4 space-y-2 bg-red-50 border-red-200">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold text-sm text-red-700">
            Erro ao conectar com o servidor
          </span>
        </div>
        {result.errors?.map((e, i) => (
          <p key={i} className="text-red-600 text-xs flex items-start gap-1.5">
            <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {e}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        result.is_valid
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-center gap-2">
        {result.is_valid ? (
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
        )}
        <span
          className={`font-semibold text-sm ${result.is_valid ? "text-green-700" : "text-red-700"}`}
        >
          {result.is_valid ? "Arquivo válido" : "Arquivo inválido"}
        </span>
        {result.file_format && (
          <span className="ml-auto text-xs text-slate-500 uppercase font-medium">
            {result.file_format}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-white rounded-lg p-2 text-center border border-slate-200">
          <p className="text-slate-500 text-xs">Linhas</p>
          <p className="font-bold text-slate-700">
            {result.rows?.toLocaleString("pt-BR") ?? "—"}
          </p>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border border-slate-200">
          <p className="text-slate-500 text-xs">Colunas</p>
          <p className="font-bold text-slate-700">{result.columns ?? "—"}</p>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border border-slate-200">
          <p className="text-slate-500 text-xs">Tamanho</p>
          <p className="font-bold text-slate-700">
            {result.file_size_mb != null
              ? `${result.file_size_mb.toFixed(2)} MB`
              : "—"}
          </p>
        </div>
      </div>

      {result.errors?.length > 0 && (
        <div className="space-y-1">
          {result.errors.map((e, i) => (
            <p
              key={i}
              className="text-red-600 text-xs flex items-start gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {e}
            </p>
          ))}
        </div>
      )}

      {result.warnings?.length > 0 && (
        <div className="space-y-1">
          {result.warnings.map((w, i) => (
            <p
              key={i}
              className="text-amber-700 text-xs flex items-start gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {w}
            </p>
          ))}
        </div>
      )}

      {result.missing_columns?.length > 0 && (
        <p className="text-red-600 text-xs">
          Colunas ausentes: {result.missing_columns.join(", ")}
        </p>
      )}
    </div>
  );
};

// ── Model History table ───────────────────────────────────────────────────────

const ModelHistoryContent = ({ models, loading, error, onRefresh }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "_current",
    dir: "desc",
  });
  const [filterText, setFilterText] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");

  // Unique specialty groups for the dropdown
  const groups = useMemo(() => {
    const seen = new Set();
    (models ?? []).forEach((m) => {
      if (m.specialty_group) seen.add(m.specialty_group);
    });
    return [...seen].sort();
  }, [models]);

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

  // Determine "current" model per specialty_group (most recent by created_at) from full list
  const currentIds = useMemo(() => {
    const ids = new Set();
    if (models?.length) {
      const byGroup = {};
      models.forEach((m) => {
        const group = m.specialty_group ?? "_default";
        if (
          !byGroup[group] ||
          new Date(m.created_at) > new Date(byGroup[group].created_at)
        ) {
          byGroup[group] = m;
        }
      });
      Object.values(byGroup).forEach((m) => ids.add(m.id));
    }
    return ids;
  }, [models]);

  const displayModels = useMemo(() => {
    let data = [...(models ?? [])];
    if (filterText) {
      const q = filterText.toLowerCase();
      data = data.filter(
        (m) =>
          (m.model_version ?? m.model_name ?? "").toLowerCase().includes(q) ||
          (m.specialty_group ?? "").toLowerCase().includes(q),
      );
    }
    if (filterGroup !== "all") {
      data = data.filter((m) => m.specialty_group === filterGroup);
    }
    if (sortConfig.key === "_current") {
      // Atual first (by specialty group, most recent), then by created_at desc
      data.sort((a, b) => {
        const aCurrent = currentIds.has(a.id) ? 0 : 1;
        const bCurrent = currentIds.has(b.id) ? 0 : 1;
        if (aCurrent !== bCurrent) return aCurrent - bCurrent;
        return new Date(b.created_at) - new Date(a.created_at);
      });
    } else if (sortConfig.key) {
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
  }, [models, currentIds, sortConfig, filterText, filterGroup]);

  // Atual | Versão | Grupo | Acurácia | F1 | ROC | PR | Threshold | Linhas | Data
  const { widths: colWidths, startResize } = useResizableColumns([
    70, 200, 190, 90, 75, 90, 80, 100, 90, 155,
  ]);

  const SortableTh = ({ col, colIndex, children, className = "" }) => (
    <th
      onClick={() => toggleSort(col)}
      style={{ position: "relative" }}
      className={`text-left text-xs text-slate-400 font-semibold uppercase tracking-wide pb-3 pr-4 whitespace-nowrap cursor-pointer select-none hover:text-slate-600 transition-colors ${className}`}
    >
      <span className="inline-flex items-center gap-1 pr-2">
        {children} {sortIcon(col)}
      </span>
      <div
        onMouseDown={startResize(colIndex)}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
      />
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-500 mr-auto">
          Modelos treinados e registrados no banco de dados
        </p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 text-sm border border-slate-200 text-slate-600 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por versão ou especialidade…"
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
        {groups.length > 0 && (
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os grupos</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {fmtSpecialty(g)}
              </option>
            ))}
          </select>
        )}
        {(filterText || filterGroup !== "all") && (
          <button
            onClick={() => {
              setFilterText("");
              setFilterGroup("all");
            }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}
        {(filterText || filterGroup !== "all") && (
          <span className="text-xs text-slate-400 ml-auto">
            {displayModels.length} de {models?.length ?? 0}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && !models?.length ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando histórico…</span>
        </div>
      ) : !displayModels.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <Database className="w-8 h-8" />
          <p className="text-sm">
            {models?.length
              ? "Nenhum modelo corresponde aos filtros"
              : "Nenhum modelo treinado ainda"}
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
            <thead>
              <tr className="border-b border-slate-100">
                {/* Atual — sortable by _current */}
                <th
                  onClick={() => toggleSort("_current")}
                  style={{ position: "relative" }}
                  className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wide pb-3 pr-4 whitespace-nowrap cursor-pointer select-none hover:text-slate-600 transition-colors"
                >
                  <span className="inline-flex items-center gap-1 pr-2">
                    Atual {sortIcon("_current")}
                  </span>
                  <div
                    onMouseDown={startResize(0)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
                  />
                </th>
                <SortableTh col="model_version" colIndex={1}>
                  Versão
                </SortableTh>
                <SortableTh col="specialty_group" colIndex={2}>
                  Grupo de Especialidade
                </SortableTh>
                <SortableTh col="accuracy" colIndex={3}>
                  Acurácia
                </SortableTh>
                <SortableTh col="f1_score" colIndex={4}>
                  F1
                </SortableTh>
                <SortableTh col="roc_auc" colIndex={5}>
                  ROC-AUC
                </SortableTh>
                <SortableTh col="pr_auc" colIndex={6}>
                  PR-AUC
                </SortableTh>
                <SortableTh col="threshold" colIndex={7}>
                  Threshold
                </SortableTh>
                <SortableTh col="dataset_rows" colIndex={8}>
                  Linhas
                </SortableTh>
                <SortableTh col="created_at" colIndex={9}>
                  Treinado em
                </SortableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayModels.map((m) => {
                const isCurrent = currentIds.has(m.id);
                return (
                  <tr
                    key={m.id}
                    className={`transition-colors ${isCurrent ? "bg-blue-50/40" : "hover:bg-slate-50"}`}
                  >
                    {/* Atual */}
                    <td className="py-3 px-3">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 bg-brand-gradient text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Atual
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td
                      className="py-3 pr-4 font-mono text-xs text-slate-600"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={m.model_version ?? m.model_name}
                    >
                      {m.model_version ?? m.model_name}
                    </td>
                    <td className="py-3 pr-4 text-slate-700 overflow-hidden text-ellipsis">
                      {fmtSpecialty(m.specialty_group)}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {fmt(m.accuracy)}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {fmt(m.f1_score)}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {fmtRaw(m.roc_auc)}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {fmtRaw(m.pr_auc)}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {m.threshold != null ? fmtRaw(m.threshold, 4) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {m.dataset_rows != null
                        ? m.dataset_rows.toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-500 overflow-hidden text-ellipsis">
                      {fmtDate(m.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const Training = () => {
  const [activeTab, setActiveTab] = useState("training");
  const [mode, setMode] = useState(null); // null | "retrain" | "upload"

  // File upload state
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem("training_validation_result");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [validationLocked, setValidationLocked] = useState(false);
  const fileInputRef = useRef(null);

  // Job state
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState("");
  const pollRef = useRef(null);

  // Model history state
  const [models, setModels] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // ── polling ──
  const ACTIVE_JOB_KEY = "training_active_job_id";

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const data = await modelHistoryService.getAllModels();
      setModels(data);
    } catch (err) {
      setHistoryError(
        err.response?.data?.detail ||
          err.message ||
          "Erro ao carregar histórico de modelos.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const startPolling = useCallback(
    (id) => {
      stopPolling();
      localStorage.setItem(ACTIVE_JOB_KEY, id);
      pollRef.current = setInterval(async () => {
        try {
          const status = await trainingService.getJobStatus(id);
          setJob(status);
          if (status.status === "success" || status.status === "failed") {
            stopPolling();
            localStorage.removeItem(ACTIVE_JOB_KEY);
            fetchHistory();
          }
        } catch {
          // ignore transient errors; polling will retry
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, fetchHistory],
  );

  // Restore an in-progress job after navigation
  useEffect(() => {
    const savedId = localStorage.getItem(ACTIVE_JOB_KEY);
    if (!savedId) return;
    let cancelled = false;
    (async () => {
      try {
        const status = await trainingService.getJobStatus(savedId);
        if (cancelled) return;
        setJobId(savedId);
        setJob(status);
        if (status.status === "pending" || status.status === "running") {
          setActiveTab("training"); // bring user to the status panel
          startPolling(savedId);
        } else {
          // Job already finished while we were away
          localStorage.removeItem(ACTIVE_JOB_KEY);
        }
      } catch {
        // Job not found or network error — clear stale key
        localStorage.removeItem(ACTIVE_JOB_KEY);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ── mode change ──
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setFile(null);
    setValidationResult(null);
    sessionStorage.removeItem("training_validation_result");
    setTriggerError("");
  };

  // ── file handling ──
  const handleFile = (f) => {
    setFile(f);
    setValidationResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleValidate = async () => {
    if (!file) return;
    setValidating(true);
    setValidationLocked(true);
    setValidationResult(null);
    try {
      const result = await trainingService.validateFile(file);
      setValidationResult(result);
      try {
        sessionStorage.setItem(
          "training_validation_result",
          JSON.stringify(result),
        );
      } catch {}
    } catch (err) {
      const isNetworkError = !err.response;
      const isNotFound = err.response?.status === 404;
      const detail = err.response?.data?.detail;
      setValidationResult({
        is_valid: false,
        network_error: isNetworkError || isNotFound,
        errors: [
          typeof detail === "string"
            ? detail
            : (detail?.message ?? err.message ?? "Erro ao validar arquivo."),
        ],
        warnings: detail?.errors ?? [],
        rows: null,
        columns: null,
        file_size_mb: null,
        file_format: null,
        missing_columns: detail?.missing_columns ?? [],
      });
      try {
        sessionStorage.removeItem("training_validation_result");
      } catch {}
    } finally {
      setValidating(false);
      setValidationLocked(false);
    }
  };

  // ── trigger training ──
  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerError("");
    setJob(null);
    setJobId(null);

    try {
      let accepted;
      if (mode === "retrain") {
        accepted = await trainingService.retrainExisting();
      } else {
        accepted = await trainingService.uploadAndTrain(file);
      }
      setJobId(accepted.job_id);
      setJob({
        job_id: accepted.job_id,
        status: "pending",
        result: null,
        error: null,
        created_at: accepted.timestamp,
        started_at: null,
        finished_at: null,
      });
      setTriggerError("");
      startPolling(accepted.job_id);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 409) {
        const activeId = detail?.active_job_id;
        setTriggerError(
          `Já existe um treinamento em andamento${activeId ? ` (job: ${activeId})` : ""}. Aguarde a conclusão.`,
        );
      } else {
        setTriggerError(
          typeof detail === "string"
            ? detail
            : (detail?.message ??
                err.message ??
                "Erro ao iniciar treinamento."),
        );
      }
    } finally {
      setTriggering(false);
    }
  };

  const isJobActive = job?.status === "pending" || job?.status === "running";
  const isLocked = isJobActive || validationLocked;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Treinamento do Modelo
        </h1>
        <p className="text-slate-500">
          Retreine o modelo de predição com novos dados ou com o histórico
          acumulado de consultas e feedbacks
        </p>
      </div>

      {/* Tab card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("training")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 ${
              activeTab === "training"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Treinamento
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              fetchHistory();
            }}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <History className="w-4 h-4" />
            Histórico de Modelos
          </button>
        </div>

        {/* Training tab */}
        {activeTab === "training" && (
          <div className="p-6 space-y-6">
            {/* Active job warning banner */}
            {isJobActive && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Um treinamento está em andamento. Aguarde a conclusão para
                  iniciar um novo.
                </span>
              </div>
            )}

            {/* Validation in-progress banner */}
            {validationLocked && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3">
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                <span>Validando arquivo… aguarde a conclusão.</span>
              </div>
            )}

            {/* Mode selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card A — Retrain */}
              <button
                onClick={() => !isLocked && handleModeChange("retrain")}
                disabled={isLocked}
                className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                  isLocked
                    ? "border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed"
                    : mode === "retrain"
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div
                  className={`inline-flex p-2.5 rounded-xl mb-3 ${
                    mode === "retrain" && !isJobActive
                      ? "bg-blue-500 text-white"
                      : "bg-white text-slate-500 border border-slate-200"
                  }`}
                >
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3
                  className={`font-semibold text-base mb-1 ${
                    mode === "retrain" && !isJobActive
                      ? "text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  Retreinar com dados existentes
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Usa todos os dados históricos do armazenamento e o feedback
                  das consultas predizidas. Nenhum arquivo necessário.
                </p>
              </button>

              {/* Card B — Upload */}
              <button
                onClick={() => !isLocked && handleModeChange("upload")}
                disabled={isLocked}
                className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                  isLocked
                    ? "border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed"
                    : mode === "upload"
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div
                  className={`inline-flex p-2.5 rounded-xl mb-3 ${
                    mode === "upload" && !isJobActive
                      ? "bg-blue-500 text-white"
                      : "bg-white text-slate-500 border border-slate-200"
                  }`}
                >
                  <Upload className="w-5 h-5" />
                </div>
                <h3
                  className={`font-semibold text-base mb-1 ${
                    mode === "upload" && !isJobActive
                      ? "text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  Treinar com novo arquivo
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Envia um novo conjunto de dados (CSV, Excel ou Parquet) que
                  será combinado com os dados históricos e o feedback salvo.
                </p>
              </button>
            </div>

            {/* Action panel — Retrain mode */}
            {mode === "retrain" && !isLocked && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Retreinar com dados existentes
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      O modelo será retreinado utilizando todos os lotes de
                      dados já enviados ao armazenamento + as consultas
                      predizidas que receberam feedback de comparecimento.
                    </p>
                  </div>
                </div>

                {triggerError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {triggerError}
                  </div>
                )}

                <button
                  onClick={handleTrigger}
                  disabled={triggering || isJobActive}
                  className="flex items-center gap-2 bg-brand-gradient text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {triggering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {triggering ? "Iniciando…" : "Iniciar retreinamento"}
                </button>
              </div>
            )}

            {/* Action panel — Upload mode */}
            {mode === "upload" && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="font-semibold text-slate-800">
                  Enviar novo arquivo
                </h3>

                {/* Drag and drop area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? "border-blue-400 bg-blue-50"
                      : file
                        ? "border-green-400 bg-green-50"
                        : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.parquet"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFile(e.target.files[0])
                    }
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-green-500" />
                      <p className="font-medium text-green-700">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB — clique para
                        trocar
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload className="w-8 h-8" />
                      <p className="font-medium">
                        Arraste um arquivo ou clique para selecionar
                      </p>
                      <p className="text-xs">
                        CSV, Excel (.xlsx / .xls) ou Parquet
                      </p>
                    </div>
                  )}
                </div>

                {/* Validate button */}
                {file && !validationResult && (
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {validating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {validating ? "Validando…" : "Validar arquivo"}
                  </button>
                )}

                {/* Validation result */}
                <ValidationResultCard result={validationResult} />

                {triggerError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {triggerError}
                  </div>
                )}

                {/* Train button — only shown after successful validation */}
                {validationResult?.is_valid && (
                  <button
                    onClick={handleTrigger}
                    disabled={triggering || isJobActive}
                    className="flex items-center gap-2 bg-brand-gradient text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {triggering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {triggering ? "Iniciando…" : "Iniciar treinamento"}
                  </button>
                )}
              </div>
            )}

            {/* Job status */}
            <JobStatusSection job={job} />
          </div>
        )}

        {/* History tab */}
        {activeTab === "history" && (
          <div className="p-6">
            <ModelHistoryContent
              models={models}
              loading={historyLoading}
              error={historyError}
              onRefresh={fetchHistory}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Training;
