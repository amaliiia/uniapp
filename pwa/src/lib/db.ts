import Dexie, { type EntityTable } from 'dexie'

export interface Horario {
    id: number
    dia_semana: number
    hora_inicio: string
    sala: string | null
    disciplina: string
    cor: string | null
    professor: string | null
}
export interface Nota {
    id: number
    semestre: string
    disciplina: string
    n1: number | null
    n2: number | null
    n3: number | null
    media: number | null
}
export interface Falta {
    id: number
    semestre: string
    disciplina: string
    cor: string | null
    faltas: number
    limite_faltas: number
}
export interface Noticia {
    id: number
    categoria: string | null
    titulo: string
    resumo: string | null
    publicado_em: string
}
export interface Perfil {
    id: string
    nome: string
    matricula: string
    email: string
    turno: string | null
}
export interface Meta {
    chave: string
    valor: string
}
export interface Atividade {
    id: number
    disciplina: string
    cor: string | null
    titulo: string
    descricao: string | null
    prazo: string | null // YYYY-MM-DD
    enunciado_path: string | null
    entrega: { arquivo_path: string; enviada_em: string } | null
}
export interface OutboxItem {
    id: number
    aluno_id: string
    atividade_id: number
    nome: string
    tipo: string
    tamanho: number
    arquivo: Blob
    criado_em: string
    tentativas: number
    erro: string | null
}
export interface Material {
    id: number
    disciplina: string
    cor: string | null
    tipo: string | null
    titulo: string
    tamanho_bytes: number | null
    arquivo_path: string | null
}
export interface ArquivoSalvo {
    id: number // = id do material
    arquivo_path: string // versão que foi baixada
    blob: Blob
    mime: string
    tamanho: number
    baixado_em: string
}
export interface Aula {
    id: number
    data: string // YYYY-MM-DD
    hora_inicio: string
    topico: string | null
    descricao: string | null
    disciplina: string
    cor: string | null
}
export interface Evento {
    id: number
    data: string // YYYY-MM-DD
    titulo: string
    tipo: string
    disciplina: string | null
    cor: string | null
}
export interface HcCategoria {
    categoria: string
    limite_horas: number
}
export interface HoraComplementar {
    id: number
    categoria: string
    atividade: string
    horas: number
    semestre: string | null
    criado_em: string
}

export const db = new Dexie('uniapp') as Dexie & {
    horarios: EntityTable<Horario, 'id'>
    notas: EntityTable<Nota, 'id'>
    faltas: EntityTable<Falta, 'id'>
    noticias: EntityTable<Noticia, 'id'>
    perfil: EntityTable<Perfil, 'id'>
    meta: EntityTable<Meta, 'chave'>
    atividades: EntityTable<Atividade, 'id'>
    outbox: EntityTable<OutboxItem, 'id'>
    materiais: EntityTable<Material, 'id'>
    arquivos: EntityTable<ArquivoSalvo, 'id'>
    aulas: EntityTable<Aula, 'id'>
    eventos: EntityTable<Evento, 'id'>
    hc_categorias: EntityTable<HcCategoria, 'categoria'>
    horas: EntityTable<HoraComplementar, 'id'>
}

db.version(1).stores({
    horarios: '++id, dia_semana',
    notas: '++id, semestre',
    faltas: '++id',
    noticias: 'id, publicado_em',
    perfil: 'id',
    meta: 'chave',
})

db.version(2).stores({
    atividades: 'id, prazo',
    outbox: '++id, atividade_id',
})

db.version(3).stores({
    materiais: 'id, disciplina',
    arquivos: 'id',
})

db.version(4).stores({
    aulas: 'id, data',
    eventos: 'id, data',
    hc_categorias: 'categoria',
    horas: 'id',
})

// Atenção: apaga também a fila de envios pendentes e os arquivos baixados
export async function limparDados() {
    await db.transaction('rw', db.tables, async () => {
        await Promise.all(db.tables.map((t) => t.clear()))
    })
}