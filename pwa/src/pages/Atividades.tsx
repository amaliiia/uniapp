import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Atividade, type OutboxItem } from '../lib/db'
import {
    ACCEPT,
    LIMITE_MB,
    abrirArquivo,
    cancelarEnvio,
    enfileirarEntrega,
    processarOutbox,
} from '../lib/entregas'
import { sincronizar } from '../lib/sync'
import { useOnline } from '../hooks/useOnline'
import { fmtDataHora, fmtPrazo, fmtTamanho, hojeISO } from '../lib/format'

type Filtro = 'pendentes' | 'enviadas' | 'todas'
type Status = 'pendente' | 'fila' | 'enviada'

function Cartao({
    a,
    item,
    aberta,
    onToggle,
    online,
}: {
    a: Atividade
    item?: OutboxItem
    aberta: boolean
    onToggle: () => void
    online: boolean
}) {
    const [arquivo, setArquivo] = useState<File | null>(null)
    const [msg, setMsg] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)
    const input = useRef<HTMLInputElement>(null)

    const status: Status = item ? 'fila' : a.entrega ? 'enviada' : 'pendente'
    const atrasada = status === 'pendente' && !!a.prazo && a.prazo < hojeISO()

    const chip =
        status === 'enviada'
            ? { txt: 'Enviada', cls: 'bg-green-100 text-green-700' }
            : status === 'fila'
                ? { txt: 'Na fila', cls: 'bg-amber-100 text-amber-800' }
                : atrasada
                    ? { txt: 'Atrasada', cls: 'bg-red-100 text-red-700' }
                    : { txt: 'Pendente', cls: 'bg-slate-100 text-slate-600' }

    async function enviar() {
        if (!arquivo) return
        setEnviando(true)
        setMsg(null)
        const erro = await enfileirarEntrega(a.id, arquivo)
        if (erro) {
            setMsg(erro)
        } else {
            setArquivo(null)
            if (input.current) input.current.value = ''
            if (navigator.onLine) {
                await processarOutbox()
                await sincronizar()
            }
        }
        setEnviando(false)
    }

    async function abrir(bucket: 'materiais' | 'entregas', path: string) {
        setMsg(null)
        const erro = await abrirArquivo(bucket, path)
        if (erro) setMsg(erro)
    }

    return (
        <div className="rounded-2xl bg-white shadow-sm">
            <button onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-left">
                <span
                    className="h-10 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: a.cor ?? '#94a3b8' }}
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{a.titulo}</p>
                    <p className="truncate text-sm text-slate-500">
                        {a.disciplina}
                        {a.prazo && <> · prazo {fmtPrazo(a.prazo)}</>}
                    </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${chip.cls}`}>
                    {chip.txt}
                </span>
            </button>

            {aberta && (
                <div className="border-t border-slate-100 p-4 text-sm">
                    {a.descricao && <p className="mb-3 text-slate-600">{a.descricao}</p>}

                    {a.enunciado_path && (
                        <button
                            onClick={() => abrir('materiais', a.enunciado_path!)}
                            disabled={!online}
                            className="mb-3 font-bold text-blue-600 underline disabled:text-slate-400 disabled:no-underline"
                        >
                            Abrir enunciado{!online && ' (precisa de internet)'}
                        </button>
                    )}

                    {status === 'enviada' && a.entrega && (
                        <div className="mb-3 rounded-xl bg-green-50 p-3 text-green-800">
                            <p className="font-bold">Enviada em {fmtDataHora(a.entrega.enviada_em)}</p>
                            <button
                                onClick={() => abrir('entregas', a.entrega!.arquivo_path)}
                                disabled={!online}
                                className="mt-1 font-bold underline disabled:text-slate-400 disabled:no-underline"
                            >
                                Ver arquivo enviado{!online && ' (precisa de internet)'}
                            </button>
                        </div>
                    )}

                    {item && (
                        <div className="mb-3 rounded-xl bg-amber-50 p-3 text-amber-900">
                            <p className="font-bold">
                                {item.nome} ({fmtTamanho(item.tamanho)})
                            </p>
                            <p>
                                {online
                                    ? 'Aguardando envio...'
                                    : 'Sem conexão. Será enviado quando a internet voltar.'}
                            </p>
                            {item.erro && <p className="mt-1 font-medium text-red-700">Falha: {item.erro}</p>}
                            <button onClick={() => cancelarEnvio(a.id)} className="mt-2 font-bold underline">
                                Cancelar envio
                            </button>
                        </div>
                    )}

                    <input
                        ref={input}
                        type="file"
                        accept={ACCEPT}
                        onChange={(e) => {
                            setArquivo(e.target.files?.[0] ?? null)
                            setMsg(null)
                        }}
                        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-bold file:text-slate-700"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        PDF, ZIP, DOC(X), PNG ou JPG · até {LIMITE_MB} MB
                    </p>

                    {msg && <p className="mt-2 font-medium text-red-600">{msg}</p>}

                    <button
                        onClick={enviar}
                        disabled={!arquivo || enviando}
                        className="mt-3 w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50"
                    >
                        {enviando ? 'Enviando...' : status === 'enviada' ? 'Reenviar entrega' : 'Enviar entrega'}
                    </button>
                    {!online && (
                        <p className="mt-2 text-xs text-slate-500">
                            Sem conexão: o arquivo fica guardado no aparelho e é enviado quando a internet voltar.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default function Atividades() {
    const online = useOnline()
    const atividades = useLiveQuery(() => db.atividades.orderBy('prazo').toArray())
    const fila = useLiveQuery(() => db.outbox.toArray())
    const [filtro, setFiltro] = useState<Filtro>('pendentes')
    const [aberta, setAberta] = useState<number | null>(null)

    if (atividades === undefined || fila === undefined)
        return <p className="p-4 text-slate-500">Carregando...</p>

    const naFila = new Map(fila.map((i) => [i.atividade_id, i]))
    const enviada = (a: Atividade) => !naFila.has(a.id) && a.entrega !== null
    const lista = atividades.filter((a) =>
        filtro === 'todas' ? true : filtro === 'enviadas' ? enviada(a) : !enviada(a)
    )

    const filtros: [Filtro, string][] = [
        ['pendentes', 'Pendentes'],
        ['enviadas', 'Enviadas'],
        ['todas', 'Todas'],
    ]

    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-extrabold">Atividades</h1>

            <div className="mb-4 flex gap-2">
                {filtros.map(([f, nome]) => (
                    <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        className={`rounded-full px-4 py-1.5 text-sm font-bold ${filtro === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                            }`}
                    >
                        {nome}
                    </button>
                ))}
            </div>

            {lista.length === 0 && <p className="text-slate-500">Nenhuma atividade aqui.</p>}

            <div className="flex flex-col gap-3">
                {lista.map((a) => (
                    <Cartao
                        key={a.id}
                        a={a}
                        item={naFila.get(a.id)}
                        online={online}
                        aberta={aberta === a.id}
                        onToggle={() => setAberta(aberta === a.id ? null : a.id)}
                    />
                ))}
            </div>
        </div>
    )
}