import type { Fatura } from './Subscriptions'
import { acharBanco } from './banks'
import {
  formatarVencimento,
  formatarPreco,
  descreverPagamento,
} from './format'
import styles from './Modal.module.css'

type Props = {
  fatura: Fatura
  onClose: () => void
  onEdit: (fatura: Fatura) => void
  onDelete: (id: string) => void
}

export function FaturaDetailModal({
  fatura,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const banco = acharBanco(fatura.banco)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <header className={styles.dialogHeader}>
          <h2>{fatura.nome}</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <dl className={styles.details}>
          <div>
            <dt>Tipo de Pagamento</dt>
            <dd>{descreverPagamento(fatura.tipoPagamento, fatura.parcelas)}</dd>
          </div>
          {fatura.valorParcelado != null && (
            <div>
              <dt>Valor da parcela</dt>
              <dd>{formatarPreco(fatura.valorParcelado)}</dd>
            </div>
          )}
          <div>
            <dt>Banco</dt>
            <dd>
              {banco ? (
                <span className={styles.detailBanco}>
                  {banco.logo && (
                    <img src={banco.logo} alt="" className={styles.detailLogo} />
                  )}
                  {banco.name}
                </span>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Vencimento</dt>
            <dd>{formatarVencimento(fatura.vencimento)}</dd>
          </div>
          <div>
            <dt>Preço</dt>
            <dd>{formatarPreco(fatura.preco)}</dd>
          </div>
          <div>
            <dt>Categoria</dt>
            <dd>{fatura.categoria}</dd>
          </div>
        </dl>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editar}
            onClick={() => onEdit(fatura)}
          >
            Editar
          </button>
          <button
            type="button"
            className={styles.delete}
            onClick={() => onDelete(fatura.id)}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
