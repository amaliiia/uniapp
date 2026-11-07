import { NavLink } from 'react-router-dom'

const itens = [
    { to: '/', label: 'Início' },
    { to: '/horarios', label: 'Horários' },
    { to: '/notas', label: 'Notas' },
    { to: '/faltas', label: 'Faltas' },
    { to: '/perfil', label: 'Perfil' },
]

export default function BottomNav() {
    return (
        <nav className="fixed inset-x-0 bottom-0 flex border-t border-slate-200 bg-white">
            {itens.map((i) => (
                <NavLink
                    key={i.to}
                    to={i.to}
                    end={i.to === '/'}
                    className={({ isActive }) =>
                        `flex-1 py-3 text-center text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-slate-500'
                        }`
                    }
                >
                    {i.label}
                </NavLink>
            ))}
        </nav>
    )
}