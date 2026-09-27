import { describe, it, expect } from 'vitest'
import { metricasDoPainel, evolucaoMensal, rendaPorOrigem } from './painel'
import type { Receita } from '@/domain/receita/types'
import type { Fatura } from '@/domain/fatura/types'

function receita(valor: number, data: string, origem = 'x'): Receita {
  return { id: crypto.randomUUID(), valor, data, origem }
}

function despesa(preco: number): Fatura {
  return {
    id: crypto.randomUUID(), tipo: 'variavel', nome: 'x', icone: null,
    tipoPagamento: 'PIX', parcelas: null, valorParcelado: null, banco: null,
    vencimento: null, status: 'Ativa', inicio: null, fim: null,
    preco, moeda: 'BRL', periodicidade: 'Mensal', mesVencimento: null, categoria: 'x',
  }
}

describe('metricasDoPainel', () => {
  it('calcula comprometimento, taxa de sobra, média e variação', () => {
    const receitas = [receita(5000, '2026-08-10'), receita(10000, '2026-09-10')]
    const m = metricasDoPainel({
      receitas, despesas: [despesa(2000)], aliquota: 10, mes: '2026-09', reserva: 0,
    })
    // set: recebido 10000, imposto 1000, despesa 2000 → comprometido 3000 = 30%
    expect(Math.round(m.comprometimento!)).toBe(30)
    // sobra 7000 / 10000 = 70%
    expect(Math.round(m.taxaSobra!)).toBe(70)
    // média (5000 + 10000) / 2 meses = 7500
    expect(m.mediaMensal).toBe(7500)
    // variação: (10000 - 5000)/5000 = 100%
    expect(Math.round(m.variacao!)).toBe(100)
  })

  it('devolve null quando não há base (sem receita no mês, sem mês anterior)', () => {
    const m = metricasDoPainel({
      receitas: [], despesas: [despesa(500)], aliquota: 10, mes: '2026-09', reserva: 0,
    })
    expect(m.comprometimento).toBeNull()
    expect(m.taxaSobra).toBeNull()
    expect(m.variacao).toBeNull()
    expect(m.mediaMensal).toBe(0)
  })

  it('calcula o cofre acumulado e os meses de sobrevivência', () => {
    const receitas = [receita(5000, '2026-08-10'), receita(5000, '2026-09-10')]
    const m = metricasDoPainel({
      receitas, despesas: [despesa(2000)], aliquota: 0, mes: '2026-09', reserva: 20,
    })
    // cofre = (5000 + 5000) × 20% = 2000
    expect(m.cofre).toBe(2000)
    // sobrevivência = cofre 2000 ÷ despesa mensal 2000 = 1 mês
    expect(m.mesesSobrevivencia).toBe(1)
  })
})

describe('evolucaoMensal', () => {
  it('gera um ponto por mês com receita, ordenado do mais antigo', () => {
    const receitas = [receita(10000, '2026-09-10'), receita(5000, '2026-08-10')]
    const pontos = evolucaoMensal({
      receitas, despesas: [despesa(2000)], aliquota: 10, reserva: 0,
    })
    expect(pontos.map((p) => p.mes)).toEqual(['2026-08', '2026-09'])
    expect(pontos[1]).toMatchObject({
      recebido: 10000, despesa: 2000, imposto: 1000, livre: 7000,
    })
  })
})

describe('rendaPorOrigem', () => {
  it('soma por origem, calcula % e ordena do maior', () => {
    const receitas = [
      receita(7000, '2026-09-01', 'Cliente A'),
      receita(3000, '2026-09-02', 'Cliente B'),
      receita(1000, '2026-09-03', 'Cliente A'),
    ]
    const fatias = rendaPorOrigem(receitas)
    // Cliente A = 8000 (maior), Cliente B = 3000
    expect(fatias[0]).toMatchObject({ origem: 'Cliente A', total: 8000 })
    expect(fatias[0].pct).toBe(73) // 8000 / 11000
    expect(fatias[1]).toMatchObject({ origem: 'Cliente B', total: 3000 })
  })
})
