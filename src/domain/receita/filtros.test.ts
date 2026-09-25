import { describe, it, expect } from 'vitest'
import { receitasDoMes } from './filtros'
import type { Receita } from './types'

const receitas: Receita[] = [
  { id: '1', valor: 100, data: '2026-09-10', origem: 'A' },
  { id: '2', valor: 200, data: '2026-09-30', origem: 'B' },
  { id: '3', valor: 300, data: '2026-08-01', origem: 'C' },
]

describe('receitasDoMes', () => {
  it('retorna só as receitas do mês pedido', () => {
    const r = receitasDoMes(receitas, '2026-09')
    expect(r).toHaveLength(2)
    expect(r.map((x) => x.id)).toEqual(['1', '2'])
  })

  it('mês sem receitas retorna lista vazia', () => {
    expect(receitasDoMes(receitas, '2026-01')).toHaveLength(0)
  })
})
