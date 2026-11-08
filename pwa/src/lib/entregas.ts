import { supabase } from './supabase'
import { db, type OutboxItem } from './db'

const MIME: Record<string, string> = {
    pdf: 'application/pdf',
    zip: 'application/zip',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
}

export const LIMITE_MB = 10
export const ACCEPT = '.pdf,.zip,.doc,.docx,.png,.jpg,.jpeg'

const extensao = (nome: string) => nome.split('.').pop()?.toLowerCase() ?? ''

export function validarArquivo(f: File): string | null {
    if (!MIME[extensao(f.name)]) return 'Formato não aceito. Use PDF, ZIP, DOC, DOCX, PNG ou JPG.'
    if (f.size === 0) return 'O arquivo está vazio.'
    if (f.size > LIMITE_MB * 1024 * 1024) return `O arquivo passa de ${LIMITE_MB} MB.`
    return null
}

// O Storage recusa acentos e caracteres especiais no caminho
function nomeSeguro(nome: string) {
    const limpo = nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]+/g, '_')
    return limpo.slice(-100) || 'arquivo'
}

// Coloca o arquivo na fila (uma por atividade). Retorna null ou a mensagem de erro.
export async function enfileirarEntrega(atividadeId: number, arquivo: File): Promise<string | null> {
    const erro = validarArquivo(arquivo)
    if (erro) return erro
    const dono = await db.meta.get('user_id')
    if (!dono) return 'Abra o app com internet ao menos uma vez antes de enviar.'

    await db.transaction('rw', db.outbox, async () => {
        await db.outbox.where('atividade_id').equals(atividadeId).delete()
        await db.outbox.add({
            aluno_id: dono.valor,
            atividade_id: atividadeId,
            nome: arquivo.name,
            tipo: MIME[extensao(arquivo.name)],
            tamanho: arquivo.size,
            arquivo,
            criado_em: new Date().toISOString(),
            tentativas: 0,
            erro: null,
        })
    })
    return null
}

export const cancelarEnvio = (atividadeId: number) =>
    db.outbox.where('atividade_id').equals(atividadeId).delete()

let rodando: Promise<void> | null = null

// Envia tudo que está na fila. Chamadas simultâneas reaproveitam a mesma execução.
export function processarOutbox() {
    if (!rodando) {
        rodando = executar().finally(() => {
            rodando = null
        })
    }
    return rodando
}

async function executar() {
    if (!navigator.onLine) return
    const { data } = await supabase.auth.getSession()
    const uid = data.session?.user.id
    if (!uid) return

    const itens = await db.outbox.orderBy('id').toArray()
    for (const item of itens) {
        if (item.aluno_id !== uid) continue // item de outro aluno: não envia como este
        const erro = await enviarItem(uid, item)
        if (erro) {
            await db.outbox.update(item.id, { erro, tentativas: item.tentativas + 1 })
            if (!navigator.onLine) break
        } else {
            await db.outbox.delete(item.id)
        }
    }
}

async function enviarItem(uid: string, item: OutboxItem): Promise<string | null> {
    try {
        const path = `${uid}/${item.atividade_id}/${nomeSeguro(item.nome)}`

        const { error: e1 } = await supabase.storage
            .from('entregas')
            .upload(path, item.arquivo, { upsert: true, contentType: item.tipo })
        if (e1) return e1.message

        const { error: e2 } = await supabase.from('entregas').upsert(
            {
                atividade_id: item.atividade_id,
                aluno_id: uid,
                arquivo_path: path,
                enviada_em: new Date().toISOString(),
            },
            { onConflict: 'atividade_id,aluno_id' }
        )
        if (e2) return e2.message

        // reenvio com outro nome: apaga o arquivo anterior para não sobrar lixo
        const anterior = (await db.atividades.get(item.atividade_id))?.entrega?.arquivo_path
        if (anterior && anterior !== path) {
            await supabase.storage.from('entregas').remove([anterior])
        }
        return null
    } catch (err) {
        return err instanceof Error ? err.message : 'Falha no envio.'
    }
}

// Abre um arquivo privado por link temporário (só funciona online)
export async function abrirArquivo(bucket: 'materiais' | 'entregas', path: string) {
    const aba = window.open('', '_blank') // abre antes do await para o navegador não bloquear
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 120)
    if (error || !data) {
        aba?.close()
        return /not found/i.test(error?.message ?? '')
            ? 'Arquivo não encontrado.'
            : 'Não foi possível abrir o arquivo.'
    }
    if (aba) aba.location.href = data.signedUrl
    else window.location.href = data.signedUrl
    return null
}