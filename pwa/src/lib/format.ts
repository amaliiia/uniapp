export const fmtNota = (n: number | null) =>
    n === null || n === undefined ? '—' : n.toFixed(1).replace('.', ',')

// ≥ 7 verde, ≥ 5 amarelo, < 5 vermelho
export const corNota = (m: number | null) =>
    m === null ? 'text-slate-400' : m >= 7 ? 'text-green-600' : m >= 5 ? 'text-amber-600' : 'text-red-600'