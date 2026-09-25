import { useState, type FormEvent } from 'react'
import type { Categoria } from './categorias'
import styles from './CategoriaPanel.module.css'

type Props = {
  onClose: () => void
  onCreate: (categoria: Categoria) => void
}

export function CategoriaPanel({ onClose, onCreate }: Props) {
  const [nome, setNome] = useState('')
  const [emoji, setEmoji] = useState('')
  const [cor, setCor] = useState('#d4af37')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return // Nome é obrigatório

    onCreate({
      id: crypto.randomUUID(),
      nome: nome.trim(),
      emoji: emoji.trim() || '🏷️', // emoji padrão se vazio
      cor,
    })
    onClose()
  }

  return (
    <aside className={styles.panel} onClick={(e) => e.stopPropagation()}>
      <header className={styles.header}>
        <h3>Nova Categoria</h3>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Nome *</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Streaming"
            required
          />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Emoji</span>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="Ex: 🎬"
              maxLength={4}
            />
          </label>

          <label className={styles.field}>
            <span>Cor</span>
            <input
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              className={styles.color}
            />
          </label>
        </div>

        <div className={styles.previewWrap}>
          <span className={styles.previewLabel}>Prévia</span>
          <span
            className={styles.previewTag}
            style={{ background: `${cor}22`, color: cor, borderColor: cor }}
          >
            {(emoji || '🏷️') + ' ' + (nome || 'Categoria')}
          </span>
        </div>

        <button type="submit" className={styles.save}>
          Criar categoria
        </button>
      </form>
    </aside>
  )
}
