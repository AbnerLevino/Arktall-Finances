import { useState, useEffect } from 'react'
import type { Config } from './types'

// "Gaveta" da configuração no localStorage
const CHAVE = 'arktall:config'

// Valor inicial se o usuário nunca configurou nada: sem imposto nem reserva.
const PADRAO: Config = { aliquotaImposto: 0, percentualReserva: 0 }

/**
 * Custom hook: a configuração do usuário + persistência no localStorage.
 * Mesmo padrão do useReceitas/useCategorias, mas guardando UM objeto
 * (não uma lista).
 */
export function useConfig() {
  // (1) memória "config": lida do localStorage uma vez, na montagem
  const [config, setConfig] = useState<Config>(() => {
    const salvo = localStorage.getItem(CHAVE)
    // merge com o PADRAO: garante campos novos (ex.: percentualReserva) em
    // configs antigas salvas antes desse campo existir.
    return salvo ? { ...PADRAO, ...JSON.parse(salvo) } : PADRAO
  })

  // (2) efeito: toda vez que "config" mudar, salva de volta
  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(config))
  }, [config])

  // (3) atualizar SÓ a alíquota, mantendo os demais campos (spread de objeto)
  const setAliquota = (n: number) => {
    setConfig((prev) => ({ ...prev, aliquotaImposto: n }))
  }

  // (4) atualizar SÓ o percentual de reserva
  const setReserva = (n: number) => {
    setConfig((prev) => ({ ...prev, percentualReserva: n }))
  }

  // (5) entrega o dado + as ações
  return { config, setAliquota, setReserva }
}
