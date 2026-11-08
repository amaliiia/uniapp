import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Horarios from './pages/Horarios'
import Atividades from './pages/Atividades'
import Notas from './pages/Notas'
import Faltas from './pages/Faltas'
import Materiais from './pages/Materiais'
import Agenda from './pages/Agenda'
import HorasComplementares from './pages/HorasComplementares'
import Mais from './pages/Mais'
import Perfil from './pages/Perfil'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="horarios" element={<Horarios />} />
        <Route path="atividades" element={<Atividades />} />
        <Route path="notas" element={<Notas />} />
        <Route path="mais" element={<Mais />} />
        <Route path="materiais" element={<Materiais />} />
        <Route path="faltas" element={<Faltas />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="complementares" element={<HorasComplementares />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
    </Routes>
  )
}