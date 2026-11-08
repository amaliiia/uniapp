import { sincronizar } from './sync'
import { processarOutbox } from './entregas'

type Estado = { sincronizando: boolean; erro: string | null }

let estado: Estado = { sincronizando: false, erro: null }
const ouvintes = new Set<() => void>()

function definir(novo: Estado) {
    estado = novo
    ouvintes.forEach((f) => f())
}

export const lerStatus = () => estado

export function assinarStatus(cb: () => void) {
    ouvintes.add(cb)
    return () => {
        ouvintes.delete(cb)
    }
}

let ciclo: Promise<void> | null = null

// Envia a fila de entregas e depois sincroniza os dados.
// Chamadas simultâneas reaproveitam o mesmo ciclo.
export function atualizarTudo() {
    if (!ciclo) {
        ciclo = (async () => {
            definir({ sincronizando: true, erro: null })
            let erro: string | null = null
            try {
                await processarOutbox()
                erro = await sincronizar()
            } catch (err) {
                erro = err instanceof Error ? err.message : 'Falha ao atualizar.'
            }
            definir({ sincronizando: false, erro })
        })().finally(() => {
            ciclo = null
        })
    }
    return ciclo
}