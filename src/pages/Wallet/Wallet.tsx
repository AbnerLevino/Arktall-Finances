import styles from './Wallet.module.css'
import { Subscriptions } from './Subscriptions'
import { useCategorias } from './categorias'

// Página única de dashboard (visão geral: KPIs + gráficos).
// As abas Wallet | Bills foram removidas; a gestão dos cards virou a
// página Management.
export function Wallet() {
  // Fonte das categorias — usada pra pintar/agrupar os gráficos.
  const { categorias } = useCategorias()

  return (
    <section className={styles.page}>
      <Subscriptions categorias={categorias} />
    </section>
  )
}
