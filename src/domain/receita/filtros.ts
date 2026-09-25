import type { Receita } from './types'

/**
 * Receitas cujo mês de recebimento é `mes` (formato "AAAA-MM").
 * Fonte única da verdade do filtro mensal — usada pelo cálculo e pela tela.
 * Base para filtros futuros (por dia, semana, ano...).
 */
export function receitasDoMes(receitas: Receita[], mes: string): Receita[] {
  return receitas.filter((r) => r.data.startsWith(mes))
}
