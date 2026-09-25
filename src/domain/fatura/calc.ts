import type { Fatura } from './types'

/**
 * Custo mensal de UMA fatura, aplicando a regra de periodicidade:
 * - Mensal: o preço cheio é cobrado todo mês       → preco
 * - Anual:  o preço é diluído em 12 meses do ano    → preco / 12
 *
 * (Faturas antigas sem `periodicidade` caem no caso mensal, que é o padrão.)
 */
export function custoMensal(fatura: Fatura): number {
  return fatura.periodicidade === 'Anual' ? fatura.preco / 12 : fatura.preco
}

// Soma o custo mensal de todas as faturas — base do KPI "Custo Mensal"
export function custoMensalTotal(faturas: Fatura[]): number {
  return faturas.reduce((total, f) => total + custoMensal(f), 0)
}

// "AAAA-MM" -> índice absoluto de mês (ano*12 + mês), pra facilitar contas
function indiceMes(iso: string): number {
  const [ano, mes] = iso.split('-').map(Number)
  return ano * 12 + (mes - 1)
}

// Índice absoluto de volta pra "AAAA-MM"
function isoDoIndice(idx: number): string {
  const ano = Math.floor(idx / 12)
  const mes = (idx % 12) + 1
  return `${ano}-${String(mes).padStart(2, '0')}`
}

// Índice de mês -> "MM/AA" (pra eixo da timeline)
export function formatarMesIdx(idx: number): string {
  const ano = Math.floor(idx / 12)
  const mes = (idx % 12) + 1
  return `${String(mes).padStart(2, '0')}/${String(ano).slice(2)}`
}

export type FaixaTimeline = {
  nome: string
  categoria: string
  inicioIdx: number
  fimIdx: number
  ativa: boolean
  meses: number
  totalGasto: number
  range: [number, number] // [início, fim+1] pra Recharts (barra flutuante)
}

/**
 * Linha do tempo de vida de cada assinatura (tipo Gantt): uma faixa por
 * assinatura, do início até o fim (cancelada) ou até hoje (ativa).
 */
export function timelineAssinaturas(faturas: Fatura[]): {
  faixas: FaixaTimeline[]
  min: number
  max: number
} {
  const comInicio = faturas.filter((f) => f.inicio)
  if (comInicio.length === 0) return { faixas: [], min: 0, max: 0 }

  const agora = new Date()
  const idxAgora = agora.getFullYear() * 12 + agora.getMonth()

  const faixas: FaixaTimeline[] = comInicio.map((f) => {
    const i = indiceMes(f.inicio as string)
    const ativa = f.status !== 'Cancelada'
    const fimF = !ativa && f.fim ? indiceMes(f.fim) : idxAgora
    const meses = Math.max(1, fimF - i + 1)
    return {
      nome: f.nome,
      categoria: f.categoria || 'Sem categoria',
      inicioIdx: i,
      fimIdx: fimF,
      ativa,
      meses,
      totalGasto: meses * custoMensal(f),
      range: [i, fimF + 1],
    }
  })

  const min = Math.min(...faixas.map((f) => f.inicioIdx))
  const max = Math.max(...faixas.map((f) => f.fimIdx + 1))
  return { faixas, min, max }
}

export type EventoFatura = { tipo: 'inicio' | 'fim'; nome: string }

export type PontoMensal = {
  mes: string
  eventos: EventoFatura[]
  valores: Record<string, number> // categoria -> gasto naquele mês
}

/**
 * Gasto POR MÊS decomposto por categoria (não acumulado).
 * Cada mês soma o custo das assinaturas ativas naquele mês, agrupado por
 * categoria. Serve pras barras empilhadas — cancelar aparece como queda.
 */
export function serieMensalPorCategoria(faturas: Fatura[]): {
  pontos: PontoMensal[]
  categorias: string[]
} {
  const comInicio = faturas.filter((f) => f.inicio)
  if (comInicio.length === 0) return { pontos: [], categorias: [] }

  const agora = new Date()
  const idxAgora = agora.getFullYear() * 12 + agora.getMonth()

  const spans = comInicio.map((f) => ({
    nome: f.nome,
    categoria: f.categoria || 'Sem categoria',
    i: indiceMes(f.inicio as string),
    fimF: f.status === 'Cancelada' && f.fim ? indiceMes(f.fim) : idxAgora,
    cancelMes: f.status === 'Cancelada' && f.fim ? indiceMes(f.fim) : null,
    custo: custoMensal(f),
  }))

  const inicioGlobal = Math.min(...spans.map((s) => s.i))
  const fimGlobal = Math.max(...spans.map((s) => s.fimF))
  const catSet = new Set<string>()
  const pontos: PontoMensal[] = []

  for (let m = inicioGlobal; m <= fimGlobal; m++) {
    const valores: Record<string, number> = {}
    const eventos: EventoFatura[] = []
    for (const s of spans) {
      if (m >= s.i && m <= s.fimF) {
        valores[s.categoria] = (valores[s.categoria] ?? 0) + s.custo
        catSet.add(s.categoria)
      }
      if (s.i === m) eventos.push({ tipo: 'inicio', nome: s.nome })
      if (s.cancelMes === m) eventos.push({ tipo: 'fim', nome: s.nome })
    }
    pontos.push({ mes: isoDoIndice(m), eventos, valores })
  }

  return { pontos, categorias: [...catSet] }
}
export type PontoSerie = {
  mes: string
  acumulado: number // gasto acumulado até aquele mês
  doMes: number // gasto só daquele mês
  ativas: number // quantas assinaturas ativas no mês
  ativasNomes: string[] // nomes das assinaturas ativas no mês
  eventos: EventoFatura[] // começos/cancelamentos naquele mês
}

/**
 * Série do gasto ACUMULADO ao longo do tempo (todas as assinaturas).
 * Cada assinatura contribui com seu custo mensal de `inicio` até `fim`
 * (se cancelada) ou até o mês atual (se ativa). Além do acumulado, cada
 * ponto carrega o gasto do mês, nº de ativas e os eventos (começo/cancelamento).
 */
export function serieAcumulada(faturas: Fatura[]): PontoSerie[] {
  const comInicio = faturas.filter((f) => f.inicio)
  if (comInicio.length === 0) return []

  const agora = new Date()
  const idxAgora = agora.getFullYear() * 12 + agora.getMonth()

  const spans = comInicio.map((f) => ({
    nome: f.nome,
    i: indiceMes(f.inicio as string),
    fimF: f.status === 'Cancelada' && f.fim ? indiceMes(f.fim) : idxAgora,
    cancelMes: f.status === 'Cancelada' && f.fim ? indiceMes(f.fim) : null,
    custo: custoMensal(f),
  }))

  const inicioGlobal = Math.min(...spans.map((s) => s.i))
  const fimGlobal = Math.max(...spans.map((s) => s.fimF))

  const pontos: PontoSerie[] = []
  let acumulado = 0
  for (let m = inicioGlobal; m <= fimGlobal; m++) {
    let doMes = 0
    const ativasNomes: string[] = []
    const eventos: EventoFatura[] = []
    for (const s of spans) {
      if (m >= s.i && m <= s.fimF) {
        doMes += s.custo
        ativasNomes.push(s.nome)
      }
      if (s.i === m) eventos.push({ tipo: 'inicio', nome: s.nome })
      if (s.cancelMes === m) eventos.push({ tipo: 'fim', nome: s.nome })
    }
    acumulado += doMes
    pontos.push({
      mes: isoDoIndice(m),
      acumulado,
      doMes,
      ativas: ativasNomes.length,
      ativasNomes,
      eventos,
    })
  }
  return pontos
}
