export const fmtNota = (n: number | null) =>
    n === null || n === undefined ? '—' : n.toFixed(1).replace('.', ',')

// ≥ 7 verde, ≥ 5 amarelo, < 5 vermelho
export const corNota = (m: number | null) =>
    m === null ? 'text-slate-400' : m >= 7 ? 'text-green-600' : m >= 5 ? 'text-amber-600' : 'text-red-600'

export const fmtPrazo = (iso: string) =>
    new Date(iso + 'T00:00:00')
        .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        .replace('.', '')

export const hojeISO = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD local

export const somarDias = (iso: string, n: number) => {
    const d = new Date(iso + 'T12:00:00')
    d.setDate(d.getDate() + n)
    return d.toLocaleDateString('sv-SE')
}

export const fmtDiaLongo = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
    })

export const fmtDataHora = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })

export const fmtTamanho = (b: number) =>
    b < 1024 * 1024
        ? `${Math.max(1, Math.round(b / 1024))} KB`
        : `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`