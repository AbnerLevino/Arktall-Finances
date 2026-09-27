import { describe, it, expect } from 'vitest'
import { impostoDaReceita, dinheiroLivreDoMes } from './dinheiroLivre'
import type { Receita } from './types'
import type { Fatura } from '@/domain/fatura/types'

// helper: cria uma despesa mensal mínima (só o preço importa pro cálculo)
function despesaMensal(preco: number): Fatura {
  return {
    id: crypto.randomUUID(), tipo: 'variavel', nome: 'x', icone: null,
    tipoPagamento: 'PIX', parcelas: null, valorParcelado: null, banco: null,
    vencimento: null, status: 'Ativa', inicio: null, fim: null,
    preco, moeda: 'BRL', periodicidade: 'Mensal', mesVencimento: null, categoria: '',
  }
}

describe('impostoDaReceita', () => {
  it('aplica a alíquota percentual sobre o valor', () => {
    expect(impostoDaReceita(1000, 6)).toBe(60)
  })
  it('alíquota zero não reserva nada', () => {
    expect(impostoDaReceita(1000, 0)).toBe(0)
  })
})

describe('dinheiroLivreDoMes', () => {
  const receitas: Receita[] = [
    { id: '1', valor: 5000, data: '2026-09-10', origem: 'Cliente A' },
    { id: '2', valor: 3000, data: '2026-09-25', origem: 'Cliente B' },
    { id: '3', valor: 9999, data: '2026-08-01', origem: 'mês anterior' }, // fora do mês
  ]

  it('detalha recebido, imposto, despesas e o livre do mês', () => {
    // receitas de 09/2026 = 8000; imposto 6% = 480; despesas = 2000
    // livre = 8000 - 480 - 2000 = 5520
    const d = dinheiroLivreDoMes({
      receitas,
      despesas: [despesaMensal(1200), despesaMensal(800)],
      aliquota: 6,
      mes: '2026-09',
    })
    expect(d.recebido).toBe(8000)
    expect(d.imposto).toBe(480)
    expect(d.despesas).toBe(2000)
    expect(d.livre).toBe(5520)
  })

  it('mês sem receita dá o negativo do custo das despesas', () => {
    const d = dinheiroLivreDoMes({
      receitas: [],
      despesas: [despesaMensal(500)],
      aliquota: 10,
      mes: '2026-09',
    })
    expect(d.livre).toBe(-500)
  })
})
