import React from "react";
import { TrendingUp, Users, DollarSign } from "lucide-react";
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

const Dashboard = () => {
  // Mock KPI data
  const kpiData = [
    {
      title: "Predições Hoje",
      value: "247",
      icon: Users,
      change: "+12%",
      positive: true,
    },
    {
      title: "Risco Médio de Falta",
      value: "23.4%",
      icon: TrendingUp,
      change: "-5.2%",
      positive: true,
    },
    {
      title: "Economia Estimada",
      value: "R$ 12.450",
      icon: DollarSign,
      change: "+18%",
      positive: true,
    },
  ];

  // Mock chart data - Real vs. Predicted Attendance over the week
  const chartData = [
    { day: "Seg", real: 156, predicted: 162 },
    { day: "Ter", real: 189, predicted: 185 },
    { day: "Qua", real: 203, predicted: 198 },
    { day: "Qui", real: 178, predicted: 182 },
    { day: "Sex", real: 195, predicted: 192 },
    { day: "Sáb", real: 142, predicted: 148 },
    { day: "Dom", real: 98, predicted: 95 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel</h1>
        <p className="text-slate-500">
          Insights com IA para gestão de consultas médicas
        </p>
      </div>

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
                  <h3 className="text-3xl font-bold text-slate-800">
                    {kpi.value}
                  </h3>
                  <div className="mt-2 flex items-center gap-1">
                    <span
                      className={`text-sm font-semibold ${
                        kpi.positive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {kpi.change}
                    </span>
                    <span className="text-xs text-slate-500">vs semana passada</span>
                  </div>
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
            Tendência Semanal de Comparecimento
          </h2>
          <p className="text-sm text-slate-500">
            Comparecimento real vs. previsto na última semana
          </p>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
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
              dataKey="real"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#colorReal)"
              name="Comparecimento Real"
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#colorPredicted)"
              name="Comparecimento Previsto"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
