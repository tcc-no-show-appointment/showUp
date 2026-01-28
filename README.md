# Show-Up - AI No-Show Prediction Platform

A modern, responsive SaaS frontend built with React, Tailwind CSS, and Recharts for predicting medical appointment no-shows using AI.

## Features

- **Dashboard**: Overview with KPI cards and weekly attendance trend chart
- **Prediction**: Individual and batch prediction capabilities
  - Individual: Form-based prediction with real-time risk calculation
  - Batch: CSV/Excel upload or JSON input for bulk processing
- **Appointments**: Interactive table for managing daily appointments with feedback loop
  - Color-coded risk levels (High/Medium/Low)
  - Batch selection with floating action bar
  - Mark appointments as Show or No-Show

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
