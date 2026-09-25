import { Icon } from '@/components/Icon/Icon'
import { rotuloCategoria, type Categoria } from './categorias'
import { useDropdownAnchor } from './useDropdownAnchor'
import styles from './BancoSelect.module.css'

type Props = {
  value: string // rótulo da categoria selecionada (emoji + nome)
  categorias: Categoria[]
  onChange: (rotulo: string) => void
  onCriar: () => void // abre o painel de criação ao lado
}

export function CategoriaSelect({ value, categorias, onChange, onCriar }: Props) {
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
          <span className={styles.placeholder}>
            Selecione a categoria (ex: Streaming...)
          </span>
        )}
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </button>

      {aberto && (
        <>
          <div className={styles.backdrop} onClick={() => setAberto(false)} />
          <ul className={styles.menu} style={estiloMenu}>
            {categorias.length === 0 && (
              <li className={styles.vazio}>Nenhuma categoria ainda</li>
            )}
            {categorias.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={styles.option}
                  onClick={() => {
                    onChange(rotuloCategoria(c))
                    fechar()
                  }}
                >
                  {rotuloCategoria(c)}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className={styles.outros}
                onClick={() => {
                  setAberto(false)
                  onCriar()
                }}
              >
                <Icon name="plus" size={12} />
                Criar categoria
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  )
}
