import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { formatarPreco } from '@/lib/format'
import { formatarMesIdx, type FaixaTimeline } from '@/domain/fatura/calc'
import styles from './EvolucaoChart.module.css'

const CINZA = '#a1a1aa'
const BORDA = '#2a2a30'
const CINZA_BARRA = '#6b7280'

type Props = {
  faixas: FaixaTimeline[]
  min: number
  max: number
  cores: Record<string, string>
}

type TooltipProps = {
  active?: boolean
  payload?: { payload: FaixaTimeline }[]
}

function TooltipTimeline({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const f = payload[0].payload

  return (
    <div className={styles.tip}>
      <div className={styles.tipMes}>{f.nome}</div>
      <div className={styles.tipLinha}>
        <span>Categoria</span>
        <span>{f.categoria}</span>
      </div>
      <div className={styles.tipLinha}>
        <span>Período</span>
        <span>
          {formatarMesIdx(f.inicioIdx)} –{' '}
          {f.ativa ? 'agora' : formatarMesIdx(f.fimIdx)}
        </span>
      </div>
      <div className={styles.tipLinha}>
        <span>Duração</span>
        <span>
          {f.meses} {f.meses === 1 ? 'mês' : 'meses'}
        </span>
      </div>
      <div className={styles.tipLinha}>
        <span>Total gasto</span>
        <strong>{formatarPreco(f.totalGasto)}</strong>
      </div>
    </div>
  )
}

export function TimelineChart({ faixas, min, max, cores }: Props) {
  if (faixas.length === 0) return null

  // Marcas de ano (Janeiros) dentro do intervalo; fallback pros extremos
  const ticks: number[] = []
  let t = min - (min % 12)
  if (t < min) t += 12
  for (; t <= max; t += 12) ticks.push(t)
  if (ticks.length < 2) ticks.splice(0, ticks.length, min, max)

  const altura = faixas.length * 34 + 56

  return (
    <div className={styles.chart}>
      <span className={styles.title}>Linha do Tempo das Assinaturas</span>
      <div style={{ width: '100%', height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={faixas}
            margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
          >
            <CartesianGrid stroke={BORDA} horizontal={false} />
            <XAxis
              type="number"
              domain={[min, max]}
              ticks={ticks}
              tickFormatter={formatarMesIdx}
              tick={{ fontSize: 11, fill: CINZA }}
              tickLine={false}
              axisLine={{ stroke: BORDA }}
            />
            <YAxis
              type="category"
              dataKey="nome"
              width={110}
              tick={{ fontSize: 12, fill: '#fafafa' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              content={<TooltipTimeline />}
            />
            <Bar dataKey="range" barSize={16} radius={4}>
              {faixas.map((f, i) => (
                <Cell
                  key={i}
                  fill={cores[f.categoria] ?? CINZA_BARRA}
                  fillOpacity={f.ativa ? 0.95 : 0.45}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
