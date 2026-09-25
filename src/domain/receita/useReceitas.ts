import { useState, useEffect } from 'react'
import type { Receita } from './types'

// "Gaveta" própria das receitas no localStorage
const CHAVE = 'arktall:receitas'

/**
 * Custom hook: a lista de receitas + a persistência no localStorage.
 * Mesmo padrão do useCategorias — chame UMA vez no componente pai e
 * compartilhe o resultado por props (dois usos separados teriam estados distintos).
 */
export function useReceitas() {
  // (1) memória "receitas": lida do localStorage UMA vez, na montagem (lazy initializer)
  const [receitas, setReceitas] = useState<Receita[]>(() => {
    const salvo = localStorage.getItem(CHAVE)
    return salvo ? JSON.parse(salvo) : []
  })

  // (2) efeito: toda vez que "receitas" mudar, salva de volta no localStorage
  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(receitas))
  }, [receitas])

  // (3) adicionar: cria uma NOVA lista com o item novo (imutabilidade)
  const adicionar = (receita: Receita) => {
    setReceitas((prev) => [...prev, receita])
  }

  // (4) entrega o dado + a ação pra quem usar o hook
  return { receitas, adicionar }
}
