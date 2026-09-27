import { custoMensalTotal } from '@/domain/fatura/calc'
import { receitasDoMes } from './filtros'
import type { Receita } from './types'
import type { Fatura } from '@/domain/fatura/types'

// RN07 — imposto reservado de uma receita
export function impostoDaReceita(valor: number, aliquota: number): number {
  return valor * (aliquota / 100)
}

type Args = {
  receitas: Receita[]
  despesas: Fatura[]
  aliquota: number
  mes: string // "AAAA-MM"
  reserva?: number // % da receita guardado no colchão (default 0)
}

// O detalhamento da cascata: os pedaços + o resultado final.
// A tela usa os pedaços pra mostrar de onde vem o número.
export type DetalheDinheiroLivre = {
  recebido: number // Σ receitas do mês
  imposto: number // Σ imposto reservado do mês
  despesas: number // custo mensal das despesas fixas
  reserva: number // valor guardado no colchão neste mês (permanece com o usuário)
  livre: number // recebido − imposto − despesas − reserva
}

// RN08/RN09 — cascata do dinheiro livre do mês:
// receitas − imposto − despesas fixas − reserva/colchão.
// A reserva é a única saída que NÃO é perda: continua sendo do usuário.
export function dinheiroLivreDoMes({
  receitas,
  despesas,
  aliquota,
  mes,
  reserva = 0,
}: Args): DetalheDinheiroLivre {
  const doMes = receitasDoMes(receitas, mes)
  const recebido = doMes.reduce((soma, r) => soma + r.valor, 0)
  const imposto = doMes.reduce((soma, r) => soma + impostoDaReceita(r.valor, aliquota), 0)
  const totalDespesas = custoMensalTotal(despesas)
  const valorReserva = recebido * (reserva / 100)
  return {
    recebido,
    imposto,
    despesas: totalDespesas,
    reserva: valorReserva,
    livre: recebido - imposto - totalDespesas - valorReserva,
  }
}
