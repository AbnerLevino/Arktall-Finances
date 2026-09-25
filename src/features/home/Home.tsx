import { useState } from 'react'
import styles from './Home.module.css'
import { useReceitas } from '@/domain/receita/useReceitas'
import { useConfig } from '@/domain/config/useConfig'
import { dinheiroLivreDoMes } from '@/domain/receita/dinheiroLivre'
import { formatarPreco } from '@/lib/format'
import type { Fatura } from '@/domain/fatura/types'
import { ReceitaFormModal } from './ReceitaFormModal'

// "Gaveta" das despesas — as mesmas que o dashboard e o Management usam
const CHAVE_FATURAS = 'arktall:faturas'

// Página inicial: a "vitrine" do dinheiro livre do mês.
export function Home() {
  const { receitas, adicionar } = useReceitas()
  const { config, setAliquota } = useConfig()
  const [modalAberto, setModalAberto] = useState(false)

  // despesas fixas já cadastradas (leitura única, mesmo padrão do dashboard)
  const [despesas] = useState<Fatura[]>(() => {
    const salvo = localStorage.getItem(CHAVE_FATURAS)
    return salvo ? JSON.parse(salvo) : []
  })

  const mesAtual = new Date().toISOString().slice(0, 7) // "AAAA-MM"

  // valor DERIVADO: recalculado a cada render (não é guardado em estado)
  const livre = dinheiroLivreDoMes({
    receitas,
    despesas,
    aliquota: config.aliquotaImposto,
    mes: mesAtual,
  })

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.label}>Dinheiro livre este mês</span>
        <span className={`${styles.value} ${livre < 0 ? styles.negativo : ''}`}>
          {formatarPreco(livre)}
        </span>
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

      <p className={styles.hint}>
        {receitas.length === 0
          ? 'Cadastre sua primeira receita no botão +'
          : `${receitas.length} receita(s) cadastrada(s) no total.`}
      </p>

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
