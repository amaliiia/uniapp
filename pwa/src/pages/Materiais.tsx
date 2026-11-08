import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Material } from '../lib/db'
import { abrirSalvo, baixarMaterial, removerSalvo } from '../lib/arquivos'
import { useOnline } from '../hooks/useOnline'
import { fmtTamanho } from '../lib/format'

type Salvo = { id: number; arquivo_path: string; tamanho: number }

function Cartao({ m, salvo, online }: { m: Material; salvo?: Salvo; online: boolean }) {
    const [ocupado, setOcupado] = useState(false)
    const [msg, setMsg] = useState<string | null>(null)

    const desatualizado = !!salvo && !!m.arquivo_path && salvo.arquivo_path !== m.arquivo_path

    async function baixar() {
        setOcupado(true)
        setMsg(null)
        setMsg(await baixarMaterial(m))
        setOcupado(false)
    }

    async function abrir() {
        setMsg(null)
        setMsg(await abrirSalvo(m.id))
    }

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <span
                    className="h-10 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: m.cor ?? '#94a3b8' }}
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{m.titulo}</p>
                    <p className="truncate text-sm text-slate-500">
                        {m.disciplina}
                        {m.tipo && <> · {m.tipo}</>}
                        {m.tamanho_bytes ? <> · {fmtTamanho(m.tamanho_bytes)}</> : null}
                    </p>
                </div>
                {salvo && !desatualizado && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                        No aparelho
                    </span>
                )}
                {desatualizado && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                        Nova versão
                    </span>
                )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {salvo && (
                    <button onClick={abrir} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
                        Abrir
                    </button>
                )}
                {(!salvo || desatualizado) && m.arquivo_path && (
                    <button
                        onClick={baixar}
                        disabled={!online || ocupado}
                        className={`rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50 ${salvo ? 'bg-slate-100 text-slate-700' : 'bg-blue-600 text-white'
                            }`}
                    >
                        {ocupado ? 'Baixando...' : salvo ? 'Atualizar' : 'Baixar'}
                    </button>
                )}
                {salvo && (
                    <button
                        onClick={() => removerSalvo(m.id)}
                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
                    >
                        Remover do aparelho
                    </button>
                )}
                {!salvo && !m.arquivo_path && (
                    <span className="py-2 text-sm text-slate-500">Arquivo ainda não disponível.</span>
                )}
            </div>

            {!online && !salvo && m.arquivo_path && (
                <p className="mt-2 text-xs text-slate-500">Sem conexão: conecte-se para baixar.</p>
            )}
            {msg && <p className="mt-2 text-sm font-medium text-red-600">{msg}</p>}
        </div>
    )
}

export default function Materiais() {
    const online = useOnline()
    const materiais = useLiveQuery(() => db.materiais.toArray())
    const salvos = useLiveQuery(async () =>
        (await db.arquivos.toArray()).map(({ id, arquivo_path, tamanho }): Salvo => ({
            id,
            arquivo_path,
            tamanho,
        }))
    )
    const [disc, setDisc] = useState('Todas')

    if (materiais === undefined || salvos === undefined)
        return <p className="p-4 text-slate-500">Carregando...</p>

    const porId = new Map(salvos.map((s) => [s.id, s]))
    const disciplinas = ['Todas', ...[...new Set(materiais.map((m) => m.disciplina))].sort()]
    const lista = materiais
        .filter((m) => disc === 'Todas' || m.disciplina === disc)
        .sort((a, b) => a.disciplina.localeCompare(b.disciplina) || a.titulo.localeCompare(b.titulo))
    const totalSalvo = salvos.reduce((s, x) => s + x.tamanho, 0)

    return (
        <div className="p-4">
            <h1 className="mb-1 text-2xl font-extrabold">Materiais</h1>
            <p className="mb-4 text-sm text-slate-500">
                {salvos.length === 0
                    ? 'Nenhum arquivo guardado no aparelho.'
                    : `${salvos.length} ${salvos.length === 1 ? 'arquivo' : 'arquivos'} no aparelho (${fmtTamanho(totalSalvo)})`}
            </p>

            <div className="mb-4 flex gap-2 overflow-x-auto">
                {disciplinas.map((d) => (
                    <button
                        key={d}
                        onClick={() => setDisc(d)}
                        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold ${disc === d ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                            }`}
                    >
                        {d}
                    </button>
                ))}
            </div>

            {lista.length === 0 && <p className="text-slate-500">Nenhum material.</p>}

            <div className="flex flex-col gap-3">
                {lista.map((m) => (
                    <Cartao key={m.id} m={m} salvo={porId.get(m.id)} online={online} />
                ))}
            </div>
        </div>
    )
}