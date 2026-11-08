import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { useAuth } from '../hooks/useAuth'

export default function Perfil() {
    const { sair } = useAuth()
    const aluno = useLiveQuery(() => db.perfil.toCollection().first())
    const pendentes = useLiveQuery(() => db.outbox.count()) ?? 0

    function confirmarSaida() {
        if (
            pendentes > 0 &&
            !window.confirm(
                `Você tem ${pendentes} ${pendentes === 1 ? 'envio' : 'envios'} na fila. Se sair agora, ${pendentes === 1 ? 'ele será perdido' : 'eles serão perdidos'
                }. Sair mesmo assim?`
            )
        )
            return
        void sair()
    }

    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-extrabold">Perfil</h1>
            {aluno && (
                <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
                    <p className="font-bold">{aluno.nome}</p>
                    <p className="text-sm text-slate-600">Matrícula: {aluno.matricula}</p>
                    <p className="text-sm text-slate-600">{aluno.email}</p>
                </div>
            )}
            <button onClick={confirmarSaida} className="w-full rounded-xl bg-red-600 p-3 font-bold text-white">
                Sair
            </button>
        </div>
    )
}