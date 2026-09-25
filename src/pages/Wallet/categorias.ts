import { useState, useEffect } from 'react'

// A entidade Categoria — criada 100% pelo usuário
export type Categoria = {
  id: string
  nome: string
  emoji: string
  cor: string // hex, ex: #d4af37
}

// "Gaveta" própria das categorias no localStorage
const CHAVE = 'arktall:categorias'

/**
 * Custom hook: empacota a lista de categorias + a persistência no localStorage.
 * IMPORTANTE: chame UMA vez no componente pai e compartilhe o resultado por
 * props — se dois componentes chamarem separadamente, teriam estados distintos.
 */
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>(() => {
    const salvo = localStorage.getItem(CHAVE)
    return salvo ? JSON.parse(salvo) : []
  })

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(categorias))
  }, [categorias])

  const adicionar = (categoria: Categoria) => {
    setCategorias((prev) => [...prev, categoria])
  }

  return { categorias, adicionar }
}

// Texto de exibição de uma categoria (emoji + nome)
export function rotuloCategoria(c: Categoria): string {
  return `${c.emoji} ${c.nome}`.trim()
}
