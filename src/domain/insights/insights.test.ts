import { describe, it, expect } from 'vitest'
import { gerarInsights } from './insights'
import type { Fatura } from '@/domain/fatura/types'

function despesa(preco: number, categoria: string): Fatura {
  return {
    id: crypto.randomUUID(), tipo: 'variavel', nome: 'x', icone: null,
    tipoPagamento: 'PIX', parcelas: null, valorParcelado: null, banco: null,
    vencimento: null, status: 'Ativa', inicio: null, fim: null,
    preco, moeda: 'BRL', periodicidade: 'Mensal', mesVencimento: null, categoria,
  }
}

describe('gerarInsights', () => {
  it('gera imposto, % de despesas, maior categoria e livre positivo', () => {
    const insights = gerarInsights({
      recebido: 8000,
      imposto: 480,
      despesas: 2000,
      livre: 5520,
      despesasList: [despesa(1200, '🏠 Casa'), despesa(800, '🎬 Lazer')],
    })

    const ids = insights.map((i) => i.id)
    expect(ids).toContain('imposto')
    expect(ids).toContain('despesas-pct')
    expect(ids).toContain('maior-cat')
    expect(ids).toContain('livre')

    // maior categoria = Casa (1200 > 800)
    const maior = insights.find((i) => i.id === 'maior-cat')
    expect(maior?.texto).toContain('🏠 Casa')
  })

  it('livre negativo vira alerta', () => {
    const insights = gerarInsights({
      recebido: 0,
      imposto: 0,
      despesas: 500,
      livre: -500,
      despesasList: [despesa(500, 'x')],
    })
    const alerta = insights.find((i) => i.id === 'vermelho')
    expect(alerta?.tom).toBe('alerta')
  })
})
