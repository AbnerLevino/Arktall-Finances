import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { formatarPreco } from './format'
import type { PontoMensal, EventoFatura } from './calc'
import styles from './EvolucaoChart.module.css'

const CINZA = '#a1a1aa'
const BORDA = '#2a2a30'

type Props = {
  pontos: PontoMensal[]
  categorias: string[] // rótulos das categorias presentes (ordem das barras)
  cores: Record<string, string> // rótulo -> cor
}

// "2026-01" -> "01/26"
function fmtMes(iso: string): string {
  const [ano, mes] = iso.split('-')
  return `${mes}/${ano.slice(2)}`
}

// Tooltip: total do mês + quebra por categoria + eventos
type TooltipProps = {
  active?: boolean
  label?: string | number
  payload?: { dataKey: string; value: number; color: string }[]
  eventosPorMes?: Record<string, EventoFatura[]>
}

function TooltipMensal({
  active,
  label,
  payload,
  eventosPorMes,
}: TooltipProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  const eventos = eventosPorMes?.[String(label)] ?? []

  return (
    <div className={styles.tip}>
      <div className={styles.tipMes}>{fmtMes(String(label))}</div>
      <div className={styles.tipLinha}>
        <span>Total</span>
        <strong>{formatarPreco(total)}</strong>
      </div>

      <div className={styles.tipCats}>
        {payload
          .filter((p) => p.value > 0)
          .map((p) => (
            <div key={p.dataKey} className={styles.tipCat}>
              <span className={styles.dot} style={{ background: p.color }} />
              <span className={styles.tipCatNome}>{p.dataKey}</span>
              <span className={styles.tipCatVal}>{formatarPreco(p.value)}</span>
            </div>
          ))}
      </div>

      {eventos.map((e, i) => (
        <div
          key={i}
          className={e.tipo === 'fim' ? styles.tipFim : styles.tipInicio}
        >
          {e.tipo === 'fim' ? '✕ Cancelou' : '＋ Começou'}: {e.nome}
        </div>
      ))}
    </div>
  )
}

export function GastoMensalChart({ pontos, categorias, cores }: Props) {
  if (pontos.length === 0) return null

  // Recharts precisa dos valores como chaves no topo da linha
  const data = pontos.map((p) => ({ mes: p.mes, ...p.valores }))
  const eventosPorMes: Record<string, EventoFatura[]> = {}
  for (const p of pontos) eventosPorMes[p.mes] = p.eventos

  const larguraMin = Math.max(600, pontos.length * 46)

  return (
    <div className={styles.chart}>
      <span className={styles.title}>Gasto Mensal por Categoria</span>
      <div className={styles.scroll}>
        <div style={{ width: larguraMin, height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid stroke={BORDA} vertical={false} />
              <XAxis
                dataKey="mes"
                tickFormatter={fmtMes}
                tick={{ fontSize: 11, fill: CINZA }}
                tickLine={false}
                axisLine={{ stroke: BORDA }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={48}
              />
              <YAxis
                tickFormatter={(v) => formatarPreco(v)}
                tick={{ fontSize: 11, fill: CINZA }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<TooltipMensal eventosPorMes={eventosPorMes} />}
              />
              {categorias.map((label) => (
                <Bar
                  key={label}
                  dataKey={label}
                  stackId="gasto"
                  fill={cores[label] ?? '#6b7280'}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
