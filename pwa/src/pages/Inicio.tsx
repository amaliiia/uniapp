import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'

export default function Inicio() {
    const perfil = useLiveQuery(() => db.perfil.toCollection().first())
    const noticias = useLiveQuery(() => db.noticias.orderBy('publicado_em').reverse().toArray())

    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-extrabold">
                Olá, {perfil?.nome.split(' ')[0] ?? '...'}!
            </h1>
            <h2 className="mb-2 text-sm font-bold uppercase text-slate-500">Notícias</h2>
            {noticias?.length === 0 && <p className="text-slate-500">Nenhuma notícia ainda.</p>}
            <div className="flex flex-col gap-3">
                {noticias?.map((n) => (
                    <article key={n.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <span className="text-xs font-bold text-blue-600">{n.categoria}</span>
                        <h3 className="font-bold">{n.titulo}</h3>
                        <p className="text-sm text-slate-600">{n.resumo}</p>
                    </article>
                ))}
            </div>
        </div>
    )
}