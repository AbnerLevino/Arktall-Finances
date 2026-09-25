import { custoMensalTotal } from '@/domain/fatura/calc'
import type { Receita } from './types'
import type { Fatura } from '@/domain/fatura/types'

// RN07 — imposto reservado de uma receita
export function impostoDaReceita(valor: number, aliquota: number): number {
  return valor * (aliquota / 100)
}

// uma receita pertence ao mês "AAAA-MM" quando sua data "AAAA-MM-DD" começa com ele
function ehDoMes(receita: Receita, mes: string): boolean {
  return receita.data.startsWith(mes)
}

type Args = {
  receitas: Receita[]
  despesas: Fatura[]
  aliquota: number
  mes: string // "AAAA-MM"
}

// RN08 — cascata do dinheiro livre do mês:
// receitas do mês − imposto reservado do mês − custo das despesas fixas
export function dinheiroLivreDoMes({ receitas, despesas, aliquota, mes }: Args): number {
  const doMes = receitas.filter((r) => ehDoMes(r, mes))
  const totalReceita = doMes.reduce((soma, r) => soma + r.valor, 0)
  const totalImposto = doMes.reduce((soma, r) => soma + impostoDaReceita(r.valor, aliquota), 0)
  const totalDespesas = custoMensalTotal(despesas)
  return totalReceita - totalImposto - totalDespesas
}
