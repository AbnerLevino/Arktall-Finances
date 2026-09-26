import { useEffect, useState, type ReactNode } from 'react'
import type { Fatura } from './types'
import { FaturasContext } from './faturasStore'

// "Gaveta" única das faturas no localStorage
const CHAVE = 'arktall:faturas'

// Provedor: segura o estado das faturas e persiste no localStorage.
// Fica no topo da árvore (App) — todas as telas leem a MESMA lista.
export function FaturasProvider({ children }: { children: ReactNode }) {
  const [faturas, setFaturas] = useState<Fatura[]>(() => {
    const salvo = localStorage.getItem(CHAVE)
    return salvo ? JSON.parse(salvo) : []
  })

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(faturas))
  }, [faturas])

  const salvar = (fatura: Fatura) => {
    setFaturas((prev) =>
      prev.some((f) => f.id === fatura.id)
        ? prev.map((f) => (f.id === fatura.id ? fatura : f))
        : [...prev, fatura],
    )
  }

  const remover = (id: string) => {
    setFaturas((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <FaturasContext.Provider value={{ faturas, salvar, remover }}>
      {children}
    </FaturasContext.Provider>
  )
}
