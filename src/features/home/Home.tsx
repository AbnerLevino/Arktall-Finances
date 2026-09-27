import { useState, useEffect, useRef } from 'react'
import styles from './Home.module.css'
import { Icon } from '@/ui/Icon/Icon'
import { useReceitas } from '@/domain/receita/useReceitas'
import { useConfig } from '@/domain/config/useConfig'
import { dinheiroLivreDoMes } from '@/domain/receita/dinheiroLivre'
import { receitasDoMes } from '@/domain/receita/filtros'
import { gerarInsights } from '@/domain/insights/insights'
import { despesasPorCategoria } from '@/domain/fatura/calc'
import { calcularColchao, descreverSobrevivencia } from '@/domain/reserva/reserva'
import { mesAnterior, mesSeguinte, formatarMesAno } from '@/lib/mes'
import { formatarPreco, formatarDataCurta, formatarDataHora } from '@/lib/format'
import { useFaturas } from '@/domain/fatura/faturasStore'
import type { Receita } from '@/domain/receita/types'
import { ReceitaFormModal } from './ReceitaFormModal'

// Nome do usuário — fixo por ora (sem backend); futuramente vem do perfil/login.
const NOME_USUARIO = 'Abner Levino'

// Página inicial: a "vitrine" do dinheiro livre do mês.
export function Home() {
  const { receitas, adicionar, editar, remover } = useReceitas()
  const { config, setAliquota, setReservaAtual } = useConfig()
  const [modalAberto, setModalAberto] = useState(false)
  // receita em edição; null = modo criação
  const [receitaEditando, setReceitaEditando] = useState<Receita | null>(null)
  // relógio ao vivo do cabeçalho (mostra o "agora", atualiza a cada segundo)
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(id) // limpa o timer quando o componente sai da tela
  }, [])

  // mês em foco no card (navegável pelas setas) — começa no mês corrente
  const [mesSelecionado, setMesSelecionado] = useState(() =>
    new Date().toISOString().slice(0, 7),
  )

  // qual aviso informativo está sendo exibido agora — roda a cada 5s
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

  // despesas fixas — fonte única compartilhada (Context)
  const { faturas: despesas } = useFaturas()

  // valor DERIVADO: recalculado a cada render (não é guardado em estado).
  // Segue o MÊS SELECIONADO — muda quando as setas navegam.
  const detalhe = dinheiroLivreDoMes({
    receitas,
    despesas,
    aliquota: config.aliquotaImposto,
    mes: mesSelecionado,
  })

  // colchão de segurança: quanto ter guardado pra não fechar no vermelho no
  // próximo mês (despesas fixas + imposto a pagar). Reaproveita o imposto JÁ
  // calculado na cascata (detalhe.imposto) — fonte única da verdade.
  const colchao = calcularColchao({
    despesas,
    imposto: detalhe.imposto,
    reservaAtual: config.reservaAtual,
  })

  // receitas do mês em foco, mais recentes primeiro (para a lista)
  const receitasMes = [...receitasDoMes(receitas, mesSelecionado)].sort((a, b) =>
    b.data.localeCompare(a.data),
  )

  // avisos calculados do mês em foco, separados por hierarquia de urgência:
  // críticos ficam fixos no topo; informativos rodam dentro do card.
  const insights = gerarInsights({
    receitas,
    despesas,
    aliquota: config.aliquotaImposto,
    mes: mesSelecionado,
    detalhe,
  })
  const criticos = insights.filter((i) => i.nivel === 'critico')
  const informativos = insights.filter((i) => i.nivel === 'info')

  // troca o aviso informativo exibido a cada 5s (só se há mais de um)
  useEffect(() => {
    if (informativos.length <= 1) return
    const id = setInterval(() => {
      setInsightIdx((i) => (i + 1) % informativos.length)
    }, 5000)
    return () => clearInterval(id)
  }, [informativos.length])

  // índice seguro (a lista pode encolher ao trocar de mês) + aviso atual
  const idxAtual = informativos.length > 0 ? insightIdx % informativos.length : 0
  const insightAtual = informativos.length > 0 ? informativos[idxAtual] : null

  // despesas fixas agrupadas por categoria (maior → menor) pro pop-up
  const categoriasGasto = despesasPorCategoria(despesas)

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

          {/* Avisos CRÍTICOS — na frente da saudação, com peso de alerta */}
          {criticos.length > 0 && (
            <div className={styles.avisos}>
              {criticos.map((c) => (
                <div key={c.id} className={styles.avisoCritico} role="alert">
                  <span className={styles.avisoValor}>{c.valor}</span>
                  <span className={styles.avisoTexto}>
                    {c.rotulo}
                    {c.detalhe ? ` — ${c.detalhe}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Criar receita — dourado, à direita na linha do bem-vindo */}
          <button
            type="button"
            className={styles.criarReceita}
            onClick={() => {
              setReceitaEditando(null)
              setModalAberto(true)
            }}
          >
            <Icon name="plus" size={18} />
            Criar Receita
          </button>
        </div>
      </div>

      {/* Card 1 — Dinheiro livre (KPI + cascata + alíquota) */}
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={styles.heroMain}>
            {/* Título + navegador de mês (setas aparecem no hover) */}
            <div className={styles.mesNav}>
              <span className={styles.label}>Dinheiro livre</span>
              <div className={styles.mesStepper}>
                <button
                  type="button"
                  className={styles.mesSeta}
                  onClick={() => setMesSelecionado(mesAnterior(mesSelecionado))}
                  aria-label="Mês anterior"
                >
                  ‹
                </button>
                <span className={styles.mesLabel}>
                  {formatarMesAno(mesSelecionado)}
                </span>
                <button
                  type="button"
                  className={styles.mesSeta}
                  onClick={() => setMesSelecionado(mesSeguinte(mesSelecionado))}
                  aria-label="Próximo mês"
                >
                  ›
                </button>
              </div>
            </div>

            <span
              className={`${styles.value} ${detalhe.livre < 0 ? styles.negativo : ''}`}
            >
              {formatarPreco(detalhe.livre)}
            </span>

            {/* Aviso informativo rotativo — número em destaque (a "voz" do sistema) */}
            {insightAtual && (
              <div
                key={insightAtual.id}
                className={styles.insightCard}
                data-tom={insightAtual.tom}
              >
                <div className={styles.insightHead}>
                  <span className={styles.insightRotulo}>
                    {insightAtual.rotulo}
                  </span>
                  {informativos.length > 1 && (
                    <span className={styles.insightDots} aria-hidden="true">
                      {informativos.map((info, i) => (
                        <span
                          key={info.id}
                          className={`${styles.dot} ${i === idxAtual ? styles.dotAtivo : ''}`}
                        />
                      ))}
                    </span>
                  )}
                </div>
                <span className={styles.insightValor}>{insightAtual.valor}</span>
                {insightAtual.detalhe && (
                  <span className={styles.insightDetalhe}>
                    {insightAtual.detalhe}
                  </span>
                )}
              </div>
            )}
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
                className={`${styles.breakdownRow} ${styles.despesasBtn}`}
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

        {/* Bloco: colchão de segurança — o sistema diz quanto guardar pro próximo mês */}
        <div className={styles.reservaBloco}>
          <h3 className={styles.reservaTitulo}>
            🛡️ Quanto guardar pra não ficar no vermelho
          </h3>

          {colchao.necessario > 0 ? (
            <>
              <span className={styles.reservaValor}>
                {formatarPreco(colchao.necessario)}
              </span>
              <div className={styles.reservaComposicao}>
                No próximo mês · {formatarPreco(colchao.despesasFixas)} de
                despesas
                {colchao.imposto > 0 &&
                  ` + ${formatarPreco(colchao.imposto)} de imposto`}
              </div>

              <div className={styles.reservaBarra}>
                <div
                  className={styles.reservaBarraFill}
                  style={{ width: `${colchao.progresso}%` }}
                />
              </div>

              <div
                className={`${styles.reservaInfo} ${colchao.coberto ? styles.reservaCoberto : ''}`}
              >
                {colchao.coberto ? (
                  <>
                    ✅ Coberto! Você tem {formatarPreco(colchao.saldo)}
                    {descreverSobrevivencia(colchao.mesesSobrevivencia) && (
                      <>
                        {' · aguenta '}
                        {descreverSobrevivencia(colchao.mesesSobrevivencia)} sem
                        receita
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Você tem {formatarPreco(colchao.saldo)} ·{' '}
                    <strong className={styles.reservaFalta}>
                      faltam {formatarPreco(colchao.falta)}
                    </strong>
                  </>
                )}
              </div>
            </>
          ) : (
            <p className={styles.reservaVazio}>
              Cadastre suas despesas fixas para o sistema calcular seu colchão.
            </p>
          )}

          <label className={styles.reservaCampo}>
            <span>Quanto você já tem guardado?</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={config.reservaAtual}
              onChange={(e) => setReservaAtual(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* Card 2 — Receitas do mês (lista) */}
      <div className={styles.card}>
        <span className={styles.cardTitle}>
          Receitas de {formatarMesAno(mesSelecionado)}
        </span>

        {receitasMes.length === 0 ? (
          <p className={styles.vazio}>
            Nenhuma receita neste mês. Use o botão + para adicionar.
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
                      className={styles.editar}
                      onClick={() => {
                        setReceitaEditando(r)
                        setModalAberto(true)
                      }}
                      aria-label={`Editar receita de ${r.origem || 'origem não informada'}`}
                    >
                      <Icon name="edit" size={15} />
                    </button>
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

      {modalAberto && (
        <ReceitaFormModal
          receita={receitaEditando ?? undefined}
          onClose={() => {
            setModalAberto(false)
            setReceitaEditando(null)
          }}
          onSave={(r) => (receitaEditando ? editar(r) : adicionar(r))}
        />
      )}
    </section>
  )
}
