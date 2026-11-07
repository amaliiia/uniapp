import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { limparDados } from '../lib/db'

type AuthCtx = {
    session: Session | null
    loading: boolean
    entrar: (matricula: string, senha: string) => Promise<string | null>
    sair: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setLoading(false)
        })
        const { data } = supabase.auth.onAuthStateChange((evento, s) => {
            setSession(s)
            if (evento === 'SIGNED_OUT') void limparDados()
        })
        return () => data.subscription.unsubscribe()
    }, [])

    async function entrar(matricula: string, senha: string) {
        const { data: email, error } = await supabase.rpc('email_por_matricula', {
            p_matricula: matricula,
        })
        if (error || !email) return 'Matrícula ou senha inválidos.'
        const { error: erroLogin } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        })
        return erroLogin ? 'Matrícula ou senha inválidos.' : null
    }

    async function sair() {
        await limparDados()
        await supabase.auth.signOut()
    }

    return <Ctx.Provider value={{ session, loading, entrar, sair }}>{children}</Ctx.Provider>
}

export function useAuth() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
    return ctx
}