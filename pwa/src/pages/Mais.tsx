import { Link } from 'react-router-dom'

const itens = [
    { to: '/materiais', label: 'Materiais', desc: 'Documentos das disciplinas' },
    { to: '/agenda', label: 'Agenda', desc: 'Aulas, provas e prazos' },
    { to: '/faltas', label: 'Faltas', desc: 'Faltas por disciplina' },
    { to: '/complementares', label: 'Horas complementares', desc: 'Lançamentos e total validado' },
    { to: '/perfil', label: 'Perfil', desc: 'Seus dados e sair' },
]

export default function Mais() {
    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-extrabold">Mais</h1>
            <div className="flex flex-col gap-3">
                {itens.map((i) => (
                    <Link key={i.to} to={i.to} className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="font-bold">{i.label}</p>
                        <p className="text-sm text-slate-500">{i.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}