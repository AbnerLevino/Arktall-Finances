import { useState } from 'react'
import { Icon } from '@/ui/Icon/Icon'
import styles from './Management.module.css'
import {
  formatarVencimento,
  formatarPreco,
  descreverPagamento,
} from '@/lib/format'
import { acharBanco } from '@/domain/banco/banks'
import { useCategorias, rotuloCategoria } from '@/domain/categoria/categorias'
import type { Fatura } from '@/domain/fatura/types'
import { FaturaFormModal } from './FaturaFormModal'

// Cor neutra para o grupo "Sem categoria"
const COR_SEM_CATEGORIA = '#6b7280'

// Mesma "gaveta" das assinaturas — por ora Management só LÊ os dados.
// (a ação dos botões editar/excluir liga no próximo passo, junto com o
// FAB de cadastro)
const CHAVE_STORAGE = 'arktall:faturas'

// Página de gestão: cada conta é uma linha full-width com identidade,
// metadados, preço e ações. Separada do dashboard (gráficos).
export function Management() {
  const { categorias, adicionar } = useCategorias()

  const [faturas, setFaturas] = useState<Fatura[]>(() => {
    const salvo = localStorage.getItem(CHAVE_STORAGE)
    return salvo ? JSON.parse(salvo) : []
  })

  // Controla a abertura do modal de cadastro (acionado pelo FAB)
  const [modalAberto, setModalAberto] = useState(false)
  // Fatura em edição; null = modo criação (FAB)
  const [faturaEditando, setFaturaEditando] = useState<Fatura | null>(null)

  // Fonte da verdade: grava no estado e no localStorage numa operação só
  const persistir = (novas: Fatura[]) => {
    setFaturas(novas)
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(novas))
  }

  // Abre o modal já preenchido com a fatura escolhida
  const abrirEdicao = (f: Fatura) => {
    setFaturaEditando(f)
    setModalAberto(true)
  }

  // Fecha e limpa o modo edição
  const fecharModal = () => {
    setModalAberto(false)
    setFaturaEditando(null)
  }

  // Salvar: se o id já existe, SUBSTITUI; senão, adiciona no fim
  const salvarFatura = (nova: Fatura) => {
    const existe = faturas.some((f) => f.id === nova.id)
    persistir(
      existe ? faturas.map((f) => (f.id === nova.id ? nova : f)) : [...faturas, nova],
    )
    fecharModal()
  }

  // Agrupa as faturas por categoria (+ um grupo "Sem categoria" no fim)
  const grupos = categorias
    .map((c) => ({
      chave: c.id,
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
      chave: '__sem__',
      nome: 'Sem categoria',
      cor: null,
      faturas: semCategoria,
    })
  }

  // Uma linha (card full-width). `cor` é a cor da categoria — pinta a barra.
  const renderRow = (f: Fatura, cor: string) => {
    const banco = acharBanco(f.banco)
    return (
      <div key={f.id} className={styles.row}>
        <span className={styles.accent} style={{ background: cor }} />

        <div className={styles.identity}>
          {f.icone ? (
            <img src={f.icone} alt="" className={styles.avatar} />
          ) : (
            <span className={styles.avatarFallback}>{f.nome.charAt(0)}</span>
          )}
          <div className={styles.nameBlock}>
            <span className={styles.name}>{f.nome}</span>
            <div className={styles.badges}>
              <span className={styles.badgeTipo}>
                {f.tipo === 'variavel' ? 'Conta Variável' : 'Assinatura'}
              </span>
              <span
                className={styles.status}
                data-cancelada={f.status === 'Cancelada'}
              >
                {f.status}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Banco</span>
            <span className={styles.metaValue}>
              {banco ? (
                <>
                  {banco.logo && (
                    <img src={banco.logo} alt="" className={styles.bancoLogo} />
                  )}
                  {banco.name}
                </>
              ) : (
                '—'
              )}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Vencimento</span>
            <span className={styles.metaValue}>
              {formatarVencimento(f.vencimento)}
            </span>
          </div>

          {f.tipo !== 'variavel' && (
            <>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Pagamento</span>
                <span className={styles.metaValue}>
                  {descreverPagamento(f.tipoPagamento, f.parcelas)}
                </span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Periodicidade</span>
                <span className={styles.metaValue}>
                  {f.periodicidade || 'Mensal'}
                </span>
              </div>
            </>
          )}
        </div>

        <div className={styles.right}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatarPreco(f.preco)}</span>
            <span className={styles.priceUnit}>
              {f.periodicidade === 'Anual' ? '/ ano' : '/ mês'}
            </span>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.action}
              aria-label={`Editar ${f.nome}`}
              onClick={() => abrirEdicao(f)}
            >
              <Icon name="edit" size={15} />
            </button>
            <button
              type="button"
              className={`${styles.action} ${styles.actionDanger}`}
              aria-label={`Excluir ${f.nome}`}
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Management</h2>

      {faturas.length === 0 ? (
        <p className={styles.empty}>Nenhuma conta cadastrada ainda.</p>
      ) : (
        <div className={styles.groups}>
          {grupos.map((g) => (
            <div key={g.chave} className={styles.group}>
              <div className={styles.groupHeader}>
                <span className={styles.groupTitle}>{g.nome}</span>
                <span className={styles.groupLine} />
              </div>
              <div className={styles.rows}>
                {g.faturas.map((f) => renderRow(f, g.cor ?? COR_SEM_CATEGORIA))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className={styles.fab}
        onClick={() => {
          setFaturaEditando(null)
          setModalAberto(true)
        }}
        aria-label="Adicionar conta"
      >
        <Icon name="plus" size={22} />
      </button>

      {modalAberto && (
        <FaturaFormModal
          fatura={faturaEditando ?? undefined}
          categorias={categorias}
          adicionarCategoria={adicionar}
          onClose={fecharModal}
          onSave={salvarFatura}
        />
      )}
    </section>
  )
}
