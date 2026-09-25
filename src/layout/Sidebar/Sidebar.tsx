import { Icon, type IconName } from '@/components/Icon/Icon'
import styles from './Sidebar.module.css'

type NavItem = {
  id: string
  label: string
  displayLabel: string
  icon: IconName
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', displayLabel: 'Home', icon: 'home' },
  { id: 'wallet', label: 'Wallet', displayLabel: 'Wallet', icon: 'wallet' },
  { id: 'management', label: 'Management', displayLabel: 'Management', icon: 'invoice' },
]

type SidebarProps = {
  activeId: string
  onSelect: (id: string) => void
  onHoverChange?: (isHovered: boolean) => void
}

export function Sidebar({ activeId, onSelect, onHoverChange }: SidebarProps) {
  const handleMouseEnter = () => {
    onHoverChange?.(true)
  }

  const handleMouseLeave = () => {
    onHoverChange?.(false)
  }

  return (
    <nav
      className={styles.sidebar}
      aria-label="Navegação principal"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeId

          return (
            <li key={item.id} className={styles.itemWrapper}>
              <button
                type="button"
                className={styles.item}
                data-active={isActive}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelect(item.id)}
              >
                <Icon name={item.icon} size={18} />
                <span className={styles.label}>{item.displayLabel}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
