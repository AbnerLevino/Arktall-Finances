import { useState } from 'react'
import { Icon, type IconName } from '@/components/Icon/Icon'
import styles from './Sidebar.module.css'

type NavItem = {
  id: string
  label: string
  icon: IconName
}

// Adicionar um item novo aqui já aparece na sidebar com hover e seleção.
const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Início', icon: 'home' },
  { id: 'wallet', label: 'Carteira', icon: 'wallet' },
  { id: 'invoice', label: 'Faturas', icon: 'invoice' },
]

export function Sidebar() {
  const [activeId, setActiveId] = useState<string>(NAV_ITEMS[0].id)

  return (
    <nav className={styles.sidebar} aria-label="Navegação principal">
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeId

          return (
            <li key={item.id}>
              <button
                type="button"
                className={styles.item}
                data-active={isActive}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveId(item.id)}
              >
                <Icon name={item.icon} size={22} />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
