import { createContext, useContext } from 'react'
import type { Fatura } from './types'

export type FaturasContextValue = {
  faturas: Fatura[]
  salvar: (fatura: Fatura) => void // upsert: substitui se o id já existe, senão adiciona
  remover: (id: string) => void
}

export const FaturasContext = createContext<FaturasContextValue | null>(null)

// Hook de consumo: pega a lista + ações de qualquer lugar dentro do Provider.
export function useFaturas() {
  const ctx = useContext(FaturasContext)
  if (!ctx) {
    throw new Error('useFaturas precisa estar dentro de <FaturasProvider>')
  }
  return ctx
}
