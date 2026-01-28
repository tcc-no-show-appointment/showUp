import React, { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

const Appointments = () => {
  // Mock appointments data
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      name: "Maria Silva",
      time: "08:30",
      risk: "High",
      riskValue: 85,
      status: null,
      selected: false,
    },
    {
      id: 2,
      name: "João Santos",
      time: "09:00",
      risk: "Low",
      riskValue: 15,
      status: null,
      selected: false,
    },
    {
      id: 3,
      name: "Ana Costa",
      time: "09:30",
      risk: "Medium",
      riskValue: 52,
      status: null,
      selected: false,
    },
    {
      id: 4,
      name: "Pedro Oliveira",
      time: "10:00",
      risk: "High",
      riskValue: 78,
      status: null,
      selected: false,
    },
    {
      id: 5,
      name: "Sofia Lima",
      time: "10:30",
      risk: "Low",
      riskValue: 22,
      status: null,
      selected: false,
    },
    {
      id: 6,
      name: "Lucas Ferreira",
      time: "11:00",
      risk: "Medium",
      riskValue: 45,
      status: null,
      selected: false,
    },
    {
      id: 7,
      name: "Beatriz Sousa",
      time: "11:30",
      risk: "High",
      riskValue: 92,
      status: null,
      selected: false,
    },
    {
      id: 8,
      name: "Rafael Rodrigues",
      time: "14:00",
      risk: "Low",
      riskValue: 18,
      status: null,
      selected: false,
    },
    {
      id: 9,
      name: "Carolina Alves",
      time: "14:30",
      risk: "Medium",
      riskValue: 58,
      status: null,
      selected: false,
    },
    {
      id: 10,
      name: "Gabriel Mendes",
      time: "15:00",
      risk: "Low",
      riskValue: 12,
      status: null,
      selected: false,
    },
  ]);

  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setAppointments(
      appointments.map((apt) => ({ ...apt, selected: newSelectAll })),
    );
  };

  const handleSelectAppointment = (id) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, selected: !apt.selected } : apt,
      ),
    );
    // Update selectAll if needed
    const newAppointments = appointments.map((apt) =>
      apt.id === id ? { ...apt, selected: !apt.selected } : apt,
    );
    setSelectAll(newAppointments.every((apt) => apt.selected));
  };

  const handleMarkStatus = (status) => {
    setAppointments(
      appointments.map((apt) =>
        apt.selected ? { ...apt, status, selected: false } : apt,
      ),
    );
    setSelectAll(false);
  };

  const selectedCount = appointments.filter((apt) => apt.selected).length;

  const getRiskBadge = (risk, riskValue) => {
    const colors = {
      High: "bg-red-100 text-red-700 border-red-200",
      Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Low: "bg-green-100 text-green-700 border-green-200",
    };

    const icons = {
      High: <AlertTriangle className="w-3 h-3" />,
      Medium: <Clock className="w-3 h-3" />,
      Low: <CheckCircle className="w-3 h-3" />,
    };

    const labels = {
      High: "Alto",
      Medium: "Médio",
      Low: "Baixo",
    };

    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${colors[risk]}`}
        >
          {icons[risk]}
          {labels[risk]}
        </span>
        <span className="text-xs text-slate-500">{riskValue}%</span>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    if (!status)
      return <span className="text-xs text-slate-400">Pendente</span>;

    if (status === "show") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
          <CheckCircle className="w-3 h-3" />
          Compareceu
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <XCircle className="w-3 h-3" />
        Faltou
      </span>
    );
  };

  const stats = {
    total: appointments.length,
    high: appointments.filter((a) => a.risk === "High").length,
    medium: appointments.filter((a) => a.risk === "Medium").length,
    low: appointments.filter((a) => a.risk === "Low").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Consultas de Hoje
        </h1>
        <p className="text-slate-500">
          Gerencie consultas e forneça feedback para melhorar a IA
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total de Consultas</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-red-200">
          <p className="text-sm text-slate-500 mb-1">Risco Alto</p>
          <p className="text-2xl font-bold text-red-600">{stats.high}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-200">
          <p className="text-sm text-slate-500 mb-1">Risco Médio</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-green-200">
          <p className="text-sm text-slate-500 mb-1">Risco Baixo</p>
          <p className="text-2xl font-bold text-green-600">{stats.low}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nome do Paciente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nível de Risco
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status Real
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    appointment.selected ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={appointment.selected}
                      onChange={() => handleSelectAppointment(appointment.id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">
                      {appointment.name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{appointment.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getRiskBadge(appointment.risk, appointment.riskValue)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(appointment.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-6 py-4">
            <div className="flex items-center gap-6">
              <p className="text-sm font-medium text-slate-700">
                <span className="font-bold text-blue-600">{selectedCount}</span>{" "}
                consulta{selectedCount > 1 ? "s" : ""} selecionada
                {selectedCount > 1 ? "s" : ""}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleMarkStatus("show")}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar Comparecimento
                </button>

                <button
                  onClick={() => handleMarkStatus("no-show")}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <XCircle className="w-4 h-4" />
                  Marcar Falta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
