import { despesasPorCategoria } from '@/domain/fatura/calc'
import type { Fatura } from '@/domain/fatura/types'
import type { Receita } from '@/domain/receita/types'
import type { DetalheDinheiroLivre } from '@/domain/receita/dinheiroLivre'
import { receitasDoMes } from '@/domain/receita/filtros'
import { mesAnterior } from '@/lib/mes'
import { formatarPreco } from '@/lib/format'

// Um "aviso" que o sistema fala pro usuário, já quebrado em partes para
// a tela dar peso ao número:
//   rotulo  -> o que é (pequeno)      ex.: "Média mensal"
//   valor   -> o número (destaque)    ex.: "R$ 5.500,00"
//   detalhe -> complemento (menor)    ex.: "Este mês está 9% acima da média"
// nivel: 'critico' = fixo/destacado no topo (perda, risco); 'info' = rotativo no card.
// tom: cor/ênfase (info neutro, bom positivo, alerta atenção).
export type Insight = {
  id: string
  rotulo: string
  valor: string
  detalhe?: string
  tom: 'info' | 'bom' | 'alerta'
  nivel: 'critico' | 'info'
}

type Args = {
  receitas: Receita[] // TODAS as receitas (para cálculos históricos)
  despesas: Fatura[] // despesas fixas cadastradas
  aliquota: number // % de imposto configurado
  mes: string // mês em foco "AAAA-MM"
  detalhe: DetalheDinheiroLivre // cascata já calculada do mês em foco
}

/**
 * Gera os avisos do mês. São "invisíveis": respondem o que o usuário NÃO
 * consegue ler direto na tela (tendência, média, concentração, imposto do ano,
 * reserva) + o alerta crítico de mês no vermelho.
 *
 * Cada aviso tem GUARDA: se faltam dados, é omitido em vez de mostrar número
 * sem sentido. Função pura — no futuro uma IA reescreve os textos, mas os
 * números continuam vindo daqui.
 */
export function gerarInsights({
  receitas,
  despesas,
  aliquota,
  mes,
  detalhe,
}: Args): Insight[] {
  const lista: Insight[] = []

  // CRÍTICO — mês fechou no vermelho (saídas passaram do que entrou)
  if (detalhe.livre < 0) {
    lista.push({
      id: 'vermelho',
      nivel: 'critico',
      tom: 'alerta',
      rotulo: 'Mês no vermelho',
      valor: `− ${formatarPreco(Math.abs(detalhe.livre))}`,
      detalhe: 'suas saídas passaram do que entrou',
    })
  }

  // 1) Comparação com o mês passado — precisa ter receita no mês anterior
  const recebidoAnterior = totalRecebido(receitasDoMes(receitas, mesAnterior(mes)))
  if (recebidoAnterior > 0) {
    const pct = Math.round(
      ((detalhe.recebido - recebidoAnterior) / recebidoAnterior) * 100,
    )
    if (pct !== 0) {
      lista.push({
        id: 'comparacao',
        nivel: 'info',
        tom: pct > 0 ? 'bom' : 'info',
        rotulo: 'Vs. mês passado',
        valor: `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`,
        detalhe:
          pct > 0
            ? 'a mais que no mês passado'
            : 'a menos que no mês passado',
      })
    }
  }

  // 2) Média mensal + posição do mês atual em relação a ela
  const meses = new Set(receitas.map((r) => r.data.slice(0, 7)))
  if (meses.size > 0) {
    const media = totalRecebido(receitas) / meses.size
    const difPct = media > 0 ? Math.round(((detalhe.recebido - media) / media) * 100) : 0
    const posicao =
      difPct > 0
        ? `${difPct}% acima da média`
        : difPct < 0
          ? `${Math.abs(difPct)}% abaixo da média`
          : 'na média'
    lista.push({
      id: 'media',
      nivel: 'info',
      tom: difPct >= 0 ? 'bom' : 'info',
      rotulo: 'Média mensal',
      valor: formatarPreco(media),
      detalhe: `Este mês está ${posicao}`,
    })
  }

  // 3) Concentração de gasto — a categoria que mais pesa (crítico se ≥ 50%)
  const categorias = despesasPorCategoria(despesas)
  if (categorias.length > 0 && detalhe.despesas > 0) {
    const top = categorias[0]
    const critico = top.pct >= 50
    lista.push({
      id: 'concentracao',
      nivel: critico ? 'critico' : 'info',
      tom: critico ? 'alerta' : 'info',
      rotulo: 'Maior concentração de gasto',
      valor: `${top.pct}%`,
      detalhe: `dos gastos fixos em ${top.categoria}`,
    })
  }

  // 4) Imposto acumulado no ano — a tela só mostra o do mês
  const ano = mes.slice(0, 4)
  const recebidoAno = totalRecebido(receitas.filter((r) => r.data.startsWith(ano)))
  if (recebidoAno > 0 && aliquota > 0) {
    lista.push({
      id: 'imposto-ano',
      nivel: 'info',
      tom: 'info',
      rotulo: `Imposto reservado em ${ano}`,
      valor: formatarPreco(recebidoAno * (aliquota / 100)),
      detalhe: 'acumulado no ano',
    })
  }

  // 5) Reserva de emergência sugerida — 3 meses de despesas fixas
  if (detalhe.despesas > 0) {
    lista.push({
      id: 'reserva',
      nivel: 'info',
      tom: 'info',
      rotulo: 'Reserva de emergência ideal',
      valor: formatarPreco(detalhe.despesas * 3),
      detalhe: '3 meses de despesas fixas',
    })
  }

  return lista
}

// Soma o valor de uma lista de receitas
function totalRecebido(receitas: Receita[]): number {
  return receitas.reduce((soma, r) => soma + r.valor, 0)
}
