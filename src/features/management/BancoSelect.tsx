import { useState } from 'react'
import { Icon } from '@/ui/Icon/Icon'
import {
  BANCOS,
  OUTROS_BANCOS,
  acharBanco,
  lerBancosAdicionados,
  salvarBancosAdicionados,
} from '@/domain/banco/banks'
import { useDropdownAnchor } from '@/ui/Select/useDropdownAnchor'
import styles from '@/ui/Select/Select.module.css'

type Props = {
  value: number | null
  onChange: (code: number) => void
}

/**
 * Dropdown customizado de bancos.
 * Precisa ser customizado (e não um <select> nativo) porque a tag <option>
 * do HTML não permite exibir imagens — e queremos mostrar a logo de cada banco.
 */
export function BancoSelect({ value, onChange }: Props) {
  const { aberto, setAberto, triggerRef, alternar, estiloMenu } =
    useDropdownAnchor()
  const [mostrarOutros, setMostrarOutros] = useState(false)
  const [adicionados, setAdicionados] = useState<number[]>(() =>
    lerBancosAdicionados(),
  )
  const selecionado = acharBanco(value)

  const fechar = () => {
    setAberto(false)
    setMostrarOutros(false)
  }

  // Lista principal: os 5 fixos + os secundários que o usuário já adicionou
  const principais = [
    ...BANCOS,
    ...OUTROS_BANCOS.filter((b) => adicionados.includes(b.code)),
  ]
  // No "outros", mostra só os que AINDA NÃO estão no dropdown
  const disponiveis = OUTROS_BANCOS.filter((b) => !adicionados.includes(b.code))

  // Adiciona o banco à lista, seleciona e fecha
  const adicionarBanco = (code: number) => {
    const novos = [...adicionados, code]
    setAdicionados(novos)
    salvarBancosAdicionados(novos)
    onChange(code)
    fechar()
  }

  return (
    <div className={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={alternar}
      >
        {selecionado ? (
          <span className={styles.selected}>
            {selecionado.logo && (
              <img src={selecionado.logo} alt="" className={styles.logo} />
            )}
            {selecionado.name}
          </span>
        ) : (
          <span className={styles.placeholder}>Selecione o banco</span>
        )}
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </button>

      {aberto && (
        <>
          <div className={styles.backdrop} onClick={fechar} />
          <ul className={styles.menu} style={estiloMenu}>
            {mostrarOutros ? (
              disponiveis.length > 0 ? (
                disponiveis.map((b) => (
                  <li key={b.code}>
                    <button
                      type="button"
                      className={styles.option}
                      onClick={() => adicionarBanco(b.code)}
                    >
                      {b.logo ? (
                        <img src={b.logo} alt="" className={styles.logo} />
                      ) : (
                        <span className={styles.logoPlaceholder} />
                      )}
                      {b.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className={styles.vazio}>Todos já foram adicionados</li>
              )
            ) : (
              <>
                {principais.map((b) => (
                  <li key={b.code}>
                    <button
                      type="button"
                      className={styles.option}
                      onClick={() => {
                        onChange(b.code)
                        fechar()
                      }}
                    >
                      {b.logo ? (
                        <img src={b.logo} alt="" className={styles.logo} />
                      ) : (
                        <span className={styles.logoPlaceholder} />
                      )}
                      {b.name}
                    </button>
                  </li>
                ))}

                <li>
                  <button
                    type="button"
                    className={styles.outros}
                    onClick={() => setMostrarOutros(true)}
                  >
                    <Icon name="plus" size={12} />
                    Selecionar Outros Bancos
                  </button>
                </li>
              </>
            )}
          </ul>
        </>
      )}
    </div>
  )
}
