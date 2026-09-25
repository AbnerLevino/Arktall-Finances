import { useState, type FormEvent } from 'react'
import type { Receita } from '@/domain/receita/types'
import styles from '@/ui/Modal/Modal.module.css'

type Props = {
  onClose: () => void
  onSave: (r: Receita) => void
}

// Formulário controlado de nova receita (3 campos do MVP).
export function ReceitaFormModal({ onClose, onSave }: Props) {
  // cada campo é um estado; o input reflete o estado (input controlado)
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [origem, setOrigem] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault() // evita o reload padrão do <form>
    if (!valor || !data) return // validação mínima: valor e data são obrigatórios
    onSave({
      id: crypto.randomUUID(),
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
          <h2>Nova receita</h2>
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
