// Formata um número como moeda brasileira (ex: 29.9 -> "R$ 29,90")
export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
