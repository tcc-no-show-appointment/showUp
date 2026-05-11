import React, { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  TrendingUp,
  Users,
  CalendarCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  Target,
  ShieldAlert,
  Clock,
  FileDown,
  Info,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { appointmentService } from "../services";

const getLast30Days = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
};

const isSameDay = (dateStr, target) => {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
};

const Dashboard = () => {
  const dashboardRef = useRef(null);
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const exportPdf = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;
      let yPos = 0;
      let remaining = imgH;
      while (remaining > 0) {
        pdf.addImage(imgData, "PNG", 0, -yPos, imgW, imgH);
        remaining -= pageH;
        if (remaining > 0) {
          pdf.addPage();
          yPos += pageH;
        }
      }
      pdf.save(`dashboard_${new Date().toISOString().split("T")[0]}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await appointmentService.getAppointments({
        page: 1,
        pageSize: 500,
      });
      setAppointments(data.appointments);
      setTotal(data.total);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.map((d) => d.msg).join("; ")
          : typeof detail === "string"
            ? detail
            : err.message || "Erro ao carregar dados do painel.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPredictions = appointments.filter(
    (a) => a.created_at && isSameDay(a.created_at, today),
  ).length;

  const withRisk = appointments.filter(
    (a) => a.probability_no_show_normalized != null,
  );
  const avgRisk =
    withRisk.length > 0
      ? withRisk.reduce((sum, a) => sum + a.probability_no_show_normalized, 0) /
        withRisk.length
      : null;

  const withPrediction = appointments.filter((a) => a.prediction_class != null);
  const showCount = withPrediction.filter(
    (a) => a.prediction_class === 0,
  ).length;
  const attendanceRate =
    withPrediction.length > 0
      ? (showCount / withPrediction.length) * 100
      : null;

  // ── Model performance metrics (only for appointments with real feedback) ──
  const withFeedback = appointments.filter(
    (a) =>
      a.appointment_status === "Realizado" || a.appointment_status === "Falta",
  );
  const tp = withFeedback.filter(
    (a) => a.prediction_class === 1 && a.appointment_status === "Falta",
  ).length;
  const tn = withFeedback.filter(
    (a) => a.prediction_class === 0 && a.appointment_status === "Realizado",
  ).length;
  const fp = withFeedback.filter(
    (a) => a.prediction_class === 1 && a.appointment_status === "Realizado",
  ).length;
  const fn = withFeedback.filter(
    (a) => a.prediction_class === 0 && a.appointment_status === "Falta",
  ).length;

  const accuracy =
    withFeedback.length > 0 ? ((tp + tn) / withFeedback.length) * 100 : null;
  const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : null;
  const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : null;
  const actualNoShowRate =
    withFeedback.length > 0
      ? (withFeedback.filter((a) => a.appointment_status === "Falta").length /
          withFeedback.length) *
        100
      : null;

  // ── Pending high-risk appointments ──
  const pending = appointments.filter((a) => !a.appointment_status);
  const highRiskPending = pending.filter(
    (a) => a.probability_no_show_normalized > 0.7,
  ).length;

  // ── Specialty breakdown (predicted no-show rate per specialty) ──
  const specialtyMap = {};
  appointments.forEach((a) => {
    const s = a.specialty || "Outras";
    if (!specialtyMap[s]) specialtyMap[s] = { total: 0, noShow: 0 };
    specialtyMap[s].total++;
    if (a.prediction_class === 1) specialtyMap[s].noShow++;
  });
  const specialtyData = Object.entries(specialtyMap)
    .map(([name, { total, noShow }]) => ({
      name: name.length > 22 ? name.slice(0, 22) + "…" : name,
      rate: total > 0 ? Math.round((noShow / total) * 100) : 0,
      total,
      noShow,
    }))
    .filter((s) => s.total >= 2)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 8);

  const last30Days = getLast30Days();
  const chartData = last30Days.map((day) => {
    const dayAppts = appointments.filter(
      (a) => a.created_at && isSameDay(a.created_at, day),
    );
    const label = `${String(day.getDate()).padStart(2, "0")}/${String(day.getMonth() + 1).padStart(2, "0")}`;
    return {
      day: label,
      presenca: dayAppts.filter((a) => a.prediction_class === 0).length,
      falta: dayAppts.filter((a) => a.prediction_class === 1).length,
    };
  });

  const fmt = (val, decimals = 1) =>
    val == null ? "—" : `${val.toFixed(decimals)}%`;

  const kpiRow1 = [
    {
      title: "Predições hoje",
      value: loading ? "—" : todayPredictions.toString(),
      icon: Users,
      subtitle: `${total} no total`,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Risco médio de falta",
      value: loading ? "—" : fmt(avgRisk != null ? avgRisk * 100 : null),
      icon: TrendingUp,
      subtitle: `${withRisk.length} predições analisadas`,
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Taxa de comparecimento prevista",
      value: loading ? "—" : fmt(attendanceRate),
      icon: CalendarCheck,
      subtitle: `${showCount} de ${withPrediction.length} previstas`,
      color: "from-green-500 to-green-600",
    },
  ];

  const kpiRow2 = [
    {
      title: "Acurácia do modelo",
      value: loading
        ? "—"
        : accuracy == null
          ? "Sem feedback"
          : `${tp + tn}/${withFeedback.length}`,
      sub2: accuracy != null ? fmt(accuracy) : "",
      icon: Target,
      subtitle:
        withFeedback.length > 0
          ? `${withFeedback.length} consulta${withFeedback.length !== 1 ? "s" : ""} com feedback`
          : "Registre feedbacks para ver",
      color: "from-violet-500 to-violet-600",
    },
    {
      title: "Precisão em faltas",
      value: loading ? "—" : fmt(precision),
      icon: ShieldAlert,
      subtitle:
        precision == null
          ? "Das previstas como falta, % que faltou de fato"
          : `${tp} acertos de ${tp + fp} previstas`,
      color: "from-red-500 to-red-600",
    },
    {
      title: "Alto risco pendentes",
      value: loading ? "—" : highRiskPending.toString(),
      icon: Clock,
      subtitle:
        highRiskPending > 0
          ? `${highRiskPending} paciente${highRiskPending !== 1 ? "s" : ""} acima de 70% sem feedback`
          : "Nenhum pendente de alto risco",
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="p-8" ref={dashboardRef}>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel</h1>
          <p className="text-slate-500">
            Insights com IA para gestão de consultas médicas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPdf}
            disabled={loading || exporting}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Exportar PDF
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Data scope banner */}
      {!loading && !error && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            Todos os cards e gráficos utilizam os{" "}
            <strong>{appointments.length.toLocaleString("pt-BR")}</strong>{" "}
            registros mais recentes carregados
            {total > appointments.length ? (
              <>
                {" "}
                de um total de <strong>
                  {total.toLocaleString("pt-BR")}
                </strong>{" "}
                no banco
              </>
            ) : (
              <>
                {" "}
                (total no banco:{" "}
                <strong>{total.toLocaleString("pt-BR")}</strong>)
              </>
            )}
            . Todo o período de tempo é considerado.
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {kpiRow1.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">
                    {kpi.title}
                  </p>
                  {loading ? (
                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin mt-1" />
                  ) : (
                    <h3 className="text-3xl font-bold text-slate-800">
                      {kpi.value}
                    </h3>
                  )}
                  <p className="text-xs text-slate-400 mt-2">{kpi.subtitle}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Row 2 — Model performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpiRow2.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-500 mb-2">
                    {kpi.title}
                  </p>
                  {loading ? (
                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin mt-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold text-slate-800">
                        {kpi.value}
                      </h3>
                      {kpi.sub2 && (
                        <span className="text-sm font-semibold text-violet-600">
                          {kpi.sub2}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2">{kpi.subtitle}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center ml-4 shrink-0`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Area chart — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              Predições dos últimos 30 dias
            </h2>
            <p className="text-sm text-slate-500">
              Previsões de presença e falta por dia (consultas salvas)
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorPresenca"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFalta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  interval={4}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="presenca"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#colorPresenca)"
                  name="Presença prevista"
                />
                <Area
                  type="monotone"
                  dataKey="falta"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorFalta)"
                  name="Falta prevista"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Confusion summary — 1/3 width */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            Desempenho real
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Baseado em {withFeedback.length} consulta
            {withFeedback.length !== 1 ? "s" : ""} com feedback registrado
          </p>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : withFeedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Clock className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">
                Registre feedbacks de comparecimento na tela de Consultas para
                ver métricas reais.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Acurácia
                  </p>
                  <p className="text-xs text-slate-400">
                    {tp + tn} de {withFeedback.length} corretas
                  </p>
                </div>
                <span className="text-2xl font-bold text-violet-600">
                  {fmt(accuracy)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Precisão em faltas
                  </p>
                  <p className="text-xs text-slate-400">
                    {tp} de {tp + fp} previstas como falta
                  </p>
                </div>
                <span className="text-2xl font-bold text-red-500">
                  {fmt(precision)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Recall de Faltas
                  </p>
                  <p className="text-xs text-slate-400">
                    {tp} de {tp + fn} que realmente faltaram
                  </p>
                </div>
                <span className="text-2xl font-bold text-orange-500">
                  {fmt(recall)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Taxa real de falta
                  </p>
                  <p className="text-xs text-slate-400">
                    {tp + fn} faltas reais confirmadas
                  </p>
                </div>
                <span className="text-2xl font-bold text-slate-700">
                  {fmt(actualNoShowRate)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Specialty breakdown */}
      {!loading && specialtyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              Taxa de falta prevista por especialidade
            </h2>
            <p className="text-sm text-slate-500">
              Das consultas salvas, % previstas como falta por especialidade
              (mín. 2 consultas)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={specialtyData}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value}% (${props.payload.noShow}/${props.payload.total})`,
                  "Taxa de falta prevista",
                ]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {specialtyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.rate >= 60
                        ? "#ef4444"
                        : entry.rate >= 35
                          ? "#f59e0b"
                          : "#22c55e"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
