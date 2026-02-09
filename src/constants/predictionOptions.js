// Form options for prediction form
// In the future, these can be fetched from an API

export const tipoConvenioOptions = [
  { value: "Ambulatorial", label: "Ambulatorial" },
  { value: "Apartamento", label: "Apartamento" },
  { value: "Enfermaria", label: "Enfermaria" },
  {
    value: "Apartamento com direito a acompanhante",
    label: "Apartamento com direito a acompanhante",
  },
  { value: "Odontológico", label: "Odontológico" },
];

export const unidadeAtendimentoOptions = [
  { value: "SÃO VICENTE - AMB. TRAS", label: "SÃO VICENTE - AMB. TRAS" },
  { value: "AEROPORTO - AMB. IGESP", label: "AEROPORTO - AMB. IGESP" },
  { value: "GUARUJA - AMB. IGESP", label: "GUARUJA - AMB. IGESP" },
  {
    value: "SEDE (SÃO PAULO) - AMB. TRAS",
    label: "SEDE (SÃO PAULO) - AMB. TRAS",
  },
  { value: "SANTANA - AMB. TRAS", label: "SANTANA - AMB. TRAS" },
  { value: "CAMPO BELO", label: "CAMPO BELO" },
  { value: "PRAIA GRANDE - AMB. IGESP", label: "PRAIA GRANDE - AMB. IGESP" },
  { value: "SANTOS PA - AMB. IGESP", label: "SANTOS PA - AMB. IGESP" },
  { value: "TATUAPE- AMB. TRAS", label: "TATUAPE- AMB. TRAS" },
  { value: "SÃO BERNARDO - AMB. TRAS", label: "SÃO BERNARDO - AMB. TRAS" },
  { value: "LAPA - AMB. TRAS", label: "LAPA - AMB. TRAS" },
  { value: "HOSP GUARUJA", label: "HOSP GUARUJA" },
  { value: "BELA VISTA - AMB. IGESP", label: "BELA VISTA - AMB. IGESP" },
];

