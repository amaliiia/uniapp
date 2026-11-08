import { supabase } from './supabase'
import { db, limparDados } from './db'

type Disc = { nome: string; cor: string | null }

type HRow = {
    dia_semana: number
    hora_inicio: string
    sala: string | null
    disciplinas: { nome: string; cor: string | null; professor: string | null }
}
type NRow = {
    semestre: string
    disciplina: string
    n1: number | null
    n2: number | null
    n3: number | null
    media: number | null
}
type FRow = {
    faltas: number
    limite_faltas: number
    disciplinas: Disc
    semestres_letivos: { rotulo: string }
}
type ARow = {
    id: number
    titulo: string
    descricao: string | null
    prazo: string | null
    enunciado_path: string | null
    disciplinas: Disc
}
type ERow = { atividade_id: number; arquivo_path: string; enviada_em: string }
type MRow = {
    id: number
    tipo: string | null
    titulo: string
    tamanho_bytes: number | null
    arquivo_path: string | null
    disciplinas: Disc
}
type AulaRow = {
    id: number
    data: string
    hora_inicio: string
    topico: string | null
    descricao: string | null
    disciplinas: Disc
}
type EvRow = {
    id: number
    data: string
    titulo: string
    tipo: string
    disciplinas: Disc | null
}

let emAndamento: Promise<string | null> | null = null

// Retorna null se deu certo, ou a mensagem de erro.
// Chamadas simultâneas reaproveitam a mesma sincronização.
export function sincronizar() {
    if (!emAndamento) {
        emAndamento = executar().finally(() => {
            emAndamento = null
        })
    }
    return emAndamento
}

async function executar(): Promise<string | null> {
    if (!navigator.onLine) return 'Sem conexão'

    const { data: sessao } = await supabase.auth.getSession()
    const uid = sessao.session?.user.id
    if (!uid) return 'Sem sessão'

    // outro aluno no mesmo aparelho: apaga o cache do anterior
    const dono = await db.meta.get('user_id')
    if (dono && dono.valor !== uid) await limparDados()

    const [h, n, f, nt, p, a, e, mt, au, ev, hc, hh] = await Promise.all([
        supabase
            .from('horarios')
            .select('dia_semana, hora_inicio, sala, disciplinas(nome, cor, professor)'),
        supabase.from('v_notas').select('semestre, disciplina, n1, n2, n3, media'),
        supabase
            .from('matriculas_disciplina')
            .select('faltas, limite_faltas, disciplinas(nome, cor), semestres_letivos(rotulo)'),
        supabase.from('noticias').select('id, categoria, titulo, resumo, publicado_em'),
        supabase.from('alunos').select('id, nome, matricula, email, turno').single(),
        supabase
            .from('atividades')
            .select('id, titulo, descricao, prazo, enunciado_path, disciplinas(nome, cor)'),
        supabase.from('entregas').select('atividade_id, arquivo_path, enviada_em'),
        supabase
            .from('materiais')
            .select('id, tipo, titulo, tamanho_bytes, arquivo_path, disciplinas(nome, cor)'),
        supabase
            .from('aulas')
            .select('id, data, hora_inicio, topico, descricao, disciplinas(nome, cor)'),
        supabase.from('agenda_eventos').select('id, data, titulo, tipo, disciplinas(nome, cor)'),
        supabase.from('hc_categorias').select('categoria, limite_horas'),
        supabase
            .from('horas_complementares')
            .select('id, categoria, atividade, horas, semestre, criado_em'),
    ])

    const erro = [h, n, f, nt, p, a, e, mt, au, ev, hc, hh].find((r) => r.error)?.error
    if (erro) return erro.message

    const horarios = (h.data as unknown as HRow[]).map((x) => ({
        dia_semana: x.dia_semana,
        hora_inicio: x.hora_inicio,
        sala: x.sala,
        disciplina: x.disciplinas.nome,
        cor: x.disciplinas.cor,
        professor: x.disciplinas.professor,
    }))
    const notas = n.data as unknown as NRow[]
    const faltas = (f.data as unknown as FRow[]).map((x) => ({
        semestre: x.semestres_letivos.rotulo,
        disciplina: x.disciplinas.nome,
        cor: x.disciplinas.cor,
        faltas: x.faltas,
        limite_faltas: x.limite_faltas,
    }))
    const entregas = new Map((e.data as unknown as ERow[]).map((x) => [x.atividade_id, x]))
    const atividades = (a.data as unknown as ARow[]).map((x) => {
        const en = entregas.get(x.id)
        return {
            id: x.id,
            disciplina: x.disciplinas.nome,
            cor: x.disciplinas.cor,
            titulo: x.titulo,
            descricao: x.descricao,
            prazo: x.prazo,
            enunciado_path: x.enunciado_path,
            entrega: en ? { arquivo_path: en.arquivo_path, enviada_em: en.enviada_em } : null,
        }
    })
    const materiais = (mt.data as unknown as MRow[]).map((x) => ({
        id: x.id,
        disciplina: x.disciplinas.nome,
        cor: x.disciplinas.cor,
        tipo: x.tipo,
        titulo: x.titulo,
        tamanho_bytes: x.tamanho_bytes,
        arquivo_path: x.arquivo_path,
    }))
    const idsMateriais = new Set(materiais.map((m) => m.id))
    const aulas = (au.data as unknown as AulaRow[]).map((x) => ({
        id: x.id,
        data: x.data,
        hora_inicio: x.hora_inicio,
        topico: x.topico,
        descricao: x.descricao,
        disciplina: x.disciplinas.nome,
        cor: x.disciplinas.cor,
    }))
    const eventos = (ev.data as unknown as EvRow[]).map((x) => ({
        id: x.id,
        data: x.data,
        titulo: x.titulo,
        tipo: x.tipo,
        disciplina: x.disciplinas?.nome ?? null,
        cor: x.disciplinas?.cor ?? null,
    }))

    // só mexe no cache depois que TODAS as consultas deram certo
    await db.transaction(
        'rw',
        [
            db.horarios,
            db.notas,
            db.faltas,
            db.noticias,
            db.perfil,
            db.atividades,
            db.materiais,
            db.arquivos,
            db.aulas,
            db.eventos,
            db.hc_categorias,
            db.horas,
            db.meta,
        ],
        async () => {
            await db.horarios.clear()
            await db.horarios.bulkAdd(horarios as never[])
            await db.notas.clear()
            await db.notas.bulkAdd(notas as never[])
            await db.faltas.clear()
            await db.faltas.bulkAdd(faltas as never[])
            await db.noticias.clear()
            await db.noticias.bulkAdd(nt.data ?? [])
            await db.perfil.clear()
            await db.perfil.put(p.data!)
            await db.atividades.clear()
            await db.atividades.bulkAdd(atividades)
            await db.materiais.clear()
            await db.materiais.bulkAdd(materiais)
            // arquivos baixados são mantidos; só saem os de materiais que não existem mais
            await db.arquivos.filter((x) => !idsMateriais.has(x.id)).delete()
            await db.aulas.clear()
            await db.aulas.bulkAdd(aulas)
            await db.eventos.clear()
            await db.eventos.bulkAdd(eventos)
            await db.hc_categorias.clear()
            await db.hc_categorias.bulkAdd(hc.data ?? [])
            await db.horas.clear()
            await db.horas.bulkAdd(hh.data ?? [])
            await db.meta.bulkPut([
                { chave: 'user_id', valor: uid },
                { chave: 'ultima_sync', valor: new Date().toISOString() },
            ])
        }
    )
    return null
}