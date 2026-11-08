import { supabase } from './supabase'
import { db, type Material } from './db'

const MIME: Record<string, string> = {
    pdf: 'application/pdf',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sql: 'text/plain',
    txt: 'text/plain',
    zip: 'application/zip',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
}

const extensao = (nome: string) => nome.split('.').pop()?.toLowerCase() ?? ''

// Baixa do Storage e guarda no aparelho. Retorna null ou a mensagem de erro.
export async function baixarMaterial(m: Material): Promise<string | null> {
    if (!m.arquivo_path) return 'Arquivo ainda não disponível.'
    if (!navigator.onLine) return 'Sem conexão. Conecte-se para baixar.'
    try {
        const { data, error } = await supabase.storage.from('materiais').download(m.arquivo_path)
        if (error || !data) {
            return /not found/i.test(error?.message ?? '')
                ? 'Arquivo não encontrado no servidor.'
                : 'Não foi possível baixar o arquivo.'
        }
        const mime = MIME[extensao(m.arquivo_path)] ?? (data.type || 'application/octet-stream')
        const blob = new Blob([data], { type: mime })
        await db.arquivos.put({
            id: m.id,
            arquivo_path: m.arquivo_path,
            blob,
            mime,
            tamanho: blob.size,
            baixado_em: new Date().toISOString(),
        })
        // pede ao navegador para não apagar os arquivos quando faltar espaço
        void navigator.storage?.persist?.()
        return null
    } catch (err) {
        if (err instanceof DOMException && err.name === 'QuotaExceededError') {
            return 'Sem espaço no aparelho para guardar este arquivo.'
        }
        return err instanceof Error ? err.message : 'Falha no download.'
    }
}

// Abre o arquivo salvo (funciona offline)
export async function abrirSalvo(id: number): Promise<string | null> {
    const aba = window.open('', '_blank') // abre antes do await para não ser bloqueado
    const a = await db.arquivos.get(id)
    if (!a) {
        aba?.close()
        return 'O arquivo não está salvo no aparelho.'
    }
    const url = URL.createObjectURL(a.blob)
    if (aba) aba.location.href = url
    else window.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000)
    return null
}

export const removerSalvo = (id: number) => db.arquivos.delete(id)