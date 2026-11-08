import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { fmtDiaLongo, hojeISO, somarDias } from '../lib/format'

export default function Agenda() {
    const hoje = hojeISO()
    const [dia, setDia] = useState(hoje)

    // só aulas com tópico escrito pela administração
    const registros = useLiveQuery(
        async () =>
            (await db.aulas.where('data').equals(dia).sortBy('hora_inicio')).filter(
                (a) => !!a.topico?.trim()
            ),
        [dia]
    )

    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-extrabold">Agenda</h1>

            <div className="mb-4 flex items-center gap-2">
                <button
                    onClick={() => setDia(somarDias(dia, -1))}
                    aria-label="Dia anterior"
                    className="rounded-xl bg-white px-4 py-2 text-lg font-bold shadow-sm"
                >
                    ‹
                </button>
                <p className="flex-1 text-center text-sm font-bold capitalize">{fmtDiaLongo(dia)}</p>
                <button
                    onClick={() => setDia(somarDias(dia, 1))}
                    aria-label="Próximo dia"
                    className="rounded-xl bg-white px-4 py-2 text-lg font-bold shadow-sm"
                >
                    ›
                </button>
            </div>
            {dia !== hoje && (
                <button
                    onClick={() => setDia(hoje)}
                    className="mb-4 w-full rounded-xl bg-blue-600 py-2 text-sm font-bold text-white"
                >
                    Voltar para hoje
                </button>
            )}

            {registros === undefined && <p className="text-slate-500">Carregando...</p>}
            {registros?.length === 0 && (
                <p className="text-slate-500">Nenhum tópico registrado neste dia.</p>
            )}

            <div className="flex flex-col gap-3">
                {registros?.map((a) => (
                    <div key={a.id} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                        <span
                            className="w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: a.cor ?? '#94a3b8' }}
                        />
                        <div className="min-w-0">
                            <p className="font-bold">{a.disciplina}</p>
                            <p className="whitespace-pre-line text-sm text-slate-700">{a.topico}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}