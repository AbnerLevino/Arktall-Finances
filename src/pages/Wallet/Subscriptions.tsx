import { useState } from 'react'
import styles from './Wallet.module.css'
import { formatarPreco } from './format'
import { custoMensalTotal, timelineAssinaturas } from './calc'
import { rotuloCategoria, type Categoria } from './categorias'
import { CategoriaBarras } from './CategoriaBarras'
import { TimelineChart } from './TimelineChart'

// Cor neutra para o grupo "Sem categoria"
const COR_SEM_CATEGORIA = '#6b7280'

// O "molde" de uma fatura — garante que toda fatura tenha esses campos
export type Fatura = {
  id: string
  tipo: 'assinatura' | 'variavel' // discriminante: assinatura (preço fixo) ou conta variável
  nome: string
  icone: string | null // ícone PNG (data URL) na frente do nome; null se não tem
  tipoPagamento: string
  parcelas: number | null // nº de parcelas (só crédito parcelado); null = à vista
  valorParcelado: number | null // valor de cada parcela; null se não parcelado
  banco: number | null // código do banco (pra achar a logo); null se não escolhido
  vencimento: number | null // dia do mês em que é cobrado (1–31)
  status: 'Ativa' | 'Cancelada' // assinatura ativa ou cancelada
  inicio: string | null // mês/ano de início da assinatura (formato "AAAA-MM")
  fim: string | null // mês/ano de fim (só quando cancelada)
  preco: number
  moeda: string // código da moeda (BRL, USD, EUR...)
  periodicidade: string // 'Mensal' ou 'Anual'
  mesVencimento: number | null // mês da cobrança (1–12); só quando anual
  categoria: string
}

// "Gaveta" própria das assinaturas no localStorage
const CHAVE_STORAGE = 'arktall:faturas'

type Props = {
  categorias: Categoria[]
}

// Dashboard: só a VISÃO (KPIs + gráficos). Os cards e o cadastro moraram
// aqui antes — agora vivem na página Management.
export function Subscriptions({ categorias }: Props) {
  // Lê do localStorage uma única vez, na montagem (lazy initializer)
  const [faturas] = useState<Fatura[]>(() => {
    const salvo = localStorage.getItem(CHAVE_STORAGE)
    return salvo ? JSON.parse(salvo) : []
  })

  // KPI: soma do custo mensal (anual entra como preço/12)
  const totalMensal = custoMensalTotal(faturas)

  // Agrupa as faturas por categoria (+ um grupo "Sem categoria" no fim).
  // Aqui serve só pra derivar os dados do gráfico de categorias.
  const grupos = categorias
    .map((c) => ({
      emoji: c.emoji,
      nome: c.nome,
      cor: c.cor as string | null,
      faturas: faturas.filter((f) => f.categoria === rotuloCategoria(c)),
    }))
    .filter((g) => g.faturas.length > 0)

  const semCategoria = faturas.filter(
    (f) => !categorias.some((c) => rotuloCategoria(c) === f.categoria),
  )
  if (semCategoria.length > 0) {
    grupos.push({
      emoji: '📁',
      nome: 'Sem categoria',
      cor: null,
      faturas: semCategoria,
    })
  }

  // Linha do tempo de vida das assinaturas + cores por categoria
  const timeline = timelineAssinaturas(faturas)
  const coresCategoria: Record<string, string> = {}
  for (const f of timeline.faixas) {
    const cat = categorias.find((c) => rotuloCategoria(c) === f.categoria)
    coresCategoria[f.categoria] = cat ? cat.cor : COR_SEM_CATEGORIA
  }

  // Dados do gráfico: custo mensal por categoria (deriva dos grupos)
  const dadosGrafico = grupos
    .map((g) => ({
      label: `${g.emoji} ${g.nome}`,
      value: custoMensalTotal(g.faturas),
      cor: g.cor ?? COR_SEM_CATEGORIA,
    }))
    .filter((d) => d.value > 0)

  return (
    <div className={styles.pageContent}>
      <div className={styles.topArea}>
        <div className={styles.kpis}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Custo Mensal</span>
            <span className={styles.kpiValue}>{formatarPreco(totalMensal)}</span>
          </div>
        </div>
      </div>

      <TimelineChart
        faixas={timeline.faixas}
        min={timeline.min}
        max={timeline.max}
        cores={coresCategoria}
      />

      <CategoriaBarras data={dadosGrafico} />
    </div>
  )
}
