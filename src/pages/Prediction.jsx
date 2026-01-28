import React, { useState } from "react";
import { User, Upload, FileJson, Brain, AlertCircle } from "lucide-react";
import DateInput from "../components/DateInput";

const Prediction = () => {
  const [activeTab, setActiveTab] = useState("individual");
  const [riskResult, setRiskResult] = useState(null);
  const [formData, setFormData] = useState({
    age: "",
    gender: "Female",
    hypertension: false,
    diabetes: false,
    alcoholism: false,
    handicap: false,
    smsReceived: true,
    scheduledDay: "",
    appointmentDay: "",
    awaitingTime: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCalculateRisk = (e) => {
    e.preventDefault();
    // Mock risk calculation
    const mockRisk = Math.floor(Math.random() * 100);
    setRiskResult({
      risk: mockRisk,
      level: mockRisk > 70 ? "High" : mockRisk > 40 ? "Medium" : "Low",
      color: mockRisk > 70 ? "red" : mockRisk > 40 ? "yellow" : "green",
    });
  };

  const handleBatchProcess = () => {
    alert(
      "Batch processing initiated! In production, this would process the uploaded file.",
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Predição com IA
        </h1>
        <p className="text-slate-500">
          Calcule o risco de falta usando predições baseadas em IA
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("individual")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 ${
              activeTab === "individual"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="w-4 h-4" />
            Predição Individual
          </button>
          <button
            onClick={() => setActiveTab("batch")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 ${
              activeTab === "batch"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Upload className="w-4 h-4" />
            Processamento em Lote
          </button>
        </div>

        {/* Individual Tab Content */}
        {activeTab === "individual" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <form onSubmit={handleCalculateRisk} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Age */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Idade
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Digite a idade"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sexo
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="Female">Feminino</option>
                        <option value="Male">Masculino</option>
                      </select>
                    </div>

                    {/* Scheduled Day */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Data do Agendamento
                      </label>
                      <DateInput
                        name="scheduledDay"
                        value={formData.scheduledDay}
                        onChange={handleInputChange}
                        placeholder="Selecione a data"
                        required
                      />
                    </div>

                    {/* Appointment Day */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Data da Consulta
                      </label>
                      <DateInput
                        name="appointmentDay"
                        value={formData.appointmentDay}
                        onChange={handleInputChange}
                        placeholder="Selecione a data"
                        required
                      />
                    </div>

                    {/* Awaiting Time */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tempo de Espera (dias)
                      </label>
                      <input
                        type="number"
                        name="awaitingTime"
                        value={formData.awaitingTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Dias até a consulta"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">
                      Condições Médicas
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { name: "hypertension", label: "Hipertensão" },
                        { name: "diabetes", label: "Diabetes" },
                        { name: "alcoholism", label: "Alcoolismo" },
                        { name: "handicap", label: "Deficiência" },
                        { name: "smsReceived", label: "SMS Recebido" },
                      ].map((field) => (
                        <label
                          key={field.name}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            name={field.name}
                            checked={formData[field.name]}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">
                            {field.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-brand-gradient text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Brain className="w-5 h-5" />
                    Calcular Risco
                  </button>
                </form>
              </div>

              {/* Result Card */}
              <div className="lg:col-span-1">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 sticky top-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Resultado da Predição
                  </h3>

                  {riskResult ? (
                    <div className="space-y-4">
                      {/* Risk Level Badge */}
                      <div className="text-center">
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold mb-3 ${
                            riskResult.color === "red"
                              ? "bg-red-100 text-red-700"
                              : riskResult.color === "yellow"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          <AlertCircle className="w-4 h-4" />
                          Risco{" "}
                          {riskResult.level === "High"
                            ? "Alto"
                            : riskResult.level === "Medium"
                              ? "Médio"
                              : "Baixo"}
                        </div>
                      </div>

                      {/* Risk Score */}
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">
                          Probabilidade de Falta
                        </p>
                        <p className="text-4xl font-bold text-slate-800">
                          {riskResult.risk}%
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            riskResult.color === "red"
                              ? "bg-red-500"
                              : riskResult.color === "yellow"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${riskResult.risk}%` }}
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          Esta predição é baseada em análise de IA dos dados do
                          paciente e padrões históricos.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        Preencha o formulário e clique em "Calcular Risco" para
                        ver a predição
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Tab Content */}
        {activeTab === "batch" && (
          <div className="p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors duration-200">
                <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Enviar Arquivo CSV ou Excel
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Arraste e solte seu arquivo aqui, ou clique para selecionar
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  id="batch-file"
                />
                <label
                  htmlFor="batch-file"
                  className="inline-block bg-white border border-slate-300 text-slate-700 font-medium py-2 px-6 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Selecionar Arquivo
                </label>
              </div>

              {/* OR Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-medium">
                    OU
                  </span>
                </div>
              </div>

              {/* JSON Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Colar Dados JSON
                </label>
                <textarea
                  rows="10"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  placeholder={`[\n  {\n    "age": 45,\n    "gender": "F",\n    "hypertension": false,\n    ...\n  }\n]`}
                />
              </div>

              {/* Process Button */}
              <button
                onClick={handleBatchProcess}
                className="w-full bg-brand-gradient text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FileJson className="w-5 h-5" />
                Processar Lista em Lote
              </button>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Informações do Processamento em Lote
                    </p>
                    <p className="text-xs text-blue-700">
                      Envie um arquivo com dados de pacientes ou cole JSON para
                      prever o risco de falta para múltiplas consultas de uma
                      vez. Os resultados estarão disponíveis para download após
                      o processamento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;
