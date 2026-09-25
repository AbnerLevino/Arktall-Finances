import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
  Customized,
  ResponsiveContainer,
  useXAxisScale,
  useYAxisScale,
} from 'recharts'
import { formatarPreco } from '@/lib/format'
import type { PontoSerie } from '@/domain/fatura/calc'
import styles from './EvolucaoChart.module.css'

const OURO = '#d4af37'
const CINZA = '#a1a1aa'
const BORDA = '#2a2a30'
const VERMELHO = '#ef4444'
const VERDE = '#10b981'
const CINZA_CAIXA = '#3f3f46' // fundo cinza das anotações

type Props = {
  data: PontoSerie[]
}

// "2026-01" -> "01/26"
function fmtMes(iso: string): string {
  const [ano, mes] = iso.split('-')
  return `${mes}/${ano.slice(2)}`
}

// Tooltip enxuto: só os números do mês (os eventos viram anotação fixa)
type TooltipProps = {
  active?: boolean
  payload?: { payload: PontoSerie }[]
}

function TooltipRico({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload

  return (
    <div className={styles.tip}>
      <div className={styles.tipMes}>{fmtMes(p.mes)}</div>
      <div className={styles.tipLinha}>
        <span>Acumulado</span>
        <strong>{formatarPreco(p.acumulado)}</strong>
      </div>
      <div className={styles.tipLinha}>
        <span>Gasto no mês</span>
        <span>{formatarPreco(p.doMes)}</span>
      </div>
    </div>
  )
}

/**
 * Anotações fixas: pra cada mês com evento, desenha uma linha pontilhada
 * saindo do ponto até uma caixinha com o que começou/cancelou. Fica sempre
 * visível (opacidade menor) — informa sem precisar passar o mouse.
 * Usa os "mapas" de eixo do Recharts pra converter mês/valor em pixels.
 */
function Anotacoes({ pontos }: { pontos?: PontoSerie[] }) {
  // Hooks do Recharts v3: dão as escalas dos eixos (mês/valor -> pixel)
  const xScale = useXAxisScale()
  const yScale = useYAxisScale()
  if (!pontos || !xScale || !yScale) return null

  return (
    <g>
      {pontos.map((p) => {
        const x = Number(xScale(p.mes))
        const y = Number(yScale(p.acumulado))
        const temFim = p.eventos.some((e) => e.tipo === 'fim')
        const cor = temFim ? VERMELHO : VERDE
        const linhas = p.eventos.map(
          (e) => `${e.tipo === 'fim' ? '✕' : '＋'} ${e.nome}`,
        )
        const w = 96
        const h = linhas.length * 13 + 6
        const GAP = 38 // sobe mais, afastando a caixa do ponto

        // Vira a caixa pra baixo quando não há espaço acima do ponto
        const cabeAcima = y - GAP - h >= 2
        const caixaY = cabeAcima ? y - GAP - h : y + GAP
        const linhaFim = cabeAcima ? y - GAP : y + GAP

        return (
          <g key={p.mes} opacity={0.5}>
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={linhaFim}
              stroke={cor}
              strokeDasharray="3 3"
            />
            <rect
              x={x - w / 2}
              y={caixaY}
              width={w}
              height={h}
              rx={3}
              fill={CINZA_CAIXA}
              stroke={cor}
            />
            {linhas.map((t, i) => (
              <text
                key={i}
                x={x}
                y={caixaY + 13 + i * 13}
                textAnchor="middle"
                fontSize={10}
                fill="#fafafa"
              >
                {t}
              </text>
            ))}
          </g>
        )
      })}
    </g>
  )
}

export function EvolucaoChart({ data }: Props) {
  if (data.length === 0) return null

  // Largura mínima proporcional aos meses — se passar da tela, rola na horizontal
  const larguraMin = Math.max(600, data.length * 46)

  // Meses com evento (início/cancelamento) — pra marcar e anotar
  const cancelamentos = data.filter((p) =>
    p.eventos.some((e) => e.tipo === 'fim'),
  )
  const inicios = data.filter((p) => p.eventos.some((e) => e.tipo === 'inicio'))
  const comEventos = data.filter((p) => p.eventos.length > 0)

  return (
    <div className={styles.chart}>
      <span className={styles.title}>Gasto Acumulado</span>
      <div className={styles.scroll}>
        <div style={{ width: larguraMin, height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 64, right: 16, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="gradOuro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={OURO} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={OURO} stopOpacity={0} />
                </linearGradient>
              </defs>
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
                content={<TooltipRico />}
                cursor={{ stroke: BORDA, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="acumulado"
                stroke={OURO}
                strokeWidth={2}
                fill="url(#gradOuro)"
              />
              {inicios.map((p) => (
                <ReferenceDot
                  key={`i-${p.mes}`}
                  x={p.mes}
                  y={p.acumulado}
                  r={5}
                  fill={VERDE}
                  stroke="#1a1a1e"
                  strokeWidth={2}
                />
              ))}
              {cancelamentos.map((p) => (
                <ReferenceDot
                  key={`c-${p.mes}`}
                  x={p.mes}
                  y={p.acumulado}
                  r={5}
                  fill={VERMELHO}
                  stroke="#1a1a1e"
                  strokeWidth={2}
                />
              ))}
              <Customized component={<Anotacoes pontos={comEventos} />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
