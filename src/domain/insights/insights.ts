import { custoMensal } from '@/domain/fatura/calc'
import type { Fatura } from '@/domain/fatura/types'
import { formatarPreco } from '@/lib/format'

// Um "aviso" que o sistema fala pro usuário.
// tom: muda a cor/ênfase (info = neutro, bom = positivo, alerta = atenção).
export type Insight = {
  id: string
  texto: string
  tom: 'info' | 'bom' | 'alerta'
}

type Args = {
  recebido: number
  imposto: number
  despesas: number
  livre: number
  despesasList: Fatura[]
}

/**
 * Gera os insights do mês a partir dos NÚMEROS já calculados (função pura).
 * No futuro, uma IA vai reescrever esses textos com tom natural — mas os
 * números continuam vindo daqui (código confiável; IA só verbaliza).
 */
export function gerarInsights({
  recebido,
  imposto,
  despesas,
  livre,
  despesasList,
}: Args): Insight[] {
  const lista: Insight[] = []

  // Imposto a reservar
  if (imposto > 0) {
    lista.push({
      id: 'imposto',
      tom: 'info',
      texto: `Separe ${formatarPreco(imposto)} para o imposto este mês.`,
    })
  }

  // Quanto as despesas fixas comem do que entrou
  if (recebido > 0) {
    const pct = Math.round((despesas / recebido) * 100)
    lista.push({
      id: 'despesas-pct',
      tom: pct > 50 ? 'alerta' : 'info',
      texto: `Suas despesas fixas consomem ${pct}% do que entrou.`,
    })
  }

  // Maior categoria de saída
  const maior = maiorCategoria(despesasList)
  if (maior) {
    lista.push({
      id: 'maior-cat',
      tom: 'info',
      texto: `Sua maior saída é ${maior.categoria} (${formatarPreco(maior.total)}).`,
    })
  }

  // Situação do dinheiro livre
  if (livre > 0) {
    lista.push({
      id: 'livre',
      tom: 'bom',
      texto: `Você tem ${formatarPreco(livre)} livres — dá pra poupar uma parte.`,
    })
  } else if (livre < 0) {
    lista.push({
      id: 'vermelho',
      tom: 'alerta',
      texto: `Atenção: você fechou ${formatarPreco(Math.abs(livre))} no vermelho este mês.`,
    })
  }

  return lista
}

// Categoria com a maior soma de custo mensal (ou null se não há despesas)
function maiorCategoria(
  despesas: Fatura[],
): { categoria: string; total: number } | null {
  if (despesas.length === 0) return null

  const soma: Record<string, number> = {}
  for (const f of despesas) {
    const cat = f.categoria || 'Sem categoria'
    soma[cat] = (soma[cat] ?? 0) + custoMensal(f)
  }

  let melhor: { categoria: string; total: number } | null = null
  for (const [categoria, total] of Object.entries(soma)) {
    if (!melhor || total > melhor.total) melhor = { categoria, total }
  }
  return melhor
}
