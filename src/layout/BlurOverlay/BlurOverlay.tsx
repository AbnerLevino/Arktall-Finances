import styles from './BlurOverlay.module.css'

type BlurOverlayProps = {
  isVisible: boolean
}

export function BlurOverlay({ isVisible }: BlurOverlayProps) {
  if (!isVisible) return null

  return <div className={styles.overlay} aria-hidden="true" />
}
