import { useEffect, useState } from 'react'

export type Tema = 'dark' | 'light'

const CHAVE = 'arktall:tema'

// Lê a escolha salva; se não houver (ou for inválida), começa no escuro.
function temaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE)
  return salvo === 'light' || salvo === 'dark' ? salvo : 'dark'
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaInicial)

  // Efeito colateral: sempre que `tema` muda, aplica no <html> e salva.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    localStorage.setItem(CHAVE, tema)
  }, [tema])

  // Alterna entre os dois
  const alternar = () => setTema((t) => (t === 'dark' ? 'light' : 'dark'))

  return { tema, alternar }
}
