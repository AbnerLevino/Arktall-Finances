import { useState } from 'react'
import styles from './Wallet.module.css'

// O "molde" de uma conta (gasto do dia a dia: luz, água, mercado, pix...).
// Campos ainda serão definidos — por ora a estrutura básica.
export type Conta = {
  id: string
  nome: string
}

// "Gaveta" própria das contas — SEPARADA das assinaturas
const CHAVE_STORAGE = 'arktall:contas'

export function Bills() {
  // Estado próprio das contas, lido da sua própria gaveta no localStorage.
  // (o setter entra quando construirmos o cadastro de contas)
  const [contas] = useState<Conta[]>(() => {
    const salvo = localStorage.getItem(CHAVE_STORAGE)
    return salvo ? JSON.parse(salvo) : []
  })

  return (
    <div className={styles.pageContent}>
      {contas.length === 0 ? (
        <p className={styles.empty}>Nenhuma conta cadastrada ainda.</p>
      ) : (
        <div className={styles.list}>
          {contas.map((c) => (
            <button key={c.id} type="button" className={styles.card}>
              <span className={styles.cardNome}>{c.nome}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
