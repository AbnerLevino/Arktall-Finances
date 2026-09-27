import { describe, it, expect } from 'vitest'
import { calcularReserva } from './reserva'
import type { Fatura } from '@/domain/fatura/types'

function despesa(preco: number): Fatura {
  return {
    id: crypto.randomUUID(), tipo: 'variavel', nome: 'x', icone: null,
    tipoPagamento: 'PIX', parcelas: null, valorParcelado: null, banco: null,
    vencimento: null, status: 'Ativa', inicio: null, fim: null,
    preco, moeda: 'BRL', periodicidade: 'Mensal', mesVencimento: null, categoria: 'x',
  }
}

describe('calcularReserva', () => {
  it('calcula meta, falta, progresso e sobrevivência', () => {
    // despesas 2000/mês, meta 3 meses = 6000; já tem 2000
    const r = calcularReserva({
      despesas: [despesa(2000)],
      reservaAtual: 2000,
      mesesMeta: 3,
    })
    expect(r.meta).toBe(6000)
    expect(r.falta).toBe(4000)
    expect(Math.round(r.progresso)).toBe(33) // 2000/6000
    expect(r.mesesSobrevivencia).toBe(1) // 2000 / 2000
  })

  it('progresso não passa de 100% e falta não fica negativa', () => {
    const r = calcularReserva({
      despesas: [despesa(1000)],
      reservaAtual: 9000, // acima da meta (3000)
      mesesMeta: 3,
    })
    expect(r.progresso).toBe(100)
    expect(r.falta).toBe(0)
  })

  it('sem despesas: meta 0 e sobrevivência null', () => {
    const r = calcularReserva({ despesas: [], reservaAtual: 500, mesesMeta: 6 })
    expect(r.meta).toBe(0)
    expect(r.mesesSobrevivencia).toBeNull()
  })
})