export const especialidadeOptions = [
  { value: "EXAMES", label: "EXAMES" },
  { value: "AV.TEC. ORTOP./ JOELHO", label: "AV.TEC. ORTOP./ JOELHO" },
  {
    value: "CLINICA GERAL/MAIOR 60 ANOS",
    label: "CLINICA GERAL/MAIOR 60 ANOS",
  },
  { value: "ONCOLOGIA", label: "ONCOLOGIA" },
  { value: "GINECOLOGIA - OBSTETRÍCIA", label: "GINECOLOGIA - OBSTETRÍCIA" },
  { value: "REUMATOLOGIA", label: "REUMATOLOGIA" },
  { value: "ENDOCRINOLOGIA", label: "ENDOCRINOLOGIA" },
  { value: "GLAUCOMA / GONIOSCOPIA", label: "GLAUCOMA / GONIOSCOPIA" },
  {
    value: "AV.TEC. CIR. GERAL ONCOLOGICA",
    label: "AV.TEC. CIR. GERAL ONCOLOGICA",
  },
  { value: "PEDIATRIA_PLANTAO", label: "PEDIATRIA_PLANTAO" },
  { value: "OTORRINOLARINGOLOGIA", label: "OTORRINOLARINGOLOGIA" },
  { value: "PNEUMOLOGIA", label: "PNEUMOLOGIA" },
  {
    value: "AV.TEC. GERAL/GASTRO/PROCTO",
    label: "AV.TEC. GERAL/GASTRO/PROCTO",
  },
  { value: "SESSÃO DE QUIMIOTERAPIA", label: "SESSÃO DE QUIMIOTERAPIA" },
  {
    value: "AV.TEC. TRIAGEM  NEUROCIRURGIA/COLUNA",
    label: "AV.TEC. TRIAGEM NEUROCIRURGIA/COLUNA",
  },
  {
    value: "CLINICA GERAL/ PROCEDIMENTOS",
    label: "CLINICA GERAL/ PROCEDIMENTOS",
  },
  {
    value: "_TELEATEND_GINECOLOGIA/OBSTETRICIA",
    label: "_TELEATEND_GINECOLOGIA/OBSTETRICIA",
  },
  { value: "ORTOPEDIA", label: "ORTOPEDIA" },
  {
    value: "GASTROENTEROLOGIA/CONSULTAS",
    label: "GASTROENTEROLOGIA/CONSULTAS",
  },
  { value: "FONOAUDIOLOGIA", label: "FONOAUDIOLOGIA" },
  { value: "AV.TEC. ORTOP./MÃO", label: "AV.TEC. ORTOP./MÃO" },
  { value: "AV.TEC. NEUROCIRURGIA", label: "AV.TEC. NEUROCIRURGIA" },
  { value: "PROCEDIMENTOS/UROLOGIA", label: "PROCEDIMENTOS/UROLOGIA" },
  { value: "PRE-NATAL ALTO RISCO", label: "PRE-NATAL ALTO RISCO" },
  { value: "PSICOLOGIA INFANTIL", label: "PSICOLOGIA INFANTIL" },
  { value: "MASTOLOGIA", label: "MASTOLOGIA" },
  { value: "AV.TEC. ORTOP./OMBRO", label: "AV.TEC. ORTOP./OMBRO" },
  { value: "TRIAGEM CIR. BARIATRICA", label: "TRIAGEM CIR. BARIATRICA" },
  {
    value: "AV. TEC. CIRURGIA PEDIATRICA",
    label: "AV. TEC. CIRURGIA PEDIATRICA",
  },
  {
    value: "AV. TEC. CIR. CABEÇA/ PESCOÇO/PROCEDIMENTO",
    label: "AV. TEC. CIR. CABEÇA/ PESCOÇO/PROCEDIMENTO",
  },
  {
    value: "TERAPIA OCUPACIONAL INFANTIL",
    label: "TERAPIA OCUPACIONAL INFANTIL",
  },
  { value: "PSICOPEDAGOGIA INFANTIL", label: "PSICOPEDAGOGIA INFANTIL" },
  { value: "NEUROLOGIA", label: "NEUROLOGIA" },
  { value: "UROLOGIA", label: "UROLOGIA" },
  { value: "TERAPIA OCUPACIONAL", label: "TERAPIA OCUPACIONAL" },
  { value: "PROCEDIMENTOS/REUMATOLOGIA", label: "PROCEDIMENTOS/REUMATOLOGIA" },
  { value: "NUTRIÇÃO_MED.PREVENTIVA", label: "NUTRIÇÃO_MED.PREVENTIVA" },
  { value: "FISIOTERAPIA INFANTIL", label: "FISIOTERAPIA INFANTIL" },
  { value: "PSICOLOGIA", label: "PSICOLOGIA" },
  {
    value: "DERMATOLOGIA/ PEQUENAS CIRURGIAS",
    label: "DERMATOLOGIA/ PEQUENAS CIRURGIAS",
  },
  { value: "NUTRICIONISTA", label: "NUTRICIONISTA" },
  { value: "GINECOLOGIA", label: "GINECOLOGIA" },
  {
    value: "AV.TEC. GINECO/HISTERO CIR.",
    label: "AV.TEC. GINECO/HISTERO CIR.",
  },
  { value: "AV.TEC. ORTOP./ONCO", label: "AV.TEC. ORTOP./ONCO" },
  { value: "AV. TEC. CIR. BARIATRICA", label: "AV. TEC. CIR. BARIATRICA" },
  { value: "DERMATOLOGIA CONSULTAS", label: "DERMATOLOGIA CONSULTAS" },
  { value: "MUSICOTERAPIA INFANTIL", label: "MUSICOTERAPIA INFANTIL" },
  { value: "VASCULAR", label: "VASCULAR" },
  { value: "AV.TEC. ORTOP./ COLUNA", label: "AV.TEC. ORTOP./ COLUNA" },
  { value: "INFECTOLOGISTA", label: "INFECTOLOGISTA" },
  { value: "PROCEDIMENTO/DERMATOLOGIA", label: "PROCEDIMENTO/DERMATOLOGIA" },
  {
    value: "AV.TEC. ORTOP./ PE_TORNOZELO",
    label: "AV.TEC. ORTOP./ PE_TORNOZELO",
  },
  { value: "AVALIACAO QT_OFTALMO", label: "AVALIACAO QT_OFTALMO" },
  { value: "AV. ADM. MULTIDISCIPLINAR", label: "AV. ADM. MULTIDISCIPLINAR" },
  { value: "OFTALMOLOGIA", label: "OFTALMOLOGIA" },
  { value: "HEMATOLOGIA", label: "HEMATOLOGIA" },
  { value: "AV.TEC. ORTOP./GERAL", label: "AV.TEC. ORTOP./GERAL" },
  { value: "FISIOTERAPIA NEUROLOGICA", label: "FISIOTERAPIA NEUROLOGICA" },
  { value: "CARDIOLOGIA", label: "CARDIOLOGIA" },
  { value: "CLINICA GERAL", label: "CLINICA GERAL" },
  {
    value: "AV.TEC. PLÁSTICA REPARADORA",
    label: "AV.TEC. PLÁSTICA REPARADORA",
  },
  { value: "AV.TEC. CIR CABEÇA/PESCOÇO", label: "AV.TEC. CIR CABEÇA/PESCOÇO" },
  { value: "ENTREVISTA QUALIFICADA", label: "ENTREVISTA QUALIFICADA" },
  { value: "FISIOTERAPIA UROLOGICA", label: "FISIOTERAPIA UROLOGICA" },
  { value: "AV.TEC. UROLOGICA", label: "AV.TEC. UROLOGICA" },
  {
    value: "PROCEDIMENTOS/PEQUENAS CIRURGIAS",
    label: "PROCEDIMENTOS/PEQUENAS CIRURGIAS",
  },
  { value: "PEDIATRIA", label: "PEDIATRIA" },
  { value: "ORTOPEDIA/ACOMPANHAM_GESSO", label: "ORTOPEDIA/ACOMPANHAM_GESSO" },
  { value: "AV.TEC. GERAL/GASTRO", label: "AV.TEC. GERAL/GASTRO" },
  { value: "AV.TEC. CIR TORACICO", label: "AV.TEC. CIR TORACICO" },
  { value: "PROCEDIMENTO/ORTOPEDIA", label: "PROCEDIMENTO/ORTOPEDIA" },
  {
    value: "CARDIOLOGIA/ MEDICINA PREVENTIVA",
    label: "CARDIOLOGIA/ MEDICINA PREVENTIVA",
  },
  { value: "GASTRO/PROCTO/HEPATO", label: "GASTRO/PROCTO/HEPATO" },
  { value: "AV.TEC. ORTOP./ QUADRIL", label: "AV.TEC. ORTOP./ QUADRIL" },
  { value: "VASCULAR/PROCEDIMENTOS", label: "VASCULAR/PROCEDIMENTOS" },
  { value: "FISIATRIA", label: "FISIATRIA" },
  { value: "OFTALMOLOGIA 7 A 18 ANOS", label: "OFTALMOLOGIA 7 A 18 ANOS" },
  { value: "HOMEOPATIA", label: "HOMEOPATIA" },
  { value: "PROCTOLOGIA", label: "PROCTOLOGIA" },
  { value: "GERONTOLOGIA", label: "GERONTOLOGIA" },
  { value: "OBSTETRICIA", label: "OBSTETRICIA" },
  { value: "NEUROPEDIATRIA", label: "NEUROPEDIATRIA" },
  { value: "GASTRO/PROCTO", label: "GASTRO/PROCTO" },
  {
    value: "CLINICA GERAL/MEDICO DA FAMILIA",
    label: "CLINICA GERAL/MEDICO DA FAMILIA",
  },
  { value: "AV.TEC. OTORRINO", label: "AV.TEC. OTORRINO" },
  {
    value: "AV.TEC. ORTOP./INFILTRAÇÃO_GERAL",
    label: "AV.TEC. ORTOP./INFILTRAÇÃO_GERAL",
  },
  { value: "AV.TEC. MARCAPASSO_CARDIO", label: "AV.TEC. MARCAPASSO_CARDIO" },
  { value: "CLINICA_PLANTAO", label: "CLINICA_PLANTAO" },
  {
    value: "FISIOTERAPIA POS OPERATORIA",
    label: "FISIOTERAPIA POS OPERATORIA",
  },
  {
    value: "GASTROENTEROLOGIA/HEPATOLOGIA",
    label: "GASTROENTEROLOGIA/HEPATOLOGIA",
  },
  { value: "AV.TEC. ORTOP./INFILTRACAO", label: "AV.TEC. ORTOP./INFILTRACAO" },
  { value: "AV.TEC. VASCULAR", label: "AV.TEC. VASCULAR" },
  {
    value: "PROCEDIMENTO/ MAPEAMENTO DE RETINA",
    label: "PROCEDIMENTO/ MAPEAMENTO DE RETINA",
  },
  { value: "FONOAUDIOLOGIA INFANTIL", label: "FONOAUDIOLOGIA INFANTIL" },
];

export const sexoOptions = [
  { value: "F", label: "Feminino" },
  { value: "M", label: "Masculino" },
];

// Helper function to fetch options (for future API integration)
export const fetchFormOptions = async () => {
  // TODO: Replace with actual API call in the future
  // const response = await fetch('/api/form-options');
  // const data = await response.json();
  // return data;

  return {
    tipoConvenio: tipoConvenioOptions,
    unidadeAtendimento: unidadeAtendimentoOptions,
    especialidade: especialidadeOptions,
    sexo: sexoOptions,
  };
};
