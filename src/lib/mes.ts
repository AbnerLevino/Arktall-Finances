// Utilidades de navegação por mês no formato "AAAA-MM".
// Usam Date só pra fazer a conta da virada de ano corretamente.

// Mês anterior a "AAAA-MM" (ex.: "2026-01" -> "2025-12")
export function mesAnterior(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 1, 1) // 1º dia do mês informado
  d.setMonth(d.getMonth() - 1)
  return chave(d)
}

// Mês seguinte a "AAAA-MM" (ex.: "2026-12" -> "2027-01")
export function mesSeguinte(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 1, 1)
  d.setMonth(d.getMonth() + 1)
  return chave(d)
}

// "AAAA-MM" -> "Setembro 2026" (mês por extenso, inicial maiúscula)
export function formatarMesAno(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 1, 1)
  const nome = d.toLocaleDateString('pt-BR', { month: 'long' })
  return `${nome.charAt(0).toUpperCase() + nome.slice(1)} ${ano}`
}

// Date -> "AAAA-MM"
function chave(d: Date): string {
  const ano = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${ano}-${mm}`
}
