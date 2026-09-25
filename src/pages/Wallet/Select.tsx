import { useDropdownAnchor } from './useDropdownAnchor'
import styles from './BancoSelect.module.css'

type Props = {
  value: string
  onChange: (valor: string) => void
  options: string[]
  placeholder?: string
}

/**
 * Dropdown genérico (mesmo visual/comportamento do BancoSelect, porém só texto).
 * Usado onde não há logo — Tipo de Pagamento, Categoria, etc.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
}: Props) {
  const { aberto, setAberto, triggerRef, alternar, fechar, estiloMenu } =
    useDropdownAnchor()

  return (
    <div className={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={alternar}
      >
        {value ? (
          <span className={styles.selected}>{value}</span>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </button>

      {aberto && (
        <>
          <div className={styles.backdrop} onClick={() => setAberto(false)} />
          <ul className={styles.menu} style={estiloMenu}>
            {options.map((op) => (
              <li key={op}>
                <button
                  type="button"
                  className={styles.option}
                  onClick={() => {
                    onChange(op)
                    fechar()
                  }}
                >
                  {op}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
