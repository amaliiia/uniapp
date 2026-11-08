import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'

const TOTAL_EXIGIDO = 200

export default function HorasComplementares() {
    const categorias = useLiveQuery(() => db.hc_categorias.toArray())
    const horas = useLiveQuery(() => db.horas.toArray())

    if (categorias === undefined || horas === undefined)
        return <p className="p-4 text-slate-500">Carregando...</p>

    // total validado = por categoria, min(teto, soma das horas lançadas)
    const porCategoria = categorias.map((c) => {
        const soma = horas
            .filter((h) => h.categoria === c.categoria)
            .reduce((s, h) => s + h.horas, 0)
        return { ...c, soma, validas: Math.min(c.limite_horas, soma) }
    })
    const validadas = porCategoria.reduce((s, c) => s + c.validas, 0)
    const faltam = Math.max(0, TOTAL_EXIGIDO - validadas)
    const pct = Math.min(100, (validadas / TOTAL_EXIGIDO) * 100)

    const lista = [...horas].sort((a, b) => b.criado_em.localeCompare(a.criado_em))

    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-extrabold">Horas complementares</h1>

            <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Total validado</p>
                <p className="text-3xl font-extrabold text-blue-600">
                    {validadas}
                    <span className="text-lg font-bold text-slate-400"> / {TOTAL_EXIGIDO} h</span>
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    {faltam === 0 ? 'Meta de horas atingida.' : `Faltam ${faltam} h para a meta.`}
                </p>
            </div>

            <h2 className="mb-2 text-sm font-bold uppercase text-slate-500">Por categoria</h2>
            <div className="mb-4 flex flex-col gap-2">
                {porCategoria.map((c) => (
                    <div key={c.categoria} className="rounded-2xl bg-white p-3 shadow-sm">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold">{c.categoria}</span>
                            <span className="font-bold text-slate-600">
                                {c.validas}/{c.limite_horas} h
                            </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-green-500"
                                style={{ width: `${Math.min(100, (c.validas / c.limite_horas) * 100)}%` }}
                            />
                        </div>
                        {c.soma > c.limite_horas && (
                            <p className="mt-1 text-xs text-slate-500">
                                {c.soma - c.limite_horas} h acima do teto da categoria não contam.
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <h2 className="mb-2 text-sm font-bold uppercase text-slate-500">Lançamentos</h2>
            {lista.length === 0 && (
                <p className="text-slate-500">
                    Nenhum lançamento registrado ainda. As horas são lançadas pela coordenação.
                </p>
            )}
            <div className="flex flex-col gap-3">
                {lista.map((h) => (
                    <div key={h.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="font-bold">{h.atividade}</p>
                        <p className="text-sm text-slate-500">
                            {h.categoria} · {h.horas} h{h.semestre && <> · {h.semestre}</>}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}