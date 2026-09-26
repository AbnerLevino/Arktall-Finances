import type { Receita } from '@/domain/receita/types'
import type { Fatura } from '@/domain/fatura/types'
import { dinheiroLivreDoMes } from '@/domain/receita/dinheiroLivre'
import { receitasDoMes } from '@/domain/receita/filtros'
import { custoMensalTotal } from '@/domain/fatura/calc'
import { mesAnterior } from '@/lib/mes'

type Entrada = {
  receitas: Receita[]
  despesas: Fatura[]
  aliquota: number
  mes: string // "AAAA-MM"
}

// KPIs ANALÍTICOS do Painel — razões/tendências (não os valores brutos da Home).
// Campos podem ser null quando não há base pra calcular (ex.: sem receita).
export type MetricasPainel = {
  comprometimento: number | null // % da renda que já tem dono (imposto + despesas)
  taxaSobra: number | null // % da renda que sobra livre
  mediaMensal: number // receita média por mês com dados
  variacao: number | null // % de variação da receita vs mês anterior
}

export function metricasDoPainel({
  receitas,
  despesas,
  aliquota,
  mes,
}: Entrada): MetricasPainel {
  const d = dinheiroLivreDoMes({ receitas, despesas, aliquota, mes })

  const comprometimento =
    d.recebido > 0 ? ((d.imposto + d.despesas) / d.recebido) * 100 : null
  const taxaSobra = d.recebido > 0 ? (d.livre / d.recebido) * 100 : null

  const meses = new Set(receitas.map((r) => r.data.slice(0, 7)))
  const totalGeral = receitas.reduce((s, r) => s + r.valor, 0)
  const mediaMensal = meses.size > 0 ? totalGeral / meses.size : 0

  const recebidoAnterior = receitasDoMes(receitas, mesAnterior(mes)).reduce(
    (s, r) => s + r.valor,
    0,
  )
  const variacao =
    recebidoAnterior > 0
      ? ((d.recebido - recebidoAnterior) / recebidoAnterior) * 100
      : null

  return { comprometimento, taxaSobra, mediaMensal, variacao }
}

// Um ponto da linha do tempo: um mês com receita cadastrada.
export type PontoEvolucao = {
  mes: string // "AAAA-MM"
  recebido: number
  despesa: number
  imposto: number
  livre: number
}

/**
 * Evolução mês a mês (receita × despesa × livre).
 * A receita é real (temos as datas). A despesa fixa usa o custo mensal ATUAL
 * como aproximação (não guardamos histórico de despesa por mês ainda).
 * Só aparecem meses que têm receita cadastrada (ordenados do mais antigo).
 */
export function evolucaoMensal({
  receitas,
  despesas,
  aliquota,
}: Omit<Entrada, 'mes'>): PontoEvolucao[] {
  const meses = [...new Set(receitas.map((r) => r.data.slice(0, 7)))].sort()
  const despesa = custoMensalTotal(despesas)

  return meses.map((mes) => {
    const recebido = receitasDoMes(receitas, mes).reduce((s, r) => s + r.valor, 0)
    const imposto = recebido * (aliquota / 100)
    return { mes, recebido, despesa, imposto, livre: recebido - imposto - despesa }
  })
}

// De onde vem a renda: soma das receitas por origem/cliente, com % do total,
// já ordenado do maior pro menor (mostra concentração de clientes).
export type FatiaRenda = {
  origem: string
  total: number
  pct: number
}

export function rendaPorOrigem(receitas: Receita[]): FatiaRenda[] {
  const soma: Record<string, number> = {}
  for (const r of receitas) {
    const origem = r.origem || 'Sem origem'
    soma[origem] = (soma[origem] ?? 0) + r.valor
  }

  const total = Object.values(soma).reduce((s, v) => s + v, 0)

  return Object.entries(soma)
    .map(([origem, valor]) => ({
      origem,
      total: valor,
      pct: total > 0 ? Math.round((valor / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
}
