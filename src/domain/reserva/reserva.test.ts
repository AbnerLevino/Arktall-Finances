import { describe, it, expect } from 'vitest'
import { calcularColchao, descreverSobrevivencia } from './reserva'
import type { Fatura } from '@/domain/fatura/types'

function despesa(preco: number): Fatura {
  return {
    id: crypto.randomUUID(), tipo: 'variavel', nome: 'x', icone: null,
    tipoPagamento: 'PIX', parcelas: null, valorParcelado: null, banco: null,
    vencimento: null, status: 'Ativa', inicio: null, fim: null,
    preco, moeda: 'BRL', periodicidade: 'Mensal', mesVencimento: null, categoria: 'x',
  }
}

describe('calcularColchao', () => {
  it('necessário = despesas + imposto; calcula falta e progresso', () => {
    // despesas 1200 + imposto 300 = necessário 1500; já tem 800
    const r = calcularColchao({
      despesas: [despesa(1200)],
      imposto: 300,
      reservaAtual: 800,
    })
    expect(r.necessario).toBe(1500)
    expect(r.despesasFixas).toBe(1200)
    expect(r.imposto).toBe(300)
    expect(r.falta).toBe(700)
    expect(Math.round(r.progresso)).toBe(53) // 800/1500
    expect(r.coberto).toBe(false)
  })

  it('saldo cobre o necessário: coberto, falta 0, progresso capado em 100', () => {
    const r = calcularColchao({
      despesas: [despesa(1000)],
      imposto: 0,
      reservaAtual: 2000, // acima do necessário (1000)
    })
    expect(r.coberto).toBe(true)
    expect(r.falta).toBe(0)
    expect(r.progresso).toBe(100)
    expect(r.mesesSobrevivencia).toBe(2) // 2000 ÷ 1000 de custo fixo
  })

  it('sem despesas nem imposto: necessário 0 e sobrevivência null', () => {
    const r = calcularColchao({ despesas: [], imposto: 0, reservaAtual: 500 })
    expect(r.necessario).toBe(0)
    expect(r.mesesSobrevivencia).toBeNull()
    expect(r.coberto).toBe(false)
  })
})

describe('descreverSobrevivencia', () => {
  it('a partir de 1 mês, fala em meses', () => {
    expect(descreverSobrevivencia(1)).toBe('1 mês')
    expect(descreverSobrevivencia(2.4)).toBe('2 meses')
    expect(descreverSobrevivencia(3)).toBe('3 meses')
  })

  it('abaixo de 1 mês, fala em dias', () => {
    expect(descreverSobrevivencia(0.6)).toBe('18 dias') // 0,6 × 30
    expect(descreverSobrevivencia(0.5)).toBe('15 dias')
    expect(descreverSobrevivencia(1 / 30)).toBe('1 dia')
  })

  it('sem despesas (null) não descreve nada', () => {
    expect(descreverSobrevivencia(null)).toBeNull()
  })
})
