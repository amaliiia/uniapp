import { supabase } from './supabase'
import { db, limparDados } from './db'

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
    disciplinas: { nome: string; cor: string | null }
    semestres_letivos: { rotulo: string }
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

    const [h, n, f, nt, p] = await Promise.all([
        supabase
            .from('horarios')
            .select('dia_semana, hora_inicio, sala, disciplinas(nome, cor, professor)'),
        supabase.from('v_notas').select('semestre, disciplina, n1, n2, n3, media'),
        supabase
            .from('matriculas_disciplina')
            .select('faltas, limite_faltas, disciplinas(nome, cor), semestres_letivos(rotulo)'),
        supabase.from('noticias').select('id, categoria, titulo, resumo, publicado_em'),
        supabase.from('alunos').select('id, nome, matricula, email, turno').single(),
    ])

    const erro = [h, n, f, nt, p].find((r) => r.error)?.error
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

    // só mexe no cache depois que TODAS as consultas deram certo
    await db.transaction(
        'rw',
        [db.horarios, db.notas, db.faltas, db.noticias, db.perfil, db.meta],
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
            await db.meta.bulkPut([
                { chave: 'user_id', valor: uid },
                { chave: 'ultima_sync', valor: new Date().toISOString() },
            ])
        }
    )
    return null
}