import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'

export default function Faltas() {
    const todas = useLiveQuery(() => db.faltas.toArray())

    if (todas === undefined) return <p className="p-4 text-slate-500">Carregando...</p>

    const atual = todas.map((x) => x.semestre).sort().at(-1)
    const linhas = todas.filter((x) => x.semestre === atual).sort((a, b) => b.faltas - a.faltas)

    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-extrabold">Faltas</h1>

            {linhas.length === 0 && <p className="text-slate-500">Nenhum registro de faltas.</p>}

            <div className="flex flex-col gap-3">
                {linhas.map((l) => {
                    const pct = Math.min(100, (l.faltas / l.limite_faltas) * 100)
                    const cor = pct >= 75 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-500' : 'bg-green-500'
                    return (
                        <div key={l.id} className="rounded-2xl bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="font-bold">{l.disciplina}</p>
                                <p className="text-sm font-bold text-slate-600">
                                    {l.faltas}/{l.limite_faltas}
                                </p>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Restam {Math.max(0, l.limite_faltas - l.faltas)} faltas
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}