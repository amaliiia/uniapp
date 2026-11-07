import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
    const { session, loading, entrar } = useAuth()
    const [matricula, setMatricula] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)

    if (!loading && session) return <Navigate to="/" replace />

    async function enviar(e: FormEvent) {
        e.preventDefault()
        setErro(null)
        if (!/^\d{4,}$/.test(matricula)) return setErro('Matrícula deve ter só números (mín. 4).')
        if (senha.length < 4) return setErro('A senha deve ter ao menos 4 caracteres.')
        setEnviando(true)
        const msg = await entrar(matricula, senha)
        setEnviando(false)
        if (msg) setErro(msg)
    }

    return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-slate-50 p-6">
            <h1 className="mb-1 text-3xl font-extrabold text-blue-600">UniApp</h1>
            <p className="mb-6 text-slate-500">Portal do Aluno</p>

            <form onSubmit={enviar} className="flex flex-col gap-3">
                <input
                    className="rounded-xl border border-slate-300 bg-white p-3"
                    placeholder="Matrícula"
                    inputMode="numeric"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                />
                <input
                    className="rounded-xl border border-slate-300 bg-white p-3"
                    placeholder="Senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />
                {erro && <p className="text-sm font-medium text-red-600">{erro}</p>}
                <button
                    disabled={enviando}
                    className="rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-60"
                >
                    {enviando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    )
}