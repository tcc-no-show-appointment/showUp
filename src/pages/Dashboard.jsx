import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  CalendarCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
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
} from "recharts";
import { appointmentService } from "../services";

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const isSameDay = (dateStr, target) => {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
};

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
};

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await appointmentService.getAppointments({
        page: 1,
        pageSize: 100,
      });
      setAppointments(data.appointments);
      setTotal(data.total);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Erro ao carregar dados do painel.",
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

  const withRisk = appointments.filter((a) => a.probability_no_show != null);

  const avgRisk =
    withRisk.length > 0
      ? withRisk.reduce((sum, a) => sum + a.probability_no_show, 0) /
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

  const last7Days = getLast7Days();
  const chartData = last7Days.map((day) => {
    const dayAppts = appointments.filter(
      (a) => a.created_at && isSameDay(a.created_at, day),
    );
    return {
      day: DAYS_PT[day.getDay()],
      presenca: dayAppts.filter((a) => a.prediction_class === 0).length,
      falta: dayAppts.filter((a) => a.prediction_class === 1).length,
    };
  });

  const kpiData = [
    {
      title: "Predições Hoje",
      value: loading ? "—" : todayPredictions.toString(),
      icon: Users,
      subtitle: `${total} no total`,
    },
    {
      title: "Risco Médio de Falta",
      value:
        loading || avgRisk == null ? "—" : `${(avgRisk * 100).toFixed(1)}%`,
      icon: TrendingUp,
      subtitle: `${withRisk.length} predições analisadas`,
    },
    {
      title: "Taxa de Comparecimento Prevista",
      value:
        loading || attendanceRate == null
          ? "—"
          : `${attendanceRate.toFixed(1)}%`,
      icon: CalendarCheck,
      subtitle: `${showCount} de ${withPrediction.length} previstas`,
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel</h1>
          <p className="text-slate-500">
            Insights com IA para gestão de consultas médicas
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpiData.map((kpi, index) => {
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
                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Area Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            Predições dos Últimos 7 Dias
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
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPresenca" x1="0" y1="0" x2="0" y2="1">
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
                tick={{ fill: "#64748b", fontSize: 12 }}
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
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
              <Area
                type="monotone"
                dataKey="presenca"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#colorPresenca)"
                name="Presença Prevista"
              />
              <Area
                type="monotone"
                dataKey="falta"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorFalta)"
                name="Falta Prevista"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
