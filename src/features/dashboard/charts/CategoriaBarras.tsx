import { formatarPreco } from '@/lib/format'
import styles from './CategoriaBarras.module.css'

// Uma fatia do gráfico: categoria (label), valor mensal e cor.
export type FatiaGrafico = {
  label: string
  value: number
  cor: string
}

type Props = {
  data: FatiaGrafico[]
  titulo?: string
}

// Ranking horizontal genérico: rótulo + barra de proporção + % + valor.
// Usado tanto pra "gasto por categoria" quanto pra "de onde vem a renda".
export function CategoriaBarras({ data, titulo = 'Gasto por Categoria' }: Props) {
  const total = data.reduce((soma, d) => soma + d.value, 0)
  if (total === 0) return null // nada pra mostrar

  // Do maior pro menor — vira um ranking
  const ordenado = [...data].sort((a, b) => b.value - a.value)

  return (
    <div className={styles.wrap}>
      <span className={styles.title}>{titulo}</span>

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
