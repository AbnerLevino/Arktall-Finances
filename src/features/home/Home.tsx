import { useState, useEffect, useRef } from 'react'
import styles from './Home.module.css'
import { Icon } from '@/ui/Icon/Icon'
import { useReceitas } from '@/domain/receita/useReceitas'
import { useConfig } from '@/domain/config/useConfig'
import { dinheiroLivreDoMes } from '@/domain/receita/dinheiroLivre'
import { receitasDoMes } from '@/domain/receita/filtros'
import { gerarInsights } from '@/domain/insights/insights'
import { despesasPorCategoria } from '@/domain/fatura/calc'
import { formatarPreco, formatarDataCurta, formatarDataHora } from '@/lib/format'
import type { Fatura } from '@/domain/fatura/types'
import { ReceitaFormModal } from './ReceitaFormModal'

// "Gaveta" das despesas — as mesmas que o dashboard e o Management usam
const CHAVE_FATURAS = 'arktall:faturas'
// Nome do usuário — fixo por ora (sem backend); futuramente vem do perfil/login.
const NOME_USUARIO = 'Abner Levino'

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
  // pop-up de detalhamento das despesas fixas + ref para fechar ao clicar fora
  const [despesasAbertas, setDespesasAbertas] = useState(false)
  const despesasRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!despesasAbertas) return
    function aoClicarFora(e: MouseEvent) {
      if (despesasRef.current && !despesasRef.current.contains(e.target as Node)) {
        setDespesasAbertas(false)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [despesasAbertas])

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

  // avisos "invisíveis" do mês (o que NÃO dá pra ler direto na tela):
  // tendência vs. mês passado, média, concentração, imposto do ano, reserva.
  const insights = gerarInsights({
    receitas,
    despesas,
    aliquota: config.aliquotaImposto,
    mes: mesAtual,
    detalhe,
  })

  // despesas fixas agrupadas por categoria (maior → menor) pro pop-up
  const categoriasGasto = despesasPorCategoria(despesas)

  // troca o aviso exibido a cada 20s (só faz sentido se há mais de um)
  useEffect(() => {
    if (insights.length <= 1) return
    const id = setInterval(() => {
      setInsightIdx((i) => (i + 1) % insights.length)
    }, 5000)
    return () => clearInterval(id)
  }, [insights.length])

  // o aviso atual (com guarda caso a lista encolha)
  const insightAtual =
    insights.length > 0 ? insights[insightIdx % insights.length] : null

  // saudação por horário (usa o relógio que já roda de segundo em segundo)
  const hora = agora.getHours()
  const saudacao =
    hora >= 5 && hora < 12
      ? 'Bom dia'
      : hora >= 12 && hora < 18
        ? 'Boa tarde'
        : 'Boa noite'

  // explicação CONCEITUAL da alíquota — ensina o que é, sem repetir o número
  // (o valor já aparece na cascata acima)
  const textoAliquota =
    config.aliquotaImposto > 0
      ? 'Fatia da sua receita reservada para impostos — já descontada do seu dinheiro livre.'
      : 'Defina o percentual da receita que você separa para impostos.'

  return (
    <section className={styles.page}>
      <div className={styles.intro}>
        <header className={styles.pageHeader}>
          <span className={styles.pageTitle}>{formatarDataHora(agora)}</span>
        </header>

        <div className={styles.saudacao}>
          <h1 className={styles.welcome}>
            {saudacao}, <span className={styles.nome}>{NOME_USUARIO}</span>!
          </h1>

          {insightAtual && (
            <div className={styles.insightRotativo}>
              {/* key força o remount ao trocar → replay da animação de subida */}
              <span
                key={insightAtual.id}
                className={styles.insight}
                data-tom={insightAtual.tom}
              >
                <span className={styles.insightDot} aria-hidden="true" />
                <span className={styles.insightTexto}>{insightAtual.texto}</span>
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
            <div className={styles.despesasWrap} ref={despesasRef}>
              <button
                type="button"
                className={styles.despesasBtn}
                aria-expanded={despesasAbertas}
                onClick={() => setDespesasAbertas((v) => !v)}
              >
                <span className={styles.breakdownLabel}>
                  <span className={styles.linkPontilhado}>Despesas fixas</span>
                </span>
                <span className={`${styles.breakdownValue} ${styles.desconto}`}>
                  − {formatarPreco(detalhe.despesas)}
                </span>
              </button>

              {despesasAbertas && (
                <div
                  className={styles.despesasPopover}
                  role="dialog"
                  aria-label="Onde você mais gasta"
                >
                  <span className={styles.popoverTitulo}>
                    Onde você mais gasta
                  </span>

                  {categoriasGasto.length === 0 ? (
                    <p className={styles.popoverVazio}>
                      Nenhuma despesa cadastrada.
                    </p>
                  ) : (
                    <ul className={styles.popoverLista}>
                      {categoriasGasto.map((c, i) => (
                        <li
                          key={c.categoria}
                          className={`${styles.popoverItem} ${i === 0 ? styles.popoverTop : ''}`}
                        >
                          <div className={styles.popoverCatLinha}>
                            <span className={styles.popoverNome}>
                              {c.categoria}
                            </span>
                            <span className={styles.popoverValor}>
                              {formatarPreco(c.total)}
                            </span>
                          </div>
                          <div className={styles.popoverBarra}>
                            <div
                              className={styles.popoverBarraFill}
                              style={{ width: `${c.pct}%` }}
                            />
                          </div>
                          <span className={styles.popoverPct}>
                            {c.pct}% do total
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className={styles.popoverTotal}>
                    <span>Total</span>
                    <span>{formatarPreco(detalhe.despesas)}</span>
                  </div>
                </div>
              )}
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
          <span className={styles.aliquotaHelp}>{textoAliquota}</span>
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
