import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { EnviarBoletim } from './pages/EnviarBoletim'
import { Resultados } from './pages/Resultados'
import { ResultadoMunicipio } from './pages/ResultadoMunicipio'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/enviar" replace />} />
        <Route path="enviar" element={<EnviarBoletim />} />
        <Route path="resultados" element={<Resultados />} />
        <Route path="resultados/:codigoMunicipio" element={<ResultadoMunicipio />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
