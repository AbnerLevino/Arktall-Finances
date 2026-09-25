import { useState, useEffect } from 'react'
import styles from './Home.module.css'
import { Icon } from '@/ui/Icon/Icon'
import { useReceitas } from '@/domain/receita/useReceitas'
import { useConfig } from '@/domain/config/useConfig'
import { dinheiroLivreDoMes } from '@/domain/receita/dinheiroLivre'
import { receitasDoMes } from '@/domain/receita/filtros'
import { gerarInsights } from '@/domain/insights/insights'
import { formatarPreco, formatarDataCurta, formatarDataHora } from '@/lib/format'
import type { Fatura } from '@/domain/fatura/types'
import { ReceitaFormModal } from './ReceitaFormModal'

// "Gaveta" das despesas — as mesmas que o dashboard e o Management usam
const CHAVE_FATURAS = 'arktall:faturas'

// Página inicial: a "vitrine" do dinheiro livre do mês.
export function Home() {
  const { receitas, adicionar, remover } = useReceitas()
  const { config, setAliquota } = useConfig()
  const [modalAberto, setModalAberto] = useState(false)
  // relógio ao vivo do cabeçalho (atualiza a cada segundo)
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(id) // limpa o timer quando o componente sai da tela
  }, [])
  // qual aviso (insight) está sendo exibido agora — roda a cada 20s
  const [insightIdx, setInsightIdx] = useState(0)

  // despesas fixas já cadastradas (leitura única, mesmo padrão do dashboard)
  const [despesas] = useState<Fatura[]>(() => {
    const salvo = localStorage.getItem(CHAVE_FATURAS)
    return salvo ? JSON.parse(salvo) : []
  })

  const mesAtual = new Date().toISOString().slice(0, 7) // "AAAA-MM"

  // valor DERIVADO: recalculado a cada render (não é guardado em estado).
  // Agora vem o detalhamento inteiro da cascata, não só o número final.
  const detalhe = dinheiroLivreDoMes({
    receitas,
    despesas,
    aliquota: config.aliquotaImposto,
    mes: mesAtual,
  })

  // receitas deste mês, mais recentes primeiro (para a tabela)
  const receitasMes = [...receitasDoMes(receitas, mesAtual)].sort((a, b) =>
    b.data.localeCompare(a.data),
  )

  // avisos calculados do mês (a "voz" do sistema — no futuro, verbalizados por IA)
  const insights = gerarInsights({
    recebido: detalhe.recebido,
    imposto: detalhe.imposto,
    despesas: detalhe.despesas,
    livre: detalhe.livre,
    despesasList: despesas,
  })

  // troca o aviso exibido a cada 20s (só faz sentido se há mais de um)
  useEffect(() => {
    if (insights.length <= 1) return
    const id = setInterval(() => {
      setInsightIdx((i) => (i + 1) % insights.length)
    }, 20000)
    return () => clearInterval(id)
  }, [insights.length])

  // o aviso atual (com guarda caso a lista encolha)
  const insightAtual =
    insights.length > 0 ? insights[insightIdx % insights.length] : null

  return (
    <section className={styles.page}>
      <div className={styles.intro}>
        <header className={styles.pageHeader}>
          <span className={styles.pageTitle}>{formatarDataHora(agora)}</span>
        </header>

        <div className={styles.saudacao}>
          <h1 className={styles.welcome}>Bem-vindo, Grande Empreendedor!</h1>

          {insightAtual && (
            <div className={styles.insightRotativo}>
              {/* key força o remount ao trocar → replay da animação de subida */}
              <span
                key={insightAtual.id}
                className={styles.insight}
                data-tom={insightAtual.tom}
              >
                {insightAtual.texto}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card 1 — Dinheiro livre (KPI + cascata + alíquota) */}
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={styles.heroMain}>
            <span className={styles.label}>Dinheiro livre este mês</span>
            <span
              className={`${styles.value} ${detalhe.livre < 0 ? styles.negativo : ''}`}
            >
              {formatarPreco(detalhe.livre)}
            </span>
          </div>

          <div className={styles.divider} />

          <div className={styles.breakdown}>
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>Recebido</span>
              <span className={styles.breakdownValue}>
                {formatarPreco(detalhe.recebido)}
              </span>
            </div>
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>
                Imposto ({config.aliquotaImposto}%)
              </span>
              <span className={`${styles.breakdownValue} ${styles.desconto}`}>
                − {formatarPreco(detalhe.imposto)}
              </span>
            </div>
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>Despesas fixas</span>
              <span className={`${styles.breakdownValue} ${styles.desconto}`}>
                − {formatarPreco(detalhe.despesas)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <label className={styles.aliquota}>
            <span>Alíquota de imposto (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={config.aliquotaImposto}
              onChange={(e) => setAliquota(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* Card 2 — Receitas do mês (lista) */}
      <div className={styles.card}>
        <span className={styles.cardTitle}>Receitas do mês</span>

        {receitasMes.length === 0 ? (
          <p className={styles.vazio}>
            Nenhuma receita cadastrada este mês. Use o botão + para adicionar.
          </p>
        ) : (
          <div className={styles.listWrap}>
            <ul className={styles.list}>
              {receitasMes.map((r) => (
                <li key={r.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemOrigem}>
                      {r.origem || 'Sem origem'}
                    </span>
                    <span className={styles.itemData}>
                      {formatarDataCurta(r.data)}
                    </span>
                  </div>
                  <div className={styles.itemDireita}>
                    <span className={styles.itemValor}>
                      + {formatarPreco(r.valor)}
                    </span>
                    <button
                      type="button"
                      className={styles.remover}
                      onClick={() => remover(r.id)}
                      aria-label={`Excluir receita de ${r.origem || 'origem não informada'}`}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="button"
        className={styles.fab}
        onClick={() => setModalAberto(true)}
        aria-label="Nova receita"
      >
        +
      </button>

      {modalAberto && (
        <ReceitaFormModal
          onClose={() => setModalAberto(false)}
          onSave={adicionar}
        />
      )}
    </section>
  )
}
