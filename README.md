# Show-Up

Aplicação frontend React para visualizar e operar o sistema de predição de não comparecimento em consultas médicas.

## Visão geral

O `showUp` é a interface central do sistema, permitindo que profissionais de saúde acompanhem o risco de absenteísmo dos pacientes e tomem ações preventivas. A aplicação oferece painel de controle com indicadores, predição individual e em lote, gerenciamento de agendamentos com feedback de comparecimento real, e uma área dedicada ao treinamento de novos modelos com upload de dados históricos.

Ele consome duas APIs:

- `no-show-predicton-api` — predições de risco e persistência de agendamentos
- `no-show-training-api` — validação de arquivos, treinamento de modelos e histórico

## Funcionalidades principais

- **Dashboard** — indicadores de desempenho (KPIs) e gráfico de tendência semanal de comparecimento
- **Predição individual** — formulário com dados do agendamento e resultado de risco em tempo real
- **Predição em lote** — upload de CSV ou colagem de JSON (até 250 agendamentos), com tabela de resultados e exportação CSV
- **Agendamentos** — lista diária com classificação de risco por cor, seleção em massa e registro de feedback (Compareceu / Faltou)
- **Treinamento** — upload de novo dataset, acompanhamento do job em tempo real e histórico de modelos treinados

## Uso do batch prediction

### Campos esperados por registro

- `Marcacao` (ISO datetime) — data e hora da marcação
- `DataHoraConsulta` (ISO datetime) — data e hora da consulta
- `Idade` — idade do paciente
- `Sexo` — `M` ou `F`
- `CidadePaciente`, `BairroPaciente`
- `TipoConvenio`
- `UnidadeAtendimento`, `Especialidade`
- `idUnicoPaciente` (opcional)

Exemplos disponíveis: `example_batch_prediction.csv` e `example_batch_prediction.json`

### Resultado

- Resumo: total processado, predições de show e no-show
- Tabela detalhada com probabilidades por agendamento
- Exportação dos resultados em CSV

## Integração com APIs

As URLs são configuráveis via variáveis de ambiente:

```env
VITE_PREDICTION_API_URL=http://127.0.0.1:8000
VITE_TRAINING_API_URL=http://127.0.0.1:8000
```

O arquivo `src/services/api.ts` cria instâncias Axios independentes para cada backend, com interceptors de erro e timeouts configurados.

## Tecnologias principais

| Tecnologia           | Por quê                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **React 18 + Vite**  | Build extremamente rápido e HMR ágil para desenvolvimento; React para gerenciamento de estado e componentização  |
| **TypeScript**       | Tipagem estática nos serviços e models, reduzindo erros de integração com as APIs                                |
| **Tailwind CSS**     | Utilitários de estilo inline que eliminam overhead de CSS customizado e aceleram a construção de UI              |
| **Recharts**         | Biblioteca de gráficos baseada em SVG, bem integrada ao ecossistema React                                        |
| **Axios**            | Cliente HTTP com suporte a interceptors, facilitando tratamento centralizado de erros e configuração de base URL |
| **React Router DOM** | Roteamento client-side com navegação entre as páginas sem recarregamento                                         |

## CI/CD

Pipeline executado via GitHub Actions em pushes para `homolog` e `prod`:

1. **Build & Deploy** — instala dependências, compila o projeto com Vite e publica automaticamente no Azure Static Web Apps
2. **Variáveis de ambiente** — `VITE_PREDICTION_API_URL`, `VITE_TRAINING_API_URL` e `VITE_ENVIRONMENT` são injetadas via secrets do repositório durante o build

## Como rodar

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

## Estrutura do projeto

- `src/App.tsx` — componente principal, definição de rotas
- `src/main.tsx` — ponto de entrada React
- `src/pages/`
  - `Dashboard.jsx` — KPIs e gráfico de tendência semanal
  - `Prediction.jsx` — predição individual e em lote com exportação
  - `Appointments.jsx` — lista de agendamentos com filtros e feedback
  - `Training.jsx` — upload de dados, acompanhamento de job e histórico de modelos
- `src/components/`
  - `Layout.tsx` — estrutura de layout com sidebar e área de conteúdo
  - `Sidebar.tsx` — navegação lateral com links para as páginas
  - `DateInput.tsx` — campo de data com máscara e validação
  - `NormalizedRiskHelp.jsx` — tooltip explicativo do score de risco normalizado
  - `EnvironmentBanner.tsx` — indicador visual de ambiente (dev / homolog / prod)
- `src/services/`
  - `api.ts` — instâncias Axios configuradas por backend
  - `predictionService.ts` — chamadas aos endpoints de predição
  - `appointmentService.ts` — chamadas aos endpoints de agendamento
  - `trainingService.ts` — chamadas aos endpoints de treinamento
  - `modelHistoryService.ts` — consulta ao histórico de modelos
  - `healthService.ts` — verificação de saúde das APIs
- `src/constants/predictionOptions.js` — listas de opções para campos do formulário

## Licença

MIT
