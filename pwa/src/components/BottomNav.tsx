import { NavLink, useLocation } from 'react-router-dom'

const principais = [
    { to: '/', label: 'Início' },
    { to: '/horarios', label: 'Horários' },
    { to: '/atividades', label: 'Atividades' },
    { to: '/notas', label: 'Notas' },
]
const doMenu = ['/mais', '/materiais', '/faltas', '/agenda', '/complementares', '/perfil']

const classe = (ativo: boolean) =>
    `flex-1 px-0.5 py-3 text-center text-xs font-semibold ${ativo ? 'text-blue-600' : 'text-slate-500'
    }`

export default function BottomNav() {
    const { pathname } = useLocation()
    const maisAtivo = doMenu.some((p) => pathname === p || pathname.startsWith(p + '/'))

    return (
        <nav className="fixed inset-x-0 bottom-0 flex border-t border-slate-200 bg-white">
            {principais.map((i) => (
                <NavLink key={i.to} to={i.to} end={i.to === '/'} className={({ isActive }) => classe(isActive)}>
                    {i.label}
                </NavLink>
            ))}
            <NavLink to="/mais" className={() => classe(maisAtivo)}>
                Mais
            </NavLink>
        </nav>
    )
}