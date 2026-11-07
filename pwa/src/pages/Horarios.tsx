import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

export default function Horarios() {
    const hoje = new Date().getDay() // 0=Dom ... 6=Sáb
    const [dia, setDia] = useState(hoje >= 1 && hoje <= 5 ? hoje : 1)
    const aulas = useLiveQuery(
        () => db.horarios.where('dia_semana').equals(dia).sortBy('hora_inicio'),
        [dia]
    )

    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-extrabold">Horários</h1>

            <div className="mb-4 flex gap-2">
                {DIAS.map((d, i) => (
                    <button
                        key={d}
                        onClick={() => setDia(i + 1)}
                        className={`flex-1 rounded-xl py-2 text-sm font-bold ${dia === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                            }`}
                    >
                        {d}
                    </button>
                ))}
            </div>

            {aulas === undefined && <p className="text-slate-500">Carregando...</p>}
            {aulas?.length === 0 && <p className="text-slate-500">Sem aulas neste dia.</p>}

            <div className="flex flex-col gap-3">
                {aulas?.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                        <span className="w-12 text-sm font-bold text-slate-500">{a.hora_inicio.slice(0, 5)}</span>
                        <span
                            className="h-10 w-1.5 rounded-full"
                            style={{ backgroundColor: a.cor ?? '#94a3b8' }}
                        />
                        <div>
                            <p className="font-bold">{a.disciplina}</p>
                            <p className="text-sm text-slate-500">
                                {a.sala} · {a.professor}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}