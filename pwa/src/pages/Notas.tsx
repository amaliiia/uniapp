import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { corNota, fmtNota } from '../lib/format'

export default function Notas() {
    const linhas = useLiveQuery(() => db.notas.toArray())
    const [sel, setSel] = useState('')

    if (linhas === undefined) return <p className="p-4 text-slate-500">Carregando...</p>

    const semestres = [...new Set(linhas.map((l) => l.semestre))].sort().reverse()
    const sem = sel || semestres[0] || ''
    const doSem = linhas
        .filter((l) => l.semestre === sem)
        .sort((a, b) => a.disciplina.localeCompare(b.disciplina))
    const medias = doSem.map((l) => l.media).filter((m): m is number => m !== null)
    const mediaSem = medias.length ? medias.reduce((a, b) => a + b, 0) / medias.length : null

    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-extrabold">Notas</h1>

            {semestres.length === 0 && <p className="text-slate-500">Nenhuma nota disponível.</p>}

            <div className="mb-4 flex gap-2 overflow-x-auto">
                {semestres.map((s) => (
                    <button
                        key={s}
                        onClick={() => setSel(s)}
                        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold ${sem === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {doSem.length > 0 && (
                <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Média do semestre</p>
                    <p className={`text-3xl font-extrabold ${corNota(mediaSem)}`}>{fmtNota(mediaSem)}</p>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {doSem.map((l) => (
                    <div key={l.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="font-bold">{l.disciplina}</p>
                            <p className={`text-xl font-extrabold ${corNota(l.media)}`}>{fmtNota(l.media)}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            N1: {fmtNota(l.n1)} · N2: {fmtNota(l.n2)}
                            {l.n3 !== null && <> · N3: {fmtNota(l.n3)}</>}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}