import { useState, type FormEvent } from 'react'
import type { Receita } from '@/domain/receita/types'
import styles from '@/ui/Modal/Modal.module.css'

type Props = {
  receita?: Receita // se vier, o modal abre em modo EDIÇÃO (pré-preenchido)
  onClose: () => void
  onSave: (r: Receita) => void
}

// Formulário controlado de receita (3 campos do MVP). Cria ou edita.
export function ReceitaFormModal({ receita, onClose, onSave }: Props) {
  const editando = Boolean(receita)
  // cada campo é um estado; começa vazio (criar) ou com o valor atual (editar)
  const [valor, setValor] = useState(receita ? String(receita.valor) : '')
  const [data, setData] = useState(receita?.data ?? '')
  const [origem, setOrigem] = useState(receita?.origem ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault() // evita o reload padrão do <form>
    if (!valor || !data) return // validação mínima: valor e data são obrigatórios
    onSave({
      id: receita?.id ?? crypto.randomUUID(), // na edição mantém o id
      valor: Number(valor), // input devolve string; convertemos pra número
      data,
      origem: origem.trim(),
    })
    onClose()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2>{editando ? 'Editar receita' : 'Nova receita'}</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <form className={styles.formCompact} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Valor recebido (R$)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </label>

          <label className={styles.field}>
            <span>Data de recebimento</span>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Origem (de quem/onde veio)</span>
            <input
              type="text"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              placeholder="Ex.: Cliente A"
            />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.save}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
