import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatarPreco } from './format'
import styles from './CategoriaChart.module.css'

export type FatiaGrafico = {
  label: string
  value: number
  cor: string
}

type Props = {
  data: FatiaGrafico[]
}

export function CategoriaChart({ data }: Props) {
  const total = data.reduce((soma, d) => soma + d.value, 0)
  if (total === 0) return null // nada pra desenhar

  return (
    <div className={styles.chart}>
      <div className={styles.donut}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={42}
              outerRadius={64}
              paddingAngle={2}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.cor} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Furo central com o total */}
        <div className={styles.hole}>
          <span className={styles.holeLabel}>Total/mês</span>
          <span className={styles.holeValue}>{formatarPreco(total)}</span>
        </div>
      </div>

      <ul className={styles.legend}>
        {data.map((d) => {
          const pct = Math.round((d.value / total) * 100)
          return (
            <li key={d.label} className={styles.legendItem}>
              <span className={styles.dot} style={{ background: d.cor }} />
              <span className={styles.legendLabel}>{d.label}</span>
              <span className={styles.legendPct}>{pct}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
