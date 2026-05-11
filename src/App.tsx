import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Prediction from './pages/Prediction'
import Appointments from './pages/Appointments'
import Training from './pages/Training'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="prediction" element={<Prediction />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="training" element={<Training />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
