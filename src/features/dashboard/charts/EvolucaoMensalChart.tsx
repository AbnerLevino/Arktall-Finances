import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatarPreco } from '@/lib/format'
import type { PontoEvolucao } from '@/domain/metricas/painel'
import styles from './EvolucaoMensalChart.module.css'

const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

// "AAAA-MM" -> "set/26"
function rotuloMes(iso: string): string {
  const [ano, m] = iso.split('-')
  return `${MESES[Number(m) - 1]}/${ano.slice(2)}`
}

// Eixo Y compacto: 10000 -> "10k"
function compacto(v: number): string {
  return v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
}

type Props = { pontos: PontoEvolucao[] }

export function EvolucaoMensalChart({ pontos }: Props) {
  const dados = pontos.map((p) => ({ ...p, rotulo: rotuloMes(p.mes) }))

  return (
    <div className={styles.wrap}>
      <span className={styles.title}>Evolução mês a mês</span>

      {dados.length === 0 ? (
        <p className={styles.vazio}>Cadastre receitas para ver a evolução.</p>
      ) : (
        <div className={styles.chart}>
          <ResponsiveContainer>
            <ComposedChart
              data={dados}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="rotulo"
                tick={{ fill: 'var(--color-icon)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--color-icon)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v) => compacto(Number(v))}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-hover)' }}
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-icon-hover)',
                }}
                formatter={(v) => formatarPreco(Number(v))}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="recebido" name="Recebido" fill="#d4af37" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" name="Despesa" fill="rgba(239, 68, 68, 0.55)" radius={[4, 4, 0, 0]} />
              <Line dataKey="livre" name="Livre" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
