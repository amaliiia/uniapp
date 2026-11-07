import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Horarios from './pages/Horarios'
import Notas from './pages/Notas'
import Faltas from './pages/Faltas'
import Perfil from './pages/Perfil'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="horarios" element={<Horarios />} />
        <Route path="notas" element={<Notas />} />
        <Route path="faltas" element={<Faltas />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
    </Routes>
  )
}