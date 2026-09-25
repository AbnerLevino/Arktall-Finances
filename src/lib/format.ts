// Formata um número como moeda brasileira (ex: 29.9 -> "R$ 29,90")
export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Formata uma data ISO "AAAA-MM-DD" como "DD/MM/AAAA"
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

const MESES_CURTOS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

// Formata uma data ISO "AAAA-MM-DD" como "25 set 2026"
export function formatarDataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia} ${MESES_CURTOS[Number(mes) - 1]} ${ano}`
}

// Formata data + hora como "25/Setem./2026 - 12:15:50" (mês abreviado com inicial maiúscula)
export function formatarDataHora(d: Date): string {
  const dia = String(d.getDate()).padStart(2, '0')
  const mesLongo = d.toLocaleDateString('pt-BR', { month: 'long' })
  const mes = mesLongo.charAt(0).toUpperCase() + mesLongo.slice(1, 5) + '.'
  const ano = d.getFullYear()
  const hora = d.toLocaleTimeString('pt-BR', { hour12: false })
  return `${dia}/${mes}/${ano} - ${hora}`
}

// Mostra o dia de cobrança (ex: 10 -> "Dia 10")
export function formatarVencimento(dia: number | null): string {
  return dia ? `Dia ${dia}` : '—'
}

// Junta tipo + parcelas (ex: "Cartão de Crédito" + 3 -> "Cartão de Crédito 3x")
export function descreverPagamento(
  tipo: string,
  parcelas: number | null,
): string {
  return parcelas ? `${tipo} ${parcelas}x` : tipo
}
