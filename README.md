# Show-Up - AI No-Show Prediction Platform

A modern, responsive SaaS frontend built with React, Tailwind CSS, and Recharts for predicting medical appointment no-shows using AI.

## Features

- **Dashboard**: Overview with KPI cards and weekly attendance trend chart
- **Prediction**: Individual and batch prediction capabilities
  - Individual: Form-based prediction with real-time risk calculation
  - Batch: CSV upload or JSON input for bulk processing (up to 1,000 appointments)
- **Appointments**: Interactive table for managing daily appointments with feedback loop
  - Color-coded risk levels (High/Medium/Low)
  - Batch selection with floating action bar
  - Mark appointments as Show or No-Show

## Batch Prediction Usage

The batch prediction feature allows you to predict no-show risk for multiple appointments at once.

### Input Methods

#### 1. CSV File Upload

Upload a CSV file with the following columns:

- `Marcacao` (ISO datetime): Scheduled date/time
- `DataHoraConsulta` (ISO datetime): Appointment date/time
- `Idade` (integer): Patient age (0-120)
- `Sexo` (string): Patient gender ("M" or "F")
- `CidadePaciente` (string): Patient city
- `BairroPaciente` (string): Patient neighborhood
- `TipoConvenio` (string): Insurance type
- `UnidadeAtendimento` (string): Healthcare unit name
- `Especialidade` (string): Medical specialty
- `idUnicoPaciente` (string, optional): Unique patient ID

Example files provided:

- `example_batch_prediction.csv`
- `example_batch_prediction.json`

#### 2. JSON Input

Paste JSON array directly in the textarea. Each object must contain the same fields as CSV.

### Results

After processing, you'll see:

- **Summary cards**: Total appointments, predicted shows, predicted no-shows
- **Results table**: Detailed predictions for each appointment
- **Download option**: Export results as CSV file

### Limits

- Maximum 1,000 appointments per batch
- All required fields must be present
- Invalid records will prevent processing with clear error messages

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
showUp/
├── src/
│   ├── components/
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   └── Sidebar.jsx      # Navigation sidebar
│   ├── pages/
│   │   ├── Dashboard.jsx    # Dashboard with KPIs and charts
│   │   ├── Prediction.jsx   # Individual and batch prediction
│   │   └── Appointments.jsx # Appointments management
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tailwind.config.js       # Tailwind configuration with brand colors
├── postcss.config.js
└── vite.config.js
```

## Brand Identity

- **Primary Colors**: Cyan (#06b6d4) to Blue (#2563eb) gradient
- **Background**: Slate-50
- **Style**: Clean HealthTech aesthetic with airy spacing, soft shadows, and rounded corners

## License

Private - All rights reserved
