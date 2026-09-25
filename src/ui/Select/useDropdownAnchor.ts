import { useEffect, useRef, useState, type CSSProperties } from 'react'

type Pos = { left: number; width: number; top?: number; bottom?: number }

// Estimativa da altura máxima do menu (bate com o max-height do CSS)
const ALTURA_MENU = 240

// Contador global de dropdowns abertos (usado pra decidir o "colar imagem")
let dropdownsAbertos = 0
export function algumDropdownAberto() {
  return dropdownsAbertos > 0
}

/**
 * Lógica compartilhada dos dropdowns: abre com position:fixed (escapa do
 * overflow do modal) e decide abrir pra BAIXO ou pra CIMA conforme o espaço
 * disponível na tela — assim os dropdowns perto do fim não "comem" a tela.
 */
export function useDropdownAnchor() {
  const [aberto, setAberto] = useState(false)
  const [pos, setPos] = useState<Pos>({ left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  const alternar = () => {
    const el = triggerRef.current
    if (el) {
      const r = el.getBoundingClientRect()
      const espacoAbaixo = window.innerHeight - r.bottom
      // Abre pra cima se não cabe embaixo e há mais espaço em cima
      const paraCima = espacoAbaixo < ALTURA_MENU && r.top > espacoAbaixo
      setPos(
        paraCima
          ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 4 }
          : { left: r.left, width: r.width, top: r.bottom + 4 },
      )
    }
    setAberto((a) => !a)
  }

  const fechar = () => setAberto(false)

  // Mantém o contador global em dia enquanto este dropdown está aberto
  useEffect(() => {
    if (!aberto) return
    dropdownsAbertos++
    return () => {
      dropdownsAbertos--
    }
  }, [aberto])

  // Estilo pronto pro <ul> do menu
  const estiloMenu: CSSProperties = {
    left: pos.left,
    width: pos.width,
    top: pos.top,
    bottom: pos.bottom,
  }

  return { aberto, setAberto, triggerRef, alternar, fechar, estiloMenu }
}
