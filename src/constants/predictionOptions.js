// Form options for prediction form
// value = raw DB value (sent to API), label = display text shown to the user
// In the future, these can be fetched from an API

export const tipoConvenioOptions = [
  { value: "Ambulatorial", label: "Ambulatorial" },
  { value: "Apartamento", label: "Apartamento" },
  {
    value: "Apartamento com direito a acompanhante",
    label: "Apartamento com direito a acompanhante",
  },
  { value: "Enfermaria", label: "Enfermaria" },
  { value: "Odontológico", label: "Odontológico" },
];

// Sorted alphabetically by label
export const unidadeAtendimentoOptions = [
  { value: "AEROPORTO - AMB. IGESP", label: "Aeroporto" },
  { value: "BELA VISTA - AMB. IGESP", label: "Bela Vista" },
  { value: "CAMPO BELO", label: "Campo Belo" },
  { value: "CLINICA VOE - CAMPO BELO", label: "Clínica Voe - Campo Belo" },
  { value: "GUARUJA - AMB. IGESP", label: "Guarujá" },
  { value: "HOSP GUARUJA", label: "Hospital Guarujá" },
  { value: "Hospital IGESP Santana", label: "Hospital IGESP Santana" },
  { value: "LAPA - AMB. TRAS", label: "Lapa" },
  { value: "PRAIA GRANDE - AMB. IGESP", label: "Praia Grande" },
  { value: "SANTANA - AMB. TRAS", label: "Santana" },
  { value: "SANTOS PA - AMB. IGESP", label: "Santos PA" },
  { value: "SÃO BERNARDO - AMB. TRAS", label: "São Bernardo" },
  { value: "SÃO VICENTE - AMB. TRAS", label: "São Vicente" },
  { value: "SEDE (SÃO PAULO) - AMB. TRAS", label: "Sede São Paulo" },
  { value: "SHOP. ARICANDUVA - AMB. TRAS", label: "Shopping Aricanduva" },
  { value: "TATUAPE- AMB. TRAS", label: "Tatuapé" },
];

