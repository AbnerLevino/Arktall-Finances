import { formatarPreco } from './format'
import type { FatiaGrafico } from './CategoriaChart'
import styles from './CategoriaBarras.module.css'

type Props = {
  data: FatiaGrafico[]
}

// Ranking de gasto por categoria: nome + barra de proporção + % + valor.
// Substitui a rosca — mesma informação, mais legível.
export function CategoriaBarras({ data }: Props) {
  const total = data.reduce((soma, d) => soma + d.value, 0)
  if (total === 0) return null // nada pra mostrar

  // Do maior pro menor gasto — vira um ranking
  const ordenado = [...data].sort((a, b) => b.value - a.value)

  return (
    <div className={styles.wrap}>
      <span className={styles.title}>Gasto por Categoria</span>

      <ul className={styles.list}>
        {ordenado.map((d) => {
          const pct = (d.value / total) * 100
          return (
            <li key={d.label} className={styles.row}>
              <span className={styles.label}>{d.label}</span>
              <span className={styles.track}>
                <span
                  className={styles.fill}
                  style={{ width: `${pct}%`, background: d.cor }}
                />
              </span>
              <span className={styles.pct}>{Math.round(pct)}%</span>
              <span className={styles.valor}>{formatarPreco(d.value)}</span>
            </li>
          )
        })}
      </ul>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValor}>{formatarPreco(total)}</span>
      </div>
    </div>
  )
}
