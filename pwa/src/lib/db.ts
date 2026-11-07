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

export const db = new Dexie('uniapp') as Dexie & {
    horarios: EntityTable<Horario, 'id'>
    notas: EntityTable<Nota, 'id'>
    faltas: EntityTable<Falta, 'id'>
    noticias: EntityTable<Noticia, 'id'>
    perfil: EntityTable<Perfil, 'id'>
    meta: EntityTable<Meta, 'chave'>
}

db.version(1).stores({
    horarios: '++id, dia_semana',
    notas: '++id, semestre',
    faltas: '++id',
    noticias: 'id, publicado_em',
    perfil: 'id',
    meta: 'chave',
})

export async function limparDados() {
    await db.transaction('rw', db.tables, async () => {
        await Promise.all(db.tables.map((t) => t.clear()))
    })
}