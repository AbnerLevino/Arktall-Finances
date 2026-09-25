import { describe, it, expect } from 'vitest'
import { gerarInsights } from './insights'
import { formatarPreco } from '@/lib/format'
import type { Fatura } from '@/domain/fatura/types'
import type { Receita } from '@/domain/receita/types'
import type { DetalheDinheiroLivre } from '@/domain/receita/dinheiroLivre'

function receita(valor: number, data: string): Receita {
  return { id: crypto.randomUUID(), valor, data, origem: 'x' }
}

function despesa(preco: number, categoria: string): Fatura {
  return {
    id: crypto.randomUUID(), tipo: 'variavel', nome: 'x', icone: null,
    tipoPagamento: 'PIX', parcelas: null, valorParcelado: null, banco: null,
    vencimento: null, status: 'Ativa', inicio: null, fim: null,
    preco, moeda: 'BRL', periodicidade: 'Mensal', mesVencimento: null, categoria,
  }
}

function detalhe(over: Partial<DetalheDinheiroLivre>): DetalheDinheiroLivre {
  return { recebido: 0, imposto: 0, despesas: 0, livre: 0, ...over }
}

describe('gerarInsights', () => {
  it('compara o mês atual com o anterior (recebeu mais)', () => {
    const receitas = [receita(5000, '2026-08-10'), receita(6000, '2026-09-10')]
    const insights = gerarInsights({
      receitas, despesas: [], aliquota: 10, mes: '2026-09',
      detalhe: detalhe({ recebido: 6000, imposto: 600, livre: 5400 }),
    })
    const c = insights.find((i) => i.id === 'comparacao')
    expect(c?.texto).toContain('20%')
    expect(c?.texto).toContain('a mais')
    expect(c?.tom).toBe('bom')
  })

  it('mostra a média mensal e onde o mês está em relação a ela', () => {
    const receitas = [receita(5000, '2026-08-10'), receita(6000, '2026-09-10')]
    const insights = gerarInsights({
      receitas, despesas: [], aliquota: 0, mes: '2026-09',
      detalhe: detalhe({ recebido: 6000, livre: 6000 }),
    })
    const m = insights.find((i) => i.id === 'media')
    expect(m?.texto).toContain('acima')
  })

  it('gera concentração de gasto, imposto do ano e reserva', () => {
    const receitas = [receita(10000, '2026-09-10')]
    const despesas = [despesa(1500, '🏠 Casa'), despesa(500, '🎬 Lazer')]
    const insights = gerarInsights({
      receitas, despesas, aliquota: 10, mes: '2026-09',
      detalhe: detalhe({ recebido: 10000, imposto: 1000, despesas: 2000, livre: 7000 }),
    })
    const ids = insights.map((i) => i.id)
    expect(ids).toContain('concentracao')
    expect(ids).toContain('imposto-ano')
    expect(ids).toContain('reserva')

    // Casa = 1500 de 2000 = 75% → alerta
    const conc = insights.find((i) => i.id === 'concentracao')
    expect(conc?.texto).toContain('75%')
    expect(conc?.texto).toContain('🏠 Casa')

    // imposto do ano = 10000 × 10% = 1000
    const imp = insights.find((i) => i.id === 'imposto-ano')
    expect(imp?.texto).toContain(formatarPreco(1000))

    // reserva = despesas × 3 = 6000
    const res = insights.find((i) => i.id === 'reserva')
    expect(res?.texto).toContain(formatarPreco(6000))
  })

  it('omite avisos quando faltam dados (sem mês anterior, sem despesas)', () => {
    const insights = gerarInsights({
      receitas: [receita(3000, '2026-09-10')],
      despesas: [], aliquota: 0, mes: '2026-09',
      detalhe: detalhe({ recebido: 3000, livre: 3000 }),
    })
    const ids = insights.map((i) => i.id)
    expect(ids).not.toContain('comparacao') // não há agosto
    expect(ids).not.toContain('concentracao') // não há despesas
    expect(ids).not.toContain('reserva')
  })
})
