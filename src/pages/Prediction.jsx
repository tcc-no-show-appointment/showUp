import React, { useState, forwardRef, useEffect, useRef } from "react";
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
  Save,
  X,
  Info,
} from "lucide-react";
import NormalizedRiskHelp from "../components/NormalizedRiskHelp";
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
import { cepService, predictionService, appointmentService } from "../services";

const applyDateMask = (raw) => {
  // Keep only digits, max 12
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) result += "/";
    else if (i === 8) result += " ";
    else if (i === 10) result += ":";
    result += digits[i];
  }
  return result;
};

const parseMaskedDate = (masked) => {
  const match = masked.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, dd, mm, yyyy, hh, min] = match;
  const d = new Date(+yyyy, +mm - 1, +dd, +hh, +min);
  return isNaN(d.getTime()) ? null : d;
};

const DateMaskedInput = forwardRef(
  (
    { value, onChange, onClick, onBlur, onFocus, placeholder, className },
    ref,
  ) => {
    const [local, setLocal] = useState(value || "");
    const prevValue = useRef(value);

    // Only sync from DatePicker when the external value actually changes (calendar pick)
    useEffect(() => {
      if (value !== prevValue.current) {
        prevValue.current = value;
        setLocal(value || "");
      }
    }, [value]);

    const handleChange = (e) => {
      const masked = applyDateMask(e.target.value);
      setLocal(masked);
      // Pass through so DatePicker fires onChangeRaw
      onChange({ ...e, target: { ...e.target, value: masked } });
    };

    return (
      <input
        ref={ref}
        type="text"
        value={local}
        onChange={handleChange}
        onClick={onClick}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        className={className}
        maxLength={16}
        inputMode="numeric"
      />
    );
  },
);

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
  const [saveAllState, setSaveAllState] = useState(null); // null | { saving, saved, failed, total }
  const [formErrors, setFormErrors] = useState({});
  const [individualSaved, setIndividualSaved] = useState(false);
  const [savedBatchKeys, setSavedBatchKeys] = useState(new Set());

  // Save modal states
  const [saveModal, setSaveModal] = useState({
    open: false,
    data: null,
    saving: false,
    savedId: null,
    error: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear custom validity message when user starts typing
    e.target.setCustomValidity("");

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
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
    setFormData((prev) => {
      const updated = { ...prev, [name]: date };
      // If scheduling date changed to after appointment date, clear appointment date
      if (
        name === "Marcacao" &&
        prev.DataHoraConsulta &&
        date &&
        date > prev.DataHoraConsulta
      ) {
        updated.DataHoraConsulta = null;
      }
      return updated;
    });
    if (date && formErrors[name]) {
      setFormErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
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
      const buffer = await file.arrayBuffer();

      // Try UTF-8 first (strict); fall back to Windows-1252 (common in Brazilian Excel exports)
      let text;
      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
      } catch (_e) {
        text = new TextDecoder("windows-1252").decode(buffer);
      }

      // Strip UTF-8 BOM if present
      text = text.replace(/^\uFEFF/, "");

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
    "CLINICA VOE - CAMPO BELO": {
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
    "SHOP. ARICANDUVA - AMB. TRAS": {
      address: "AV ARICANDUVA",
      cep: "03527-000",
    },
    "Hospital IGESP Santana": {
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

      // Validate max 500 appointments
      if (appointments.length === 0) {
        throw new Error("Nenhuma consulta encontrada para processar.");
      }

      if (appointments.length > 250) {
        throw new Error(
          `Máximo de 250 consultas por lote. Você tentou processar ${appointments.length}.`,
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

        const missingFields = requiredFields.filter((field) => {
          const v = appt[field];
          return (
            v === null ||
            v === undefined ||
            v === "" ||
            (field === "Idade" && (isNaN(v) || v === null))
          );
        });
        if (missingFields.length > 0) {
          throw new Error(
            `Registro ${index + 1}: campos obrigatórios faltando: ${missingFields.join(", ")}`,
          );
        }

        // Validate appointment date is not before scheduling date
        if (appt.Marcacao && appt.DataHoraConsulta) {
          const marcacao = new Date(appt.Marcacao);
          const consulta = new Date(appt.DataHoraConsulta);
          if (!isNaN(marcacao) && !isNaN(consulta) && consulta < marcacao) {
            throw new Error(
              `Registro ${index + 1}: a data da consulta (${appt.DataHoraConsulta}) não pode ser anterior à data do agendamento (${appt.Marcacao}).`,
            );
          }
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
      const detail = error.response?.data?.detail;
      let errorMessage;
      if (Array.isArray(detail)) {
        // FastAPI 422 returns detail as array of {loc, msg, input, type}
        errorMessage = detail
          .map((d) => {
            const field = d.loc?.slice(1).join(" → ") ?? "campo desconhecido";
            return `${field}: ${d.msg}`;
          })
          .join("\n");
      } else if (typeof detail === "string") {
        errorMessage = detail;
      } else {
        errorMessage =
          error.message ||
          "Erro ao processar predições em lote. Tente novamente.";
      }
      setBatchError(errorMessage);
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
      "Data agendamento",
      "Data consulta",
      "Predicao",
      "Prob. Falta Normalizada (%)",
      "Prob. Falta Bruta (%)",
      "Prob. Presenca (%)",
    ];

    const rows = batchResults.results.map((result) => [
      result.appointment.idUnicoPaciente,
      result.appointment.UnidadeAtendimento,
      result.appointment.Especialidade,
      new Date(result.appointment.Marcacao).toLocaleDateString("pt-BR"),
      new Date(result.appointment.DataHoraConsulta).toLocaleDateString("pt-BR"),
      result.prediction_label === "no-show" ? "Falta" : "Presenca",
      (result.probability_no_show_normalized * 100).toFixed(2),
      (result.probability_no_show * 100).toFixed(2),
      (result.probability_show * 100).toFixed(2),
    ]);

    // Build CSV (BOM ensures correct UTF-8 rendering in Excel)
    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      [
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
    setRiskResult(null);
    setIndividualSaved(false);

    // Client-side validation for date/required fields
    const errors = {};
    if (!formData.Marcacao) errors.Marcacao = true;
    if (!formData.DataHoraConsulta) errors.DataHoraConsulta = true;
    if (!formData.Idade) errors.Idade = true;
    if (!formData.Sexo) errors.Sexo = true;
    if (!formData.CidadePaciente) errors.CidadePaciente = true;
    if (!formData.BairroPaciente) errors.BairroPaciente = true;
    if (!formData.TipoConvenio) errors.TipoConvenio = true;
    if (!formData.UnidadeAtendimento) errors.UnidadeAtendimento = true;
    if (!formData.Especialidade) errors.Especialidade = true;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setPredictionLoading(true);
    setPredictionError("");

    try {
      // Validate that appointment date is not before scheduling date
      if (
        formData.Marcacao &&
        formData.DataHoraConsulta &&
        formData.DataHoraConsulta < formData.Marcacao
      ) {
        throw new Error(
          "A data da consulta não pode ser anterior à data do agendamento.",
        );
      }

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
      const probabilityNoShowPercent = parseFloat(
        (result.probability_no_show * 100).toFixed(1),
      );
      const probabilityShowPercent = parseFloat(
        (result.probability_show * 100).toFixed(1),
      );
      const probabilityNoShowNormalizedPercent = parseFloat(
        (result.probability_no_show_normalized * 100).toFixed(1),
      );

      setRiskResult({
        risk: probabilityNoShowNormalizedPercent,
        level:
          probabilityNoShowNormalizedPercent > 70
            ? "High"
            : probabilityNoShowNormalizedPercent > 40
              ? "Medium"
              : "Low",
        color:
          probabilityNoShowNormalizedPercent > 70
            ? "red"
            : probabilityNoShowNormalizedPercent > 40
              ? "yellow"
              : "green",
        prediction: result.prediction,
        predictionLabel: result.prediction_label,
        probabilityShow: probabilityShowPercent,
        probabilityNoShow: probabilityNoShowPercent,
        probabilityNoShowNormalized: probabilityNoShowNormalizedPercent,
        threshold: result.threshold,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      const status = error.response?.status;
      setPredictionError(
        status && status >= 500
          ? "Erro interno no servidor. Tente novamente em alguns instantes ou entre em contato com o suporte."
          : error.response?.data?.detail ||
              error.message ||
              "Erro ao calcular predição. Tente novamente.",
      );
    } finally {
      setPredictionLoading(false);
    }
  };

  const openSaveModal = (appointmentPayload, batchIndex = null) => {
    setSaveModal({
      open: true,
      data: appointmentPayload,
      saving: false,
      savedId: null,
      error: "",
      batchIndex,
    });
  };

  const handleSaveAll = async () => {
    if (!batchResults) return;
    const total = batchResults.results.length;
    setSaveAllState({ saving: true, saved: 0, failed: 0, total });
    try {
      const payloads = batchResults.results.map(buildBatchItemPayload);
      const result = await appointmentService.createAppointmentsBatch(payloads);
      setSaveAllState({
        saving: false,
        saved: result.created,
        failed: result.failed,
        total,
      });
      if (result.failed === 0) {
        setSavedBatchKeys(new Set(batchResults.results.map((_, i) => i)));
      }
    } catch {
      setSaveAllState({ saving: false, saved: 0, failed: total, total });
    }
  };

  const closeSaveModal = () => {
    setSaveModal({
      open: false,
      data: null,
      saving: false,
      savedId: null,
      error: "",
    });
  };

  const handleConfirmSave = async () => {
    setSaveModal((prev) => ({ ...prev, saving: true, error: "" }));
    try {
      const created = await appointmentService.createAppointment(
        saveModal.data,
      );
      const savedId = created.appointment_prediction_id;
      setSaveModal((prev) => ({
        ...prev,
        saving: false,
        savedId,
      }));
      if (saveModal.batchIndex != null) {
        setSavedBatchKeys((prev) => new Set([...prev, saveModal.batchIndex]));
      } else {
        setIndividualSaved(true);
      }
    } catch (error) {
      setSaveModal((prev) => ({
        ...prev,
        saving: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Erro ao salvar consulta.",
      }));
    }
  };

  const buildIndividualPayload = () => {
    const unitInfo = unitMapping[formData.UnidadeAtendimento] || {
      address: "AVENIDA PAULISTA",
      cep: "01310-100",
    };
    return {
      patient_id: formData.idUnicoPaciente || null,
      scheduled_at: formData.Marcacao?.toISOString() || null,
      appointment_at: formData.DataHoraConsulta?.toISOString() || null,
      patient_age: parseInt(formData.Idade, 10) || null,
      patient_sex: formData.Sexo || null,
      patient_city: formData.CidadePaciente || null,
      patient_neighborhood: formData.BairroPaciente || null,
      insurance_type: formData.TipoConvenio || null,
      unit_name: formData.UnidadeAtendimento || null,
      unit_address: unitInfo.address,
      unit_zipcode: unitInfo.cep,
      specialty: formData.Especialidade || null,
      prediction_class: riskResult?.prediction ?? null,
      prediction_label: riskResult?.predictionLabel ?? null,
      probability_show: riskResult ? riskResult.probabilityShow / 100 : null,
      probability_no_show: riskResult
        ? riskResult.probabilityNoShow / 100
        : null,
      probability_no_show_normalized: riskResult
        ? riskResult.probabilityNoShowNormalized / 100
        : null,
      threshold: riskResult?.threshold ?? null,
    };
  };

  const buildBatchItemPayload = (result) => {
    const appt = result.appointment;
    const unitInfo = unitMapping[appt.UnidadeAtendimento] || {
      address: "AVENIDA PAULISTA",
      cep: "01310-100",
    };
    return {
      patient_id: appt.idUnicoPaciente || null,
      scheduled_at: appt.Marcacao || null,
      appointment_at: appt.DataHoraConsulta || null,
      patient_age: parseInt(appt.Idade, 10) || null,
      patient_sex: appt.Sexo || null,
      patient_city: appt.CidadePaciente || null,
      patient_neighborhood: appt.BairroPaciente || null,
      insurance_type: appt.TipoConvenio || null,
      unit_name: appt.UnidadeAtendimento || null,
      unit_address: unitInfo.address,
      unit_zipcode: unitInfo.cep,
      specialty: appt.Especialidade || null,
      prediction_class: result.prediction,
      prediction_label: result.prediction_label,
      probability_show: result.probability_show,
      probability_no_show: result.probability_no_show,
      probability_no_show_normalized: result.probability_no_show_normalized,
      threshold: result.threshold ?? null,
    };
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Predição com IA
          </h1>
          <p className="text-slate-500">
            Calcule o risco de falta usando predições baseadas em IA
          </p>
        </div>
        <NormalizedRiskHelp />
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

                    {/* idUnicoPaciente */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ID Único do Paciente{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          (opcional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="idUnicoPaciente"
                        value={formData.idUnicoPaciente}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Digite o ID do paciente (opcional)"
                      />
                    </div>

                    {/* Marcacao */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Data do Agendamento{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.Marcacao}
                        onChange={(date) => handleDateChange("Marcacao", date)}
                        onChangeRaw={(e) => {
                          const parsed = parseMaskedDate(
                            e?.target?.value || "",
                          );
                          if (parsed) handleDateChange("Marcacao", parsed);
                        }}
                        dateFormat="dd/MM/yyyy HH:mm"
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="Hora"
                        showTimeSelect
                        locale={ptBR}
                        placeholderText="dd/mm/aaaa hh:mm"
                        customInput={
                          <DateMaskedInput
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                              formErrors.Marcacao
                                ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          />
                        }
                      />
                      {formErrors.Marcacao && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    {/* DataHoraConsulta */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Data da Consulta <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.DataHoraConsulta}
                        onChange={(date) =>
                          handleDateChange("DataHoraConsulta", date)
                        }
                        onChangeRaw={(e) => {
                          const parsed = parseMaskedDate(
                            e?.target?.value || "",
                          );
                          if (parsed)
                            handleDateChange("DataHoraConsulta", parsed);
                        }}
                        dateFormat="dd/MM/yyyy HH:mm"
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="Hora"
                        showTimeSelect
                        locale={ptBR}
                        placeholderText="dd/mm/aaaa hh:mm"
                        minDate={formData.Marcacao || undefined}
                        customInput={
                          <DateMaskedInput
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                              formErrors.DataHoraConsulta
                                ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          />
                        }
                      />
                      {formErrors.DataHoraConsulta && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obrigatório
                        </p>
                      )}
                      {formData.Marcacao &&
                        !formData.DataHoraConsulta &&
                        !formErrors.DataHoraConsulta && (
                          <p className="text-xs text-red-500 mt-1">
                            A data da consulta deve ser igual ou posterior à
                            data do agendamento.
                          </p>
                        )}
                    </div>

                    {/* Idade */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Idade <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="Idade"
                        value={formData.Idade}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                          formErrors.Idade
                            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        placeholder="Digite a idade"
                        min="0"
                        max="120"
                        required
                      />
                      {formErrors.Idade && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    {/* Sexo */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sexo <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="Sexo"
                        value={formData.Sexo}
                        onChange={handleInputChange}
                        onInvalid={handleInvalid}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                          formErrors.Sexo
                            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        required
                      >
                        <option value="">Selecione...</option>
                        {sexoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.Sexo && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    {/* CEP Paciente */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        CEP do Paciente <span className="text-red-500">*</span>
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
                        Cidade do Paciente{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="CidadePaciente"
                        value={formData.CidadePaciente}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed ${
                          formErrors.CidadePaciente && !cepAutoFilled
                            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        placeholder="Digite a cidade ou preencha o CEP"
                        required
                        disabled={cepAutoFilled}
                      />
                      {formErrors.CidadePaciente && !cepAutoFilled && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    {/* BairroPaciente */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bairro do Paciente{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="BairroPaciente"
                        value={formData.BairroPaciente}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed ${
                          formErrors.BairroPaciente && !cepAutoFilled
                            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        placeholder="Digite o bairro ou preencha o CEP"
                        required
                        disabled={cepAutoFilled}
                      />
                      {formErrors.BairroPaciente && !cepAutoFilled && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    {/* TipoConvenio */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tipo de Convênio <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="TipoConvenio"
                        value={formData.TipoConvenio}
                        onChange={handleInputChange}
                        onInvalid={handleInvalid}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                          formErrors.TipoConvenio
                            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        required
                      >
                        <option value="">Selecione...</option>
                        {tipoConvenioOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.TipoConvenio && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    {/* UnidadeAtendimento */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Unidade de Atendimento{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="UnidadeAtendimento"
                        value={formData.UnidadeAtendimento}
                        onChange={handleInputChange}
                        onInvalid={handleInvalid}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                          formErrors.UnidadeAtendimento
                            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        required
                      >
                        <option value="">Selecione...</option>
                        {unidadeAtendimentoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.UnidadeAtendimento && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obrigatório
                        </p>
                      )}
                    </div>

                    {/* Especialidade */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Especialidade <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="Especialidade"
                        value={formData.Especialidade}
                        onChange={handleInputChange}
                        onInvalid={handleInvalid}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                          formErrors.Especialidade
                            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        required
                      >
                        <option value="">Selecione...</option>
                        {especialidadeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.Especialidade && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obrigatório
                        </p>
                      )}
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
                        Calcular risco
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Result Card */}
              <div className="lg:col-span-1">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 sticky top-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Resultado da predição
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
                        <div className="relative group inline-flex items-center justify-center gap-1 mb-2">
                          <p className="text-sm text-slate-600">
                            Probabilidade de falta
                          </p>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help flex-shrink-0" />
                          <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-800 text-white text-xs rounded-lg p-3 z-20 text-left pointer-events-none">
                            <p className="font-semibold mb-1.5">
                              Valor normalizado
                            </p>
                            <p className="text-slate-400">
                              Limiar da especialidade:{" "}
                              <span className="text-white font-medium">
                                {riskResult.threshold != null
                                  ? (riskResult.threshold * 100).toLocaleString(
                                      "pt-BR",
                                      {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 1,
                                      },
                                    ) + "%"
                                  : "—"}
                              </span>
                            </p>
                            <p className="mt-0.5 text-slate-400">
                              Probabilidade bruta:{" "}
                              <span className="text-white font-medium">
                                {riskResult.probabilityNoShow.toLocaleString(
                                  "pt-BR",
                                  {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1,
                                  },
                                )}
                                %
                              </span>
                            </p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                          </div>
                        </div>
                        <p className="text-4xl font-bold text-slate-800">
                          {riskResult.risk.toLocaleString("pt-BR", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}
                          %
                        </p>
                      </div>

                      {/* Probabilities */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Prob. presença:
                          </span>
                          <span className="font-semibold text-green-600">
                            {(100 - riskResult.risk).toLocaleString("pt-BR", {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="relative group inline-flex items-center gap-1">
                            <span className="text-slate-600">Prob. falta:</span>
                            <Info className="w-3 h-3 text-slate-400 cursor-help" />
                            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-0 mb-2 w-56 bg-slate-800 text-white text-xs rounded-lg p-2.5 z-20 pointer-events-none">
                              <p className="font-semibold mb-1.5">
                                Valor normalizado
                              </p>
                              <p className="text-slate-400">
                                Limiar da especialidade:{" "}
                                <span className="text-white font-medium">
                                  {riskResult.threshold != null
                                    ? (
                                        riskResult.threshold * 100
                                      ).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 1,
                                      }) + "%"
                                    : "—"}
                                </span>
                              </p>
                              <p className="mt-0.5 text-slate-400">
                                Probabilidade bruta:{" "}
                                <span className="text-white font-medium">
                                  {riskResult.probabilityNoShow.toLocaleString(
                                    "pt-BR",
                                    {
                                      minimumFractionDigits: 1,
                                      maximumFractionDigits: 1,
                                    },
                                  )}
                                  %
                                </span>
                              </p>
                              <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-800" />
                            </div>
                          </div>
                          <span className="font-semibold text-red-600">
                            {riskResult.risk.toLocaleString("pt-BR", {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })}
                            %
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
                            riskResult.predictionLabel === "no-show"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {riskResult.predictionLabel === "no-show"
                            ? "Falta"
                            : "Presença"}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-3">
                          Esta predição é baseada em análise de IA dos dados do
                          paciente e padrões históricos.
                        </p>
                        {!individualSaved ? (
                          <button
                            onClick={() =>
                              openSaveModal(buildIndividualPayload())
                            }
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Save className="w-4 h-4" />
                            Salvar consulta
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 font-semibold py-2 px-4 rounded-lg text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Consulta salva
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        Preencha o formulário e clique em "Calcular risco" para
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
                      Enviar arquivo CSV
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
                      Selecionar arquivo CSV
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
                      Colar dados JSON
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
                          <div className="text-xs text-red-700 space-y-0.5">
                            {batchError.split("\n").map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
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
                        Processar lista em lote
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
                          <li>• Máximo de 250 consultas por processamento</li>
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
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setBatchResults(null);
                        setBatchJsonInput("");
                        setBatchFile(null);
                        setBatchError("");
                        setSaveAllState(null);
                      }}
                      className="flex items-center gap-2 bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:bg-slate-300 transition-colors"
                    >
                      Nova predição
                    </button>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleDownloadResults}
                        className="flex items-center gap-2 bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Baixar resultados (CSV)
                      </button>
                      <button
                        onClick={handleSaveAll}
                        disabled={
                          saveAllState?.saving ||
                          (saveAllState && !saveAllState.saving)
                        }
                        className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {saveAllState?.saving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        Salvar Todas
                      </button>
                    </div>
                  </div>

                  {/* Save All progress / result feedback */}
                  {saveAllState && (
                    <div
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                        saveAllState.saving
                          ? "bg-blue-50 border border-blue-200 text-blue-700"
                          : saveAllState.failed === 0
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                      }`}
                    >
                      {saveAllState.saving ? (
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      ) : saveAllState.failed === 0 ? (
                        <CheckCircle className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      {saveAllState.saving
                        ? `Salvando… ${saveAllState.saved + saveAllState.failed} de ${saveAllState.total}`
                        : saveAllState.failed === 0
                          ? `${saveAllState.saved} consulta${saveAllState.saved !== 1 ? "s" : ""} salva${saveAllState.saved !== 1 ? "s" : ""} com sucesso.`
                          : `${saveAllState.saved} salva${saveAllState.saved !== 1 ? "s" : ""}, ${saveAllState.failed} com falha. Tente salvar as falhas individualmente.`}
                    </div>
                  )}

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
                              Data consulta
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-700">
                              Predição
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-700">
                              Prob. falta
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-700">
                              Ação
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
                                    result.prediction_label === "no-show"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {result.prediction_label === "no-show" ? (
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
                              <td className="px-4 py-3 text-right">
                                <div className="relative group inline-flex items-center justify-end gap-1">
                                  <span className="font-semibold text-slate-700">
                                    {(
                                      result.probability_no_show_normalized *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                  <Info className="w-3 h-3 text-slate-400 cursor-help flex-shrink-0" />
                                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full right-0 mb-2 w-56 bg-slate-800 text-white text-xs rounded-lg p-2.5 z-20 text-left pointer-events-none">
                                    <p className="font-semibold mb-1.5">
                                      Valor normalizado
                                    </p>
                                    <p className="text-slate-400">
                                      Limiar da especialidade:{" "}
                                      <span className="text-white font-medium">
                                        {result.threshold != null
                                          ? (
                                              result.threshold * 100
                                            ).toLocaleString("pt-BR", {
                                              minimumFractionDigits: 0,
                                              maximumFractionDigits: 1,
                                            }) + "%"
                                          : "—"}
                                      </span>
                                    </p>
                                    <p className="mt-0.5 text-slate-400">
                                      Probabilidade bruta:{" "}
                                      <span className="text-white font-medium">
                                        {(
                                          result.probability_no_show * 100
                                        ).toFixed(1)}
                                        %
                                      </span>
                                    </p>
                                    <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-800" />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {savedBatchKeys.has(index) ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700">
                                    <CheckCircle className="w-3 h-3" />
                                    Salvo
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      openSaveModal(
                                        buildBatchItemPayload(result),
                                        index,
                                      )
                                    }
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                  >
                                    <Save className="w-3 h-3" />
                                    Salvar
                                  </button>
                                )}
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

      {/* Save Confirmation Modal */}
      {saveModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Save className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Salvar consulta
                </h2>
              </div>
              {!saveModal.saving && !saveModal.savedId && (
                <button
                  onClick={closeSaveModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {saveModal.savedId ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-bold text-slate-800 mb-1">
                    Consulta salva!
                  </p>
                  <p className="text-sm text-slate-500">
                    ID:{" "}
                    <span className="font-semibold text-slate-700">
                      #{saveModal.savedId}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    A consulta está disponível na tela de Consultas para
                    acompanhamento.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    Confirme os dados abaixo para salvar a consulta e monitorar
                    o comparecimento do paciente.
                  </p>

                  <div className="space-y-2 bg-slate-50 rounded-xl p-4 text-sm">
                    {saveModal.data?.patient_id && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">ID Paciente</span>
                        <span className="font-medium text-slate-700">
                          {saveModal.data.patient_id}
                        </span>
                      </div>
                    )}
                    {saveModal.data?.appointment_at && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Data da Consulta</span>
                        <span className="font-medium text-slate-700">
                          {new Date(
                            saveModal.data.appointment_at,
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}
                    {saveModal.data?.unit_name && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Unidade</span>
                        <span className="font-medium text-slate-700 text-right max-w-[60%]">
                          {saveModal.data.unit_name}
                        </span>
                      </div>
                    )}
                    {saveModal.data?.specialty && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Especialidade</span>
                        <span className="font-medium text-slate-700">
                          {saveModal.data.specialty}
                        </span>
                      </div>
                    )}
                    {saveModal.data?.insurance_type && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Convênio</span>
                        <span className="font-medium text-slate-700">
                          {saveModal.data.insurance_type}
                        </span>
                      </div>
                    )}
                    {saveModal.data?.prediction_label && (
                      <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                        <span className="text-slate-500">Predição</span>
                        <span
                          className={`font-bold ${
                            saveModal.data.prediction_label === "no-show"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {saveModal.data.prediction_label === "no-show"
                            ? "Falta"
                            : "Presença"}{" "}
                          (
                          {saveModal.data.probability_no_show_normalized != null
                            ? (
                                saveModal.data.probability_no_show_normalized *
                                100
                              ).toFixed(1)
                            : "—"}
                          %)
                        </span>
                      </div>
                    )}
                  </div>

                  {saveModal.error && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-700">{saveModal.error}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              {saveModal.savedId ? (
                <button
                  onClick={closeSaveModal}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Fechar
                </button>
              ) : (
                <>
                  <button
                    onClick={closeSaveModal}
                    disabled={saveModal.saving}
                    className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    disabled={saveModal.saving}
                    className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saveModal.saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Confirmar
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prediction;
