import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAuth } from '../hooks/useAuth'
import { useOnline } from '../hooks/useOnline'
import { db } from '../lib/db'
import { sincronizar } from '../lib/sync'
import { processarOutbox } from '../lib/entregas'
import BottomNav from './BottomNav'

const fmt = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })

export default function Layout() {
    const { session, loading } = useAuth()
    const online = useOnline()
    const [sincronizando, setSincronizando] = useState(false)
    const [erroSync, setErroSync] = useState<string | null>(null)

    // undefined = carregando | null = não existe
    const dono = useLiveQuery(async () => (await db.meta.get('user_id'))?.valor ?? null)
    const ultima = useLiveQuery(async () => (await db.meta.get('ultima_sync'))?.valor ?? null)
    const pendentes = useLiveQuery(() => db.outbox.count()) ?? 0
    const userId = session?.user.id

    const atualizar = useCallback(async () => {
        setSincronizando(true)
        await processarOutbox() // envia o que ficou na fila
        setErroSync(await sincronizar())
        setSincronizando(false)
    }, [])

    useEffect(() => {
        if (userId && online) void atualizar()
    }, [userId, online, atualizar])

    if (loading || dono === undefined) return <p className="p-6 text-slate-500">Carregando...</p>

    // sem sessão: só deixa passar se estiver offline e houver dados salvos
    const podeOffline = !online && dono !== null
    if (!session && !podeOffline) return <Navigate to="/login" replace />

    let status = ultima ? `Atualizado em ${fmt(ultima)}` : ''
    let cor = 'bg-slate-100 text-slate-600'
    if (!online) {
        status = ultima
            ? `Sem conexão. Dados salvos em ${fmt(ultima)}`
            : 'Sem conexão e sem dados salvos. Conecte-se para carregar.'
        cor = 'bg-amber-100 text-amber-800'
    } else if (sincronizando) {
        status = 'Atualizando...'
    } else if (erroSync) {
        status = 'Não foi possível atualizar. Mostrando dados salvos.'
        cor = 'bg-red-100 text-red-700'
    }
    if (pendentes > 0) {
        status += ` · ${pendentes} ${pendentes === 1 ? 'envio na fila' : 'envios na fila'}`
    }

    return (
        <div className="mx-auto min-h-screen max-w-md bg-slate-50 pb-20">
            <div className={`flex items-center justify-between px-4 py-1.5 text-xs font-medium ${cor}`}>
                <span>{status}</span>
                {online && !sincronizando && (
                    <button onClick={atualizar} className="font-bold underline">
                        Atualizar
                    </button>
                )}
            </div>
            <Outlet />
            <BottomNav />
        </div>
    )
}