// Sorted alphabetically by label
export const especialidadeOptions = [
  { value: "ALERGOLOGIA", label: "Alergologia" },
  { value: "APA_ACOMPANHAMENTO", label: "APA - Acompanhamento" },
  { value: "APLICADOR ABA", label: "Aplicador ABA" },
  {
    value: "ATUALIZAÇÃO TRATAMENTO CONTÍNUO - Aguarde contato",
    label: "Atualização de Tratamento Contínuo",
  },
  { value: "AV. ADM. MULTIDISCIPLINAR", label: "Av. Adm. Multidisciplinar" },
  {
    value: "AV.TEC. CIR CABEÇA/PESCOÇO",
    label: "Av. Tec. Cir. Cabeça/Pescoço",
  },
  {
    value: "AV. TEC. CIR. CABEÇA/ PESCOÇO/PROCEDIMENTO",
    label: "Av. Tec. Cir. Cabeça/Pescoço (Procedimento)",
  },
  {
    value: "AV.TEC. CIR. GERAL ONCOLOGICA",
    label: "Av. Tec. Cir. Geral Oncológica",
  },
  { value: "AV.TEC. CIR TORACICO", label: "Av. Tec. Cir. Torácica" },
  { value: "AV. TEC. CIR. BARIATRICA", label: "Av. Tec. Cirurgia Bariátrica" },
  {
    value: "AV. TEC. CIRURGIA PEDIATRICA",
    label: "Av. Tec. Cirurgia Pediátrica",
  },
  { value: "AV.TEC. GERAL/GASTRO", label: "Av. Tec. Geral / Gastro" },
  {
    value: "AV.TEC. GERAL/GASTRO/PROCTO",
    label: "Av. Tec. Geral / Gastro / Procto",
  },
  {
    value: "AV.TEC. GINECO/HISTERO CIR.",
    label: "Av. Tec. Ginecologia / Histerectomia Cir.",
  },
  { value: "AV.TEC. MARCAPASSO_CARDIO", label: "Av. Tec. Marcapasso Cardíaco" },
  { value: "AV.TEC. MASTOLOGIA", label: "Av. Tec. Mastologia" },
  { value: "AV.TEC. NEUROCIRURGIA", label: "Av. Tec. Neurocirurgia" },
  { value: "AV.TEC. ORTOP./ COLUNA", label: "Av. Tec. Ortopedia - Coluna" },
  { value: "AV.TEC. ORTOP./GERAL", label: "Av. Tec. Ortopedia - Geral" },
  {
    value: "AV.TEC. ORTOP./INFILTRACAO",
    label: "Av. Tec. Ortopedia - Infiltração",
  },
  {
    value: "AV.TEC. ORTOP./INFILTRAÇÃO_GERAL",
    label: "Av. Tec. Ortopedia - Infiltração Geral",
  },
  { value: "AV.TEC. ORTOP./ JOELHO", label: "Av. Tec. Ortopedia - Joelho" },
  { value: "AV.TEC. ORTOP./MÃO", label: "Av. Tec. Ortopedia - Mão" },
  { value: "AV.TEC. ORTOP./OMBRO", label: "Av. Tec. Ortopedia - Ombro" },
  { value: "AV.TEC. ORTOP./ONCO", label: "Av. Tec. Ortopedia - Oncológica" },
  { value: "AV.TEC. ORTOP./PE", label: "Av. Tec. Ortopedia - Pé" },
  {
    value: "AV.TEC. ORTOP./ PE_TORNOZELO",
    label: "Av. Tec. Ortopedia - Pé/Tornozelo",
  },
  { value: "AV.TEC. ORTOP./ QUADRIL", label: "Av. Tec. Ortopedia - Quadril" },
  { value: "AV.TEC. ORTOP.GERAL/ PE", label: "Av. Tec. Ortopedia Geral - Pé" },
  { value: "AV.TEC. OTORRINO", label: "Av. Tec. Otorrinolaringologia" },
  {
    value: "AV.TEC. PLÁSTICA REPARADORA",
    label: "Av. Tec. Plástica Reparadora",
  },
  {
    value: "AV.TEC. TRIAGEM  NEUROCIRURGIA/COLUNA",
    label: "Av. Tec. Triagem Neurocirurgia / Coluna",
  },
  { value: "AV.TEC. UROLOGICA", label: "Av. Tec. Urológica" },
  { value: "AV.TEC. VASCULAR", label: "Av. Tec. Vascular" },
  {
    value: "AVALIAÇÃO_TESTE COGNITIVO/ PROCEDIMENTOS",
    label: "Avaliação - Teste Cognitivo / Procedimentos",
  },
  { value: "AVALIACAO QT_OFTALMO", label: "Avaliação QT Oftalmológica" },
  { value: "CARDIOLOGIA", label: "Cardiologia" },
  {
    value: "CARDIOLOGIA/ MEDICINA PREVENTIVA",
    label: "Cardiologia / Medicina Preventiva",
  },
  { value: "CLINICA_PLANTAO", label: "Clínica - Plantão" },
  { value: "CLINICA GERAL", label: "Clínica Geral" },
  {
    value: "CLINICA GERAL/MAIOR 60 ANOS",
    label: "Clínica Geral (Maior 60 Anos)",
  },
  {
    value: "CLINICA GERAL/MEDICO DA FAMILIA",
    label: "Clínica Geral / Médico da Família",
  },
  {
    value: "CLINICA GERAL/ PROCEDIMENTOS",
    label: "Clínica Geral / Procedimentos",
  },
  { value: "CLINICA TELEMEDICINA HOJE", label: "Clínica Telemedicina" },
  { value: "DERMATOLOGIA CONSULTAS", label: "Dermatologia" },
  {
    value: "DERMATOLOGIA/ PEQUENAS CIRURGIAS",
    label: "Dermatologia / Pequenas Cirurgias",
  },
  { value: "ENDOCRINOLOGIA", label: "Endocrinologia" },
  { value: "ENTREVISTA QUALIFICADA", label: "Entrevista Qualificada" },
  { value: "EXAMES", label: "Exames" },
  { value: "FISIATRIA", label: "Fisiatria" },
  { value: "FISIOTERAPIA", label: "Fisioterapia" },
  { value: "FISIOTERAPIA INFANTIL", label: "Fisioterapia Infantil" },
  { value: "FISIOTERAPIA NEUROLOGICA", label: "Fisioterapia Neurológica" },
  {
    value: "FISIOTERAPIA POS OPERATORIA",
    label: "Fisioterapia Pós-Operatória",
  },
  { value: "FISIOTERAPIA UROLOGICA", label: "Fisioterapia Urológica" },
  { value: "FONOAUDIOLOGIA", label: "Fonoaudiologia" },
  { value: "FONOAUDIOLOGIA INFANTIL", label: "Fonoaudiologia Infantil" },
  {
    value: "FONOAUDIOLOGIA INFANTIL_GRUPO",
    label: "Fonoaudiologia Infantil - Grupo",
  },
  { value: "GASTRO/PROCTO", label: "Gastro / Procto" },
  { value: "GASTRO/PROCTO/HEPATO", label: "Gastro / Procto / Hepato" },
  { value: "GASTROENTEROLOGIA/CONSULTAS", label: "Gastroenterologia" },
  {
    value: "GASTROENTEROLOGIA/HEPATOLOGIA",
    label: "Gastroenterologia / Hepatologia",
  },
  { value: "GASTROPEDIATRIA", label: "Gastropediatria" },
  { value: "GERONTOLOGIA", label: "Gerontologia" },
  { value: "GINECOLOGIA", label: "Ginecologia" },
  { value: "GINECOLOGIA - OBSTETRÍCIA", label: "Ginecologia / Obstetrícia" },
  { value: "GLAUCOMA / GONIOSCOPIA", label: "Glaucoma / Gonioscopia" },
  { value: "HEMATOLOGIA", label: "Hematologia" },
  { value: "HOMEOPATIA", label: "Homeopatia" },
  { value: "INFECTOLOGISTA", label: "Infectologia" },
  { value: "MASTOLOGIA", label: "Mastologia" },
  { value: "MEDICINA PREVENTIVA", label: "Medicina Preventiva" },
  { value: "MUSICOTERAPIA INFANTIL", label: "Musicoterapia Infantil" },
  { value: "NEUROLOGIA", label: "Neurologia" },
  { value: "NEUROPEDIATRIA", label: "Neuropediatria" },
  { value: "NUTRICIONISTA", label: "Nutricionista" },
  { value: "NUTRIÇÃO_MED.PREVENTIVA", label: "Nutrição / Med. Preventiva" },
  { value: "NUTROLOGIA", label: "Nutrologia" },
  { value: "OBSTETRICIA", label: "Obstetrícia" },
  { value: "OFTALMOLOGIA", label: "Oftalmologia" },
  { value: "OFTALMOLOGIA 7 A 18 ANOS", label: "Oftalmologia (7 a 18 Anos)" },
  { value: "ONCOLOGIA", label: "Oncologia" },
  { value: "ONCOLOGIA/ PROCEDIMENTOS", label: "Oncologia / Procedimentos" },
  { value: "ORTOPEDIA", label: "Ortopedia" },
  {
    value: "ORTOPEDIA/ACOMPANHAM_GESSO",
    label: "Ortopedia - Acompanhamento de Gesso",
  },
  { value: "ORTOPEDIA_PE/TORNOZELO", label: "Ortopedia - Pé/Tornozelo" },
  { value: "OTORRINOLARINGOLOGIA", label: "Otorrinolaringologia" },
  { value: "PEDIATRIA", label: "Pediatria" },
  { value: "PEDIATRIA_PLANTAO", label: "Pediatria - Plantão" },
  { value: "PNEUMOLOGIA", label: "Pneumologia" },
  { value: "PNEUMOPEDIATRIA", label: "Pneumopediatria" },
  { value: "PRE-NATAL ALTO RISCO", label: "Pré-Natal Alto Risco" },
  { value: "PROCEDIMENTO/ANUSCOPIA", label: "Procedimento - Anuscopia" },
  { value: "PROCEDIMENTO/DERMATOLOGIA", label: "Procedimento - Dermatologia" },
  {
    value: "PROCEDIMENTO/ MAPEAMENTO DE RETINA",
    label: "Procedimento - Mapeamento de Retina",
  },
  { value: "PROCEDIMENTO/ORTOPEDIA", label: "Procedimento - Ortopedia" },
  {
    value: "PROCEDIMENTOS/GINECOLOGICOS",
    label: "Procedimentos - Ginecológicos",
  },
  {
    value: "PROCEDIMENTOS/PEQUENAS CIRURGIAS",
    label: "Procedimentos - Pequenas Cirurgias",
  },
  {
    value: "PROCEDIMENTOS/REUMATOLOGIA",
    label: "Procedimentos - Reumatologia",
  },
  { value: "PROCEDIMENTOS/UROLOGIA", label: "Procedimentos - Urologia" },
  { value: "PROCTOLOGIA", label: "Proctologia" },
  { value: "PSICOLOGIA", label: "Psicologia" },
  { value: "PSICOLOGIA / PROCEDIMENTOS", label: "Psicologia / Procedimentos" },
  { value: "PSICOLOGIA INFANTIL", label: "Psicologia Infantil" },
  { value: "PSICOLOGIA INFANTIL_GRUPO", label: "Psicologia Infantil - Grupo" },
  { value: "PSICOLOGIA ONCOLÓGICA", label: "Psicologia Oncológica" },
  { value: "PSICOPEDAGOGIA", label: "Psicopedagogia" },
  { value: "PSICOPEDAGOGIA INFANTIL", label: "Psicopedagogia Infantil" },
  { value: "PSIQUIATRIA", label: "Psiquiatria" },
  { value: "REUMATOLOGIA", label: "Reumatologia" },
  { value: "SESSÃO DE QUIMIOTERAPIA", label: "Sessão de Quimioterapia" },
  {
    value: "_TELEATEND_GINECOLOGIA/OBSTETRICIA",
    label: "Teleatendimento - Ginecologia / Obstetrícia",
  },
  { value: "TERAPIA OCUPACIONAL", label: "Terapia Ocupacional" },
  {
    value: "TERAPIA OCUPACIONAL INFANTIL",
    label: "Terapia Ocupacional Infantil",
  },
  {
    value: "TERAPIA OCUPACIONAL INFANTIL_GRUPO",
    label: "Terapia Ocupacional Infantil - Grupo",
  },
  { value: "TRIAGEM CIR. BARIATRICA", label: "Triagem Cir. Bariátrica" },
  { value: "UROLOGIA", label: "Urologia" },
  { value: "VASCULAR", label: "Vascular" },
  { value: "VASCULAR/PROCEDIMENTOS", label: "Vascular / Procedimentos" },
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
