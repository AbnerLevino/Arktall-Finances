import { useState } from 'react'
import styles from './Home.module.css'
import { Icon } from '@/ui/Icon/Icon'
import { useReceitas } from '@/domain/receita/useReceitas'
import { useConfig } from '@/domain/config/useConfig'
import { dinheiroLivreDoMes } from '@/domain/receita/dinheiroLivre'
import { receitasDoMes } from '@/domain/receita/filtros'
import { formatarPreco, formatarData } from '@/lib/format'
import type { Fatura } from '@/domain/fatura/types'
import { ReceitaFormModal } from './ReceitaFormModal'

// "Gaveta" das despesas — as mesmas que o dashboard e o Management usam
const CHAVE_FATURAS = 'arktall:faturas'

// Página inicial: a "vitrine" do dinheiro livre do mês.
export function Home() {
  const { receitas, adicionar, remover } = useReceitas()
  const { config, setAliquota } = useConfig()
  const [modalAberto, setModalAberto] = useState(false)

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

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
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

      <section className={styles.section}>
        <span className={styles.sectionTitle}>Receitas do mês</span>

        {receitasMes.length === 0 ? (
          <p className={styles.vazio}>
            Nenhuma receita cadastrada este mês. Use o botão + para adicionar.
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Origem</th>
                <th className={styles.right}>Valor</th>
                <th className={styles.right} aria-label="Ações"></th>
              </tr>
            </thead>
            <tbody>
              {receitasMes.map((r) => (
                <tr key={r.id}>
                  <td>{formatarData(r.data)}</td>
                  <td>{r.origem || '—'}</td>
                  <td className={`${styles.right} ${styles.valorCell}`}>
                    {formatarPreco(r.valor)}
                  </td>
                  <td className={styles.right}>
                    <button
                      type="button"
                      className={styles.remover}
                      onClick={() => remover(r.id)}
                      aria-label={`Excluir receita de ${r.origem || 'origem não informada'}`}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

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
