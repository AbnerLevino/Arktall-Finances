import profileImg from '@/assets/profile.png'
import { Icon } from '@/components/Icon/Icon'
import { useTema } from '@/hooks/useTema'
import styles from './Header.module.css'

export function Header() {
  const { tema, alternar } = useTema()

  const handleProfileClick = () => {
    console.log('Abrir perfil')
  }

  const handleExit = () => {
    console.log('Logout')
  }

  return (
    <header className={styles.header}>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.profileImage}
          onClick={handleProfileClick}
          aria-label="Perfil"
          style={{ backgroundImage: `url(${profileImg})` }}
        />

        <div className={styles.themeToggle} role="group" aria-label="Tema">
          <button
            type="button"
            className={styles.themeOption}
            data-active={tema === 'light'}
            onClick={() => tema !== 'light' && alternar()}
            aria-label="Tema claro"
            aria-pressed={tema === 'light'}
            title="Tema claro"
          >
            <Icon name="sun" size={18} />
          </button>
          <button
            type="button"
            className={styles.themeOption}
            data-active={tema === 'dark'}
            onClick={() => tema !== 'dark' && alternar()}
            aria-label="Tema escuro"
            aria-pressed={tema === 'dark'}
            title="Tema escuro"
          >
            <Icon name="moon" size={18} />
          </button>
        </div>

        <button
          type="button"
          className={styles.exitButton}
          onClick={handleExit}
          aria-label="Sair"
          title="Logout"
        >
          <Icon name="exit" size={22} />
        </button>
      </div>
    </header>
  )
}
