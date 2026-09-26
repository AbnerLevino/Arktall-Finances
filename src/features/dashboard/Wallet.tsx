import styles from './Wallet.module.css'
import { useReceitas } from '@/domain/receita/useReceitas'
import { useFaturas } from '@/domain/fatura/faturasStore'
import { useConfig } from '@/domain/config/useConfig'
import {
  metricasDoPainel,
  evolucaoMensal,
  rendaPorOrigem,
} from '@/domain/metricas/painel'
import { formatarPreco } from '@/lib/format'
import { EvolucaoMensalChart } from './charts/EvolucaoMensalChart'
import { CategoriaBarras } from './charts/CategoriaBarras'

// Cores das barras de "de onde vem a renda" (tons dourados + neutro no fim)
const PALETA = ['#d4af37', '#c9a227', '#e6c866', '#b8942a', '#8a6d1f', '#6b7280']

// Painel: a ANÁLISE do mês (razões, tendência, origem da renda) — o que a
// Home (vitrine) não mostra.
export function Wallet() {
  const { receitas } = useReceitas()
  const { faturas } = useFaturas()
  const { config } = useConfig()
  const mesAtual = new Date().toISOString().slice(0, 7)

  const metricas = metricasDoPainel({
    receitas,
    despesas: faturas,
    aliquota: config.aliquotaImposto,
    mes: mesAtual,
  })

  const evolucao = evolucaoMensal({
    receitas,
    despesas: faturas,
    aliquota: config.aliquotaImposto,
  })

  const renda = rendaPorOrigem(receitas).map((r, i) => ({
    label: r.origem,
    value: r.total,
    cor: PALETA[i % PALETA.length],
  }))

  const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v)}%`)

  return (
    <section className={styles.page}>
      <div className={styles.pageContent}>
        <div className={styles.kpis}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Comprometimento</span>
            <span className={styles.kpiValue}>{pct(metricas.comprometimento)}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Taxa de sobra</span>
            <span className={styles.kpiValue}>{pct(metricas.taxaSobra)}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Média mensal</span>
            <span className={styles.kpiValue}>
              {formatarPreco(metricas.mediaMensal)}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Vs. mês passado</span>
            <span className={styles.kpiValue}>{pct(metricas.variacao)}</span>
          </div>
        </div>

        <EvolucaoMensalChart pontos={evolucao} />

        <CategoriaBarras data={renda} titulo="De onde vem sua renda" />
      </div>
    </section>
  )
}
