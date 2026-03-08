import React, { useState } from "react";
import {
  User,
  Upload,
  FileJson,
  Brain,
  AlertCircle,
  Loader2,
  MapPin,
  Download,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker-custom.css";
import { ptBR } from "date-fns/locale";
import {
  tipoConvenioOptions,
  unidadeAtendimentoOptions,
  especialidadeOptions,
  sexoOptions,
} from "../constants/predictionOptions";
import { cepService, predictionService } from "../services";

const Prediction = () => {
  const [activeTab, setActiveTab] = useState("individual");
  const [riskResult, setRiskResult] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    Status: "Realizado",
    Marcacao: null,
    DataHoraConsulta: null,
    Idade: "",
    Sexo: "",
    CEPPaciente: "",
    CidadePaciente: "",
    BairroPaciente: "",
    TipoConvenio: "",
    idUnicoPaciente: "",
    UnidadeAtendimento: "",
    EnderecoUnidadeAtendimento: "",
    CEPUnidadeAtendimento: "",
    Especialidade: "",
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cepAutoFilled, setCepAutoFilled] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  // Batch prediction states
  const [batchJsonInput, setBatchJsonInput] = useState("");
  const [batchFile, setBatchFile] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [batchResults, setBatchResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear custom validity message when user starts typing
    e.target.setCustomValidity("");

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInvalid = (e) => {
    const field = e.target;
    if (field.validity.valueMissing) {
      field.setCustomValidity("Por favor, preencha este campo");
    } else if (field.validity.typeMismatch) {
      field.setCustomValidity("Por favor, insira um valor válido");
    } else if (field.validity.rangeUnderflow || field.validity.rangeOverflow) {
      field.setCustomValidity(
        "Por favor, insira um valor dentro do intervalo permitido",
      );
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleCepChange = async (cep) => {
    // Clear previous errors
    setCepError("");

    // Update CEP value
    setFormData((prev) => ({
      ...prev,
      CEPPaciente: cep,
    }));

    // Remove formatting to check length
    const cleanCep = cep.replace(/\D/g, "");

    // Only fetch when we have exactly 8 digits
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const addressData = await cepService.fetchAddressByCep(cleanCep);

        // Auto-fill city and neighborhood
        setFormData((prev) => ({
          ...prev,
          CidadePaciente: addressData.localidade.toUpperCase(),
          BairroPaciente: addressData.bairro.toUpperCase(),
        }));

        setCepAutoFilled(true);
      } catch (error) {
        setCepError(error.message);
        setCepAutoFilled(false);
        // Clear auto-filled fields on error
        setFormData((prev) => ({
          ...prev,
          CidadePaciente: "",
          BairroPaciente: "",
        }));
      } finally {
        setCepLoading(false);
      }
    } else {
      // Reset auto-fill state if CEP is incomplete
      setCepAutoFilled(false);
      if (cleanCep.length === 0) {
        setFormData((prev) => ({
          ...prev,
          CidadePaciente: "",
          BairroPaciente: "",
        }));
      }
    }
  };

  // Batch prediction handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBatchFile(file);
    setBatchError("");
    setBatchResults(null);

    // Parse CSV file
    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      try {
        const jsonData = parseCSVToJSON(text);
        setBatchJsonInput(JSON.stringify(jsonData, null, 2));
      } catch (error) {
        setBatchError(`Erro ao processar CSV: ${error.message}`);
      }
    } else {
      setBatchError(
        "Formato de arquivo não suportado. Use CSV ou cole JSON diretamente.",
      );
    }
  };

  const parseCSVToJSON = (csvText) => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV vazio ou inválido");
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    // Parse rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      const row = {};

      headers.forEach((header, index) => {
        const value = values[index];

        // Convert to appropriate type
        if (header === "Idade") {
          row[header] = parseInt(value, 10);
        } else if (["Marcacao", "DataHoraConsulta"].includes(header)) {
          row[header] = value;
        } else {
          row[header] = value;
        }
      });

      data.push(row);
    }

    return data;
  };

  const unitMapping = {
    "AEROPORTO - AMB. IGESP": {
      address: "RUA BARONESA DE BELA VISTA",
      cep: "04612-000",
    },
    "BELA VISTA - AMB. IGESP": {
      address: "RUA DOUTOR SENG",
      cep: "01331-020",
    },
    "CAMPO BELO": {
      address: "RUA VIEIRA DE MORAES",
      cep: "04617-015",
    },
    "GUARUJA - AMB. IGESP": {
      address: "RUA MONTENEGRO",
      cep: "11410-040",
    },
    "HOSP GUARUJA": {
      address: "AV SANTOS DUMONT",
      cep: "11460-006",
    },
    "LAPA - AMB. TRAS": {
      address: "RUA BARÃO DE JUNDIAÍ",
      cep: "05073-010",
    },
    "PRAIA GRANDE - AMB. IGESP": {
      address: "RUA GUADALAJARA",
      cep: "11702-210",
    },
    "SANTANA - AMB. TRAS": {
      address: "RUA DUARTE DE AZEVEDO",
      cep: "02036-020",
    },
    "SANTOS PA - AMB. IGESP": {
      address: "AV ANA COSTA",
      cep: "11060-000",
    },
    "SÃO BERNARDO - AMB. TRAS": {
      address: "AV ÍNDICO",
      cep: "09750-601",
    },
    "SÃO VICENTE - AMB. TRAS": {
      address: "RUA JACOB EMERICH",
      cep: "11310-070",
    },
    "SEDE (SÃO PAULO) - AMB. TRAS": {
      address: "RUA TABATINGUERA",
      cep: "01020-903",
    },
    "TATUAPE- AMB. TRAS": {
      address: "RUA FERNANDES PINHEIRO",
      cep: "03308-060",
    },
  };

  const handleBatchProcess = async () => {
    setBatchLoading(true);
    setBatchError("");
    setBatchResults(null);

    try {
      // Parse JSON input
      let appointments;
      try {
        appointments = JSON.parse(batchJsonInput);
      } catch (error) {
        throw new Error("JSON inválido. Verifique o formato dos dados.");
      }

      // Validate appointments is an array
      if (!Array.isArray(appointments)) {
        throw new Error("Os dados devem ser um array de consultas.");
      }

      // Validate max 1000 appointments
      if (appointments.length === 0) {
        throw new Error("Nenhuma consulta encontrada para processar.");
      }

      if (appointments.length > 1000) {
        throw new Error(
          `Máximo de 1000 consultas por lote. Você tentou processar ${appointments.length}.`,
        );
      }

      // Transform appointments to API format
      const formattedAppointments = appointments.map((appt, index) => {
        // Validate required fields
        const requiredFields = [
          "Marcacao",
          "DataHoraConsulta",
          "Idade",
          "Sexo",
          "CidadePaciente",
          "BairroPaciente",
          "TipoConvenio",
          "UnidadeAtendimento",
          "Especialidade",
        ];

        const missingFields = requiredFields.filter((field) => !appt[field]);
        if (missingFields.length > 0) {
          throw new Error(
            `Registro ${index + 1}: campos obrigatórios faltando: ${missingFields.join(", ")}`,
          );
        }

        // Get unit info
        const unitInfo = unitMapping[appt.UnidadeAtendimento] || {
          address: "AVENIDA PAULISTA",
          cep: "01310-100",
        };

        return {
          Marcacao: appt.Marcacao,
          DataHoraConsulta: appt.DataHoraConsulta,
          Idade: parseInt(appt.Idade, 10),
          Sexo: appt.Sexo,
          CidadePaciente: appt.CidadePaciente,
          BairroPaciente: appt.BairroPaciente,
          TipoConvenio: appt.TipoConvenio,
          idUnicoPaciente:
            appt.idUnicoPaciente || `BATCH_${Date.now()}_${index}`,
          UnidadeAtendimento: appt.UnidadeAtendimento,
          EnderecoUnidadeAtendimento: unitInfo.address,
          CEPUnidadeAtendimento: unitInfo.cep,
          Especialidade: appt.Especialidade,
        };
      });

      // Call batch prediction API
      const result = await predictionService.predictBatch(
        formattedAppointments,
      );

      setBatchResults(result);
    } catch (error) {
      console.error("Batch prediction error:", error);
      setBatchError(
        error.response?.data?.detail ||
          error.message ||
          "Erro ao processar predições em lote. Tente novamente.",
      );
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDownloadResults = () => {
    if (!batchResults) return;

    // Prepare CSV content
    const headers = [
      "Paciente ID",
      "Unidade",
      "Especialidade",
      "Data Consulta",
      "Predição",
      "Prob. Falta (%)",
      "Prob. Presença (%)",
    ];

    const rows = batchResults.results.map((result) => [
      result.appointment.idUnicoPaciente,
      result.appointment.UnidadeAtendimento,
      result.appointment.Especialidade,
      new Date(result.appointment.DataHoraConsulta).toLocaleDateString("pt-BR"),
      result.prediction_label === "No-Show" ? "Falta" : "Presença",
      (result.probability_no_show * 100).toFixed(2),
      (result.probability_show * 100).toFixed(2),
    ]);

    // Build CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `predicoes_lote_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalculateRisk = async (e) => {
    e.preventDefault();
    setPredictionLoading(true);
    setPredictionError("");
    setRiskResult(null);

    try {
      // Get unit info
      const unitInfo = unitMapping[formData.UnidadeAtendimento] || {
        address: "AVENIDA PAULISTA",
        cep: "01310-100",
      };

      // Build request payload matching API schema
      const requestData = {
        Marcacao: formData.Marcacao?.toISOString() || new Date().toISOString(),
        DataHoraConsulta:
          formData.DataHoraConsulta?.toISOString() || new Date().toISOString(),
        Idade: parseInt(formData.Idade, 10),
        Sexo: formData.Sexo,
        CidadePaciente: formData.CidadePaciente,
        BairroPaciente: formData.BairroPaciente,
        TipoConvenio: formData.TipoConvenio,
        idUnicoPaciente: formData.idUnicoPaciente || `PATIENT${Date.now()}`,
        UnidadeAtendimento: formData.UnidadeAtendimento,
        EnderecoUnidadeAtendimento: unitInfo.address,
        CEPUnidadeAtendimento: unitInfo.cep,
        Especialidade: formData.Especialidade,
      };

      // Call prediction API
      const result = await predictionService.predict(requestData);

      // Transform API response to UI format
      const probabilityNoShowPercent = Math.round(
        result.probability_no_show * 100,
      );
      const probabilityShowPercent = Math.round(result.probability_show * 100);

      setRiskResult({
        risk: probabilityNoShowPercent,
        level:
          probabilityNoShowPercent > 70
            ? "High"
            : probabilityNoShowPercent > 40
              ? "Medium"
              : "Low",
        color:
          probabilityNoShowPercent > 70
            ? "red"
            : probabilityNoShowPercent > 40
              ? "yellow"
              : "green",
        prediction: result.prediction,
        predictionLabel: result.prediction_label,
        probabilityShow: probabilityShowPercent,
        probabilityNoShow: probabilityNoShowPercent,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      setPredictionError(
        error.response?.data?.detail ||
          error.message ||
          "Erro ao calcular predição. Tente novamente.",
      );
    } finally {
      setPredictionLoading(false);
    }
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
                    {/* ID */}
                    {/* <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ID da Consulta
                      </label>
                      <input
                        type="number"
                        name="id"
                        value={formData.id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Digite o ID (opcional)"
                      />
                    </div> */}

                    {/* Status */}
                    {/* <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Status
                      </label>
                      <select
                        name="Status"
                        value={formData.Status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="Realizado">Realizado</option>
                        <option value="Falta">Falta</option>
                      </select>
                    </div> */}

                    {/* Marcacao */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Data do Agendamento
                      </label>
                      <DatePicker
                        selected={formData.Marcacao}
                        onChange={(date) => handleDateChange("Marcacao", date)}
                        dateFormat="dd/MM/yyyy"
                        locale={ptBR}
                        placeholderText="dd/mm/aaaa"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                        onKeyDown={(e) => e.preventDefault()}
                      />
                    </div>

                    {/* DataHoraConsulta */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Data da Consulta
                      </label>
                      <DatePicker
                        selected={formData.DataHoraConsulta}
                        onChange={(date) =>
                          handleDateChange("DataHoraConsulta", date)
                        }
                        dateFormat="dd/MM/yyyy"
                        locale={ptBR}
                        placeholderText="dd/mm/aaaa"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                        onKeyDown={(e) => e.preventDefault()}
                      />
                    </div>

                    {/* Idade */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Idade
                      </label>
                      <input
                        type="number"
                        name="Idade"
                        value={formData.Idade}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Digite a idade"
                        min="0"
                        max="120"
                        required
                      />
                    </div>

                    {/* Sexo */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sexo
                      </label>
                      <select
                        name="Sexo"
                        value={formData.Sexo}
                        onChange={handleInputChange}
                        onInvalid={handleInvalid}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      >
                        <option value="">Selecione...</option>
                        {sexoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CEP Paciente */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        CEP do Paciente
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="CEPPaciente"
                          value={formData.CEPPaciente}
                          onChange={(e) => handleCepChange(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="12345-678"
                          maxLength="9"
                          required
                        />
                        {cepLoading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                        )}
                        {cepAutoFilled && !cepLoading && (
                          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {cepError && (
                        <p className="mt-1 text-xs text-red-600">{cepError}</p>
                      )}
                      {cepAutoFilled && !cepError && (
                        <p className="mt-1 text-xs text-green-600">
                          Endereço preenchido automaticamente
                        </p>
                      )}
                    </div>

                    {/* CidadePaciente */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cidade do Paciente
                      </label>
                      <input
                        type="text"
                        name="CidadePaciente"
                        value={formData.CidadePaciente}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                        placeholder="Digite a cidade ou preencha o CEP"
                        required
                        disabled={cepAutoFilled}
                      />
                    </div>

                    {/* BairroPaciente */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bairro do Paciente
                      </label>
                      <input
                        type="text"
                        name="BairroPaciente"
                        value={formData.BairroPaciente}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                        placeholder="Digite o bairro ou preencha o CEP"
                        required
                        disabled={cepAutoFilled}
                      />
                    </div>

                    {/* TipoConvenio */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tipo de Convênio
                      </label>
                      <select
                        name="TipoConvenio"
                        value={formData.TipoConvenio}
                        onChange={handleInputChange}
                        onInvalid={handleInvalid}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      >
                        <option value="">Selecione...</option>
                        {tipoConvenioOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* idUnicoPaciente
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ID Único do Paciente
                      </label>
                      <input
                        type="text"
                        name="idUnicoPaciente"
                        value={formData.idUnicoPaciente}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Digite o ID do paciente (opcional)"
                      />
                    </div> */}

                    {/* UnidadeAtendimento */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Unidade de Atendimento
                      </label>
                      <select
                        name="UnidadeAtendimento"
                        value={formData.UnidadeAtendimento}
                        onChange={handleInputChange}
                        onInvalid={handleInvalid}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      >
                        <option value="">Selecione...</option>
                        {unidadeAtendimentoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Especialidade */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Especialidade
                      </label>
                      <select
                        name="Especialidade"
                        value={formData.Especialidade}
                        onChange={handleInputChange}
                        onInvalid={handleInvalid}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      >
                        <option value="">Selecione...</option>
                        {especialidadeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Error Display */}
                  {predictionError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800 mb-1">
                            Erro ao calcular predição
                          </p>
                          <p className="text-xs text-red-700">
                            {predictionError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={predictionLoading}
                    className="w-full bg-brand-gradient text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {predictionLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Calcular Risco
                      </>
                    )}
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

                      {/* Probabilities */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Prob. Presença:
                          </span>
                          <span className="font-semibold text-green-600">
                            {(100 - riskResult.risk).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Prob. Falta:</span>
                          <span className="font-semibold text-red-600">
                            {riskResult.risk}%
                          </span>
                        </div>
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

                      {/* Prediction Label */}
                      <div className="text-center py-2">
                        <p className="text-xs text-slate-500 mb-1">Predição</p>
                        <p
                          className={`text-lg font-bold ${
                            riskResult.predictionLabel === "No-Show"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {riskResult.predictionLabel === "No-Show"
                            ? "Falta"
                            : "Presença"}
                        </p>
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
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Upload and Input Section */}
              {!batchResults && (
                <>
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors duration-200">
                    <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      Enviar Arquivo CSV
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Selecione um arquivo CSV com os dados das consultas
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="batch-file"
                    />
                    <label
                      htmlFor="batch-file"
                      className="inline-block bg-white border border-slate-300 text-slate-700 font-medium py-2 px-6 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      Selecionar Arquivo CSV
                    </label>
                    {batchFile && (
                      <p className="mt-3 text-sm text-green-600">
                        ✓ Arquivo carregado: {batchFile.name}
                      </p>
                    )}
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
                      value={batchJsonInput}
                      onChange={(e) => setBatchJsonInput(e.target.value)}
                      rows="10"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                      placeholder={`[\n  {\n    "Marcacao": "2024-11-16T08:00:00",\n    "DataHoraConsulta": "2024-11-23T14:00:00",\n    "Idade": 62,\n    "Sexo": "F",\n    "CidadePaciente": "SAO PAULO",\n    "BairroPaciente": "BELA VISTA",\n    "TipoConvenio": "Enfermaria",\n    "UnidadeAtendimento": "CAMPO BELO",\n    "Especialidade": "CARDIOLOGIA",\n    "idUnicoPaciente": "PAC001"\n  }\n]`}
                    />
                  </div>

                  {/* Error Display */}
                  {batchError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800 mb-1">
                            Erro no processamento em lote
                          </p>
                          <p className="text-xs text-red-700">{batchError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Process Button */}
                  <button
                    onClick={handleBatchProcess}
                    disabled={
                      batchLoading || (!batchJsonInput.trim() && !batchFile)
                    }
                    className="w-full bg-brand-gradient text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {batchLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <FileJson className="w-5 h-5" />
                        Processar Lista em Lote
                      </>
                    )}
                  </button>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          Informações do Processamento em Lote
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>
                            • Envie um arquivo CSV ou cole JSON com dados de
                            pacientes
                          </li>
                          <li>• Máximo de 1.000 consultas por processamento</li>
                          <li>
                            • Campos obrigatórios: Marcacao, DataHoraConsulta,
                            Idade, Sexo, CidadePaciente, BairroPaciente,
                            TipoConvenio, UnidadeAtendimento, Especialidade
                          </li>
                          <li>
                            • Os resultados estarão disponíveis para download
                            após o processamento
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Results Section */}
              {batchResults && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-blue-700">
                          Total de Consultas
                        </p>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-blue-900">
                        {batchResults.total}
                      </p>
                    </div>

                    {/* Predicted Show */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-green-700">
                          Previsão: Presença
                        </p>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-900">
                        {batchResults.predicted_show}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {(
                          (batchResults.predicted_show / batchResults.total) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>

                    {/* Predicted No-Show */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-red-700">
                          Previsão: Falta
                        </p>
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-3xl font-bold text-red-900">
                        {batchResults.predicted_no_show}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {(
                          (batchResults.predicted_no_show /
                            batchResults.total) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownloadResults}
                      className="flex items-center gap-2 bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Baixar Resultados (CSV)
                    </button>
                    <button
                      onClick={() => {
                        setBatchResults(null);
                        setBatchJsonInput("");
                        setBatchFile(null);
                        setBatchError("");
                      }}
                      className="flex items-center gap-2 bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:bg-slate-300 transition-colors"
                    >
                      Nova Predição
                    </button>
                  </div>

                  {/* Results Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Paciente
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Unidade
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Especialidade
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Data Consulta
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-700">
                              Predição
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-700">
                              Prob. Falta
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {batchResults.results.map((result, index) => (
                            <tr
                              key={index}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-slate-700">
                                {result.appointment.idUnicoPaciente}
                              </td>
                              <td className="px-4 py-3 text-slate-600 text-xs">
                                {result.appointment.UnidadeAtendimento}
                              </td>
                              <td className="px-4 py-3 text-slate-600 text-xs">
                                {result.appointment.Especialidade}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {new Date(
                                  result.appointment.DataHoraConsulta,
                                ).toLocaleDateString("pt-BR")}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                    result.prediction_label === "No-Show"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {result.prediction_label === "No-Show" ? (
                                    <>
                                      <XCircle className="w-3 h-3" />
                                      Falta
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Presença
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-700">
                                {(result.probability_no_show * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;
